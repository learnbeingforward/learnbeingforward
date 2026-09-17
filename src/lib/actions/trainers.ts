"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
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

  await prisma.trainer.update({
    where: { id: session.user.trainerId },
    data: {
      phone: phone || null,
      bio: bio || null,
      cvUrl: cvUrl || null,
    },
  });

  revalidatePath("/lms/trainer");
  return { ok: true };
}
