"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderTrainerInvoicePdf, renderTrainerApprovalPdf } from "@/lib/pdf/invoice-pdf";

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

  const invoice = await prisma.trainerInvoice.create({
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

  const pdfUrl = await renderTrainerInvoicePdf(
    invoice.id,
    {
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      bankAccountName: trainer.bankAccountName,
      bankAccountNumber: trainer.bankAccountNumber,
      bankIfsc: trainer.bankIfsc,
      bankName: trainer.bankName,
    },
    billable.map((s) => ({
      date: s.sessionDate,
      collegeName: s.batch.college.name,
      batchName: s.batch.name,
      topic: s.courseModule?.title ?? s.topic ?? "—",
      hours: HOURS_PER_SESSION,
      rate: trainer.hourlyRate,
    })),
    totalAmount,
    notes || null
  );

  await prisma.trainerInvoice.update({ where: { id: invoice.id }, data: { pdfUrl } });

  revalidatePath("/lms/trainer/invoice");
  revalidatePath("/lms/company/trainers/invoices");

  return { ok: true };
}

export type DecideInvoiceState = { ok: boolean; error?: string } | null;

export async function decideTrainerInvoice(
  invoiceId: string,
  approve: boolean,
  _prevState: DecideInvoiceState,
  formData: FormData
): Promise<DecideInvoiceState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Only the company admin can decide on invoices." };
  }

  const invoice = await prisma.trainerInvoice.findUnique({
    where: { id: invoiceId },
    include: { trainer: true },
  });
  if (!invoice || invoice.status !== "PENDING") {
    return { ok: false, error: "This invoice has already been decided." };
  }

  const deductionInput = String(formData.get("deductionAmount") ?? "").trim();
  const deductionReasonInput = String(formData.get("deductionReason") ?? "").trim();
  const timelineInput = String(formData.get("paymentTimelineDays") ?? "").trim();

  const deductionAmount = deductionInput ? Number.parseInt(deductionInput, 10) : null;
  const paymentTimelineDays = timelineInput ? Number.parseInt(timelineInput, 10) : null;

  if (deductionInput && (!Number.isFinite(deductionAmount) || (deductionAmount ?? 0) < 0)) {
    return { ok: false, error: "Enter a valid deduction amount." };
  }
  if (deductionAmount && deductionAmount > 0 && !deductionReasonInput) {
    return { ok: false, error: "Provide a reason for the deduction." };
  }
  if (timelineInput && (!Number.isFinite(paymentTimelineDays) || (paymentTimelineDays ?? 0) <= 0)) {
    return { ok: false, error: "Enter a valid number of days for the payment timeline." };
  }

  const approvedAmount = approve ? invoice.totalAmount - (deductionAmount ?? 0) : null;

  await prisma.trainerInvoice.update({
    where: { id: invoiceId },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      decidedAt: new Date(),
      approvedAmount,
      deductionAmount: approve ? deductionAmount : null,
      deductionReason: approve && deductionAmount ? deductionReasonInput : null,
      paymentTimelineDays: approve ? paymentTimelineDays : null,
    },
  });

  const approvalPdfUrl = await renderTrainerApprovalPdf(
    invoiceId,
    { name: invoice.trainer.name },
    invoice.totalAmount,
    approve,
    approvedAmount,
    approve ? deductionAmount : null,
    approve && deductionAmount ? deductionReasonInput : null,
    approve ? paymentTimelineDays : null
  );

  await prisma.trainerInvoice.update({ where: { id: invoiceId }, data: { approvalPdfUrl } });

  revalidatePath("/lms/company/trainers/invoices");
  revalidatePath("/lms/trainer/invoice");

  return { ok: true };
}
