"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { combineDateAndTime } from "@/lib/attendance";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { getEmployeeKeys } from "@/lib/employee-access";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";
import { notify } from "@/lib/notifications";

export async function submitSessionAttendance(sessionId: string, formData: FormData) {
  const session = await auth();
  const isTrainer = session?.user?.role === "TRAINER";
  const isCompany = isCompanyStaff(session?.user?.role);
  const isAuthorizedEmployee =
    session?.user?.role === "EMPLOYEE" && (await getEmployeeKeys(session.user.id)).includes("trainers.manage");
  if (!session?.user || !(isTrainer || isCompany || isAuthorizedEmployee)) {
    throw new Error("Only trainers or the company admin can mark attendance.");
  }

  const trainingSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: { batch: { include: { enrollments: true } } },
  });
  if (!trainingSession) throw new Error("Session not found.");
  if (isTrainer && trainingSession.trainerId !== session.user.trainerId) {
    throw new Error("You can only mark attendance for your own sessions.");
  }
  if (trainingSession.attendanceTaken) {
    throw new Error("Attendance has already been submitted for this session.");
  }

  const classDate = combineDateAndTime(trainingSession.sessionDate, trainingSession.startTime);

  await prisma.$transaction([
    ...trainingSession.batch.enrollments.map((enrollment) =>
      prisma.attendanceRecord.create({
        data: {
          enrollmentId: enrollment.id,
          classDate,
          present: formData.get(`present_${enrollment.id}`) === "on",
          trainingSessionId: sessionId,
        },
      })
    ),
    prisma.trainingSession.update({
      where: { id: sessionId },
      data: { attendanceTaken: true },
    }),
  ]);

  // Eligibility can otherwise go unnoticed indefinitely — a student sits
  // "Eligible" with nobody ever prompted to issue the certificate. Flag it the
  // moment attendance crosses the threshold, once, for whoever hasn't already got
  // a certification row started.
  const freshEnrollments = await prisma.enrollment.findMany({
    where: { id: { in: trainingSession.batch.enrollments.map((e) => e.id) } },
    include: { student: true, course: true, attendanceRecords: true, certification: true },
  });
  for (const e of freshEnrollments) {
    if (e.certification) continue;
    const total = e.attendanceRecords.length || e.totalClasses;
    const present = e.attendanceRecords.filter((r) => r.present).length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    if (pct >= ATTENDANCE_THRESHOLD) {
      await notify("ADMIN", `${e.student.name} is now eligible for a certificate`, {
        message: `${e.course.name} — ${pct}% attendance`,
        href: "/lms/company/attendance",
        requiredKey: "overview.attendance",
      });
    }
  }

  revalidatePath("/lms/trainer/schedule");
  revalidatePath("/lms/trainer/attendance");
  revalidatePath("/lms/student");
  revalidatePath("/lms/student/attendance");
  revalidatePath("/lms/college/students");
  revalidatePath("/lms/college/courses");
  revalidatePath("/lms/company/attendance");
  revalidatePath("/lms/company/trainers/schedule");
}
