"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

export async function approveCertificate(enrollmentId: string) {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    throw new Error("Only the company admin can approve certificates.");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { attendanceRecords: true, certification: true },
  });
  if (!enrollment) return;

  const total = enrollment.attendanceRecords.length || enrollment.totalClasses;
  const present = enrollment.attendanceRecords.filter((r) => r.present).length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const eligible = pct >= ATTENDANCE_THRESHOLD || enrollment.certification?.overrideApproved;
  if (!eligible) return;

  await prisma.certification.upsert({
    where: { enrollmentId },
    update: { trainerApproved: true, status: "ISSUED", issuedAt: new Date() },
    create: {
      enrollmentId,
      trainerApproved: true,
      status: "ISSUED",
      issuedAt: new Date(),
    },
  });

  revalidatePath("/lms/company/attendance");
  revalidatePath("/lms/student");
  revalidatePath("/lms/student/attendance");
}

export async function assignTrainer(enrollmentId: string, trainerId: string) {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    throw new Error("Only the company admin can assign trainers.");
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { trainerId: trainerId || null },
  });

  revalidatePath("/lms/company/attendance");
}
