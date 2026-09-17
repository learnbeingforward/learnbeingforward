"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";

export async function approveRegistration(userId: string) {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    throw new Error("Only the company admin can approve registrations.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.studentStatus !== "PENDING_APPROVAL") return;

  await prisma.user.update({
    where: { id: userId },
    data: { studentStatus: "ACTIVE" },
  });

  revalidatePath("/lms/company/registrations");
}

export async function rejectRegistration(userId: string) {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    throw new Error("Only the company admin can reject registrations.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.studentStatus !== "PENDING_APPROVAL") return;

  // Revert to a roster entry (unusable password) so the college's record stays
  // and the student can attempt sign-up again if this was a mistake.
  const { randomBytes } = await import("node:crypto");
  const bcrypt = (await import("bcryptjs")).default;

  await prisma.user.update({
    where: { id: userId },
    data: {
      studentStatus: "PRE_REGISTERED",
      passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 10),
    },
  });

  revalidatePath("/lms/company/registrations");
}
