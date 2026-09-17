"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";

export type CreateTrainerState = {
  ok: boolean;
  error?: string;
  email?: string;
  password?: string;
} | null;

function generatePassword() {
  return randomBytes(9).toString("base64").replace(/[+/=]/g, "");
}

export async function createTrainerAccount(
  _prevState: CreateTrainerState,
  formData: FormData
): Promise<CreateTrainerState> {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    return { ok: false, error: "Not authorized." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const hourlyRateInput = String(formData.get("hourlyRate") ?? "0").trim();
  const hourlyRate = Number.parseInt(hourlyRateInput, 10);

  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const existingTrainer = await prisma.trainer.findUnique({ where: { email } });
  if (existingTrainer) {
    return { ok: false, error: "A trainer with this email already exists." };
  }

  const trainer = await prisma.trainer.create({
    data: {
      name,
      email,
      phone: phone || null,
      hourlyRate: Number.isFinite(hourlyRate) && hourlyRate > 0 ? hourlyRate : 0,
    },
  });

  const password = generatePassword();
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "TRAINER",
      trainerId: trainer.id,
    },
  });

  revalidatePath("/lms/company/edit-site/employees");
  revalidatePath("/lms/company/trainers");

  return { ok: true, email, password };
}

export async function updateTrainerRate(trainerId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the company admin can update trainer rates.");
  }

  const hourlyRate = Number.parseInt(String(formData.get("hourlyRate") ?? "0"), 10);
  if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
    throw new Error("Enter a valid hourly rate.");
  }

  await prisma.trainer.update({ where: { id: trainerId }, data: { hourlyRate } });
  revalidatePath("/lms/company/trainers");
}

export type UpdateTrainerProfileState = { ok: boolean; error?: string } | null;

export async function updateTrainerProfile(
  _prevState: UpdateTrainerProfileState,
  formData: FormData
): Promise<UpdateTrainerProfileState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "TRAINER" || !session.user.trainerId) {
    return { ok: false, error: "Not authorized." };
  }

  const phone = String(formData.get("phone") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const cvUrl = String(formData.get("cvUrl") ?? "").trim();
  const bankAccountName = String(formData.get("bankAccountName") ?? "").trim();
  const bankAccountNumber = String(formData.get("bankAccountNumber") ?? "").trim();
  const bankIfsc = String(formData.get("bankIfsc") ?? "").trim();
  const bankName = String(formData.get("bankName") ?? "").trim();

  await prisma.trainer.update({
    where: { id: session.user.trainerId },
    data: {
      phone: phone || null,
      bio: bio || null,
      cvUrl: cvUrl || null,
      bankAccountName: bankAccountName || null,
      bankAccountNumber: bankAccountNumber || null,
      bankIfsc: bankIfsc || null,
      bankName: bankName || null,
    },
  });

  revalidatePath("/lms/trainer");
  return { ok: true };
}

export type CreateLoginForTrainerState = {
  ok: boolean;
  error?: string;
  email?: string;
  password?: string;
} | null;

export async function createLoginForExistingTrainer(
  trainerId: string,
  _prevState: CreateLoginForTrainerState,
  formData: FormData
): Promise<CreateLoginForTrainerState> {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    return { ok: false, error: "Not authorized." };
  }

  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId }, include: { loginUser: true } });
  if (!trainer) return { ok: false, error: "Trainer not found." };
  if (trainer.loginUser) return { ok: false, error: "This trainer already has a login." };

  const emailInput = String(formData.get("email") ?? "").trim().toLowerCase();
  const email = emailInput || trainer.email;
  if (!email) return { ok: false, error: "Enter an email for this trainer's login." };

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { ok: false, error: "An account with this email already exists." };

  if (email !== trainer.email) {
    const emailInUseByAnotherTrainer = await prisma.trainer.findUnique({ where: { email } });
    if (emailInUseByAnotherTrainer) return { ok: false, error: "Another trainer already uses this email." };
  }

  const password = generatePassword();
  await prisma.$transaction([
    prisma.trainer.update({ where: { id: trainerId }, data: { email } }),
    prisma.user.create({
      data: {
        name: trainer.name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: "TRAINER",
        trainerId: trainer.id,
      },
    }),
  ]);

  revalidatePath("/lms/company/trainers");
  revalidatePath("/lms/company/password-resets");

  return { ok: true, email, password };
}

export type ResetTrainerPasswordState = { ok: boolean; error?: string } | null;

export async function resetTrainerPassword(
  _prevState: ResetTrainerPasswordState,
  formData: FormData
): Promise<ResetTrainerPasswordState> {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    return { ok: false, error: "Not authorized." };
  }

  const trainerId = String(formData.get("trainerId") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "").trim();

  if (!trainerId) return { ok: false, error: "Select a trainer." };
  if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const user = await prisma.user.findFirst({ where: { trainerId } });
  if (!user) return { ok: false, error: "This trainer doesn't have a login yet." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  return { ok: true };
}
