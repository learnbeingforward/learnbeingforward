import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";

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
      collegeName: parsed.data.collegeName,
    },
  });

  return NextResponse.json({ ok: true });
}
