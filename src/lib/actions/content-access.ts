"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";
import { notify } from "@/lib/notifications";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { requireCompanyAccess } from "@/lib/employee-access";

async function requireCourseContentAccess() {
  const session = await auth();
  if (session?.user && isCompanyStaff(session.user.role)) return;
  try {
    await requireCompanyAccess("course-content");
  } catch {
    throw new Error("Only the company admin can manage course content.");
  }
}

export async function requestContentAccess(courseContentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can request content access.");
  }

  const existing = await prisma.contentAccessRequest.findUnique({
    where: { studentId_courseContentId: { studentId: session.user.id, courseContentId } },
  });
  if (existing) return;

  await prisma.contentAccessRequest.create({
    data: { studentId: session.user.id, courseContentId },
  });

  const [student, content] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.courseContent.findUnique({ where: { id: courseContentId } }),
  ]);
  await notify("STUDENT", `${student?.name ?? "A student"} requested content access`, {
    message: content?.title,
    href: "/lms/company/course-content",
    requiredKey: "course-content",
  });

  revalidatePath("/lms/student/content");
  revalidatePath("/lms/company/course-content");
}

export async function requestModulePdfAccess(courseModuleId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can request content access.");
  }

  const existing = await prisma.contentAccessRequest.findUnique({
    where: { studentId_courseModuleId: { studentId: session.user.id, courseModuleId } },
  });
  if (existing) return;

  await prisma.contentAccessRequest.create({
    data: { studentId: session.user.id, courseModuleId },
  });

  const [student, mod] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.courseModule.findUnique({ where: { id: courseModuleId } }),
  ]);
  await notify("STUDENT", `${student?.name ?? "A student"} requested the course book`, {
    message: mod?.mainPdfTitle ?? undefined,
    href: "/lms/company/course-content",
    requiredKey: "course-content",
  });

  revalidatePath("/lms/student/content");
  revalidatePath("/lms/company/course-content");
}

/** Students at or above this attendance percentage, across whatever sessions the
 * trainer has taken so far for this batch, are "eligible" for a bulk content send —
 * same threshold the certificate-eligibility check already uses. */
export async function getEligibleStudentsForBatch(batchId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TRAINER" || !session.user.trainerId) {
    throw new Error("Only a trainer can view this.");
  }

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      course: { include: { modules: true } },
      enrollments: { include: { student: true, attendanceRecords: true } },
    },
  });
  if (!batch || batch.trainerId !== session.user.trainerId) {
    throw new Error("Not your batch.");
  }

  const students = batch.enrollments
    .map((e) => {
      const total = e.attendanceRecords.length;
      const present = e.attendanceRecords.filter((r) => r.present).length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      return { enrollmentId: e.id, studentId: e.studentId, name: e.student.name, pct, eligible: total > 0 && pct >= ATTENDANCE_THRESHOLD };
    })
    .filter((s) => s.eligible);

  return { batchName: batch.name, courseName: batch.course.name, modules: batch.course.modules.map((m) => ({ id: m.id, title: m.title, hasBook: !!m.mainPdfUrl })), students };
}

export type BulkContentSendState = { ok: boolean; error?: string; sentCount?: number } | null;

/**
 * A trainer's bulk "send content to eligible students" request — doesn't share
 * anything itself. It creates PENDING ContentAccessRequest rows (same rows an
 * individual student's own request would create) for every selected student ×
 * selected module's content, tagged with one groupId so the admin reviews and
 * approves/rejects the whole bundle in a single action instead of one row at a
 * time. The course book stays a separate, explicit opt-in even in bulk.
 */
export async function requestBulkContentSend(
  batchId: string,
  _prevState: BulkContentSendState,
  formData: FormData
): Promise<BulkContentSendState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "TRAINER" || !session.user.trainerId) {
    return { ok: false, error: "Not authorized." };
  }
  const trainerId = session.user.trainerId;

  const batch = await prisma.batch.findUnique({ where: { id: batchId }, include: { course: true, trainer: true } });
  if (!batch || batch.trainerId !== trainerId) {
    return { ok: false, error: "Not your batch." };
  }

  const studentIds = formData.getAll("studentIds").map(String);
  const moduleIds = formData.getAll("moduleIds").map(String);
  const includeBook = formData.get("includeBook") === "on";
  if (studentIds.length === 0) return { ok: false, error: "Select at least one student." };
  if (moduleIds.length === 0) return { ok: false, error: "Select at least one module." };

  const [contentItems, modules] = await Promise.all([
    prisma.courseContent.findMany({ where: { courseModuleId: { in: moduleIds } }, select: { id: true } }),
    prisma.courseModule.findMany({ where: { id: { in: moduleIds }, mainPdfUrl: { not: null } }, select: { id: true } }),
  ]);

  const groupId = crypto.randomUUID();
  const rows: { studentId: string; courseContentId?: string; courseModuleId?: string; groupId: string; bulkTrainerId: string; bulkBatchId: string }[] = [];
  for (const studentId of studentIds) {
    for (const item of contentItems) {
      rows.push({ studentId, courseContentId: item.id, groupId, bulkTrainerId: trainerId, bulkBatchId: batchId });
    }
    if (includeBook) {
      for (const mod of modules) {
        rows.push({ studentId, courseModuleId: mod.id, groupId, bulkTrainerId: trainerId, bulkBatchId: batchId });
      }
    }
  }
  if (rows.length === 0) return { ok: false, error: "Nothing to send — those modules have no content yet." };

  const result = await prisma.contentAccessRequest.createMany({ data: rows, skipDuplicates: true });

  await notify(
    "TRAINER",
    `${batch.trainer?.name ?? "A trainer"} requested to send content to ${studentIds.length} student(s)`,
    {
      message: `${batch.course.name} — ${batch.name}${includeBook ? " (includes course book)" : ""}`,
      href: `/lms/company/course-content?bulkGroupId=${groupId}`,
      requiredKey: "course-content",
    }
  );

  revalidatePath("/lms/company/course-content");
  return { ok: true, sentCount: result.count };
}

export type DecideBulkState = { ok: boolean; error?: string } | null;

export async function decideBulkContentRequest(groupId: string, approve: boolean) {
  await requireCourseContentAccess();

  await prisma.contentAccessRequest.updateMany({
    where: { groupId, status: "PENDING" },
    data: { status: approve ? "APPROVED" : "REJECTED", decidedAt: new Date() },
  });

  revalidatePath("/lms/company/course-content");
  revalidatePath("/lms/student/content");
}
