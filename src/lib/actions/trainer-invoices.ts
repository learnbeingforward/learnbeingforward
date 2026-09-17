"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const HOURS_PER_SESSION = 2;

export async function getBillableSessions(trainerId: string) {
  return prisma.trainingSession.findMany({
    where: {
      trainerId,
      attendanceTaken: true,
      invoiceLineItems: {
        none: {
          invoice: { status: { in: ["PENDING", "APPROVED"] } },
        },
      },
    },
    include: { batch: { include: { college: true, course: true } }, courseModule: true },
    orderBy: { sessionDate: "asc" },
  });
}

export type SubmitInvoiceState = { ok: boolean; error?: string } | null;

export async function submitTrainerInvoice(
  _prevState: SubmitInvoiceState,
  formData: FormData
): Promise<SubmitInvoiceState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "TRAINER" || !session.user.trainerId) {
    return { ok: false, error: "Not authorized." };
  }

  const trainerId = session.user.trainerId;
  const notes = String(formData.get("notes") ?? "").trim();

  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });
  const billable = await getBillableSessions(trainerId);

  if (billable.length === 0) {
    return { ok: false, error: "No billable sessions to invoice yet." };
  }

  const hours = billable.length * HOURS_PER_SESSION;
  const totalAmount = hours * trainer.hourlyRate;

  await prisma.trainerInvoice.create({
    data: {
      trainerId,
      sessionCount: billable.length,
      hours,
      hourlyRate: trainer.hourlyRate,
      totalAmount,
      notes: notes || null,
      lineItems: {
        create: billable.map((s) => ({ trainingSessionId: s.id })),
      },
    },
  });

  revalidatePath("/lms/trainer/invoice");
  revalidatePath("/lms/company/trainers/invoices");

  return { ok: true };
}

export async function decideTrainerInvoice(invoiceId: string, approve: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the company admin can decide on invoices.");
  }

  const invoice = await prisma.trainerInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.status !== "PENDING") return;

  await prisma.trainerInvoice.update({
    where: { id: invoiceId },
    data: { status: approve ? "APPROVED" : "REJECTED", decidedAt: new Date() },
  });

  revalidatePath("/lms/company/trainers/invoices");
  revalidatePath("/lms/trainer/invoice");
}
