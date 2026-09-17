"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chunkIntoBatches, AUTO_BATCH_CAP, MANUAL_BATCH_CAP } from "@/lib/batching";

async function requireCompanyOrCollege(collegeId?: string | null) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized.");
  if (session.user.role === "SUPER_ADMIN") return session;
  if (session.user.role === "COLLEGE_ADMIN") {
    if (collegeId && session.user.collegeId !== collegeId) {
      throw new Error("You can only manage batches for your own college.");
    }
    return session;
  }
  throw new Error("Not authorized.");
}

function revalidateBatchPaths() {
  revalidatePath("/lms/company/trainers/batches");
  revalidatePath("/lms/company/trainers/schedule");
  revalidatePath("/lms/college/batches");
  revalidatePath("/lms/company/attendance");
}

type UnbatchedEnrollment = { id: string; enrolledAt: Date };

async function createBatchesFromEnrollments(
  collegeId: string,
  courseId: string,
  semester: number | null,
  enrollments: UnbatchedEnrollment[]
) {
  if (enrollments.length === 0) return 0;

  const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } });
  const existingCount = await prisma.batch.count({ where: { collegeId, courseId, semester } });

  const chunks = chunkIntoBatches(enrollments, AUTO_BATCH_CAP);
  const semesterLabel = semester ? ` — Sem ${semester}` : "";
  for (const [i, chunk] of chunks.entries()) {
    const batch = await prisma.batch.create({
      data: {
        collegeId,
        courseId,
        semester,
        name: `${course.name}${semesterLabel} — Batch ${existingCount + i + 1}`,
      },
    });
    await prisma.enrollment.updateMany({
      where: { id: { in: chunk.map((e) => e.id) } },
      data: { batchId: batch.id },
    });
  }
  return chunks.length;
}

async function groupAndBatch(where: { collegeId?: string }) {
  const unbatched = await prisma.enrollment.findMany({
    where: { ...where, batchId: null, collegeId: { not: null } },
    select: {
      id: true,
      enrolledAt: true,
      collegeId: true,
      courseId: true,
      student: { select: { semester: true } },
    },
  });

  const groups = new Map<string, { collegeId: string; courseId: string; semester: number | null; items: UnbatchedEnrollment[] }>();
  for (const e of unbatched) {
    if (!e.collegeId) continue;
    const semester = e.student.semester ?? null;
    const key = `${e.collegeId}::${e.courseId}::${semester ?? "none"}`;
    if (!groups.has(key)) {
      groups.set(key, { collegeId: e.collegeId, courseId: e.courseId, semester, items: [] });
    }
    groups.get(key)!.items.push({ id: e.id, enrolledAt: e.enrolledAt });
  }

  for (const g of groups.values()) {
    await createBatchesFromEnrollments(g.collegeId, g.courseId, g.semester, g.items);
  }
}

export async function autoBatchCollege(collegeId: string) {
  await requireCompanyOrCollege(collegeId);
  await groupAndBatch({ collegeId });
  revalidateBatchPaths();
}

export async function autoBatchAll() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the company admin can auto-batch everyone.");
  }
  await groupAndBatch({});
  revalidateBatchPaths();
}

export type CreateManualBatchState = { ok: boolean; error?: string } | null;

export async function createManualBatch(
  _prevState: CreateManualBatchState,
  formData: FormData
): Promise<CreateManualBatchState> {
  const collegeId = String(formData.get("collegeId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const semesterInput = String(formData.get("semester") ?? "").trim();
  const semester = semesterInput ? Number.parseInt(semesterInput, 10) : null;
  const enrollmentIds = formData.getAll("enrollmentIds").map(String);

  try {
    await requireCompanyOrCollege(collegeId);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Not authorized." };
  }

  if (!collegeId || !courseId) {
    return { ok: false, error: "College and course are required." };
  }
  if (enrollmentIds.length === 0) {
    return { ok: false, error: "Select at least one student." };
  }
  if (enrollmentIds.length > MANUAL_BATCH_CAP) {
    return { ok: false, error: `A batch can have at most ${MANUAL_BATCH_CAP} students.` };
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { id: { in: enrollmentIds }, collegeId, courseId, batchId: null },
  });
  if (enrollments.length !== enrollmentIds.length) {
    return { ok: false, error: "Some selected students are no longer available to batch." };
  }

  const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } });
  const existingCount = await prisma.batch.count({ where: { collegeId, courseId } });
  const semesterLabel = semester ? ` — Sem ${semester}` : "";

  const batch = await prisma.batch.create({
    data: {
      collegeId,
      courseId,
      semester,
      name: `${course.name}${semesterLabel} — Batch ${existingCount + 1}`,
    },
  });
  await prisma.enrollment.updateMany({
    where: { id: { in: enrollmentIds } },
    data: { batchId: batch.id },
  });

  revalidateBatchPaths();
  return { ok: true };
}

export async function assignTrainerToBatch(batchId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the company admin can assign a trainer to a batch.");
  }

  const trainerId = String(formData.get("trainerId") ?? "").trim();
  if (!trainerId) throw new Error("Select a trainer.");

  await prisma.batch.update({ where: { id: batchId }, data: { trainerId } });
  await prisma.enrollment.updateMany({ where: { batchId }, data: { trainerId } });

  revalidateBatchPaths();
}

export type AddToBatchState = { ok: boolean; error?: string } | null;

export async function addStudentsToBatch(
  batchId: string,
  _prevState: AddToBatchState,
  formData: FormData
): Promise<AddToBatchState> {
  const batch = await prisma.batch.findUnique({ where: { id: batchId }, include: { enrollments: true } });
  if (!batch) return { ok: false, error: "Batch not found." };

  try {
    await requireCompanyOrCollege(batch.collegeId);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Not authorized." };
  }

  const enrollmentIds = formData.getAll("enrollmentIds").map(String);
  if (enrollmentIds.length === 0) {
    return { ok: false, error: "Select at least one student to add." };
  }
  if (batch.enrollments.length + enrollmentIds.length > MANUAL_BATCH_CAP) {
    return { ok: false, error: `A batch can have at most ${MANUAL_BATCH_CAP} students.` };
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { id: { in: enrollmentIds }, collegeId: batch.collegeId, courseId: batch.courseId, batchId: null },
  });
  if (enrollments.length === 0) {
    return { ok: false, error: "Selected students are no longer available to add." };
  }

  await prisma.enrollment.updateMany({
    where: { id: { in: enrollments.map((e) => e.id) } },
    data: { batchId, trainerId: batch.trainerId },
  });

  revalidateBatchPaths();
  return { ok: true };
}

export async function removeStudentFromBatch(enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) return;

  await requireCompanyOrCollege(enrollment.collegeId);

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { batchId: null, trainerId: null },
  });

  revalidateBatchPaths();
}

export async function deleteBatch(batchId: string) {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { trainingSessions: true },
  });
  if (!batch) return;

  await requireCompanyOrCollege(batch.collegeId);

  if (batch.trainingSessions.some((s) => s.attendanceTaken)) {
    throw new Error("This batch already has attendance recorded and can't be deleted.");
  }

  await prisma.$transaction([
    prisma.enrollment.updateMany({ where: { batchId }, data: { batchId: null, trainerId: null } }),
    prisma.trainingSession.deleteMany({ where: { batchId } }),
    prisma.batch.delete({ where: { id: batchId } }),
  ]);

  revalidateBatchPaths();
}

export async function deleteTrainingSession(sessionId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the company admin can delete a scheduled session.");
  }

  const trainingSession = await prisma.trainingSession.findUnique({ where: { id: sessionId } });
  if (!trainingSession) return;

  if (trainingSession.attendanceTaken) {
    throw new Error("This session already has attendance recorded and can't be deleted.");
  }

  await prisma.trainingSession.delete({ where: { id: sessionId } });

  revalidatePath("/lms/company/trainers/schedule");
  revalidatePath("/lms/trainer/schedule");
  revalidatePath("/lms/trainer/attendance");
}
