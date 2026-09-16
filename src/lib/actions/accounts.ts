"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CreateAccountState = {
  ok: boolean;
  error?: string;
  email?: string;
  password?: string;
  roster?: boolean;
} | null;

function generatePassword() {
  return randomBytes(9).toString("base64").replace(/[+/=]/g, "");
}

export async function createStudentAccount(
  _prevState: CreateAccountState,
  formData: FormData
): Promise<CreateAccountState> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "COLLEGE_ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return { ok: false, error: "Not authorized." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const usn = String(formData.get("usn") ?? "").trim();
  const fatherName = String(formData.get("fatherName") ?? "").trim();
  const collegeIdInput = String(formData.get("collegeId") ?? "").trim();

  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const isCollegeAdmin = session.user.role === "COLLEGE_ADMIN";
  const collegeId = isCollegeAdmin ? session.user.collegeId : collegeIdInput || null;

  if (isCollegeAdmin) {
    // College admins add a roster entry only — no login credential yet. The
    // student claims it themselves via sign-up (name + email + college must
    // match), which is what closes the "anyone can claim any college" hole.
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 10),
        role: "STUDENT",
        usn: usn || null,
        fatherName: fatherName || null,
        collegeId,
        studentStatus: "PRE_REGISTERED",
      },
    });

    revalidatePath("/lms/college/students");
    return { ok: true, email, roster: true };
  }

  const password = generatePassword();
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "STUDENT",
      usn: usn || null,
      fatherName: fatherName || null,
      collegeId,
      studentStatus: "ACTIVE",
    },
  });

  revalidatePath("/lms/company/accounts");

  return { ok: true, email, password };
}

export async function createCollegeAccount(
  _prevState: CreateAccountState,
  formData: FormData
): Promise<CreateAccountState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Not authorized." };
  }

  const adminName = String(formData.get("adminName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const collegeName = String(formData.get("collegeName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();

  if (!adminName || !email || !collegeName) {
    return { ok: false, error: "Admin name, email, and college name are required." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const college = await prisma.college.upsert({
    where: { name: collegeName },
    update: {},
    create: { name: collegeName, contactEmail: contactEmail || null },
  });

  const password = generatePassword();
  await prisma.user.create({
    data: {
      name: adminName,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "COLLEGE_ADMIN",
      collegeId: college.id,
    },
  });

  revalidatePath("/lms/company/accounts");

  return { ok: true, email, password };
}
