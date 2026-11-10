"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { requireCompanyAccess } from "@/lib/employee-access";

async function requireCompany() {
  const session = await auth();
  if (session?.user && isCompanyStaff(session.user.role)) return;
  try {
    await requireCompanyAccess("course-content");
  } catch {
    throw new Error("Only the company admin can manage course content.");
  }
}

export type CreateCourseContentState = { ok: boolean; error?: string } | null;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function createMinimalCourse(name: string) {
  const base = slugify(name) || "course";
  let slug = base;
  let n = 2;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  const maxOrder = await prisma.course.aggregate({ _max: { order: true } });
  // isPlaceholder keeps this off the public marketing site until someone fills in
  // real marketing copy for it on Edit Site — this flow only exists to attach
  // content, not to publish a course page.
  const course = await prisma.course.create({
    data: {
      slug,
      name,
      shortDescription: `${name} course content.`,
      description: `${name} course content.`,
      category: "Development",
      domain: "TECHNICAL",
      isPlaceholder: true,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });
  return course.id;
}

async function createMinimalCourseModule(courseId: string, title: string) {
  const maxOrder = await prisma.courseModule.aggregate({ where: { courseId }, _max: { order: true } });
  const mod = await prisma.courseModule.create({
    data: { courseId, title, topics: "[]", order: (maxOrder._max.order ?? 0) + 1 },
  });
  return mod.id;
}

async function createMinimalCourseSubModule(courseModuleId: string, title: string) {
  const maxOrder = await prisma.courseSubModule.aggregate({ where: { courseModuleId }, _max: { order: true } });
  const sub = await prisma.courseSubModule.create({
    data: { courseModuleId, title, order: (maxOrder._max.order ?? 0) + 1 },
  });
  return sub.id;
}

/**
 * Replaces the old "course/module/sub-module must all already exist" version of
 * createCourseContent — any of the three can now be created inline as part of
 * uploading the content, instead of requiring a separate trip to Edit Site first.
 * Whichever level ends up newly created (sub-module, or module when the course
 * itself is new) supplies the content's own title too, since in practice each
 * upload here corresponds to exactly one new topic. Picking an existing
 * sub-module still asks for a separate content title, since several items can
 * live under the same sub-module.
 */
export async function createCourseContentWithHierarchy(
  _prevState: CreateCourseContentState,
  formData: FormData
): Promise<CreateCourseContentState> {
  try {
    await requireCompany();
  } catch {
    return { ok: false, error: "Not authorized." };
  }

  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  if (!fileUrl) return { ok: false, error: "Attach a PDF before submitting." };

  const courseMode = String(formData.get("courseMode") ?? "existing");
  let courseId = String(formData.get("courseId") ?? "").trim();
  if (courseMode === "new") {
    const newCourseName = String(formData.get("newCourseName") ?? "").trim();
    if (!newCourseName) return { ok: false, error: "Enter a name for the new course." };
    courseId = await createMinimalCourse(newCourseName);
  } else if (!courseId) {
    return { ok: false, error: "Select a course, or choose to create a new one." };
  }

  const moduleMode = courseMode === "new" ? "new" : String(formData.get("moduleMode") ?? "existing");
  let courseModuleId = String(formData.get("courseModuleId") ?? "").trim();
  if (moduleMode === "new") {
    const newModuleName = String(formData.get("newModuleName") ?? "").trim();
    if (!newModuleName) return { ok: false, error: "Enter a name for the new module." };
    courseModuleId = await createMinimalCourseModule(courseId, newModuleName);
  } else if (!courseModuleId) {
    return { ok: false, error: "Select a module, or choose to create a new one." };
  }

  const subModuleMode = moduleMode === "new" ? "new" : String(formData.get("subModuleMode") ?? "existing");
  let courseSubModuleId: string | null = String(formData.get("courseSubModuleId") ?? "").trim() || null;
  let title: string;
  if (subModuleMode === "new") {
    const newSubModuleName = String(formData.get("newSubModuleName") ?? "").trim();
    if (!newSubModuleName) return { ok: false, error: "Enter a name for the new sub-module." };
    courseSubModuleId = await createMinimalCourseSubModule(courseModuleId, newSubModuleName);
    title = newSubModuleName;
  } else {
    title = String(formData.get("contentTitle") ?? "").trim();
    if (!title) return { ok: false, error: "Enter a title for this content." };
  }

  const linkLabels = formData.getAll("linkLabel").map(String);
  const linkUrls = formData.getAll("linkUrl").map(String);
  const links = linkLabels
    .map((label, i) => ({ label: label.trim(), url: (linkUrls[i] ?? "").trim() }))
    .filter((l) => l.label && l.url);

  await prisma.courseContent.create({
    data: {
      title,
      courseId,
      courseModuleId,
      courseSubModuleId,
      fileUrl,
      links: { create: links.map((l, i) => ({ label: l.label, url: l.url, order: i })) },
    },
  });

  revalidatePath("/lms/company/course-content");
  revalidatePath("/lms/student/content");
  return { ok: true };
}

export type SetModuleMainPdfState = { ok: boolean; error?: string } | null;

export async function setModuleMainPdf(
  courseModuleId: string,
  _prevState: SetModuleMainPdfState,
  formData: FormData
): Promise<SetModuleMainPdfState> {
  try {
    await requireCompany();
  } catch {
    return { ok: false, error: "Not authorized." };
  }

  const title = String(formData.get("mainPdfTitle") ?? "").trim();
  const fileUrl = String(formData.get("mainPdfUrl") ?? "").trim();

  if (!title || !fileUrl) {
    return { ok: false, error: "Please provide a title and attach a PDF." };
  }

  await prisma.courseModule.update({
    where: { id: courseModuleId },
    data: { mainPdfTitle: title, mainPdfUrl: fileUrl },
  });

  revalidatePath("/lms/company/course-content");
  revalidatePath("/lms/student/content");
  return { ok: true };
}

export async function removeModuleMainPdf(courseModuleId: string) {
  await requireCompany();
  await prisma.courseModule.update({
    where: { id: courseModuleId },
    data: { mainPdfTitle: null, mainPdfUrl: null },
  });
  revalidatePath("/lms/company/course-content");
  revalidatePath("/lms/student/content");
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
