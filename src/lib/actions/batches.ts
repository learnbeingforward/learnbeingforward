"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chunkIntoBatches, AUTO_BATCH_CAP, MANUAL_BATCH_CAP } from "@/lib/batching";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { getEmployeeKeys } from "@/lib/employee-access";
import { notify } from "@/lib/notifications";

async function isAuthorizedEmployee(userId: string) {
  return (await getEmployeeKeys(userId)).includes("trainers.manage");
}

async function requireCompanyOrCollege(collegeId?: string | null) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized.");
  if (isCompanyStaff(session.user.role)) return session;
  if (session.user.role === "EMPLOYEE" && (await isAuthorizedEmployee(session.user.id))) return session;
  if (session.user.role === "COLLEGE_ADMIN") {
    if (collegeId && session.user.collegeId !== collegeId) {
      throw new Error("You can only manage batches for your own college.");
    }
    return session;
  }
  throw new Error("Not authorized.");
}

async function requireTrainerManagement() {
  const session = await auth();
  if (session?.user && isCompanyStaff(session.user.role)) return session;
  if (session?.user?.role === "EMPLOYEE" && (await isAuthorizedEmployee(session.user.id))) return session;
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
  // Grouped by the STUDENT's own collegeId, not the enrollment row's — the
  // enrollment's collegeId can drift stale (e.g. after a student is moved between
  // colleges) and has previously caused batches to get filed under the wrong
  // college, where nobody thinks to look for them.
  const unbatched = await prisma.enrollment.findMany({
    where: { batchId: null, student: where.collegeId ? { collegeId: where.collegeId } : { collegeId: { not: null } } },
    select: {
      id: true,
      enrolledAt: true,
      courseId: true,
      student: { select: { semester: true, collegeId: true } },
    },
  });

  const groups = new Map<string, { collegeId: string; courseId: string; semester: number | null; items: UnbatchedEnrollment[] }>();
  for (const e of unbatched) {
    if (!e.student.collegeId) continue;
    const semester = e.student.semester ?? null;
    const key = `${e.student.collegeId}::${e.courseId}::${semester ?? "none"}`;
    if (!groups.has(key)) {
      groups.set(key, { collegeId: e.student.collegeId, courseId: e.courseId, semester, items: [] });
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

export type AutoBatchState = { ok: boolean; error?: string; count?: number } | null;

export async function autoBatchCollegeCourse(_prevState: AutoBatchState, formData: FormData): Promise<AutoBatchState> {
  try {
    await requireTrainerManagement();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Not authorized." };
  }

  const collegeId = String(formData.get("collegeId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  if (!collegeId || !courseId) {
    return { ok: false, error: "Select a college and a course." };
  }

  const unbatched = await prisma.enrollment.findMany({
    where: { batchId: null, courseId, student: { collegeId } },
    select: { id: true, enrolledAt: true },
  });
  if (unbatched.length === 0) {
    return { ok: false, error: "No unbatched students for that college and course." };
  }

  await createBatchesFromEnrollments(collegeId, courseId, null, unbatched);
  revalidateBatchPaths();
  return { ok: true, count: unbatched.length };
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
  try {
    await requireTrainerManagement();
  } catch {
    throw new Error("Only the company admin can assign a trainer to a batch.");
  }

  const trainerId = String(formData.get("trainerId") ?? "").trim();
  if (!trainerId) throw new Error("Select a trainer.");

  await prisma.batch.update({ where: { id: batchId }, data: { trainerId } });
  await prisma.enrollment.updateMany({ where: { batchId }, data: { trainerId } });

  revalidateBatchPaths();
}

/**
 * Retroactively set (or clear/change) which course module a session covered —
 * module selection at scheduling time is optional, so plenty of already-taught,
 * attendance-taken sessions can end up with none set, and since student content
 * only unlocks per module once a session for it has attendance taken, those
 * sessions never unlock anything. This lets the admin patch the module in after
 * the fact without touching attendance (sessions and attendance records are linked
 * but independent — this never deletes or recreates either).
 */
export async function updateSessionModule(sessionId: string, formData: FormData) {
  try {
    await requireTrainerManagement();
  } catch {
    throw new Error("Only the company admin can edit a session's module.");
  }

  const courseModuleId = String(formData.get("courseModuleId") ?? "").trim() || null;
  await prisma.trainingSession.update({ where: { id: sessionId }, data: { courseModuleId } });

  revalidateBatchPaths();
  revalidatePath("/lms/company/trainers/schedule");
  revalidatePath("/lms/student/content");
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
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the main company admin can remove a student from a batch this way.");
  }

  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) return;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { batchId: null, trainerId: null },
  });

  revalidateBatchPaths();
}

export type MoveStudentState = { ok: boolean; error?: string } | null;

export async function moveStudentToCourse(
  enrollmentId: string,
  _prevState: MoveStudentState,
  formData: FormData
): Promise<MoveStudentState> {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) return { ok: false, error: "Enrollment not found." };

  try {
    await requireCompanyOrCollege(enrollment.collegeId);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Not authorized." };
  }

  const newCourseId = String(formData.get("newCourseId") ?? "").trim();
  if (!newCourseId) return { ok: false, error: "Select a course to move the student to." };
  if (newCourseId === enrollment.courseId) {
    return { ok: false, error: "Select a different course than the one they're already in." };
  }

  const existingTarget = await prisma.enrollment.findFirst({
    where: { studentId: enrollment.studentId, courseId: newCourseId },
  });
  if (existingTarget) {
    return { ok: false, error: "This student is already enrolled in that course." };
  }

  await prisma.$transaction([
    prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { batchId: null, trainerId: null },
    }),
    prisma.enrollment.create({
      data: {
        studentId: enrollment.studentId,
        courseId: newCourseId,
        collegeId: enrollment.collegeId,
      },
    }),
  ]);

  revalidateBatchPaths();
  return { ok: true };
}

export async function markBatchCompleted(batchId: string) {
  try {
    await requireTrainerManagement();
  } catch {
    throw new Error("Only the company admin can mark a batch completed.");
  }

  await prisma.batch.update({ where: { id: batchId }, data: { completed: true } });
  revalidateBatchPaths();
}

export async function deleteBatch(batchId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the main company admin can delete a batch.");
  }

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { trainingSessions: true },
  });
  if (!batch) return;

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
  try {
    await requireTrainerManagement();
  } catch {
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

/**
 * Deletes every batch created on a given calendar day (used by the batch
 * calendar's bulk "delete all batches created that day" action). Batches with
 * attendance already recorded are skipped rather than blocking the whole
 * operation — the caller is told how many were skipped.
 */
export async function deleteBatchesCreatedOn(dateKey: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only the main company admin can bulk-delete batches.");
  }

  const dayStart = new Date(`${dateKey}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const batches = await prisma.batch.findMany({
    where: { createdAt: { gte: dayStart, lt: dayEnd } },
    include: { trainingSessions: true },
  });

  const deletable = batches.filter((b) => !b.trainingSessions.some((s) => s.attendanceTaken));

  await prisma.$transaction([
    prisma.enrollment.updateMany({ where: { batchId: { in: deletable.map((b) => b.id) } }, data: { batchId: null, trainerId: null } }),
    prisma.trainingSession.deleteMany({ where: { batchId: { in: deletable.map((b) => b.id) } } }),
    prisma.batch.deleteMany({ where: { id: { in: deletable.map((b) => b.id) } } }),
  ]);

  revalidateBatchPaths();
  revalidatePath("/lms/company/trainers/batches/calendar");
}

export type RequestBatchState = { ok: boolean; error?: string } | null;

/**
 * A college's request to form a new batch — unlike createManualBatch, the
 * course and student list aren't limited to existing unbatched enrollments:
 * a college can request a batch for any course and any of their own
 * students, and students without an enrollment in that course yet get one
 * created automatically once the request is approved. Nothing is active
 * (no Batch row, no notification to the batch's students) until a company
 * admin approves it.
 */
export async function requestBatch(
  _prevState: RequestBatchState,
  formData: FormData
): Promise<RequestBatchState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "COLLEGE_ADMIN" || !session.user.collegeId) {
    return { ok: false, error: "Only a college admin can request a batch." };
  }
  const collegeId = session.user.collegeId;

  const courseId = String(formData.get("courseId") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;
  const semesterInput = String(formData.get("semester") ?? "").trim();
  const semester = semesterInput ? Number.parseInt(semesterInput, 10) : null;
  const studentIds = formData.getAll("studentIds").map(String);

  if (!courseId) return { ok: false, error: "Select a course." };
  if (studentIds.length === 0) return { ok: false, error: "Select at least one student." };

  const [course, students, college] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId }, select: { name: true } }),
    prisma.user.findMany({ where: { id: { in: studentIds }, collegeId, role: "STUDENT" }, select: { id: true } }),
    prisma.college.findUnique({ where: { id: collegeId }, select: { name: true } }),
  ]);
  if (!course) return { ok: false, error: "Course not found." };
  if (students.length !== studentIds.length) {
    return { ok: false, error: "Some selected students are no longer available at your college." };
  }

  await prisma.batchRequest.create({
    data: { collegeId, courseId, name, semester, studentIds },
  });

  await notify("COLLEGE", `${college?.name ?? "A college"} requested a new batch for ${course.name}`, {
    message: `${studentIds.length} student${studentIds.length !== 1 ? "s" : ""} — awaiting approval.`,
    href: "/lms/company/trainers/batches/requests",
    requiredKey: "trainers.manage",
  });

  revalidatePath("/lms/college/batches");
  revalidatePath("/lms/company/trainers/batches/requests");
  return { ok: true };
}

export async function approveBatchRequest(requestId: string, formData: FormData) {
  await requireTrainerManagement();

  const request = await prisma.batchRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") {
    throw new Error("This request is no longer pending.");
  }

  const trainingType = String(formData.get("trainingType") ?? "");
  if (!["CSR", "FREE", "PAID"].includes(trainingType)) {
    throw new Error("Select a training type.");
  }
  const rateInput = String(formData.get("rate") ?? "").trim();
  const rate = rateInput ? Number.parseInt(rateInput, 10) : null;
  if (trainingType === "PAID" && (!rate || rate <= 0)) {
    throw new Error("Enter a valid price / hourly rate for paid training.");
  }
  const startDateInput = String(formData.get("trainingStartDate") ?? "").trim();
  const trainingStartDate = startDateInput ? new Date(`${startDateInput}T00:00:00`) : null;
  if (!trainingStartDate || Number.isNaN(trainingStartDate.getTime())) {
    throw new Error("Enter a valid start date.");
  }
  const daysInput = String(formData.get("trainingDays") ?? "").trim();
  const trainingDays = Number.parseInt(daysInput, 10);
  if (!Number.isFinite(trainingDays) || trainingDays < 1) {
    throw new Error("Enter a valid number of training days.");
  }

  const studentIds = Array.isArray(request.studentIds) ? (request.studentIds as unknown[]).map(String) : [];
  if (studentIds.length === 0) throw new Error("This request has no students.");

  const course = await prisma.course.findUniqueOrThrow({ where: { id: request.courseId } });

  // The request's students aren't limited to ones already enrolled in this
  // course — anyone missing an enrollment here gets one created as part of
  // approval, instead of being silently dropped from the batch.
  const existingEnrollments = await prisma.enrollment.findMany({
    where: { studentId: { in: studentIds }, courseId: request.courseId },
  });
  const existingByStudent = new Map(existingEnrollments.map((e) => [e.studentId, e]));

  const existingBatchCount = await prisma.batch.count({ where: { collegeId: request.collegeId, courseId: request.courseId } });
  const semesterLabel = request.semester ? ` — Sem ${request.semester}` : "";
  const baseName = request.name || `${course.name}${semesterLabel}`;

  const chunks = chunkIntoBatches(
    studentIds.map((id) => ({ id, enrolledAt: existingByStudent.get(id)?.enrolledAt ?? new Date() })),
    MANUAL_BATCH_CAP
  );

  const createdBatchIds: string[] = [];
  await prisma.$transaction(async (tx) => {
    for (const [i, chunk] of chunks.entries()) {
      const batch = await tx.batch.create({
        data: {
          collegeId: request.collegeId,
          courseId: request.courseId,
          semester: request.semester,
          name: chunks.length > 1 ? `${baseName} — Batch ${existingBatchCount + i + 1}` : baseName,
          trainingType: trainingType as never,
          rate,
          trainingStartDate,
          trainingDays,
        },
      });
      createdBatchIds.push(batch.id);

      const chunkIds = chunk.map((c) => c.id);
      const chunkExistingEnrollmentIds = chunkIds
        .filter((id) => existingByStudent.has(id))
        .map((id) => existingByStudent.get(id)!.id);
      const chunkMissingStudentIds = chunkIds.filter((id) => !existingByStudent.has(id));

      if (chunkExistingEnrollmentIds.length > 0) {
        await tx.enrollment.updateMany({
          where: { id: { in: chunkExistingEnrollmentIds } },
          data: { batchId: batch.id },
        });
      }
      for (const studentId of chunkMissingStudentIds) {
        await tx.enrollment.create({
          data: { studentId, courseId: request.courseId, collegeId: request.collegeId, batchId: batch.id },
        });
      }
    }

    await tx.batchRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        decidedAt: new Date(),
        trainingType: trainingType as never,
        rate,
        trainingStartDate,
        trainingDays,
        resultBatchId: createdBatchIds[0],
      },
    });
  });

  const college = await prisma.college.findUnique({ where: { id: request.collegeId }, select: { name: true } });
  await notify("COLLEGE", `Approved ${college?.name ?? "a college"}'s batch request for ${course.name}`, {
    href: `/lms/company/trainers/batches?collegeId=${request.collegeId}`,
    requiredKey: "trainers.manage",
  });

  revalidateBatchPaths();
  revalidatePath("/lms/company/trainers/batches/requests");
}

export async function rejectBatchRequest(requestId: string, formData: FormData) {
  await requireTrainerManagement();

  const request = await prisma.batchRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") return;

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) throw new Error("Enter a reason for rejecting this request.");

  await prisma.batchRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", decidedAt: new Date(), rejectReason: reason },
  });

  const [college, course] = await Promise.all([
    prisma.college.findUnique({ where: { id: request.collegeId }, select: { name: true } }),
    prisma.course.findUnique({ where: { id: request.courseId }, select: { name: true } }),
  ]);
  await notify("COLLEGE", `Rejected ${college?.name ?? "a college"}'s batch request for ${course?.name ?? "a course"}`, {
    message: reason,
    href: "/lms/company/trainers/batches/requests",
    requiredKey: "trainers.manage",
  });

  revalidatePath("/lms/college/batches");
  revalidatePath("/lms/company/trainers/batches/requests");
}
