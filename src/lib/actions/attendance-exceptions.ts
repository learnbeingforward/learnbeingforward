"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { requireCompanyAccess } from "@/lib/employee-access";
import { notify } from "@/lib/notifications";

async function requireApprovalsAccess() {
  const session = await auth();
  if (session?.user && isCompanyStaff(session.user.role)) return;
  await requireCompanyAccess("registrations.approvals");
}

export async function requestAttendanceException(enrollmentId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COLLEGE_ADMIN" || !session.user.collegeId) {
    throw new Error("Only a college admin can submit this request.");
  }
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    throw new Error("A reason is required.");
  }

  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment || enrollment.collegeId !== session.user.collegeId) {
    throw new Error("That enrollment doesn't belong to your college.");
  }

  const existing = await prisma.attendanceException.findFirst({
    where: { enrollmentId, status: "PENDING" },
  });
  if (existing) return;

  await prisma.attendanceException.create({
    data: {
      enrollmentId,
      collegeId: session.user.collegeId,
      reason: reason.trim(),
      status: "PENDING",
    },
  });

  const college = await prisma.college.findUnique({ where: { id: session.user.collegeId } });
  await notify("COLLEGE", `${college?.name ?? "A college"} requested an attendance exception`, {
    message: reason,
    href: "/lms/company/approvals",
  });

  revalidatePath("/lms/college/queries");
  revalidatePath("/lms/company/approvals");
}

export async function approveAttendanceException(id: string) {
  try {
    await requireApprovalsAccess();
  } catch {
    throw new Error("Only the company admin can approve this.");
  }

  const exception = await prisma.attendanceException.findUnique({ where: { id } });
  if (!exception || exception.status !== "PENDING") return;

  await prisma.$transaction([
    prisma.attendanceException.update({
      where: { id },
      data: { status: "APPROVED", decidedAt: new Date() },
    }),
    prisma.certification.upsert({
      where: { enrollmentId: exception.enrollmentId },
      update: { overrideApproved: true, status: "ELIGIBLE" },
      create: {
        enrollmentId: exception.enrollmentId,
        overrideApproved: true,
        status: "ELIGIBLE",
      },
    }),
  ]);

  revalidatePath("/lms/company/approvals");
  revalidatePath("/lms/company/attendance");
  revalidatePath("/lms/student");
  revalidatePath("/lms/student/attendance");
  revalidatePath("/lms/college/queries");
}

export async function rejectAttendanceException(id: string) {
  try {
    await requireApprovalsAccess();
  } catch {
    throw new Error("Only the company admin can reject this.");
  }

  const exception = await prisma.attendanceException.findUnique({ where: { id } });
  if (!exception || exception.status !== "PENDING") return;

  await prisma.attendanceException.update({
    where: { id },
    data: { status: "REJECTED", decidedAt: new Date() },
  });

  revalidatePath("/lms/company/approvals");
  revalidatePath("/lms/college/queries");
}
