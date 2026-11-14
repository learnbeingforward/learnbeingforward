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
  const assessmentCode = String(formData.get("assessmentCode") ?? "").trim() || null;
  const passMarkRaw = String(formData.get("passMark") ?? "").trim();
  const passMark = passMarkRaw ? Math.max(0, Number.parseInt(passMarkRaw, 10) || 0) : null;

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
      assessmentCode,
      passMark,
      // The 3 default section cards (Aptitude/Technical/Coding) always exist, so
      // any assessment can mix as many of the 3 kinds as the admin actually uses —
      // a section nobody adds a question to just stays empty and invisible to
      // students, same as a pure single-type assessment behaves today.
      sectionKinds: JSON.stringify({ Aptitude: "APTITUDE", Technical: "TECHNICAL", Coding: "CODING" }),
    },
  });

  revalidatePath("/lms/company/assessments");
  return { ok: true, assessmentId: assessment.id };
}

export type SectionKind = "APTITUDE" | "TECHNICAL" | "CODING";

/** Adds a custom named section (beyond the default Aptitude/Technical/Coding 3)
 * to an assessment's section-card grid — the dashed "+ ADD SECTION" tile. */
export async function addAssessmentSection(assessmentId: string, name: string, kind: SectionKind) {
  await requireSuperAdmin("assessments.build");
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Section name is required.");

  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) throw new Error("Assessment not found.");

  const kinds = JSON.parse(assessment.sectionKinds || "{}") as Record<string, SectionKind>;
  if (Object.keys(kinds).some((k) => k.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error("A section with that name already exists.");
  }
  kinds[trimmed] = kind;

  await prisma.assessment.update({ where: { id: assessmentId }, data: { sectionKinds: JSON.stringify(kinds) } });
  revalidatePath("/lms/company/assessments");
}

/** Removes a custom section card — only when it has no questions in it, so this
 * can never silently orphan real content. */
export async function removeAssessmentSection(assessmentId: string, name: string) {
  await requireSuperAdmin("assessments.build");

  const questionCount = await prisma.assessmentQuestion.count({ where: { assessmentId, sectionName: name } });
  if (questionCount > 0) throw new Error("Remove or move this section's questions first.");

  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) throw new Error("Assessment not found.");
  const kinds = JSON.parse(assessment.sectionKinds || "{}") as Record<string, SectionKind>;
  delete kinds[name];
  const shuffle = JSON.parse(assessment.shuffleSections || "{}") as Record<string, boolean>;
  delete shuffle[name];

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { sectionKinds: JSON.stringify(kinds), shuffleSections: JSON.stringify(shuffle) },
  });
  revalidatePath("/lms/company/assessments");
}

/** The "Shuffle questions" checkbox on a section card — shuffles that section's
 * question ORDER per student (seeded by assignment id, so it's stable across a
 * resumed attempt). Option order within a question is never shuffled. */
export async function setSectionShuffle(assessmentId: string, name: string, enabled: boolean) {
  await requireSuperAdmin("assessments.build");
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) throw new Error("Assessment not found.");
  const shuffle = JSON.parse(assessment.shuffleSections || "{}") as Record<string, boolean>;
  shuffle[name] = enabled;
  await prisma.assessment.update({ where: { id: assessmentId }, data: { shuffleSections: JSON.stringify(shuffle) } });
  revalidatePath("/lms/company/assessments");
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
  const assessmentCode = String(formData.get("assessmentCode") ?? "").trim() || null;
  const passMarkRaw = String(formData.get("passMark") ?? "").trim();
  const passMark = passMarkRaw ? Math.max(0, Number.parseInt(passMarkRaw, 10) || 0) : null;
  const tabSwitchLimitRaw = String(formData.get("tabSwitchLimit") ?? "").trim();
  const tabSwitchLimit = tabSwitchLimitRaw ? Math.max(1, Number.parseInt(tabSwitchLimitRaw, 10) || 3) : 3;
  const instructionsTemplate = String(formData.get("instructionsTemplate") ?? "").trim() || null;
  const submissionMessage = String(formData.get("submissionMessage") ?? "").trim() || null;
  const blockCopyPaste = formData.get("blockCopyPaste") === "on";
  const requireFaceMatch = formData.get("requireFaceMatch") === "on";
  const requireScreenShare = formData.get("requireScreenShare") === "on";
  const shuffleSectionsRaw = String(formData.get("shuffleSections") ?? "").trim();

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
      assessmentCode,
      passMark,
      tabSwitchLimit,
      instructionsTemplate,
      submissionMessage,
      blockCopyPaste,
      requireFaceMatch,
      requireScreenShare,
      shuffleSections: shuffleSectionsRaw || null,
    },
  });

  revalidatePath("/lms/company/assessments");
  return { ok: true };
}

export type AddQuestionState = { ok: boolean; error?: string; questionId?: string } | null;

// Shared by addAssessmentQuestion and updateAssessmentQuestion for the MCQ/WRITTEN
// fields that Screens 2 (Aptitude) and 3 (Technical) both post — topic/difficulty/
// tags/negative-marks/explanation plus the single/multiple/numeric answer shape.
function readMcqFields(formData: FormData) {
  const answerType = String(formData.get("answerType") ?? "SINGLE");
  const optionA = String(formData.get("optionA") ?? "").trim();
  const optionB = String(formData.get("optionB") ?? "").trim();
  const optionC = String(formData.get("optionC") ?? "").trim();
  const optionD = String(formData.get("optionD") ?? "").trim();
  const correctOption = String(formData.get("correctOption") ?? "");
  const correctOptions = formData.getAll("correctOptions").map(String).filter(Boolean);
  const numericAnswer = String(formData.get("numericAnswer") ?? "").trim() || null;
  const numericTolerance = String(formData.get("numericTolerance") ?? "").trim() || null;

  return {
    answerType,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOption,
    correctOptions,
    numericAnswer,
    numericTolerance,
    topic: String(formData.get("topic") ?? "").trim() || null,
    subTopic: String(formData.get("subTopic") ?? "").trim() || null,
    questionStyle: String(formData.get("questionStyle") ?? "").trim() || null,
    difficulty: String(formData.get("difficulty") ?? "MEDIUM").trim() || "MEDIUM",
    tags: String(formData.get("tags") ?? "").trim() || null,
    negativeMarks: Math.max(0, Number.parseInt(String(formData.get("negativeMarks") ?? "0"), 10) || 0),
    explanation: String(formData.get("explanation") ?? "").trim() || null,
  };
}

function validateMcqFields(f: ReturnType<typeof readMcqFields>): string | null {
  if (f.answerType === "NUMERIC") {
    if (!f.numericAnswer) return "Enter the correct numeric value.";
    return null;
  }
  if (!f.optionA || !f.optionB || !f.optionC || !f.optionD) {
    return "Fill in all four options.";
  }
  if (f.answerType === "MULTIPLE") {
    if (f.correctOptions.length === 0) return "Select at least one correct option.";
  } else if (!["A", "B", "C", "D"].includes(f.correctOption)) {
    return "Select which option is correct.";
  }
  return null;
}

// Shared by addAssessmentQuestion and updateAssessmentQuestion for Screen 4
// (Add Coding Question) — everything beyond the basics/test-cases that the
// 9-section builder posts.
function readCodingFields(formData: FormData) {
  const inputs = formData.getAll("testCaseInput").map(String);
  const outputs = formData.getAll("testCaseOutput").map(String);
  const hiddenFlags = formData.getAll("testCaseHidden").map(String);
  const labels = formData.getAll("testCaseLabel").map(String);
  const weights = formData.getAll("testCaseWeight").map(String);
  const testCases = inputs
    .map((input, i) => ({
      input,
      expectedOutput: outputs[i] ?? "",
      isHidden: hiddenFlags[i] === "true",
      label: labels[i]?.trim() || null,
      weight: Math.max(0, Number.parseInt(weights[i] ?? "0", 10) || 0),
    }))
    .filter((tc) => tc.expectedOutput.trim() !== "" || tc.input.trim() !== "");

  const starterCode = JSON.stringify({
    python: String(formData.get("starterPython") ?? ""),
    java: String(formData.get("starterJava") ?? ""),
    c: String(formData.get("starterC") ?? ""),
    cpp: String(formData.get("starterCpp") ?? ""),
  });

  const editableRanges = JSON.stringify({
    python: { enabled: formData.get("enabledPython") !== "off", range: String(formData.get("rangePython") ?? "") },
    java: { enabled: formData.get("enabledJava") !== "off", range: String(formData.get("rangeJava") ?? "") },
    c: { enabled: formData.get("enabledC") !== "off", range: String(formData.get("rangeC") ?? "") },
    cpp: { enabled: formData.get("enabledCpp") !== "off", range: String(formData.get("rangeCpp") ?? "") },
  });

  const timeLimitRaw = String(formData.get("timeLimitSeconds") ?? "").trim();
  const timeLimitSeconds = timeLimitRaw ? Math.min(30, Math.max(1, Number.parseInt(timeLimitRaw, 10) || 8)) : null;
  const submissionsMode = String(formData.get("submissionsMode") ?? "UNLIMITED_LAST");
  const submissionsLimitRaw = String(formData.get("submissionsLimit") ?? "").trim();

  return {
    testCases,
    starterCode,
    editableRanges,
    timeLimitSeconds,
    title: String(formData.get("title") ?? "").trim() || null,
    topic: String(formData.get("topic") ?? "").trim() || null,
    difficulty: String(formData.get("difficulty") ?? "MEDIUM").trim() || "MEDIUM",
    inputFormat: String(formData.get("inputFormat") ?? "").trim() || null,
    outputFormat: String(formData.get("outputFormat") ?? "").trim() || null,
    constraints: String(formData.get("constraints") ?? "").trim() || null,
    sampleInput: String(formData.get("sampleInput") ?? "").trim() || null,
    sampleOutput: String(formData.get("sampleOutput") ?? "").trim() || null,
    sampleExplanation: String(formData.get("sampleExplanation") ?? "").trim() || null,
    referenceSolutionLanguage: String(formData.get("referenceSolutionLanguage") ?? "").trim() || null,
    referenceSolution: String(formData.get("referenceSolution") ?? "").trim() || null,
    adminNote: String(formData.get("adminNote") ?? "").trim() || null,
    scoringMode: String(formData.get("scoringMode") ?? "PARTIAL"),
    submissionsMode,
    submissionsLimit: submissionsMode === "LIMITED" && submissionsLimitRaw ? Math.max(1, Number.parseInt(submissionsLimitRaw, 10) || 1) : null,
  };
}

export async function addAssessmentQuestion(
  assessmentId: string,
  _prevState: AddQuestionState,
  formData: FormData
): Promise<AddQuestionState> {
  await requireSuperAdmin("assessments.build");

  const questionType = String(formData.get("questionType") ?? "");
  const questionText = String(formData.get("questionText") ?? "").trim();
  const sectionName = String(formData.get("sectionName") ?? "").trim() || null;
  const snippetLanguage = String(formData.get("snippetLanguage") ?? "").trim() || null;
  const snippetCodeRaw = String(formData.get("snippetCode") ?? "");
  const snippetCode = snippetCodeRaw.trim() ? snippetCodeRaw : null;
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
    const f = readMcqFields(formData);
    const err = validateMcqFields(f);
    if (err) return { ok: false, error: err };

    const created = await prisma.assessmentQuestion.create({
      data: {
        assessmentId,
        order: (maxOrder._max.order ?? 0) + 1,
        questionType: "MCQ",
        questionText,
        marks,
        sectionName,
        snippetLanguage,
        snippetCode,
        optionA: f.answerType === "NUMERIC" ? null : f.optionA,
        optionB: f.answerType === "NUMERIC" ? null : f.optionB,
        optionC: f.answerType === "NUMERIC" ? null : f.optionC,
        optionD: f.answerType === "NUMERIC" ? null : f.optionD,
        correctOption: f.answerType === "SINGLE" ? f.correctOption : null,
        correctOptions: f.answerType === "MULTIPLE" ? f.correctOptions.join(",") : null,
        answerType: f.answerType,
        numericAnswer: f.answerType === "NUMERIC" ? f.numericAnswer : null,
        numericTolerance: f.answerType === "NUMERIC" ? f.numericTolerance : null,
        topic: f.topic,
        subTopic: f.subTopic,
        questionStyle: f.questionStyle,
        difficulty: f.difficulty,
        tags: f.tags,
        negativeMarks: f.negativeMarks,
        explanation: f.explanation,
        status: "VALIDATED",
      },
    });
    revalidatePath("/lms/company/assessments");
    return { ok: true, questionId: created.id };
  } else if (questionType === "CODING") {
    const f = readCodingFields(formData);

    if (f.testCases.length === 0) {
      return { ok: false, error: "Add at least one test case." };
    }
    if (!f.testCases.some((tc) => !tc.isHidden)) {
      return { ok: false, error: "At least one test case must be visible to the student (not hidden)." };
    }

    const created = await prisma.assessmentQuestion.create({
      data: {
        assessmentId,
        order: (maxOrder._max.order ?? 0) + 1,
        questionType: "CODING",
        questionText,
        marks,
        sectionName,
        starterCode: f.starterCode,
        timeLimitSeconds: f.timeLimitSeconds,
          title: f.title,
        topic: f.topic,
        difficulty: f.difficulty,
        inputFormat: f.inputFormat,
        outputFormat: f.outputFormat,
        constraints: f.constraints,
        sampleInput: f.sampleInput,
        sampleOutput: f.sampleOutput,
        sampleExplanation: f.sampleExplanation,
        editableRanges: f.editableRanges,
        referenceSolutionLanguage: f.referenceSolutionLanguage,
        referenceSolution: f.referenceSolution,
        adminNote: f.adminNote,
        scoringMode: f.scoringMode,
        submissionsMode: f.submissionsMode,
        submissionsLimit: f.submissionsLimit,
        status: "DRAFT",
        testCases: {
          create: f.testCases.map((tc, i) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            label: tc.label,
            weight: tc.weight,
            order: i,
          })),
        },
      },
    });
    revalidatePath("/lms/company/assessments");
    return { ok: true, questionId: created.id };
  } else {
    const created = await prisma.assessmentQuestion.create({
      data: {
        assessmentId,
        order: (maxOrder._max.order ?? 0) + 1,
        questionType: "WRITTEN",
        questionText,
        marks,
        sectionName,
        snippetLanguage,
        snippetCode,
      },
    });
    revalidatePath("/lms/company/assessments");
    return { ok: true, questionId: created.id };
  }
}

/** Edits a question already saved from Screens 2/3/4 — same field set and
 * validation as creating one, just an update instead of a create. Test cases are
 * replaced wholesale (delete-then-recreate) since the builder always posts the
 * full current list, not a diff. */
export async function updateAssessmentQuestion(
  questionId: string,
  _prevState: AddQuestionState,
  formData: FormData
): Promise<AddQuestionState> {
  await requireSuperAdmin("assessments.build");

  const existing = await prisma.assessmentQuestion.findUnique({ where: { id: questionId } });
  if (!existing) return { ok: false, error: "This question no longer exists." };

  const questionText = String(formData.get("questionText") ?? "").trim();
  const sectionName = String(formData.get("sectionName") ?? "").trim() || null;
  const snippetLanguage = String(formData.get("snippetLanguage") ?? "").trim() || null;
  const snippetCodeRaw = String(formData.get("snippetCode") ?? "");
  const snippetCode = snippetCodeRaw.trim() ? snippetCodeRaw : null;
  const marksInput = String(formData.get("marks") ?? "1");
  const marksCap = existing.questionType === "CODING" ? 50 : 10;
  const marks = Math.min(marksCap, Math.max(1, Number.parseInt(marksInput, 10) || 1));

  if (!questionText) return { ok: false, error: "Enter the question text." };

  if (existing.questionType === "MCQ") {
    const f = readMcqFields(formData);
    const err = validateMcqFields(f);
    if (err) return { ok: false, error: err };

    await prisma.assessmentQuestion.update({
      where: { id: questionId },
      data: {
        questionText,
        marks,
        sectionName,
        snippetLanguage,
        snippetCode,
        optionA: f.answerType === "NUMERIC" ? null : f.optionA,
        optionB: f.answerType === "NUMERIC" ? null : f.optionB,
        optionC: f.answerType === "NUMERIC" ? null : f.optionC,
        optionD: f.answerType === "NUMERIC" ? null : f.optionD,
        correctOption: f.answerType === "SINGLE" ? f.correctOption : null,
        correctOptions: f.answerType === "MULTIPLE" ? f.correctOptions.join(",") : null,
        answerType: f.answerType,
        numericAnswer: f.answerType === "NUMERIC" ? f.numericAnswer : null,
        numericTolerance: f.answerType === "NUMERIC" ? f.numericTolerance : null,
        topic: f.topic,
        subTopic: f.subTopic,
        questionStyle: f.questionStyle,
        difficulty: f.difficulty,
        tags: f.tags,
        negativeMarks: f.negativeMarks,
        explanation: f.explanation,
      },
    });
  } else if (existing.questionType === "CODING") {
    const f = readCodingFields(formData);
    if (f.testCases.length === 0) return { ok: false, error: "Add at least one test case." };
    if (!f.testCases.some((tc) => !tc.isHidden)) {
      return { ok: false, error: "At least one test case must be visible to the student (not hidden)." };
    }

    await prisma.$transaction([
      prisma.codingTestCase.deleteMany({ where: { questionId } }),
      prisma.assessmentQuestion.update({
        where: { id: questionId },
        data: {
          questionText,
          marks,
          sectionName,
          starterCode: f.starterCode,
          timeLimitSeconds: f.timeLimitSeconds,
          title: f.title,
          topic: f.topic,
          difficulty: f.difficulty,
          inputFormat: f.inputFormat,
          outputFormat: f.outputFormat,
          constraints: f.constraints,
          sampleInput: f.sampleInput,
          sampleOutput: f.sampleOutput,
          sampleExplanation: f.sampleExplanation,
          editableRanges: f.editableRanges,
          referenceSolutionLanguage: f.referenceSolutionLanguage,
          referenceSolution: f.referenceSolution,
          adminNote: f.adminNote,
          scoringMode: f.scoringMode,
          submissionsMode: f.submissionsMode,
          submissionsLimit: f.submissionsLimit,
          // Edited test cases need re-validating before they count as VALIDATED again.
          status: "DRAFT",
          testCases: {
            create: f.testCases.map((tc, i) => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: tc.isHidden,
              label: tc.label,
              weight: tc.weight,
              order: i,
            })),
          },
        },
      }),
    ]);
  } else {
    await prisma.assessmentQuestion.update({
      where: { id: questionId },
      data: { questionText, marks, sectionName, snippetLanguage, snippetCode },
    });
  }

  revalidatePath("/lms/company/assessments");
  return { ok: true, questionId };
}

export type BankQuestion = { id: string; questionText: string; marks: number; assessmentTitle: string };

/** "ADD FROM BANK" search — existing questions of the given kind from every
 * OTHER assessment, filtered by a text search on the question itself. */
export async function searchQuestionBank(
  kind: "APTITUDE" | "TECHNICAL" | "CODING",
  query: string,
  excludeAssessmentId: string
): Promise<BankQuestion[]> {
  await requireSuperAdmin("assessments.build");
  const questionType = kind === "CODING" ? "CODING" : "MCQ";

  const results = await prisma.assessmentQuestion.findMany({
    where: {
      assessmentId: { not: excludeAssessmentId },
      questionType,
      ...(query.trim() ? { questionText: { contains: query.trim() } } : {}),
    },
    include: { assessment: { select: { title: true } } },
    orderBy: { id: "desc" },
    take: 20,
  });

  return results.map((q) => ({
    id: q.id,
    questionText: q.questionText.slice(0, 160),
    marks: q.marks,
    assessmentTitle: q.assessment.title,
  }));
}

/** "ADD FROM BANK" — copies an existing question (from any assessment) into
 * this assessment's given section, test cases included for coding questions.
 * The source question is untouched; this always creates a brand-new row. */
export async function copyQuestionFromBank(assessmentId: string, sourceQuestionId: string, sectionName: string) {
  await requireSuperAdmin("assessments.build");

  const source = await prisma.assessmentQuestion.findUnique({
    where: { id: sourceQuestionId },
    include: { testCases: { orderBy: { order: "asc" } } },
  });
  if (!source) throw new Error("That question no longer exists.");

  const maxOrder = await prisma.assessmentQuestion.aggregate({ where: { assessmentId }, _max: { order: true } });

  await prisma.assessmentQuestion.create({
    data: {
      assessmentId,
      order: (maxOrder._max.order ?? 0) + 1,
      questionType: source.questionType,
      questionText: source.questionText,
      title: source.title,
      marks: source.marks,
      sectionName,
      optionA: source.optionA,
      optionB: source.optionB,
      optionC: source.optionC,
      optionD: source.optionD,
      correctOption: source.correctOption,
      correctOptions: source.correctOptions,
      answerType: source.answerType,
      numericAnswer: source.numericAnswer,
      numericTolerance: source.numericTolerance,
      snippetLanguage: source.snippetLanguage,
      snippetCode: source.snippetCode,
      topic: source.topic,
      subTopic: source.subTopic,
      questionStyle: source.questionStyle,
      difficulty: source.difficulty,
      tags: source.tags,
      negativeMarks: source.negativeMarks,
      explanation: source.explanation,
      starterCode: source.starterCode,
      timeLimitSeconds: source.timeLimitSeconds,
      inputFormat: source.inputFormat,
      outputFormat: source.outputFormat,
      constraints: source.constraints,
      sampleInput: source.sampleInput,
      sampleOutput: source.sampleOutput,
      sampleExplanation: source.sampleExplanation,
      editableRanges: source.editableRanges,
      referenceSolutionLanguage: source.referenceSolutionLanguage,
      referenceSolution: source.referenceSolution,
      adminNote: source.adminNote,
      scoringMode: source.scoringMode,
      submissionsMode: source.submissionsMode,
      submissionsLimit: source.submissionsLimit,
      status: source.questionType === "CODING" ? "DRAFT" : source.status,
      testCases:
        source.testCases.length > 0
          ? {
              create: source.testCases.map((tc) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden,
                label: tc.label,
                weight: tc.weight,
                order: tc.order,
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/lms/company/assessments");
}

/** Moves a question up/down within its own section (by `order`) — the simple
 * up/down-arrow alternative to drag-and-drop reordering. */
export async function reorderAssessmentQuestion(questionId: string, direction: "up" | "down") {
  await requireSuperAdmin("assessments.build");

  const question = await prisma.assessmentQuestion.findUnique({ where: { id: questionId } });
  if (!question) return;

  const siblings = await prisma.assessmentQuestion.findMany({
    where: { assessmentId: question.assessmentId, sectionName: question.sectionName },
    orderBy: { order: "asc" },
  });
  const index = siblings.findIndex((s) => s.id === questionId);
  const swapWith = direction === "up" ? siblings[index - 1] : siblings[index + 1];
  if (!swapWith) return;

  await prisma.$transaction([
    prisma.assessmentQuestion.update({ where: { id: question.id }, data: { order: swapWith.order } }),
    prisma.assessmentQuestion.update({ where: { id: swapWith.id }, data: { order: question.order } }),
  ]);
  revalidatePath("/lms/company/assessments");
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

const CAMERA_POSITIONS = ["TOP_CENTER", "TOP_LEFT", "TOP_RIGHT", "BOTTOM_LEFT", "BOTTOM_RIGHT"] as const;

/** Recorded during the pre-exam system check, purely as context for an admin
 * reviewing a flagged snapshot later — the AI proctor's own gaze check is
 * calibrated per-student from a short look-at-your-screen sample, so it doesn't
 * actually depend on this being accurate. */
export async function setCameraPosition(assignmentId: string, position: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can do this.");
  }
  if (!(CAMERA_POSITIONS as readonly string[]).includes(position)) {
    throw new Error("Invalid camera position.");
  }
  const assignment = await prisma.assessmentAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.studentId !== session.user.id) {
    throw new Error("Not your assessment.");
  }
  await prisma.assessmentAssignment.update({ where: { id: assignmentId }, data: { cameraPosition: position } });
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
    let isCorrect: boolean;
    if (question.answerType === "MULTIPLE") {
      const selected = value.split(",").filter(Boolean).sort().join(",");
      const correct = (question.correctOptions ?? "").split(",").filter(Boolean).sort().join(",");
      isCorrect = selected !== "" && selected === correct;
    } else if (question.answerType === "NUMERIC") {
      const given = Number.parseFloat(value);
      const target = Number.parseFloat(question.numericAnswer ?? "");
      const tolerance = Number.parseFloat(question.numericTolerance ?? "0") || 0;
      isCorrect = !Number.isNaN(given) && !Number.isNaN(target) && Math.abs(given - target) <= tolerance;
    } else {
      isCorrect = value === question.correctOption;
    }
    const attempted = value.trim() !== "";
    const negativeMarks = question.negativeMarks ?? 0;
    const marksAwarded = isCorrect ? question.marks : attempted && negativeMarks > 0 ? -negativeMarks : 0;

    await prisma.assessmentAnswer.upsert({
      where: { assignmentId_questionId: { assignmentId, questionId } },
      create: {
        assignmentId,
        questionId,
        selectedOption: value,
        isCorrect,
        marksAwarded,
      },
      update: { selectedOption: value, isCorrect, marksAwarded },
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

export type TestVerdict = "passed" | "wrong_answer" | "compile_error" | "runtime_error" | "time_limit_exceeded";

export type RunCodeState = {
  ok: boolean;
  error?: string;
  results?: { input: string; expectedOutput: string; actualOutput: string; passed: boolean; verdict: TestVerdict }[];
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
        const passed = !result.compileError && !result.timedOut && outputsMatch(result.stdout, tc.expectedOutput);
        const actualOutput = result.timedOut
          ? `Time limit exceeded (${question.timeLimitSeconds ?? 8}s).`
          : result.compileError
            ? `Compile error:\n${result.compileError}`
            : result.stdout || result.stderr;
        const verdict: TestVerdict = result.compileError
          ? "compile_error"
          : result.timedOut
            ? "time_limit_exceeded"
            : passed
              ? "passed"
              : !result.stdout && result.stderr
                ? "runtime_error"
                : "wrong_answer";
        return { input: tc.input, expectedOutput: tc.expectedOutput, actualOutput, passed, verdict };
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
  submittedAt?: string;
  submissionNumber?: number;
  // Per-test breakdown for the result list — hidden tests carry only a label and
  // verdict, never their input/expected output, so the client can show "Hidden
  // test 3 — Wrong Answer" without ever learning what was actually in it.
  tests?: { label: string; isHidden: boolean; verdict: TestVerdict }[];
  // Set only when the whole submission failed to compile — matches Run's
  // compile-error banner. A compile error never scores and never uses up a
  // limited submission attempt.
  compileErrorDetail?: string;
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

  if (question.submissionsMode === "LIMITED" && question.submissionsLimit) {
    const existingAnswer = await prisma.assessmentAnswer.findUnique({
      where: { assignmentId_questionId: { assignmentId, questionId } },
    });
    if (existingAnswer && existingAnswer.submissionCount >= question.submissionsLimit) {
      return { ok: false, error: `You've used all ${question.submissionsLimit} submission attempts for this question.` };
    }
  }

  const { runCode, outputsMatch } = await import("@/lib/piston");
  const runTimeoutMs = question.timeLimitSeconds ? question.timeLimitSeconds * 1000 : undefined;
  let passed = 0;
  let compileErrorDetail: string | null = null;
  const tests: { label: string; isHidden: boolean; verdict: TestVerdict; weight: number }[] = [];
  try {
    let visibleIndex = 0;
    let hiddenIndex = 0;
    for (const tc of question.testCases) {
      const result = await runCode(language as "python" | "java" | "c" | "cpp", code, tc.input, runTimeoutMs);
      const testPassed = !result.compileError && !result.timedOut && outputsMatch(result.stdout, tc.expectedOutput);
      if (testPassed) passed += 1;
      if (result.compileError && !compileErrorDetail) compileErrorDetail = result.compileError;
      const verdict: TestVerdict = result.compileError
        ? "compile_error"
        : result.timedOut
          ? "time_limit_exceeded"
          : testPassed
            ? "passed"
            : !result.stdout && result.stderr
              ? "runtime_error"
              : "wrong_answer";
      if (tc.isHidden) {
        hiddenIndex += 1;
        tests.push({ label: `Hidden test ${hiddenIndex}`, isHidden: true, verdict, weight: tc.weight ?? 0 });
      } else {
        visibleIndex += 1;
        tests.push({ label: `Test ${visibleIndex}`, isHidden: false, verdict, weight: tc.weight ?? 0 });
      }
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't run the code." };
  }

  // A compile error never scores and never consumes a limited submission
  // attempt — same rule as Run. Leave any previously stored score untouched.
  if (compileErrorDetail) {
    return {
      ok: false,
      error: "Compilation failed — this submission wasn't scored and didn't use a submission attempt.",
      compileErrorDetail,
      tests: tests.map(({ label, isHidden, verdict }) => ({ label, isHidden, verdict })),
    };
  }

  const total = question.testCases.length;
  const totalWeight = question.testCases.reduce((sum, tc) => sum + (tc.weight ?? 0), 0);
  let marksAwarded: number;
  if (question.scoringMode === "ALL_OR_NOTHING") {
    marksAwarded = passed === total ? question.marks : 0;
  } else if (totalWeight > 0) {
    const passedWeight = tests.reduce((sum, t) => sum + (t.verdict === "passed" ? t.weight : 0), 0);
    marksAwarded = Math.round((passedWeight / totalWeight) * question.marks);
  } else {
    marksAwarded = Math.round((passed / total) * question.marks);
  }

  const existingAnswer = await prisma.assessmentAnswer.findUnique({
    where: { assignmentId_questionId: { assignmentId, questionId } },
  });
  // "Best counts" skips overwriting a strictly better earlier attempt, but
  // still counts this one toward the submission limit (if any).
  const keepExisting =
    question.submissionsMode === "UNLIMITED_BEST" &&
    existingAnswer &&
    (existingAnswer.marksAwarded ?? 0) > marksAwarded;

  const submissionNumber = (existingAnswer?.submissionCount ?? 0) + 1;
  const publicTests = tests.map(({ label, isHidden, verdict }) => ({ label, isHidden, verdict }));

  if (keepExisting) {
    await prisma.assessmentAnswer.update({
      where: { id: existingAnswer.id },
      data: { submissionCount: { increment: 1 } },
    });
    return {
      ok: true,
      testCasesPassed: existingAnswer.testCasesPassed ?? passed,
      testCasesTotal: existingAnswer.testCasesTotal ?? total,
      marksAwarded: existingAnswer.marksAwarded ?? marksAwarded,
      submittedAt: new Date().toISOString(),
      submissionNumber,
      tests: publicTests,
    };
  }

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
      submissionCount: 1,
    },
    update: {
      codeSubmission: code,
      codeLanguage: language,
      testCasesPassed: passed,
      testCasesTotal: total,
      marksAwarded,
      isCorrect: passed === total,
      submissionCount: { increment: 1 },
    },
  });

  return {
    ok: true,
    testCasesPassed: passed,
    testCasesTotal: total,
    marksAwarded,
    submittedAt: new Date().toISOString(),
    submissionNumber,
    tests: publicTests,
  };
}

/** Admin-only: the "RUN SNIPPET TO VERIFY ANSWER" button on Screen 3 (Add
 * Technical Question) — runs a read-only code snippet once with no stdin and
 * reports its output, so the admin can check it against the marked answer
 * before saving. Never touches test cases or student data. */
export async function runSnippetCheck(language: string, code: string) {
  await requireSuperAdmin("assessments.build");
  if (!["python", "java", "c", "cpp"].includes(language)) {
    return { ok: false as const, error: "Unsupported language." };
  }
  const { runCode } = await import("@/lib/piston");
  try {
    const result = await runCode(language as "python" | "java" | "c" | "cpp", code, "");
    if (result.compileError) return { ok: false as const, error: `Compilation error:\n${result.compileError}` };
    if (result.timedOut) return { ok: false as const, error: "Timed out." };
    return { ok: true as const, output: result.stdout || result.stderr || "(no output)" };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Couldn't run the snippet." };
  }
}

/** "Generate expected output from reference solution" — runs the reference
 * solution against one test case's input so the admin can fill (or refill)
 * its expected output without typing it by hand. */
export async function runReferenceAgainstInput(language: string, code: string, stdin: string) {
  await requireSuperAdmin("assessments.build");
  if (!["python", "java", "c", "cpp"].includes(language)) {
    return { ok: false as const, error: "Unsupported language." };
  }
  const { runCode } = await import("@/lib/piston");
  try {
    const result = await runCode(language as "python" | "java" | "c" | "cpp", code, stdin);
    if (result.compileError) return { ok: false as const, error: `Compilation error:\n${result.compileError}` };
    if (result.timedOut) return { ok: false as const, error: "Timed out." };
    return { ok: true as const, output: result.stdout };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Couldn't run the reference solution." };
  }
}

export type ValidationCheck = { label: string; passed: boolean; detail: string };
export type ValidationResult = { ok: boolean; error?: string; checks?: ValidationCheck[]; allPassed?: boolean };

/** The "Validate & Run Rules" panel on Screen 4 — runs the 4 automated checks
 * against the real execution service and marks the question VALIDATED (or
 * DRAFT) based on the result. */
export async function validateCodingQuestion(questionId: string): Promise<ValidationResult> {
  await requireSuperAdmin("assessments.build");

  const question = await prisma.assessmentQuestion.findUnique({
    where: { id: questionId },
    include: { testCases: { orderBy: { order: "asc" } } },
  });
  if (!question || question.questionType !== "CODING") return { ok: false, error: "Question not found." };
  if (question.testCases.length === 0) return { ok: false, error: "Add at least one test case first." };
  if (!question.referenceSolution || !question.referenceSolutionLanguage) {
    return { ok: false, error: "Add a reference solution first." };
  }

  const { runCode, outputsMatch } = await import("@/lib/piston");
  const lang = question.referenceSolutionLanguage as "python" | "java" | "c" | "cpp";
  const runTimeoutMs = question.timeLimitSeconds ? question.timeLimitSeconds * 1000 : undefined;
  const checks: ValidationCheck[] = [];

  // Check 1: reference solution passes every test case.
  let refPassed = 0;
  let anyTimedOut = false;
  for (const tc of question.testCases) {
    const result = await runCode(lang, question.referenceSolution, tc.input, runTimeoutMs);
    if (result.timedOut) anyTimedOut = true;
    if (!result.compileError && !result.timedOut && outputsMatch(result.stdout, tc.expectedOutput)) refPassed += 1;
  }
  checks.push({
    label: "Reference solution passes all tests",
    passed: refPassed === question.testCases.length,
    detail: `${refPassed} / ${question.testCases.length}`,
  });

  // Check 2: boilerplate compiles (as-is) in every enabled language.
  const starterMap = JSON.parse(question.starterCode || "{}") as Record<string, string>;
  const rangesMap = JSON.parse(question.editableRanges || "{}") as Record<string, { enabled: boolean; range: string }>;
  const enabledLanguages = (["python", "java", "c", "cpp"] as const).filter((l) => rangesMap[l]?.enabled !== false);
  let compiledCount = 0;
  for (const l of enabledLanguages) {
    const code = starterMap[l];
    if (!code || !code.trim()) continue;
    const sample = question.testCases[0];
    const result = await runCode(l, code, sample.input, runTimeoutMs);
    if (!result.compileError) compiledCount += 1;
  }
  checks.push({
    label: "Boilerplate compiles in every enabled language",
    passed: compiledCount === enabledLanguages.length,
    detail: `${compiledCount} / ${enabledLanguages.length}`,
  });

  // Check 3: the unedited starter code isn't itself a free-marks solution.
  let starterPassedAll = false;
  const firstLangWithCode = enabledLanguages.find((l) => starterMap[l]?.trim());
  if (firstLangWithCode) {
    let starterPassed = 0;
    for (const tc of question.testCases) {
      const result = await runCode(firstLangWithCode, starterMap[firstLangWithCode], tc.input, runTimeoutMs);
      if (!result.compileError && !result.timedOut && outputsMatch(result.stdout, tc.expectedOutput)) starterPassed += 1;
    }
    starterPassedAll = starterPassed === question.testCases.length;
  }
  checks.push({
    label: "Empty boilerplate fails the tests (no free marks)",
    passed: !starterPassedAll,
    detail: starterPassedAll ? "Starter code already passes every test" : "Starter code doesn't pass on its own",
  });

  // Check 4: nothing timed out against the configured limit.
  checks.push({
    label: "Slowest test within time limit",
    passed: !anyTimedOut,
    detail: anyTimedOut
      ? `A test exceeded ${question.timeLimitSeconds ?? 8}s`
      : `All tests completed within ${question.timeLimitSeconds ?? 8}s`,
  });

  const allPassed = checks.every((c) => c.passed);
  await prisma.assessmentQuestion.update({
    where: { id: questionId },
    data: { status: allPassed ? "VALIDATED" : "DRAFT" },
  });
  revalidatePath("/lms/company/assessments");

  return { ok: true, checks, allPassed };
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
    requiredKey: "assessments.submissions.view",
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
  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: { assessment: { select: { tabSwitchLimit: true } } },
  });
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

  const limit = assignment.assessment.tabSwitchLimit || VIOLATION_LIMIT;
  if (updated.violationCount >= limit) {
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
  await requireSuperAdmin("assessments.submissions.grade");

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
  await requireSuperAdmin("assessments.submissions.send");
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
  await requireSuperAdmin("assessments.submissions.send");
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
  await requireSuperAdmin("assessments.submissions.send");

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
  await requireSuperAdmin("assessments.submissions.send");
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
