"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the main company admin can edit accounts here.");
  }
}

export type AccountKind = "student" | "college" | "trainer" | "admin";

export type UpdateAccountDetailsState = { ok: boolean; error?: string } | null;

export async function updateAccountDetails(
  kind: AccountKind,
  id: string,
  _prevState: UpdateAccountDetailsState,
  formData: FormData
): Promise<UpdateAccountDetailsState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Not authorized." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) return { ok: false, error: "Name is required." };

  try {
    if (kind === "student") {
      const branch = String(formData.get("branch") ?? "").trim();
      const semesterInput = String(formData.get("semester") ?? "").trim();
      const usn = String(formData.get("usn") ?? "").trim();
      await prisma.user.update({
        where: { id, role: "STUDENT" },
        data: {
          name,
          phone: phone || null,
          branch: branch || null,
          semester: semesterInput ? Number.parseInt(semesterInput, 10) : null,
          usn: usn || null,
        },
      });
    } else if (kind === "college") {
      const collegeName = String(formData.get("collegeName") ?? "").trim();
      const contactEmail = String(formData.get("contactEmail") ?? "").trim();
      const admin = await prisma.user.update({
        where: { id, role: "COLLEGE_ADMIN" },
        data: { name, phone: phone || null },
      });
      if (admin.collegeId && collegeName) {
        await prisma.college.update({
          where: { id: admin.collegeId },
          data: { name: collegeName, contactEmail: contactEmail || null },
        });
      }
    } else if (kind === "trainer") {
      const hourlyRateInput = String(formData.get("hourlyRate") ?? "").trim();
      await prisma.trainer.update({
        where: { id },
        data: {
          name,
          phone: phone || null,
          hourlyRate: hourlyRateInput ? Number.parseInt(hourlyRateInput, 10) : undefined,
        },
      });
      // The trainer's login User row carries its own copy of the name, kept in sync here.
      await prisma.user.updateMany({ where: { trainerId: id }, data: { name } });
    } else if (kind === "admin") {
      await prisma.user.update({
        where: { id, role: { in: ["SUPER_ADMIN", "ADMIN2"] } },
        data: { name, phone: phone || null },
      });
    }
  } catch {
    return { ok: false, error: "Could not save — please check the details and try again." };
  }

  revalidatePath("/lms/company/account-details");
  return { ok: true };
}

export type SendDetailsEmailState = { ok: boolean; error?: string; preview?: string } | null;

export async function sendAccountDetailsEmail(
  kind: AccountKind,
  id: string
): Promise<SendDetailsEmailState> {
  await requireSuperAdmin();

  let email: string | null = null;
  let lines: string[] = [];

  if (kind === "student") {
    const s = await prisma.user.findUnique({
      where: { id },
      include: { college: true, enrollments: { include: { course: true, attendanceRecords: true } } },
    });
    if (!s) return { ok: false, error: "Account not found." };
    email = s.email;
    lines = [
      `Name: ${s.name}`,
      `Email: ${s.email}`,
      `Phone: ${s.phone ?? "—"}`,
      `College: ${s.college?.name ?? "—"}`,
      `USN: ${s.usn ?? "—"}`,
      `Branch: ${s.branch ?? "—"} | Semester: ${s.semester ?? "—"}`,
      "",
      "Enrolled Courses:",
      ...s.enrollments.map((e) => {
        const total = e.attendanceRecords.length || e.totalClasses;
        const present = e.attendanceRecords.filter((r) => r.present).length;
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;
        return `  - ${e.course.name}: ${pct}% attendance`;
      }),
    ];
  } else if (kind === "college") {
    const admin = await prisma.user.findUnique({ where: { id }, include: { college: true } });
    if (!admin || !admin.college) return { ok: false, error: "Account not found." };
    email = admin.email;
    lines = [
      `College: ${admin.college.name}`,
      `Concerned Person: ${admin.name}`,
      `Login Email: ${admin.email}`,
      `Phone: ${admin.phone ?? "—"}`,
      `College Contact Email: ${admin.college.contactEmail ?? "—"}`,
    ];
  } else if (kind === "trainer") {
    const t = await prisma.trainer.findUnique({ where: { id }, include: { loginUser: true, invoices: true } });
    if (!t || !t.loginUser) return { ok: false, error: "Account not found." };
    email = t.loginUser.email;
    lines = [
      `Name: ${t.name}`,
      `Email: ${t.loginUser.email}`,
      `Phone: ${t.phone ?? "—"}`,
      `Hourly Rate: ₹${t.hourlyRate}`,
      `Total Invoices: ${t.invoices.length}`,
    ];
  } else if (kind === "admin") {
    const a = await prisma.user.findUnique({ where: { id } });
    if (!a) return { ok: false, error: "Account not found." };
    email = a.email;
    lines = [
      `Name: ${a.name}`,
      `Email: ${a.email}`,
      `Phone: ${a.phone ?? "—"}`,
      `Role: ${a.role === "SUPER_ADMIN" ? "Main Admin" : "Second Admin"}`,
    ];
  }

  if (!email) return { ok: false, error: "No email on file for this account." };

  const body = lines.join("\n");

  // No email provider is configured yet (see the same note in password-resets.ts) —
  // this simulates delivery. Wire up a real provider (Resend/SendGrid/SMTP) here to
  // actually send `body` to `email`.
  console.log(`[dummy email] Account details for ${email}:\n${body}`);

  return { ok: true, preview: body };
}
