"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";

export type FulfillResult = { ok: boolean; error?: string } | null;

export async function fulfillPasswordReset(
  requestId: string,
  _prevState: FulfillResult,
  formData: FormData
): Promise<FulfillResult> {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    return { ok: false, error: "Not authorized." };
  }

  const newPassword = String(formData.get("newPassword") ?? "").trim();
  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const request = await prisma.passwordResetRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") {
    return { ok: false, error: "This request is no longer pending." };
  }

  let account = null;
  if (request.role === "STUDENT") {
    account = await prisma.user.findFirst({
      where: {
        role: "STUDENT",
        email: request.email,
        studentStatus: { in: ["ACTIVE", "PENDING_APPROVAL"] },
        college: request.collegeName ? { name: request.collegeName } : undefined,
      },
    });
  } else if (request.role === "COLLEGE_ADMIN") {
    account = await prisma.user.findFirst({
      where: {
        role: "COLLEGE_ADMIN",
        email: request.email,
        college: request.collegeName ? { name: request.collegeName } : undefined,
      },
    });
  } else if (request.role === "TRAINER" || request.role === "ADMIN2") {
    account = await prisma.user.findFirst({
      where: { role: request.role, email: request.email },
    });
  }

  if (!account) {
    return {
      ok: false,
      error: "No matching active account found for these details. Reject this request instead.",
    };
  }

  await prisma.user.update({
    where: { id: account.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  await prisma.passwordResetRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", decidedAt: new Date() },
  });

  // No email provider is configured yet — this simulates delivery. Wire up a
  // real provider (Resend/SendGrid/SMTP) here and send `newPassword` to
  // `account.email` when one is available.
  console.log(`[dummy email] New password for ${account.email}: ${newPassword}`);

  revalidatePath("/lms/company/password-resets");
  return { ok: true };
}

export async function rejectPasswordReset(requestId: string) {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    throw new Error("Only the company admin can reject this.");
  }

  await prisma.passwordResetRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", decidedAt: new Date() },
  });

  revalidatePath("/lms/company/password-resets");
}

export type ResetAccountResult = { ok: boolean; error?: string; foundName?: string; foundRole?: string } | null;

export async function resetAccountPassword(
  _prevState: ResetAccountResult,
  formData: FormData
): Promise<ResetAccountResult> {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    return { ok: false, error: "Not authorized." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const newPassword = String(formData.get("newPassword") ?? "").trim();

  if (!email) return { ok: false, error: "Enter an email to look up." };
  if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const account = await prisma.user.findUnique({ where: { email } });
  if (!account) return { ok: false, error: "No account found with that email." };
  if (account.role === "SUPER_ADMIN") {
    return { ok: false, error: "The main company admin's password can't be reset here — it can only be changed from its own Profile page." };
  }
  if (account.role === "ADMIN2" && session.user.role === "ADMIN2") {
    return { ok: false, error: "A second admin's password can only be reset by the main company admin." };
  }

  await prisma.user.update({
    where: { id: account.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { ok: true, foundName: account.name, foundRole: account.role };
}

export type QuickResetState = { ok: boolean; error?: string } | null;

export async function resetStudentPassword(
  _prevState: QuickResetState,
  formData: FormData
): Promise<QuickResetState> {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    return { ok: false, error: "Not authorized." };
  }

  const studentId = String(formData.get("studentId") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "").trim();
  if (!studentId) return { ok: false, error: "Select a student." };
  if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const student = await prisma.user.findFirst({ where: { id: studentId, role: "STUDENT" } });
  if (!student) return { ok: false, error: "Student not found." };

  await prisma.user.update({
    where: { id: student.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { ok: true };
}

export async function resetCollegePassword(
  _prevState: QuickResetState,
  formData: FormData
): Promise<QuickResetState> {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    return { ok: false, error: "Not authorized." };
  }

  const collegeAdminId = String(formData.get("collegeAdminId") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "").trim();
  if (!collegeAdminId) return { ok: false, error: "Select a college." };
  if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const collegeAdmin = await prisma.user.findFirst({ where: { id: collegeAdminId, role: "COLLEGE_ADMIN" } });
  if (!collegeAdmin) return { ok: false, error: "College admin not found." };

  await prisma.user.update({
    where: { id: collegeAdmin.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { ok: true };
}
