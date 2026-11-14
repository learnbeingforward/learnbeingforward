import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validation";
import { getSiteSettings } from "@/lib/site-settings";
import { sendMail } from "@/lib/mail";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, role, phone, message } = parsed.data;
  await prisma.contactSubmission.create({ data: parsed.data });

  // The submission is already saved regardless of whether the email goes out —
  // a misconfigured/down mail server shouldn't lose the message, just the
  // immediate notification of it.
  try {
    const settings = await getSiteSettings();
    await sendMail({
      to: settings.companyContactEmail,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}${role ? `\nI am a: ${role}` : ""}${phone ? `\nPhone: ${phone}` : ""}\n\n${message}`,
    });
  } catch (err) {
    console.error("[contact] Failed to send notification email:", err);
  }

  return NextResponse.json({ ok: true });
}
