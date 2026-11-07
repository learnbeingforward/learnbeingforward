import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { notify, type NotificationCategory } from "@/lib/notifications";

const CATEGORY_BY_ROLE: Record<string, NotificationCategory> = {
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

  await prisma.passwordResetRequest.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      collegeName: parsed.data.collegeName || null,
      role: parsed.data.role,
    },
  });

  await notify(CATEGORY_BY_ROLE[parsed.data.role] ?? "ADMIN", `Password reset requested — ${parsed.data.name}`, {
    href: "/lms/company/password-resets",
  });

  return NextResponse.json({ ok: true });
}
