"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { combineDateAndTime } from "@/lib/attendance";
import { MANUAL_BATCH_CAP } from "@/lib/batching";
import { isCompanyStaff } from "@/lib/auth-helpers";

export async function requestEnrollment(courseId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can request enrollment.");
  }

  const student = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (student?.studentStatus !== "ACTIVE") return;

  const existing = await prisma.enrollmentRequest.findFirst({
    where: { studentId: session.user.id, courseId, status: "PENDING" },
  });
  if (existing) return;

  const alreadyEnrolled = await prisma.enrollment.findFirst({
    where: { studentId: session.user.id, courseId },
  });
  if (alreadyEnrolled) return;

  await prisma.enrollmentRequest.create({
    data: {
      studentId: session.user.id,
      courseId,
      collegeId: session.user.collegeId ?? undefined,
      status: "PENDING",
    },
  });

  revalidatePath("/lms/student/courses");
  revalidatePath("/lms/company");
}

export async function approveEnrollmentRequest(requestId: string) {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    throw new Error("Only the company admin can approve requests.");
  }

  const request = await prisma.enrollmentRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") return;

  const student = await prisma.user.findUnique({ where: { id: request.studentId } });

  // If a batch for this college/course/semester is already running, place the student
  // straight into it and backfill credit for every class already taught — the delay
  // was ours (approval), not theirs, so they shouldn't show up with 0% attendance.
  let batchId: string | null = null;
  let trainerId: string | null = null;
  let sessionsToBackfill: { id: string; sessionDate: Date; startTime: string }[] = [];

  if (request.collegeId) {
    const candidateBatch = await prisma.batch.findFirst({
      where: {
        collegeId: request.collegeId,
        courseId: request.courseId,
        semester: student?.semester ?? null,
      },
      include: { enrollments: true, trainingSessions: { where: { attendanceTaken: true } } },
      orderBy: { createdAt: "desc" },
    });

    if (candidateBatch && candidateBatch.enrollments.length < MANUAL_BATCH_CAP) {
      batchId = candidateBatch.id;
      trainerId = candidateBatch.trainerId;
      sessionsToBackfill = candidateBatch.trainingSessions;
    }
  }

  await prisma.$transaction([
    prisma.enrollmentRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", decidedAt: new Date() },
    }),
    prisma.enrollment.create({
      data: {
        studentId: request.studentId,
        courseId: request.courseId,
        collegeId: request.collegeId,
        totalClasses: 0,
        batchId,
        trainerId,
      },
    }),
  ]);

  if (batchId && sessionsToBackfill.length > 0) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: request.studentId, courseId: request.courseId, batchId },
      orderBy: { enrolledAt: "desc" },
    });
    if (enrollment) {
      await prisma.attendanceRecord.createMany({
        data: sessionsToBackfill.map((s) => ({
          enrollmentId: enrollment.id,
          classDate: combineDateAndTime(s.sessionDate, s.startTime),
          present: true,
        })),
      });
    }
  }

  revalidatePath("/lms/company");
  revalidatePath("/lms/company/attendance");
  revalidatePath("/lms/student");
  revalidatePath("/lms/student/courses");
  revalidatePath("/lms/college");
  revalidatePath("/lms/college/students");
  revalidatePath("/lms/college/courses");
}

export async function rejectEnrollmentRequest(requestId: string) {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    throw new Error("Only the company admin can reject requests.");
  }

  const request = await prisma.enrollmentRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") return;

  await prisma.enrollmentRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", decidedAt: new Date() },
  });

  revalidatePath("/lms/company");
  revalidatePath("/lms/student/courses");
}
