import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";
import { notify } from "@/lib/notifications";

const CATEGORY_BY_ROLE: Record<string, "STUDENT" | "COLLEGE" | "TRAINER" | "ADMIN"> = {
  STUDENT: "STUDENT",
  COLLEGE_ADMIN: "COLLEGE",
  TRAINER: "TRAINER",
  ADMIN2: "ADMIN",
};

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one from the login page." },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
    }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  const category = CATEGORY_BY_ROLE[resetToken.user.role];
  if (category) {
    await notify(category, `${resetToken.user.name} reset their own password`, {
      message: `They used the "Forgot password" email link — no action needed, this is just for your records.`,
    });
  }

  return NextResponse.json({ ok: true });
}
