"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type FulfillResult = { ok: boolean; error?: string } | null;

export async function fulfillPasswordReset(
  requestId: string,
  _prevState: FulfillResult,
  formData: FormData
): Promise<FulfillResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
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

  const student = await prisma.user.findFirst({
    where: {
      role: "STUDENT",
      email: request.email,
      studentStatus: { in: ["ACTIVE", "PENDING_APPROVAL"] },
      college: { name: request.collegeName },
    },
  });

  if (!student) {
    return {
      ok: false,
      error: "No matching active student account found for this name/email/college. Reject this request instead.",
    };
  }

  await prisma.user.update({
    where: { id: student.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  await prisma.passwordResetRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", decidedAt: new Date() },
  });

  // No email provider is configured yet — this simulates delivery. Wire up a
  // real provider (Resend/SendGrid/SMTP) here and send `newPassword` to
  // `student.email` when one is available.
  console.log(`[dummy email] New password for ${student.email}: ${newPassword}`);

  revalidatePath("/lms/company/password-resets");
  return { ok: true };
}

export async function rejectPasswordReset(requestId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
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
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Not authorized." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const newPassword = String(formData.get("newPassword") ?? "").trim();

  if (!email) return { ok: false, error: "Enter an email to look up." };
  if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const account = await prisma.user.findUnique({ where: { email } });
  if (!account) return { ok: false, error: "No account found with that email." };

  await prisma.user.update({
    where: { id: account.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { ok: true, foundName: account.name, foundRole: account.role };
}
