"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chunkIntoBatches } from "@/lib/batching";

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
}

async function createBatchesForGroup(collegeId: string, courseId: string) {
  const unbatched = await prisma.enrollment.findMany({
    where: { collegeId, courseId, batchId: null },
    select: { id: true, enrolledAt: true },
  });
  if (unbatched.length === 0) return 0;

  const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } });
  const existingCount = await prisma.batch.count({ where: { collegeId, courseId } });

  const chunks = chunkIntoBatches(unbatched);
  for (const [i, chunk] of chunks.entries()) {
    const batch = await prisma.batch.create({
      data: {
        collegeId,
        courseId,
        name: `${course.name} — Batch ${existingCount + i + 1}`,
      },
    });
    await prisma.enrollment.updateMany({
      where: { id: { in: chunk.map((e) => e.id) } },
      data: { batchId: batch.id },
    });
  }
  return chunks.length;
}

export async function autoBatchCollege(collegeId: string) {
  await requireCompanyOrCollege(collegeId);

  const groups = await prisma.enrollment.findMany({
    where: { collegeId, batchId: null },
    select: { courseId: true },
    distinct: ["courseId"],
  });

  for (const g of groups) {
    await createBatchesForGroup(collegeId, g.courseId);
  }

  revalidateBatchPaths();
}

export async function autoBatchAll() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the company admin can auto-batch everyone.");
  }

  const groups = await prisma.enrollment.findMany({
    where: { batchId: null, collegeId: { not: null } },
    select: { collegeId: true, courseId: true },
    distinct: ["collegeId", "courseId"],
  });

  for (const g of groups) {
    if (!g.collegeId) continue;
    await createBatchesForGroup(g.collegeId, g.courseId);
  }

  revalidateBatchPaths();
}

export type CreateManualBatchState = { ok: boolean; error?: string } | null;

export async function createManualBatch(
  _prevState: CreateManualBatchState,
  formData: FormData
): Promise<CreateManualBatchState> {
  const collegeId = String(formData.get("collegeId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
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
  if (enrollmentIds.length > 30) {
    return { ok: false, error: "A batch can have at most 30 students." };
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { id: { in: enrollmentIds }, collegeId, courseId, batchId: null },
  });
  if (enrollments.length !== enrollmentIds.length) {
    return { ok: false, error: "Some selected students are no longer available to batch." };
  }

  const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } });
  const existingCount = await prisma.batch.count({ where: { collegeId, courseId } });

  const batch = await prisma.batch.create({
    data: { collegeId, courseId, name: `${course.name} — Batch ${existingCount + 1}` },
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
  revalidatePath("/lms/company/attendance");
}
