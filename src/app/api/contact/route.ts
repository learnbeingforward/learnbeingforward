import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await prisma.contactSubmission.create({ data: parsed.data });

  return NextResponse.json({ ok: true });
}
