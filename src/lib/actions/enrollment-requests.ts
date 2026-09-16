"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requestEnrollment(courseId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can request enrollment.");
  }

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
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the company admin can approve requests.");
  }

  const request = await prisma.enrollmentRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") return;

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
      },
    }),
  ]);

  revalidatePath("/lms/company");
  revalidatePath("/lms/student");
  revalidatePath("/lms/student/courses");
  revalidatePath("/lms/college");
  revalidatePath("/lms/college/students");
  revalidatePath("/lms/college/courses");
}

export async function rejectEnrollmentRequest(requestId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
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
