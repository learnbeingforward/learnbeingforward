import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password, role, collegeName, organizationName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let collegeId: string | undefined;
  const orgName = role === "STUDENT" ? collegeName : organizationName;

  if (orgName) {
    const college = await prisma.college.upsert({
      where: { name: orgName },
      update: {},
      create: { name: orgName },
    });
    collegeId = college.id;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      collegeId,
    },
  });

  return NextResponse.json({ ok: true });
}
