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
      assessment: { include: { questions: { orderBy: { order: "asc" } } } },
      answers: true,
    },
  });

  if (!assignment || assignment.studentId !== studentId) {
    notFound();
  }

  if (assignment.status === "SUBMITTED" || assignment.status === "AUTO_SUBMITTED") {
    redirect("/lms/student/assessments");
  }

  const answersByQuestion = new Map(assignment.answers.map((a) => [a.questionId, a]));

  const questions = assignment.assessment.questions.map((q) => ({
    id: q.id,
    questionType: q.questionType,
    questionText: q.questionText,
    marks: q.marks,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    savedAnswer:
      q.questionType === "MCQ"
        ? (answersByQuestion.get(q.id)?.selectedOption ?? null)
        : (answersByQuestion.get(q.id)?.writtenAnswer ?? null),
  }));

  return (
    <TakeAssessmentClient
      assignmentId={assignmentId}
      assessmentTitle={assignment.assessment.title}
      questions={questions}
      initialViolationCount={assignment.violationCount}
    />
  );
}
