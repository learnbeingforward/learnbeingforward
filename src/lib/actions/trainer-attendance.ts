"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { combineDateAndTime } from "@/lib/attendance";
import { isCompanyStaff } from "@/lib/auth-helpers";

export async function submitSessionAttendance(sessionId: string, formData: FormData) {
  const session = await auth();
  const isTrainer = session?.user?.role === "TRAINER";
  const isCompany = isCompanyStaff(session?.user?.role);
  if (!session?.user || !(isTrainer || isCompany)) {
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
        },
      })
    ),
    prisma.trainingSession.update({
      where: { id: sessionId },
      data: { attendanceTaken: true },
    }),
  ]);

  revalidatePath("/lms/trainer/schedule");
  revalidatePath("/lms/trainer/attendance");
  revalidatePath("/lms/student");
  revalidatePath("/lms/student/attendance");
  revalidatePath("/lms/college/students");
  revalidatePath("/lms/college/courses");
  revalidatePath("/lms/company/attendance");
  revalidatePath("/lms/company/trainers/schedule");
}
