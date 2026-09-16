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

  const { name, password, collegeId } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const college = await prisma.college.findUnique({ where: { id: collegeId } });
  if (!college) {
    return NextResponse.json({ error: "Select a valid college." }, { status: 400 });
  }

  // MySQL's default collation already compares strings case-insensitively.
  const roster = await prisma.user.findFirst({
    where: {
      role: "STUDENT",
      email,
      collegeId,
      studentStatus: "PRE_REGISTERED",
    },
  });

  if (!roster) {
    return NextResponse.json(
      {
        error:
          "No matching student record found for this college. Ask your college to add you first, then try again with the same name and email.",
      },
      { status: 404 }
    );
  }

  if (roster.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Your name doesn't match the record your college provided. Check the spelling and try again." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: roster.id },
    data: {
      name,
      passwordHash: await bcrypt.hash(password, 10),
      studentStatus: "PENDING_APPROVAL",
    },
  });

  return NextResponse.json({ ok: true });
}
