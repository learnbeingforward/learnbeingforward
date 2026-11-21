"use server";

import crypto from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { requireCompanyAccess } from "@/lib/employee-access";
import { sendMail } from "@/lib/mail";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

async function requireCompany() {
  const session = await auth();
  if (session?.user && isCompanyStaff(session.user.role)) return;
  try {
    await requireCompanyAccess("accounts.manage.buyers");
  } catch {
    throw new Error("Only the company admin can manage buyer accounts.");
  }
}

export type BuyerActionState = { ok: boolean; error?: string } | null;

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong.";
}

/** Admin-triggered equivalent of the buyer clicking "Forgot password" themselves
 * — same token/link mechanism, just started from this side instead of the
 * login page, for a buyer who reaches out directly instead of self-serving. */
export async function sendBuyerPasswordReset(userId: string, _prevState: BuyerActionState, _formData: FormData): Promise<BuyerActionState> {
  await requireCompany();

  try {
    const buyer = await prisma.user.findUnique({ where: { id: userId } });
    if (!buyer || buyer.role !== "BUYER") return { ok: false, error: "This isn't a buyer account." };

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: buyer.id, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });

    const resetLink = `https://learnbeingforward.in/auth/reset-password?token=${token}`;
    await sendMail({
      to: buyer.email,
      subject: "Reset your Learn Being Forward password",
      text: `Hi ${buyer.name},\n\nWe've been asked to help you reset your password.\n\nClick this link to set a new one — it's valid for 1 hour and can only be used once:\n${resetLink}\n\nIf you didn't ask for this, you can safely ignore this email.`,
    });

    return { ok: true };
  } catch (err) {
    console.error("[buyers] sendBuyerPasswordReset failed:", err);
    return { ok: false, error: errorMessage(err) };
  }
}
