"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { renderCollegeInvoicePdf, type CollegeInvoiceLineItem } from "@/lib/pdf/invoice-pdf";

const HOURS_PER_SESSION = 2;

export type RequestTrainingState = { ok: boolean; error?: string } | null;

export async function requestTraining(
  _prevState: RequestTrainingState,
  formData: FormData
): Promise<RequestTrainingState> {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    return { ok: false, error: "Not authorized." };
  }
  const isAdmin2 = session.user.role === "ADMIN2";

  const collegeId = String(formData.get("collegeId") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const contractType = String(formData.get("contractType") ?? "").trim();
  const minStudentsInput = String(formData.get("minStudents") ?? "100").trim();
  const totalDaysInput = String(formData.get("totalDays") ?? "").trim();
  const startDateInput = String(formData.get("startDate") ?? "").trim();
  const ratePerStudentHourInput = String(formData.get("ratePerStudentHour") ?? "").trim();
  const flatRatePerDayInput = String(formData.get("flatRatePerDay") ?? "").trim();
  const targetBranchInput = String(formData.get("targetBranch") ?? "").trim();
  const targetSemesterInput = String(formData.get("targetSemester") ?? "").trim();

  if (!collegeId || !courseId || !contractType || !totalDaysInput || !startDateInput) {
    return { ok: false, error: "Please fill in all fields before submitting." };
  }
  if (!["CSR", "PER_STUDENT_HOURLY", "PER_DAY_FLAT"].includes(contractType)) {
    return { ok: false, error: "Select a valid training type." };
  }

  const totalDays = Number.parseInt(totalDaysInput, 10);
  const minStudents = Number.parseInt(minStudentsInput, 10) || 100;
  const startDate = new Date(`${startDateInput}T00:00:00`);

  if (!Number.isFinite(totalDays) || totalDays < 1) {
    return { ok: false, error: "Enter a valid number of training days." };
  }
  if (Number.isNaN(startDate.getTime())) {
    return { ok: false, error: "Enter a valid start date." };
  }

  let ratePerStudentHour: number | null = null;
  let flatRatePerDay: number | null = null;

  if (!isAdmin2) {
    if (contractType === "PER_STUDENT_HOURLY") {
      ratePerStudentHour = Number.parseInt(ratePerStudentHourInput, 10);
      if (!Number.isFinite(ratePerStudentHour) || ratePerStudentHour <= 0) {
        return { ok: false, error: "Enter a valid per-student, per-hour rate." };
      }
    } else if (contractType === "PER_DAY_FLAT") {
      flatRatePerDay = Number.parseInt(flatRatePerDayInput, 10);
      if (!Number.isFinite(flatRatePerDay) || flatRatePerDay <= 0) {
        return { ok: false, error: "Enter a valid flat daily rate." };
      }
    }
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + totalDays - 1);

  const targetSemester = targetSemesterInput ? Number.parseInt(targetSemesterInput, 10) : null;

  await prisma.collegeContract.create({
    data: {
      collegeId,
      courseId,
      contractType: contractType as never,
      ratePerStudentHour,
      flatRatePerDay,
      minStudents,
      totalDays,
      startDate,
      endDate,
      targetBranch: targetBranchInput || null,
      targetSemester,
      status: isAdmin2 ? "PENDING_RATE" : "PENDING",
      requestedByAdminId: isAdmin2 ? session.user.id : null,
    },
  });

  revalidatePath("/lms/company/colleges");
  revalidatePath("/lms/college/contracts");
  return { ok: true };
}

export type ApproveRateState = { ok: boolean; error?: string } | null;

export async function approveContractRate(
  contractId: string,
  _prevState: ApproveRateState,
  formData: FormData
): Promise<ApproveRateState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Only the main company admin can set the rate and send this to the college." };
  }

  const contract = await prisma.collegeContract.findUnique({ where: { id: contractId } });
  if (!contract || contract.status !== "PENDING_RATE") {
    return { ok: false, error: "This request is no longer awaiting a rate." };
  }

  let ratePerStudentHour: number | null = null;
  let flatRatePerDay: number | null = null;

  if (contract.contractType === "PER_STUDENT_HOURLY") {
    ratePerStudentHour = Number.parseInt(String(formData.get("ratePerStudentHour") ?? ""), 10);
    if (!Number.isFinite(ratePerStudentHour) || ratePerStudentHour <= 0) {
      return { ok: false, error: "Enter a valid per-student, per-hour rate." };
    }
  } else if (contract.contractType === "PER_DAY_FLAT") {
    flatRatePerDay = Number.parseInt(String(formData.get("flatRatePerDay") ?? ""), 10);
    if (!Number.isFinite(flatRatePerDay) || flatRatePerDay <= 0) {
      return { ok: false, error: "Enter a valid flat daily rate." };
    }
  }

  await prisma.collegeContract.update({
    where: { id: contractId },
    data: { ratePerStudentHour, flatRatePerDay, status: "PENDING" },
  });

  revalidatePath("/lms/company/colleges");
  revalidatePath("/lms/college/contracts");
  return { ok: true };
}

export async function decideContract(contractId: string, approve: boolean, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COLLEGE_ADMIN") {
    throw new Error("Only a college admin can decide on a training request.");
  }

  const contract = await prisma.collegeContract.findUnique({ where: { id: contractId } });
  if (!contract || contract.status !== "PENDING" || contract.collegeId !== session.user.collegeId) {
    return;
  }

  const reason = String(formData.get("reason") ?? "").trim();
  if (!approve && !reason) {
    throw new Error("A reason is required when rejecting a training request.");
  }

  await prisma.collegeContract.update({
    where: { id: contractId },
    data: { status: approve ? "APPROVED" : "REJECTED", decidedAt: new Date(), rejectReason: reason || null },
  });

  revalidatePath("/lms/college/contracts");
  revalidatePath("/lms/company/colleges");
}

export async function rescheduleSession(sessionId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the company admin can reschedule a session.");
  }

  const newDateInput = String(formData.get("newDate") ?? "").trim();
  if (!newDateInput) throw new Error("Enter a new date.");

  const trainingSession = await prisma.trainingSession.findUnique({ where: { id: sessionId } });
  if (!trainingSession || trainingSession.attendanceTaken) return;

  await prisma.trainingSession.update({
    where: { id: sessionId },
    data: { sessionDate: new Date(`${newDateInput}T00:00:00`) },
  });

  revalidatePath("/lms/company/colleges");
  revalidatePath("/lms/company/trainers/schedule");
  revalidatePath("/lms/trainer/schedule");
}

export type GenerateInvoiceState = { ok: boolean; error?: string; invoiceId?: string; pdfUrl?: string } | null;

export async function generateCollegeInvoice(
  contractId: string,
  _prevState: GenerateInvoiceState,
  _formData: FormData
): Promise<GenerateInvoiceState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Only the main company admin can generate an invoice." };
  }

  const contract = await prisma.collegeContract.findUnique({
    where: { id: contractId },
    include: { college: true, course: true },
  });
  if (!contract) return { ok: false, error: "Training request not found." };
  if (contract.status !== "APPROVED") {
    return { ok: false, error: "The college hasn't approved this training request yet." };
  }
  if (contract.contractType === "CSR") {
    return { ok: false, error: "CSR training is free — no invoice is needed." };
  }

  const batches = await prisma.batch.findMany({
    where: { collegeId: contract.collegeId, courseId: contract.courseId },
    include: {
      enrollments: true,
      trainingSessions: { where: { attendanceTaken: true } },
    },
  });

  let totalStudents: number;
  let totalHours: number | null = null;
  let totalDays: number | null = null;
  let totalAmount: number;
  const lineItems: CollegeInvoiceLineItem[] = [];

  if (contract.contractType === "PER_STUDENT_HOURLY") {
    let hoursSum = 0;
    let amountSum = 0;
    for (const batch of batches) {
      const hours = batch.trainingSessions.length * HOURS_PER_SESSION;
      if (hours === 0) continue;
      const amount = hours * batch.enrollments.length * (contract.ratePerStudentHour ?? 0);
      hoursSum += hours;
      amountSum += amount;
      lineItems.push({ batchName: batch.name, students: batch.enrollments.length, hours, days: null, amount });
    }
    if (hoursSum === 0) {
      return {
        ok: false,
        error:
          "No training sessions have been marked as attended yet for this contract — mark attendance first, then generate the invoice.",
      };
    }
    totalHours = hoursSum;
    totalAmount = amountSum;
    totalStudents = batches.reduce((sum, b) => sum + b.enrollments.length, 0);
  } else {
    const allDistinctDates = new Set<string>();
    for (const batch of batches) {
      for (const s of batch.trainingSessions) {
        allDistinctDates.add(s.sessionDate.toISOString().slice(0, 10));
      }
    }
    if (allDistinctDates.size === 0) {
      return {
        ok: false,
        error:
          "No training sessions have been marked as attended yet for this contract — mark attendance first, then generate the invoice.",
      };
    }
    totalDays = allDistinctDates.size;
    totalStudents = batches.reduce((sum, b) => sum + b.enrollments.length, 0);
    totalAmount = totalDays * (contract.flatRatePerDay ?? 0);

    for (const batch of batches) {
      const batchDates = new Set(batch.trainingSessions.map((s) => s.sessionDate.toISOString().slice(0, 10)));
      if (batchDates.size === 0) continue;
      const amount = Math.round((batchDates.size / totalDays) * totalAmount);
      lineItems.push({ batchName: batch.name, students: batch.enrollments.length, hours: null, days: batchDates.size, amount });
    }
  }

  const invoice = await prisma.collegeInvoice.create({
    data: { contractId, totalStudents, totalHours, totalDays, totalAmount },
  });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const pdfUrl = await renderCollegeInvoicePdf(
    invoice.id,
    contract.college.name,
    contract.course.name,
    { totalStudents, totalHours, totalDays, totalAmount },
    {
      companyBankAccountName: settings?.companyBankAccountName ?? null,
      companyBankAccountNumber: settings?.companyBankAccountNumber ?? null,
      companyBankIfsc: settings?.companyBankIfsc ?? null,
      companyBankName: settings?.companyBankName ?? null,
      companyGstNumber: settings?.companyGstNumber ?? null,
    },
    lineItems
  );
  await prisma.collegeInvoice.update({ where: { id: invoice.id }, data: { pdfUrl } });

  revalidatePath("/lms/company/colleges");
  revalidatePath("/lms/college/contracts");

  return { ok: true, invoiceId: invoice.id, pdfUrl };
}

export type SubmitDraftState = { ok: boolean; error?: string } | null;

export async function submitDraftCollegeInvoice(
  invoiceId: string,
  _prevState: SubmitDraftState,
  _formData: FormData
): Promise<SubmitDraftState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Only the main company admin can send this invoice." };
  }

  const invoice = await prisma.collegeInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { ok: false, error: "Invoice not found." };
  if (invoice.submitted) return { ok: false, error: "This invoice has already been sent." };

  await prisma.collegeInvoice.update({ where: { id: invoiceId }, data: { submitted: true } });

  revalidatePath("/lms/company/colleges");
  revalidatePath("/lms/college/contracts");
  return { ok: true };
}

export async function decideCollegeInvoice(invoiceId: string, approve: boolean, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COLLEGE_ADMIN") {
    throw new Error("Only a college admin can decide on an invoice.");
  }

  const invoice = await prisma.collegeInvoice.findUnique({
    where: { id: invoiceId },
    include: { contract: true },
  });
  if (
    !invoice ||
    invoice.status !== "PENDING" ||
    !invoice.submitted ||
    invoice.contract.collegeId !== session.user.collegeId
  ) {
    return;
  }

  const reason = String(formData.get("reason") ?? "").trim();
  if (!approve && !reason) {
    throw new Error("A reason is required when rejecting an invoice.");
  }

  await prisma.collegeInvoice.update({
    where: { id: invoiceId },
    data: { status: approve ? "APPROVED" : "REJECTED", decidedAt: new Date(), rejectReason: reason || null },
  });

  revalidatePath("/lms/college/contracts");
  revalidatePath("/lms/company/colleges");
}
