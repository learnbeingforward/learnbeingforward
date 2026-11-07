"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { requireCompanyAccess } from "@/lib/employee-access";
import { notify } from "@/lib/notifications";

async function requireTrainer() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TRAINER" || !session.user.trainerId) {
    throw new Error("Only trainers can manage their content.");
  }
  return session.user.trainerId;
}

async function requireTrainerContentReview() {
  const session = await auth();
  if (session?.user && isCompanyStaff(session.user.role)) return;
  try {
    await requireCompanyAccess("overview.trainer-content");
  } catch {
    throw new Error("Only the company admin can review trainer content.");
  }
}

export type CreateSessionContentState = { ok: boolean; error?: string } | null;

export async function createSessionContent(
  _prevState: CreateSessionContentState,
  formData: FormData
): Promise<CreateSessionContentState> {
  const trainerId = await requireTrainer();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const courseModuleId = String(formData.get("courseModuleId") ?? "").trim();
  const courseSubModuleId = String(formData.get("courseSubModuleId") ?? "").trim() || null;
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const fileType = String(formData.get("fileType") ?? "").trim();

  if (!title || !description || !courseId || !courseModuleId || !fileUrl) {
    return { ok: false, error: "Please fill in all fields and attach a file before submitting." };
  }

  const [trainer, course, courseModule] = await Promise.all([
    prisma.trainer.findUnique({ where: { id: trainerId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.courseModule.findUnique({ where: { id: courseModuleId } }),
  ]);

  await prisma.sessionContent.create({
    data: {
      trainerId,
      title,
      description,
      courseId,
      courseModuleId,
      courseSubModuleId,
      fileUrl,
      fileType: fileType || "pdf",
    },
  });

  await notify("TRAINER", `${trainer?.name ?? "A trainer"} submitted content for review`, {
    message: `${course?.name ?? "—"} — ${courseModule?.title ?? "—"}: ${title}`,
    href: "/lms/company/trainer-content",
    requiredKey: "overview.trainer-content",
  });

  revalidatePath("/lms/trainer/content");
  return { ok: true };
}

export async function deleteSessionContent(contentId: string) {
  const trainerId = await requireTrainer();

  const content = await prisma.sessionContent.findUnique({ where: { id: contentId } });
  if (!content || content.trainerId !== trainerId) {
    throw new Error("Content not found.");
  }

  await prisma.sessionContent.delete({ where: { id: contentId } });
  revalidatePath("/lms/trainer/content");
  revalidatePath("/lms/company/trainer-content");
}

/**
 * The admin's "Send to Student" action — one click, no per-student picking. It
 * shares the content with every student who actually attended one of this
 * trainer's sessions for this module (present=true on a TrainingSession taught by
 * this trainer with this courseModuleId); students who never attended never see
 * it. Visibility is computed at read time from attendance, not stored per student.
 */
export async function sendSessionContentToAttendedStudents(contentId: string) {
  await requireTrainerContentReview();

  const content = await prisma.sessionContent.findUnique({ where: { id: contentId } });
  if (!content) throw new Error("Content not found.");

  await prisma.sessionContent.update({
    where: { id: contentId },
    data: { sharedWithStudents: true, sharedAt: new Date() },
  });

  revalidatePath("/lms/company/trainer-content");
  revalidatePath("/lms/student/content");
}

export async function unshareSessionContent(contentId: string) {
  await requireTrainerContentReview();
  await prisma.sessionContent.update({ where: { id: contentId }, data: { sharedWithStudents: false, sharedAt: null } });
  revalidatePath("/lms/company/trainer-content");
  revalidatePath("/lms/student/content");
}

export async function deleteSessionContentAsAdmin(contentId: string) {
  await requireTrainerContentReview();
  await prisma.sessionContent.delete({ where: { id: contentId } });
  revalidatePath("/lms/company/trainer-content");
  revalidatePath("/lms/trainer/content");
  revalidatePath("/lms/student/content");
}
