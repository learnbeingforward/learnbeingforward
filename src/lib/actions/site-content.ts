"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCompanyStaff } from "@/lib/auth-helpers";

async function requireCompany() {
  const session = await auth();
  if (!session?.user || !isCompanyStaff(session.user.role)) {
    throw new Error("Only the company admin can edit site content.");
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function revalidateMarketing() {
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/technologies");
  revalidatePath("/team");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/lms/company/edit-site");
}

// ---------- Courses ----------

export async function createCourse(formData: FormData) {
  await requireCompany();

  const name = String(formData.get("name") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "Development").trim();
  const techSlugs = formData.getAll("techSlugs").map(String);
  const isPlaceholder = formData.get("isPlaceholder") === "on";

  if (!name || !description) throw new Error("Name and description are required.");

  const slug = slugify(name);
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) throw new Error("A course with this name already exists.");

  const maxOrder = await prisma.course.aggregate({ _max: { order: true } });

  await prisma.course.create({
    data: {
      slug,
      name,
      shortDescription: shortDescription || description.slice(0, 140),
      description,
      category,
      techSlugs: JSON.stringify(techSlugs),
      isPlaceholder,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  revalidateMarketing();
}

export async function deleteCourse(courseId: string) {
  await requireCompany();
  await prisma.course.delete({ where: { id: courseId } });
  revalidateMarketing();
}

export async function createCourseModule(formData: FormData) {
  await requireCompany();

  const courseId = String(formData.get("courseId") ?? "");
  const trackTitle = String(formData.get("trackTitle") ?? "Course Modules").trim();
  const title = String(formData.get("title") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const topicsRaw = String(formData.get("topics") ?? "");
  const delivery = String(formData.get("delivery") ?? "").trim();
  const techSlugs = formData.getAll("techSlugs").map(String);

  if (!courseId || !title || !topicsRaw.trim()) {
    throw new Error("Course, title, and topics are required.");
  }

  const topics = topicsRaw
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  const maxOrder = await prisma.courseModule.aggregate({
    where: { courseId },
    _max: { order: true },
  });

  const created = await prisma.courseModule.create({
    data: {
      courseId,
      trackTitle: trackTitle || "Course Modules",
      title,
      level: level || null,
      topics: JSON.stringify(topics),
      techSlugs: JSON.stringify(techSlugs),
      delivery: delivery || null,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  // Topics double as the module's sub-modules — this is what makes them selectable
  // as an attachment point when adding course content, without a separate list to maintain.
  for (const [i, title] of topics.entries()) {
    await prisma.courseSubModule.create({
      data: { courseModuleId: created.id, title, order: i },
    });
  }

  revalidateMarketing();
}

export async function deleteCourseModule(moduleId: string) {
  await requireCompany();
  await prisma.courseModule.delete({ where: { id: moduleId } });
  revalidateMarketing();
}

export async function createCourseSubModule(formData: FormData) {
  await requireCompany();

  const courseModuleId = String(formData.get("courseModuleId") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!courseModuleId || !title) {
    throw new Error("Module and sub-module title are required.");
  }

  const maxOrder = await prisma.courseSubModule.aggregate({
    where: { courseModuleId },
    _max: { order: true },
  });

  await prisma.courseSubModule.create({
    data: { courseModuleId, title, order: (maxOrder._max.order ?? 0) + 1 },
  });

  revalidateMarketing();
}

export async function deleteCourseSubModule(subModuleId: string) {
  await requireCompany();
  await prisma.courseSubModule.delete({ where: { id: subModuleId } });
  revalidateMarketing();
}

// ---------- Technologies ----------

export async function createTechnology(formData: FormData) {
  await requireCompany();

  const name = String(formData.get("name") ?? "").trim();
  const iconName = String(formData.get("iconName") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!name || !iconName || !category) {
    throw new Error("Name, icon, and category are required.");
  }

  const slug = slugify(name);
  const existing = await prisma.technology.findUnique({ where: { slug } });
  if (existing) throw new Error("A technology with this name already exists.");

  const maxOrder = await prisma.technology.aggregate({ _max: { order: true } });

  await prisma.technology.create({
    data: {
      slug,
      name,
      iconName,
      category: category as never,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  revalidateMarketing();
}

export async function deleteTechnology(id: string) {
  await requireCompany();
  await prisma.technology.delete({ where: { id } });
  revalidateMarketing();
}

// ---------- Team members (employees) ----------

export async function createTeamMember(formData: FormData) {
  await requireCompany();

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const experienceYears = Number(formData.get("experienceYears") ?? 0);
  const background = String(formData.get("background") ?? "").trim();
  const specialtiesRaw = String(formData.get("specialties") ?? "");
  const isFreelancer = formData.get("isFreelancer") === "on";
  const collegesRaw = String(formData.get("colleges") ?? "");
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const cvUrl = String(formData.get("cvUrl") ?? "").trim();

  if (!name || !role) throw new Error("Name and role are required.");

  const specialties = specialtiesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const colleges = collegesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const maxOrder = await prisma.teamMember.aggregate({ _max: { order: true } });

  await prisma.teamMember.create({
    data: {
      name,
      role,
      experienceYears: Number.isFinite(experienceYears) ? experienceYears : 0,
      background: background || role,
      specialties: JSON.stringify(specialties),
      isFreelancer,
      colleges: colleges.length > 0 ? JSON.stringify(colleges) : null,
      cvUrl: cvUrl || null,
      photoUrl: photoUrl || null,
      avatarSeed: slugify(name) + "-" + Date.now(),
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  revalidateMarketing();
}

export async function deleteTeamMember(id: string) {
  await requireCompany();
  await prisma.teamMember.delete({ where: { id } });
  revalidateMarketing();
}

export type UpdateTeamMemberState = { ok: boolean; error?: string } | null;

export async function updateTeamMember(
  id: string,
  _prevState: UpdateTeamMemberState,
  formData: FormData
): Promise<UpdateTeamMemberState> {
  await requireCompany();

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const experienceYears = Number(formData.get("experienceYears") ?? 0);
  const background = String(formData.get("background") ?? "").trim();
  const specialtiesRaw = String(formData.get("specialties") ?? "");
  const isFreelancer = formData.get("isFreelancer") === "on";
  const collegesRaw = String(formData.get("colleges") ?? "");
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const cvUrl = String(formData.get("cvUrl") ?? "").trim();

  if (!name || !role) return { ok: false, error: "Name and role are required." };

  const specialties = specialtiesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const colleges = collegesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.teamMember.update({
    where: { id },
    data: {
      name,
      role,
      experienceYears: Number.isFinite(experienceYears) ? experienceYears : 0,
      background: background || role,
      specialties: JSON.stringify(specialties),
      isFreelancer,
      colleges: colleges.length > 0 ? JSON.stringify(colleges) : null,
      cvUrl: cvUrl || null,
      photoUrl: photoUrl || null,
    },
  });

  revalidateMarketing();
  return { ok: true };
}

// ---------- Contact profiles ----------

export async function createContactProfile(formData: FormData) {
  await requireCompany();

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();

  if (!name || !role || !email || !phone) {
    throw new Error("Name, role, email, and phone are required.");
  }

  const maxOrder = await prisma.contactProfile.aggregate({ _max: { order: true } });

  await prisma.contactProfile.create({
    data: {
      name,
      role,
      email,
      phone,
      photoUrl: photoUrl || null,
      avatarSeed: slugify(name) + "-" + Date.now(),
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  revalidateMarketing();
}

export async function deleteContactProfile(id: string) {
  await requireCompany();
  await prisma.contactProfile.delete({ where: { id } });
  revalidateMarketing();
}

// ---------- Home page features ----------

export async function createHomeFeature(formData: FormData) {
  await requireCompany();

  const icon = String(formData.get("icon") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!icon || !title || !description) {
    throw new Error("Icon, title, and description are required.");
  }

  const maxOrder = await prisma.homeFeature.aggregate({ _max: { order: true } });

  await prisma.homeFeature.create({
    data: { icon, title, description, order: (maxOrder._max.order ?? 0) + 1 },
  });

  revalidateMarketing();
}

export async function deleteHomeFeature(id: string) {
  await requireCompany();
  await prisma.homeFeature.delete({ where: { id } });
  revalidateMarketing();
}

// ---------- Footer links ----------

export async function createFooterLink(formData: FormData) {
  await requireCompany();

  const label = String(formData.get("label") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();

  if (!label || !href) throw new Error("Label and link are required.");

  const maxOrder = await prisma.footerLink.aggregate({ _max: { order: true } });

  await prisma.footerLink.create({
    data: { label, href, order: (maxOrder._max.order ?? 0) + 1 },
  });

  revalidateMarketing();
}

export async function deleteFooterLink(id: string) {
  await requireCompany();
  await prisma.footerLink.delete({ where: { id } });
  revalidateMarketing();
}

// ---------- Site settings (company contact block) ----------

export async function updateSiteSettings(formData: FormData) {
  await requireCompany();

  const companyContactName = String(formData.get("companyContactName") ?? "").trim();
  const companyContactPhone = String(formData.get("companyContactPhone") ?? "").trim();
  const companyContactEmail = String(formData.get("companyContactEmail") ?? "").trim();

  if (!companyContactName || !companyContactPhone || !companyContactEmail) {
    throw new Error("All fields are required.");
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { companyContactName, companyContactPhone, companyContactEmail },
    create: { id: "singleton", companyContactName, companyContactPhone, companyContactEmail },
  });

  revalidateMarketing();
}
