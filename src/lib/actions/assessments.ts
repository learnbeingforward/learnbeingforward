"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEmployeeKeys, type EmployeePageKey } from "@/lib/employee-access";
import { deleteUploadFromGitHub } from "@/lib/github-upload";
import { unlink } from "node:fs/promises";
import path from "node:path";

const VIOLATION_LIMIT = 3;
const AUDIO_VIOLATION_LIMIT = 3;

/**
 * SUPER_ADMIN always passes. An EMPLOYEE passes only when granted the specific
 * assessments key for the page they're acting from (build vs. submissions) — this
 * deliberately does NOT extend to ADMIN2, matching this feature's existing
 * super-admin-only scope; Employee Access is the only way to delegate it.
 */
async function requireSuperAdmin(employeeKey: EmployeePageKey) {
  const session = await auth();
  if (!session?.user) throw new Error("Only the main company admin can manage assessments.");
  if (session.user.role === "SUPER_ADMIN") return session;
  if (session.user.role === "EMPLOYEE") {
    const keys = await getEmployeeKeys(session.user.id);
    if (keys.includes(employeeKey)) return session;
  }
  throw new Error("Only the main company admin can manage assessments.");
}

// ---------- Admin: build assessments ----------

export type CreateAssessmentState = { ok: boolean; error?: string; assessmentId?: string } | null;

export async function createAssessment(
  _prevState: CreateAssessmentState,
  formData: FormData
): Promise<CreateAssessmentState> {
  await requireSuperAdmin("assessments.build");

  const type = String(formData.get("type") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const durationMinutes = Math.max(1, Number.parseInt(String(formData.get("durationMinutes") ?? "30"), 10) || 30);
  const proctoringEnabled = formData.get("proctoringEnabled") === "on";
  const availableFromRaw = String(formData.get("availableFrom") ?? "");
  const availableUntilRaw = String(formData.get("availableUntil") ?? "");

  if (!["APTITUDE", "TECHNICAL_APTITUDE", "CODING"].includes(type)) {
    return { ok: false, error: "Invalid assessment type." };
  }
  if (!title) return { ok: false, error: "Title is required." };
  if (!availableFromRaw || !availableUntilRaw) {
    return { ok: false, error: "Set both the start and end date/time the assessment is open." };
  }
  const availableFrom = new Date(availableFromRaw);
  const availableUntil = new Date(availableUntilRaw);
  if (Number.isNaN(availableFrom.getTime()) || Number.isNaN(availableUntil.getTime())) {
    return { ok: false, error: "Enter valid dates." };
  }
  if (availableUntil <= availableFrom) {
    return { ok: false, error: "The closing date/time must be after the opening date/time." };
  }

  const assessment = await prisma.assessment.create({
    data: {
      type: type as never,
      title,
      description: description || null,
      durationMinutes,
      proctoringEnabled,
      availableFrom,
      availableUntil,
    },
  });

  revalidatePath("/lms/company/assessments");
  return { ok: true, assessmentId: assessment.id };
}

export async function deleteAssessment(assessmentId: string) {
  await requireSuperAdmin("assessments.build");
  await prisma.assessment.delete({ where: { id: assessmentId } });
  revalidatePath("/lms/company/assessments");
}

export type UpdateAssessmentSettingsState = { ok: boolean; error?: string } | null;

/**
 * Lets an already-created assessment's settings be changed later — title,
 * duration, the open/close window, and critically the proctoring toggle —
 * without having to recreate the assessment (and its questions) from scratch
 * just to turn camera/mic proctoring on or off.
 */
export async function updateAssessmentSettings(
  assessmentId: string,
  _prevState: UpdateAssessmentSettingsState,
  formData: FormData
): Promise<UpdateAssessmentSettingsState> {
  await requireSuperAdmin("assessments.build");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const durationMinutes = Math.max(1, Number.parseInt(String(formData.get("durationMinutes") ?? "30"), 10) || 30);
  const proctoringEnabled = formData.get("proctoringEnabled") === "on";
  const availableFromRaw = String(formData.get("availableFrom") ?? "");
  const availableUntilRaw = String(formData.get("availableUntil") ?? "");

  if (!title) return { ok: false, error: "Title is required." };
  if (!availableFromRaw || !availableUntilRaw) {
    return { ok: false, error: "Set both the start and end date/time the assessment is open." };
  }
  const availableFrom = new Date(availableFromRaw);
  const availableUntil = new Date(availableUntilRaw);
  if (Number.isNaN(availableFrom.getTime()) || Number.isNaN(availableUntil.getTime())) {
    return { ok: false, error: "Enter valid dates." };
  }
  if (availableUntil <= availableFrom) {
    return { ok: false, error: "The closing date/time must be after the opening date/time." };
  }

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      title,
      description: description || null,
      durationMinutes,
      proctoringEnabled,
      availableFrom,
      availableUntil,
    },
  });

  revalidatePath("/lms/company/assessments");
  return { ok: true };
}

export type AddQuestionState = { ok: boolean; error?: string } | null;

export async function addAssessmentQuestion(
  assessmentId: string,
  _prevState: AddQuestionState,
  formData: FormData
): Promise<AddQuestionState> {
  await requireSuperAdmin("assessments.build");

  const questionType = String(formData.get("questionType") ?? "");
  const questionText = String(formData.get("questionText") ?? "").trim();
  const marksInput = String(formData.get("marks") ?? "1");
  const marks = Math.min(10, Math.max(1, Number.parseInt(marksInput, 10) || 1));

  if (!questionText) return { ok: false, error: "Enter the question text." };
  if (!["MCQ", "WRITTEN"].includes(questionType)) {
    return { ok: false, error: "Choose a question type." };
  }

  const maxOrder = await prisma.assessmentQuestion.aggregate({
    where: { assessmentId },
    _max: { order: true },
  });

  if (questionType === "MCQ") {
    const optionA = String(formData.get("optionA") ?? "").trim();
    const optionB = String(formData.get("optionB") ?? "").trim();
    const optionC = String(formData.get("optionC") ?? "").trim();
    const optionD = String(formData.get("optionD") ?? "").trim();
    const correctOption = String(formData.get("correctOption") ?? "");

    if (!optionA || !optionB || !optionC || !optionD) {
      return { ok: false, error: "Fill in all four options." };
    }
    if (!["A", "B", "C", "D"].includes(correctOption)) {
      return { ok: false, error: "Select which option is correct." };
    }

    await prisma.assessmentQuestion.create({
      data: {
        assessmentId,
        order: (maxOrder._max.order ?? 0) + 1,
        questionType: "MCQ",
        questionText,
        marks,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
      },
    });
  } else {
    await prisma.assessmentQuestion.create({
      data: {
        assessmentId,
        order: (maxOrder._max.order ?? 0) + 1,
        questionType: "WRITTEN",
        questionText,
        marks,
      },
    });
  }

  revalidatePath("/lms/company/assessments");
  return { ok: true };
}

export async function deleteAssessmentQuestion(questionId: string) {
  await requireSuperAdmin("assessments.build");
  await prisma.assessmentQuestion.delete({ where: { id: questionId } });
  revalidatePath("/lms/company/assessments");
}

export async function publishAssessment(assessmentId: string) {
  await requireSuperAdmin("assessments.build");
  await prisma.assessment.update({ where: { id: assessmentId }, data: { published: true } });
  revalidatePath("/lms/company/assessments");
}

// ---------- Admin: assign to students ----------

export type AssignAssessmentState = { ok: boolean; error?: string; assignedCount?: number } | null;

export async function assignAssessmentToStudents(
  assessmentId: string,
  _prevState: AssignAssessmentState,
  formData: FormData
): Promise<AssignAssessmentState> {
  await requireSuperAdmin("assessments.build");

  const studentIds = formData.getAll("studentIds").map(String);
  if (studentIds.length === 0) return { ok: false, error: "Select at least one student." };

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: true },
  });
  if (!assessment) return { ok: false, error: "Assessment not found." };

  const maxMarks = assessment.questions.reduce((sum, q) => sum + q.marks, 0);

  const students = await prisma.user.findMany({ where: { id: { in: studentIds }, role: "STUDENT" } });

  let assignedCount = 0;
  for (const student of students) {
    const existing = await prisma.assessmentAssignment.findUnique({
      where: { assessmentId_studentId: { assessmentId, studentId: student.id } },
    });
    if (existing) continue;

    await prisma.assessmentAssignment.create({
      data: { assessmentId, studentId: student.id, maxMarks },
    });
    assignedCount++;

    // No email provider is configured yet (same note as password-resets.ts and
    // account-details.ts) — this simulates the invite email instead of sending it.
    console.log(
      `[dummy email] Assessment invite for ${student.email}: "${assessment.title}" — open it at /lms/student/assessments`
    );
  }

  await prisma.assessment.update({ where: { id: assessmentId }, data: { published: true } });

  revalidatePath("/lms/company/assessments");
  revalidatePath("/lms/student/assessments");
  return { ok: true, assignedCount };
}

// ---------- Student: take the assessment ----------

export async function startAssessmentAttempt(assignmentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can take assessments.");
  }

  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: { assessment: true },
  });
  if (!assignment || assignment.studentId !== session.user.id) {
    throw new Error("Not your assessment.");
  }

  const now = new Date();
  const { availableFrom, availableUntil } = assignment.assessment;
  if (availableFrom && now < availableFrom) {
    throw new Error("This assessment isn't open yet.");
  }
  if (availableUntil && now > availableUntil) {
    throw new Error("The window to take this assessment has closed.");
  }

  if (assignment.status === "ASSIGNED") {
    await prisma.assessmentAssignment.update({
      where: { id: assignmentId },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    });
  }
  revalidatePath("/lms/student/assessments");
}

export async function saveAssessmentAnswer(
  assignmentId: string,
  questionId: string,
  value: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can answer assessment questions.");
  }

  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.studentId !== session.user.id) {
    throw new Error("Not your assessment.");
  }
  if (assignment.status === "SUBMITTED" || assignment.status === "AUTO_SUBMITTED") {
    return;
  }

  const question = await prisma.assessmentQuestion.findUnique({ where: { id: questionId } });
  if (!question) return;

  if (question.questionType === "MCQ") {
    const isCorrect = value === question.correctOption;
    await prisma.assessmentAnswer.upsert({
      where: { assignmentId_questionId: { assignmentId, questionId } },
      create: {
        assignmentId,
        questionId,
        selectedOption: value,
        isCorrect,
        marksAwarded: isCorrect ? question.marks : 0,
      },
      update: { selectedOption: value, isCorrect, marksAwarded: isCorrect ? question.marks : 0 },
    });
  } else {
    await prisma.assessmentAnswer.upsert({
      where: { assignmentId_questionId: { assignmentId, questionId } },
      create: { assignmentId, questionId, writtenAnswer: value },
      update: { writtenAnswer: value },
    });
  }
}

async function finalizeSubmission(assignmentId: string, auto: boolean) {
  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: { answers: true, assessment: { include: { questions: true } } },
  });
  if (!assignment) return;
  if (assignment.status === "SUBMITTED" || assignment.status === "AUTO_SUBMITTED") return;

  const hasWritten = assignment.assessment.questions.some((q) => q.questionType === "WRITTEN");
  const autoGradedTotal = assignment.answers.reduce((sum, a) => sum + (a.marksAwarded ?? 0), 0);

  await prisma.assessmentAssignment.update({
    where: { id: assignmentId },
    data: {
      status: auto ? "AUTO_SUBMITTED" : "SUBMITTED",
      autoSubmitted: auto,
      submittedAt: new Date(),
      totalMarks: autoGradedTotal,
      needsGrading: hasWritten,
    },
  });

  revalidatePath("/lms/student/assessments");
  revalidatePath("/lms/company/assessments/submissions");
}

export async function submitAssessmentAttempt(assignmentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can submit assessments.");
  }
  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.studentId !== session.user.id) {
    throw new Error("Not your assessment.");
  }
  await finalizeSubmission(assignmentId, false);
}

/**
 * Called when the student switches tabs/windows or leaves fullscreen while an
 * assessment is in progress. Three strikes auto-submits whatever has been
 * answered so far — this is the proctoring rule the product asked for.
 */
export async function recordAssessmentViolation(assignmentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can do this.");
  }
  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.studentId !== session.user.id) {
    throw new Error("Not your assessment.");
  }
  if (assignment.status === "SUBMITTED" || assignment.status === "AUTO_SUBMITTED") {
    return { violationCount: assignment.violationCount, autoSubmitted: true };
  }

  const updated = await prisma.assessmentAssignment.update({
    where: { id: assignmentId },
    data: { violationCount: { increment: 1 } },
  });

  if (updated.violationCount >= VIOLATION_LIMIT) {
    await finalizeSubmission(assignmentId, true);
    return { violationCount: updated.violationCount, autoSubmitted: true };
  }

  return { violationCount: updated.violationCount, autoSubmitted: false };
}

/**
 * Separate from recordAssessmentViolation — sustained noise detected while
 * proctoring audio monitoring is on. Tracked and limited independently from the
 * tab-switch/fullscreen violation count, as requested, with its own 3-strike cap.
 */
export async function recordAudioViolation(assignmentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can do this.");
  }
  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.studentId !== session.user.id) {
    throw new Error("Not your assessment.");
  }
  if (assignment.status === "SUBMITTED" || assignment.status === "AUTO_SUBMITTED") {
    return { audioViolationCount: assignment.audioViolationCount, autoSubmitted: true };
  }

  const updated = await prisma.assessmentAssignment.update({
    where: { id: assignmentId },
    data: { audioViolationCount: { increment: 1 } },
  });

  if (updated.audioViolationCount >= AUDIO_VIOLATION_LIMIT) {
    await finalizeSubmission(assignmentId, true);
    return { audioViolationCount: updated.audioViolationCount, autoSubmitted: true };
  }

  return { audioViolationCount: updated.audioViolationCount, autoSubmitted: false };
}

/**
 * Called when the student doesn't click back into full-screen within the
 * 5-second grace window shown after any "left the exam" event (tab switch,
 * window blur, or exiting full-screen). Unlike recordAssessmentViolation,
 * this always finalizes the attempt immediately regardless of how many
 * violations came before it — that's the rule the product asked for.
 */
export async function recordAssessmentTimeout(assignmentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can do this.");
  }
  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.studentId !== session.user.id) {
    throw new Error("Not your assessment.");
  }
  if (assignment.status === "SUBMITTED" || assignment.status === "AUTO_SUBMITTED") {
    return { autoSubmitted: true };
  }

  await prisma.assessmentAssignment.update({
    where: { id: assignmentId },
    data: { violationCount: { increment: 1 } },
  });
  await finalizeSubmission(assignmentId, true);
  return { autoSubmitted: true };
}

// ---------- Admin: grading & results ----------

export async function gradeWrittenAnswer(answerId: string, marksAwarded: number) {
  await requireSuperAdmin("assessments.submissions");

  const answer = await prisma.assessmentAnswer.update({
    where: { id: answerId },
    data: { marksAwarded },
    include: { assignment: { include: { answers: true } } },
  });

  const total = answer.assignment.answers.reduce(
    (sum, a) => sum + (a.id === answerId ? marksAwarded : (a.marksAwarded ?? 0)),
    0
  );
  const stillNeedsGrading = answer.assignment.answers.some(
    (a) => a.id !== answerId && a.marksAwarded === null && a.writtenAnswer !== null
  );

  await prisma.assessmentAssignment.update({
    where: { id: answer.assignmentId },
    data: { totalMarks: total, needsGrading: stillNeedsGrading },
  });

  revalidatePath("/lms/company/assessments/submissions");
}

export async function sendResultToCollege(assignmentId: string, formData: FormData) {
  await requireSuperAdmin("assessments.submissions");
  const snapshotIds = formData.getAll("snapshotIds").map(String);
  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: { student: { include: { college: true } }, assessment: true },
  });
  if (!assignment) return;

  const photoNote = snapshotIds.length > 0 ? ` with ${snapshotIds.length} selected proctoring photo(s) attached` : "";
  console.log(
    `[dummy email] Assessment result for ${assignment.student.name} — "${assignment.assessment.title}": ${assignment.totalMarks}/${assignment.maxMarks} sent to ${assignment.student.college?.contactEmail ?? "the college"}${photoNote}`
  );

  if (snapshotIds.length > 0) {
    await prisma.assessmentSnapshot.updateMany({
      where: { id: { in: snapshotIds }, assignmentId },
      data: { sharedWithCollege: true },
    });
  }
  await prisma.assessmentAssignment.update({ where: { id: assignmentId }, data: { sentToCollegeAt: new Date() } });
  revalidatePath("/lms/company/assessments/submissions");
  revalidatePath("/lms/college/assessment-data");
}

export async function sendResultToStudent(assignmentId: string, formData: FormData) {
  await requireSuperAdmin("assessments.submissions");
  const snapshotIds = formData.getAll("snapshotIds").map(String);
  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: { student: true, assessment: true },
  });
  if (!assignment) return;

  const photoNote = snapshotIds.length > 0 ? ` with ${snapshotIds.length} selected proctoring photo(s) attached` : "";
  console.log(
    `[dummy email] Assessment result for ${assignment.student.email} — "${assignment.assessment.title}": ${assignment.totalMarks}/${assignment.maxMarks}${photoNote}`
  );

  if (snapshotIds.length > 0) {
    await prisma.assessmentSnapshot.updateMany({
      where: { id: { in: snapshotIds }, assignmentId },
      data: { sharedWithStudent: true },
    });
  }
  await prisma.assessmentAssignment.update({ where: { id: assignmentId }, data: { sentToStudentAt: new Date() } });
  revalidatePath("/lms/company/assessments/submissions");
  revalidatePath("/lms/student/assessments");
}

// ---------- Admin: proctoring snapshots ----------

export async function deleteAssessmentSnapshots(assignmentId: string, formData: FormData) {
  await requireSuperAdmin("assessments.submissions");
  const snapshotIds = formData.getAll("snapshotIds").map(String);
  if (snapshotIds.length === 0) return;

  const snapshots = await prisma.assessmentSnapshot.findMany({
    where: { id: { in: snapshotIds }, assignmentId },
  });

  for (const snap of snapshots) {
    try {
      await unlink(path.join(process.cwd(), "public", snap.imageUrl));
    } catch {
      // Already gone locally (e.g. after a redeploy) — fine, still clean up GitHub + the DB row.
    }
    await deleteUploadFromGitHub(snap.imageUrl);
  }

  await prisma.assessmentSnapshot.deleteMany({ where: { id: { in: snapshotIds }, assignmentId } });
  revalidatePath("/lms/company/assessments/submissions");
}
