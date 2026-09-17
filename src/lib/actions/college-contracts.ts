"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderCollegeInvoicePdf } from "@/lib/pdf/invoice-pdf";

const HOURS_PER_SESSION = 2;

export type RequestTrainingState = { ok: boolean; error?: string } | null;

export async function requestTraining(
  _prevState: RequestTrainingState,
  formData: FormData
): Promise<RequestTrainingState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Not authorized." };
  }

  const collegeId = String(formData.get("collegeId") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const contractType = String(formData.get("contractType") ?? "").trim();
  const minStudentsInput = String(formData.get("minStudents") ?? "100").trim();
  const totalDaysInput = String(formData.get("totalDays") ?? "").trim();
  const startDateInput = String(formData.get("startDate") ?? "").trim();
  const ratePerStudentHourInput = String(formData.get("ratePerStudentHour") ?? "").trim();
  const flatRatePerDayInput = String(formData.get("flatRatePerDay") ?? "").trim();

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

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + totalDays - 1);

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
    },
  });

  revalidatePath("/lms/company/colleges");
  revalidatePath("/lms/college/contracts");
  return { ok: true };
}

export async function decideContract(contractId: string, approve: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COLLEGE_ADMIN") {
    throw new Error("Only a college admin can decide on a training request.");
  }

  const contract = await prisma.collegeContract.findUnique({ where: { id: contractId } });
  if (!contract || contract.status !== "PENDING" || contract.collegeId !== session.user.collegeId) {
    return;
  }

  await prisma.collegeContract.update({
    where: { id: contractId },
    data: { status: approve ? "APPROVED" : "REJECTED", decidedAt: new Date() },
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

export async function generateCollegeInvoice(contractId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the company admin can generate an invoice.");
  }

  const contract = await prisma.collegeContract.findUnique({
    where: { id: contractId },
    include: { college: true, course: true },
  });
  if (!contract || contract.status !== "APPROVED" || contract.contractType === "CSR") return;

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

  if (contract.contractType === "PER_STUDENT_HOURLY") {
    let hoursSum = 0;
    let amountSum = 0;
    for (const batch of batches) {
      const hours = batch.trainingSessions.length * HOURS_PER_SESSION;
      hoursSum += hours;
      amountSum += hours * batch.enrollments.length * (contract.ratePerStudentHour ?? 0);
    }
    if (hoursSum === 0) return;
    totalHours = hoursSum;
    totalAmount = amountSum;
    totalStudents = batches.reduce((sum, b) => sum + b.enrollments.length, 0);
  } else {
    const distinctDates = new Set<string>();
    for (const batch of batches) {
      for (const s of batch.trainingSessions) {
        distinctDates.add(s.sessionDate.toISOString().slice(0, 10));
      }
    }
    if (distinctDates.size === 0) return;
    totalDays = distinctDates.size;
    totalStudents = batches.reduce((sum, b) => sum + b.enrollments.length, 0);
    totalAmount = totalDays * (contract.flatRatePerDay ?? 0);
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
    }
  );
  await prisma.collegeInvoice.update({ where: { id: invoice.id }, data: { pdfUrl } });

  revalidatePath("/lms/company/colleges");
  revalidatePath("/lms/college/contracts");
}

export async function decideCollegeInvoice(invoiceId: string, approve: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COLLEGE_ADMIN") {
    throw new Error("Only a college admin can decide on an invoice.");
  }

  const invoice = await prisma.collegeInvoice.findUnique({
    where: { id: invoiceId },
    include: { contract: true },
  });
  if (!invoice || invoice.status !== "PENDING" || invoice.contract.collegeId !== session.user.collegeId) {
    return;
  }

  await prisma.collegeInvoice.update({
    where: { id: invoiceId },
    data: { status: approve ? "APPROVED" : "REJECTED", decidedAt: new Date() },
  });

  revalidatePath("/lms/college/contracts");
  revalidatePath("/lms/company/colleges");
}
