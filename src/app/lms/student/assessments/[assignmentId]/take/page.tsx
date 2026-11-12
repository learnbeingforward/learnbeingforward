import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TakeAssessmentClient } from "@/components/lms/TakeAssessmentClient";

export default async function TakeAssessmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const session = await auth();
  const studentId = session!.user.id;

  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      assessment: {
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { testCases: { where: { isHidden: false }, orderBy: { order: "asc" } } },
          },
        },
      },
      answers: true,
    },
  });

  if (!assignment || assignment.studentId !== studentId) {
    notFound();
  }

  // Submitting the assessment calls a server action from this same page, which
  // flips the status to SUBMITTED/AUTO_SUBMITTED and — since Server Actions
  // re-render the current route with fresh data — would otherwise redirect away
  // from here before the student ever sees their post-submission summary.
  // TakeAssessmentClient shows that summary itself instead, both right after
  // submitting and on any later re-visit of this URL.
  const alreadySubmitted = assignment.status === "SUBMITTED" || assignment.status === "AUTO_SUBMITTED";

  const now = new Date();
  const { availableFrom, availableUntil } = assignment.assessment;
  if (assignment.status === "ASSIGNED") {
    if ((availableFrom && now < availableFrom) || (availableUntil && now > availableUntil)) {
      redirect("/lms/student/assessments");
    }
  }

  const answersByQuestion = new Map(assignment.answers.map((a) => [a.questionId, a]));

  const questions = assignment.assessment.questions.map((q) => {
    const existing = answersByQuestion.get(q.id);
    return {
      id: q.id,
      questionType: q.questionType,
      questionText: q.questionText,
      marks: q.marks,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      savedAnswer:
        q.questionType === "MCQ" ? (existing?.selectedOption ?? null) : (existing?.writtenAnswer ?? null),
      starterCode: q.starterCode,
      visibleTestCases: q.testCases.map((tc) => ({ id: tc.id, input: tc.input, expectedOutput: tc.expectedOutput })),
      savedCode: existing?.codeSubmission ?? null,
      savedLanguage: existing?.codeLanguage ?? null,
      testCasesPassed: existing?.testCasesPassed ?? null,
      testCasesTotal: existing?.testCasesTotal ?? null,
    };
  });

  const hasCodingQuestions = questions.some((q) => q.questionType === "CODING");

  return (
    <TakeAssessmentClient
      assignmentId={assignmentId}
      assessmentTitle={assignment.assessment.title}
      questions={questions}
      initialViolationCount={assignment.violationCount}
      durationMinutes={assignment.assessment.durationMinutes}
      startedAt={assignment.startedAt?.toISOString() ?? null}
      availableUntil={assignment.assessment.availableUntil?.toISOString() ?? null}
      proctoringEnabled={assignment.assessment.proctoringEnabled}
      initialAudioViolationCount={assignment.audioViolationCount}
      hasCodingQuestions={hasCodingQuestions}
      initialMcqPhaseSubmitted={!!assignment.mcqPhaseSubmittedAt}
      alreadySubmitted={alreadySubmitted}
      wasAutoSubmitted={assignment.autoSubmitted}
    />
  );
}
