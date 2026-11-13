"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEmployeeKeys, type EmployeePageKey } from "@/lib/employee-access";
import { deleteUploadFromGitHub } from "@/lib/github-upload";
import { notify } from "@/lib/notifications";
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
  // Coding questions are typically weighted heavier than a single MCQ/written
  // question, so they get a higher ceiling than the rest.
  const marksCap = questionType === "CODING" ? 50 : 10;
  const marks = Math.min(marksCap, Math.max(1, Number.parseInt(marksInput, 10) || 1));

  if (!questionText) return { ok: false, error: "Enter the question text." };
  if (!["MCQ", "WRITTEN", "CODING"].includes(questionType)) {
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
  } else if (questionType === "CODING") {
    const inputs = formData.getAll("testCaseInput").map(String);
    const outputs = formData.getAll("testCaseOutput").map(String);
    const hiddenFlags = formData.getAll("testCaseHidden").map(String);
    const starterPython = String(formData.get("starterPython") ?? "");
    const starterJava = String(formData.get("starterJava") ?? "");
    const starterC = String(formData.get("starterC") ?? "");
    const starterCpp = String(formData.get("starterCpp") ?? "");
    const timeLimitRaw = String(formData.get("timeLimitSeconds") ?? "").trim();
    const timeLimitSeconds = timeLimitRaw ? Math.min(30, Math.max(1, Number.parseInt(timeLimitRaw, 10) || 8)) : null;

    const testCases = inputs
      .map((input, i) => ({ input, expectedOutput: outputs[i] ?? "", isHidden: hiddenFlags[i] === "true" }))
      .filter((tc) => tc.expectedOutput.trim() !== "" || tc.input.trim() !== "");

    if (testCases.length === 0) {
      return { ok: false, error: "Add at least one test case." };
    }
    if (!testCases.some((tc) => !tc.isHidden)) {
      return { ok: false, error: "At least one test case must be visible to the student (not hidden)." };
    }

    const starterCode = JSON.stringify({
      python: starterPython,
      java: starterJava,
      c: starterC,
      cpp: starterCpp,
    });

    await prisma.assessmentQuestion.create({
      data: {
        assessmentId,
        order: (maxOrder._max.order ?? 0) + 1,
        questionType: "CODING",
        questionText,
        marks,
        starterCode,
        timeLimitSeconds,
        testCases: {
          create: testCases.map((tc, i) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            order: i,
          })),
        },
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

export type AssignAssessmentState = { ok: boolean; error?: string; assignedCount?: number; updatedCount?: number } | null;

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
  let updatedCount = 0;
  for (const student of students) {
    const existing = await prisma.assessmentAssignment.findUnique({
      where: { assessmentId_studentId: { assessmentId, studentId: student.id } },
    });
    if (existing) {
      // Already assigned — if they haven't started yet, they'll see whatever
      // questions exist now anyway (the take-exam page always reads the
      // assessment's current questions, it was never a frozen snapshot), so the
      // only thing actually stale here is maxMarks from whenever they were first
      // assigned. Re-selecting them after editing the assessment just re-syncs
      // that instead of silently doing nothing, which is what made it look like
      // "resending" wasn't possible. Anyone already in progress or submitted is
      // left alone — use Allow Retest on their submission for those.
      if (existing.status === "ASSIGNED" && existing.maxMarks !== maxMarks) {
        await prisma.assessmentAssignment.update({ where: { id: existing.id }, data: { maxMarks } });
        updatedCount++;
      }
      continue;
    }

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
  return { ok: true, assignedCount, updatedCount };
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

// ---------- Student: coding questions ----------

export type RunCodeState = {
  ok: boolean;
  error?: string;
  results?: { input: string; expectedOutput: string; actualOutput: string; passed: boolean }[];
} | null;

/** The "Run" button — only ever touches the VISIBLE test cases, shows the student
 * their actual output, and never persists anything. Hidden test cases are never
 * fetched here, so there's no way for a student to see them by inspecting network
 * traffic from Run. */
export async function runStudentCode(
  assignmentId: string,
  questionId: string,
  language: string,
  code: string
): Promise<RunCodeState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return { ok: false, error: "Not authorized." };
  }
  if (!["python", "java", "c", "cpp"].includes(language)) {
    return { ok: false, error: "Unsupported language." };
  }

  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.studentId !== session.user.id) {
    return { ok: false, error: "Not your assessment." };
  }

  const question = await prisma.assessmentQuestion.findUnique({
    where: { id: questionId },
    include: { testCases: { where: { isHidden: false }, orderBy: { order: "asc" } } },
  });
  if (!question || question.questionType !== "CODING") {
    return { ok: false, error: "Question not found." };
  }

  const { runCode, outputsMatch } = await import("@/lib/piston");
  const runTimeoutMs = question.timeLimitSeconds ? question.timeLimitSeconds * 1000 : undefined;
  try {
    const results = await Promise.all(
      question.testCases.map(async (tc) => {
        const result = await runCode(language as "python" | "java" | "c" | "cpp", code, tc.input, runTimeoutMs);
        const actualOutput = result.timedOut
          ? `Time limit exceeded (${question.timeLimitSeconds ?? 8}s).`
          : result.compileError
            ? `Compile error:\n${result.compileError}`
            : result.stdout || result.stderr;
        return {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput,
          passed: !result.compileError && !result.timedOut && outputsMatch(result.stdout, tc.expectedOutput),
        };
      })
    );
    return { ok: true, results };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't run the code." };
  }
}

export type SubmitCodeState = {
  ok: boolean;
  error?: string;
  testCasesPassed?: number;
  testCasesTotal?: number;
  marksAwarded?: number;
} | null;

/** The "Submit Code" button for one coding question — runs against EVERY test case
 * (visible and hidden), scores proportionally to how many passed, and persists the
 * answer. Hidden test cases' inputs/outputs are never sent back to the client,
 * only the pass/fail counts. */
export async function submitCodingAnswer(
  assignmentId: string,
  questionId: string,
  formData: FormData
): Promise<SubmitCodeState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return { ok: false, error: "Not authorized." };
  }

  const language = String(formData.get("language") ?? "");
  const code = String(formData.get("code") ?? "");
  if (!["python", "java", "c", "cpp"].includes(language)) {
    return { ok: false, error: "Unsupported language." };
  }
  if (!code.trim()) return { ok: false, error: "Write some code before submitting." };

  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.studentId !== session.user.id) {
    return { ok: false, error: "Not your assessment." };
  }
  if (assignment.status === "SUBMITTED" || assignment.status === "AUTO_SUBMITTED") {
    return { ok: false, error: "This assessment has already been submitted." };
  }

  const question = await prisma.assessmentQuestion.findUnique({
    where: { id: questionId },
    include: { testCases: { orderBy: { order: "asc" } } },
  });
  if (!question || question.questionType !== "CODING") {
    return { ok: false, error: "Question not found." };
  }
  if (question.testCases.length === 0) {
    return { ok: false, error: "This question has no test cases configured." };
  }

  const { runCode, outputsMatch } = await import("@/lib/piston");
  const runTimeoutMs = question.timeLimitSeconds ? question.timeLimitSeconds * 1000 : undefined;
  let passed = 0;
  try {
    for (const tc of question.testCases) {
      const result = await runCode(language as "python" | "java" | "c" | "cpp", code, tc.input, runTimeoutMs);
      if (!result.compileError && !result.timedOut && outputsMatch(result.stdout, tc.expectedOutput)) passed += 1;
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't run the code." };
  }

  const total = question.testCases.length;
  const marksAwarded = Math.round((passed / total) * question.marks);

  await prisma.assessmentAnswer.upsert({
    where: { assignmentId_questionId: { assignmentId, questionId } },
    create: {
      assignmentId,
      questionId,
      codeSubmission: code,
      codeLanguage: language,
      testCasesPassed: passed,
      testCasesTotal: total,
      marksAwarded,
      isCorrect: passed === total,
    },
    update: {
      codeSubmission: code,
      codeLanguage: language,
      testCasesPassed: passed,
      testCasesTotal: total,
      marksAwarded,
      isCorrect: passed === total,
    },
  });

  return { ok: true, testCasesPassed: passed, testCasesTotal: total, marksAwarded };
}

/**
 * Locks in the MCQ/written phase of a mixed assessment and moves the student into
 * the coding phase — one-way. Only meaningful for assessments that actually have a
 * CODING question; for anything else this is never called from the UI at all.
 */
export async function submitMcqPhase(assignmentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can do this.");
  }

  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.studentId !== session.user.id) {
    throw new Error("Not your assessment.");
  }
  if (assignment.mcqPhaseSubmittedAt) return;

  await prisma.assessmentAssignment.update({
    where: { id: assignmentId },
    data: { mcqPhaseSubmittedAt: new Date() },
  });
  revalidatePath("/lms/student/assessments");
}

async function finalizeSubmission(assignmentId: string, auto: boolean) {
  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: { answers: true, assessment: { include: { questions: true } }, student: true },
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

  await notify("STUDENT", `${assignment.student.name} submitted "${assignment.assessment.title}"`, {
    message: auto ? "Auto-submitted (proctoring violations or time up)." : undefined,
    href: `/lms/company/assessments/submissions?assignmentId=${assignmentId}`,
    requiredKey: "assessments.submissions",
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

export type SendResultState = {
  ok: boolean;
  error?: string;
  newlyShared?: number;
  alreadyShared?: number;
} | null;

export async function sendResultToCollege(assignmentId: string, formData: FormData): Promise<SendResultState> {
  await requireSuperAdmin("assessments.submissions");
  const snapshotIds = formData.getAll("snapshotIds").map(String);
  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: { student: { include: { college: true } }, assessment: true },
  });
  if (!assignment) return { ok: false, error: "This submission no longer exists." };

  let newlyShared = 0;
  let alreadyShared = 0;
  if (snapshotIds.length > 0) {
    // Read the current sharing state first so we can tell the admin exactly what
    // this click did — "N shared" vs "N were already shared" — since otherwise a
    // re-send of already-shared photos looks like it silently did nothing.
    const existing = await prisma.assessmentSnapshot.findMany({
      where: { id: { in: snapshotIds }, assignmentId },
      select: { sharedWithCollege: true },
    });
    newlyShared = existing.filter((s) => !s.sharedWithCollege).length;
    alreadyShared = existing.filter((s) => s.sharedWithCollege).length;
    await prisma.assessmentSnapshot.updateMany({
      where: { id: { in: snapshotIds }, assignmentId },
      data: { sharedWithCollege: true },
    });
  }

  const photoNote = snapshotIds.length > 0 ? ` with ${snapshotIds.length} selected proctoring photo(s) attached` : "";
  console.log(
    `[dummy email] Assessment result for ${assignment.student.name} — "${assignment.assessment.title}": ${assignment.totalMarks}/${assignment.maxMarks} sent to ${assignment.student.college?.contactEmail ?? "the college"}${photoNote}`
  );

  await prisma.assessmentAssignment.update({ where: { id: assignmentId }, data: { sentToCollegeAt: new Date() } });
  revalidatePath("/lms/company/assessments/submissions");
  revalidatePath("/lms/college/assessment-data");
  return { ok: true, newlyShared, alreadyShared };
}

export async function sendResultToStudent(assignmentId: string, formData: FormData): Promise<SendResultState> {
  await requireSuperAdmin("assessments.submissions");
  const snapshotIds = formData.getAll("snapshotIds").map(String);
  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: { student: true, assessment: true },
  });
  if (!assignment) return { ok: false, error: "This submission no longer exists." };

  let newlyShared = 0;
  let alreadyShared = 0;
  if (snapshotIds.length > 0) {
    const existing = await prisma.assessmentSnapshot.findMany({
      where: { id: { in: snapshotIds }, assignmentId },
      select: { sharedWithStudent: true },
    });
    newlyShared = existing.filter((s) => !s.sharedWithStudent).length;
    alreadyShared = existing.filter((s) => s.sharedWithStudent).length;
    await prisma.assessmentSnapshot.updateMany({
      where: { id: { in: snapshotIds }, assignmentId },
      data: { sharedWithStudent: true },
    });
  }

  const photoNote = snapshotIds.length > 0 ? ` with ${snapshotIds.length} selected proctoring photo(s) attached` : "";
  console.log(
    `[dummy email] Assessment result for ${assignment.student.email} — "${assignment.assessment.title}": ${assignment.totalMarks}/${assignment.maxMarks}${photoNote}`
  );

  await prisma.assessmentAssignment.update({ where: { id: assignmentId }, data: { sentToStudentAt: new Date() } });
  revalidatePath("/lms/company/assessments/submissions");
  revalidatePath("/lms/student/assessments");
  return { ok: true, newlyShared, alreadyShared };
}

/**
 * Lets the admin give a student a clean retake of an assessment they already
 * submitted — e.g. an accidental/premature submit the college asked to be
 * redone. Wipes this attempt's answers, violations, snapshots, and marks, and
 * puts the assignment back to ASSIGNED so it behaves exactly like a fresh send.
 * Only ever admin-initiated; a student has no way to trigger this themselves.
 */
export async function allowAssessmentRetest(assignmentId: string) {
  await requireSuperAdmin("assessments.submissions");

  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) return;

  const snapshots = await prisma.assessmentSnapshot.findMany({ where: { assignmentId } });
  for (const snap of snapshots) {
    try {
      await unlink(path.join(process.cwd(), "public", snap.imageUrl));
    } catch {
      // Already gone locally — fine, still clean up GitHub + the DB row.
    }
    await deleteUploadFromGitHub(snap.imageUrl);
  }

  await prisma.$transaction([
    prisma.assessmentAnswer.deleteMany({ where: { assignmentId } }),
    prisma.assessmentSnapshot.deleteMany({ where: { assignmentId } }),
    prisma.assessmentAssignment.update({
      where: { id: assignmentId },
      data: {
        status: "ASSIGNED",
        violationCount: 0,
        audioViolationCount: 0,
        autoSubmitted: false,
        startedAt: null,
        submittedAt: null,
        totalMarks: null,
        needsGrading: false,
        mcqPhaseSubmittedAt: null,
        sentToCollegeAt: null,
        sentToStudentAt: null,
      },
    }),
  ]);

  revalidatePath("/lms/company/assessments/submissions");
  revalidatePath("/lms/student/assessments");
  redirect("/lms/company/assessments/submissions");
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
