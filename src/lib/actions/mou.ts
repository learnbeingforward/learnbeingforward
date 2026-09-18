"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderMouPdf } from "@/lib/pdf/mou-pdf";

export type SaveMouState = { ok: boolean; error?: string } | null;

export async function saveMouAndGenerate(
  contractId: string,
  _prevState: SaveMouState,
  formData: FormData
): Promise<SaveMouState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Only the main company admin can manage MOUs." };
  }

  const contract = await prisma.collegeContract.findUnique({
    where: { id: contractId },
    include: { college: true, course: true },
  });
  if (!contract) return { ok: false, error: "Training request not found." };
  if (contract.status !== "APPROVED") {
    return { ok: false, error: "An MOU can only be generated once the college has approved this training." };
  }

  const notes = String(formData.get("notes") ?? "").trim();

  try {
    const pdfUrl = await renderMouPdf({
      contractId: contract.id,
      collegeName: contract.college.name,
      courseName: contract.course.name,
      contractType: contract.contractType,
      ratePerStudentHour: contract.ratePerStudentHour,
      flatRatePerDay: contract.flatRatePerDay,
      minStudents: contract.minStudents,
      totalDays: contract.totalDays,
      startDate: contract.startDate,
      endDate: contract.endDate,
      targetBranch: contract.targetBranch,
      targetSemester: contract.targetSemester,
      notes: notes || null,
    });

    await prisma.collegeContract.update({
      where: { id: contractId },
      data: { mouNotes: notes || null, mouPdfUrl: pdfUrl, mouGeneratedAt: new Date() },
    });
  } catch (err) {
    console.error("Failed to render MOU PDF:", err);
    return { ok: false, error: "Something went wrong generating the MOU PDF. Try again." };
  }

  revalidatePath("/lms/company/colleges/mous");
  return { ok: true };
}
