"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireTrainer() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TRAINER" || !session.user.trainerId) {
    throw new Error("Only trainers can manage their content.");
  }
  return session.user.trainerId;
}

export async function createSessionContent(formData: FormData) {
  const trainerId = await requireTrainer();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const courseModuleId = String(formData.get("courseModuleId") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const fileType = String(formData.get("fileType") ?? "").trim();

  if (!title || !fileUrl) {
    throw new Error("Title and a file upload are required.");
  }

  await prisma.sessionContent.create({
    data: {
      trainerId,
      title,
      description: description || null,
      courseId: courseId || null,
      courseModuleId: courseModuleId || null,
      fileUrl,
      fileType: fileType || "pdf",
    },
  });

  revalidatePath("/lms/trainer/content");
}

export async function deleteSessionContent(contentId: string) {
  const trainerId = await requireTrainer();

  const content = await prisma.sessionContent.findUnique({ where: { id: contentId } });
  if (!content || content.trainerId !== trainerId) {
    throw new Error("Content not found.");
  }

  await prisma.sessionContent.delete({ where: { id: contentId } });
  revalidatePath("/lms/trainer/content");
}
