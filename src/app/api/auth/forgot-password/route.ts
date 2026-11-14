import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendMail } from "@/lib/mail";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const CATEGORY_BY_ROLE: Record<string, "STUDENT" | "COLLEGE" | "TRAINER" | "ADMIN"> = {
  STUDENT: "STUDENT",
  COLLEGE_ADMIN: "COLLEGE",
  TRAINER: "TRAINER",
  ADMIN2: "ADMIN",
};

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  // Always respond the same way regardless of whether the email was found —
  // telling an anonymous caller "no account with that email" would let them
  // enumerate who has an account here. The main company admin is excluded on
  // purpose: that account can only be reset from its own Profile page.
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.role !== "SUPER_ADMIN" && user.role in CATEGORY_BY_ROLE) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });

    const origin = request.headers.get("origin") ?? new URL(request.url).origin;
    const resetLink = `${origin}/auth/reset-password?token=${token}`;

    try {
      await sendMail({
        to: user.email,
        subject: "Reset your Learn Being Forward password",
        text: `Hi ${user.name},\n\nSomeone (hopefully you) requested a password reset for your account.\n\nClick this link to set a new password — it's valid for 1 hour and can only be used once:\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
      });
    } catch (err) {
      console.error("[forgot-password] Failed to send reset email:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
