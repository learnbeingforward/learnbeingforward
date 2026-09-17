"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type UpdateProfileState = { ok: boolean; error?: string } | null;

export async function updateStudentProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return { ok: false, error: "Not authorized." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const usn = String(formData.get("usn") ?? "").trim();
  const fatherName = String(formData.get("fatherName") ?? "").trim();
  const branch = String(formData.get("branch") ?? "").trim();
  const semesterInput = String(formData.get("semester") ?? "").trim();
  const semester = semesterInput ? Number.parseInt(semesterInput, 10) : null;
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const cvUrl = String(formData.get("cvUrl") ?? "").trim();

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const current = await prisma.user.findUnique({ where: { id: session.user.id } });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      usn: usn || null,
      fatherName: fatherName || null,
      branch: branch || null,
      semester,
      photoUrl: photoUrl || null,
      avatarSeed: current?.avatarSeed ?? `${slugify(name)}-${Date.now()}`,
      cvUrl: cvUrl || null,
    },
  });

  revalidatePath("/lms/student/profile");
  revalidatePath("/lms/college/students");
  return { ok: true };
}

export async function updateCollegeProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "COLLEGE_ADMIN" || !session.user.collegeId) {
    return { ok: false, error: "Not authorized." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();

  if (!name) {
    return { ok: false, error: "College name is required." };
  }

  await prisma.college.update({
    where: { id: session.user.collegeId },
    data: { name, contactEmail: contactEmail || null },
  });

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      photoUrl: photoUrl || null,
      avatarSeed: currentUser?.avatarSeed ?? `${slugify(name)}-${Date.now()}`,
    },
  });

  revalidatePath("/lms/college/profile");
  return { ok: true };
}

export async function updateCompanyProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Not authorized." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const companyBankAccountName = String(formData.get("companyBankAccountName") ?? "").trim();
  const companyBankAccountNumber = String(formData.get("companyBankAccountNumber") ?? "").trim();
  const companyBankIfsc = String(formData.get("companyBankIfsc") ?? "").trim();
  const companyBankName = String(formData.get("companyBankName") ?? "").trim();
  const companyGstNumber = String(formData.get("companyGstNumber") ?? "").trim();

  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const current = await prisma.user.findUnique({ where: { id: session.user.id } });
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      photoUrl: photoUrl || null,
      avatarSeed: current?.avatarSeed ?? `${slugify(name)}-${Date.now()}`,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      companyBankAccountName: companyBankAccountName || null,
      companyBankAccountNumber: companyBankAccountNumber || null,
      companyBankIfsc: companyBankIfsc || null,
      companyBankName: companyBankName || null,
      companyGstNumber: companyGstNumber || null,
    },
    create: {
      id: "singleton",
      companyBankAccountName: companyBankAccountName || null,
      companyBankAccountNumber: companyBankAccountNumber || null,
      companyBankIfsc: companyBankIfsc || null,
      companyBankName: companyBankName || null,
      companyGstNumber: companyGstNumber || null,
    },
  });

  revalidatePath("/lms/company/profile");
  return { ok: true };
}

export type ChangePasswordState = { ok: boolean; error?: string } | null;

export async function changeOwnPassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Not authorized." };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!currentPassword || !newPassword) {
    return { ok: false, error: "Please fill in both password fields." };
  }
  if (newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false, error: "Account not found." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Your current password is incorrect." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { ok: true };
}
