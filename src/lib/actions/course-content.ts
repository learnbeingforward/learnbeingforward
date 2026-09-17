"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireCompany() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the company admin can manage course content.");
  }
}

export type CreateCourseContentState = { ok: boolean; error?: string } | null;

export async function createCourseContent(
  _prevState: CreateCourseContentState,
  formData: FormData
): Promise<CreateCourseContentState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Not authorized." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const courseModuleId = String(formData.get("courseModuleId") ?? "").trim();
  const courseSubModuleId = String(formData.get("courseSubModuleId") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const linkLabels = formData.getAll("linkLabel").map(String);
  const linkUrls = formData.getAll("linkUrl").map(String);

  if (!title || !courseId || !courseModuleId || !fileUrl) {
    return { ok: false, error: "Please fill in all fields and attach a PDF before submitting." };
  }

  const links = linkLabels
    .map((label, i) => ({ label: label.trim(), url: (linkUrls[i] ?? "").trim() }))
    .filter((l) => l.label && l.url);

  await prisma.courseContent.create({
    data: {
      title,
      courseId,
      courseModuleId,
      courseSubModuleId: courseSubModuleId || null,
      fileUrl,
      links: { create: links.map((l, i) => ({ label: l.label, url: l.url, order: i })) },
    },
  });

  revalidatePath("/lms/company/course-content");
  revalidatePath("/lms/student/content");
  return { ok: true };
}

export async function deleteCourseContent(contentId: string) {
  await requireCompany();
  await prisma.courseContent.delete({ where: { id: contentId } });
  revalidatePath("/lms/company/course-content");
  revalidatePath("/lms/student/content");
}

export async function decideContentAccessRequest(requestId: string, approve: boolean) {
  await requireCompany();

  const request = await prisma.contentAccessRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") return;

  await prisma.contentAccessRequest.update({
    where: { id: requestId },
    data: { status: approve ? "APPROVED" : "REJECTED", decidedAt: new Date() },
  });

  revalidatePath("/lms/company/course-content");
  revalidatePath("/lms/student/content");
}
