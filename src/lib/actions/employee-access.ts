"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseEmployeeKeys } from "@/lib/employee-access";

async function requireCompanyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN2")) {
    throw new Error("Only the company admin team can manage employee access.");
  }
  return session;
}

export type CreateEmployeeState = { ok: boolean; error?: string; email?: string } | null;

export async function createEmployeeAccount(
  _prevState: CreateEmployeeState,
  formData: FormData
): Promise<CreateEmployeeState> {
  await requireCompanyAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const pageKeys = parseEmployeeKeys(formData.getAll("pageKeys"));
  const employeeKind = formData.get("employeeKind") === "ADMIN" ? "ADMIN" : "EMPLOYEE";

  if (!name || !email) return { ok: false, error: "Name and email are required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (pageKeys.length === 0) return { ok: false, error: "Grant access to at least one section." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with this email already exists." };

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "EMPLOYEE",
      phone: phone || null,
      employeePageKeys: pageKeys,
      employeeKind,
    },
  });

  revalidatePath("/lms/company/employee-access");
  return { ok: true, email };
}

export async function updateEmployeeAccess(employeeId: string, formData: FormData) {
  await requireCompanyAdmin();
  const pageKeys = parseEmployeeKeys(formData.getAll("pageKeys"));

  await prisma.user.update({
    where: { id: employeeId, role: "EMPLOYEE" },
    data: { employeePageKeys: pageKeys },
  });

  revalidatePath("/lms/company/employee-access");
}

export async function deleteEmployeeAccount(employeeId: string) {
  await requireCompanyAdmin();
  await prisma.user.delete({ where: { id: employeeId, role: "EMPLOYEE" } });
  revalidatePath("/lms/company/employee-access");
}
