import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { studentNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/lms/BackLink";
import { SharedSnapshotGallery } from "@/components/lms/SharedSnapshotGallery";
import { AssessmentAnswerReview, type ReviewAnswer } from "@/components/lms/AssessmentAnswerReview";
import { format } from "date-fns";

const TYPE_LABELS: Record<string, string> = {
  APTITUDE: "Aptitude",
  TECHNICAL_APTITUDE: "Technical Aptitude",
  CODING: "Coding",
};

export default async function StudentAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string }>;
}) {
  const session = await auth();
  const studentId = session!.user.id;
  const { assignmentId } = await searchParams;

  if (assignmentId) {
    const assignment = await prisma.assessmentAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        assessment: { include: { questions: { orderBy: { order: "asc" } } } },
        answers: true,
        snapshots: { where: { sharedWithStudent: true }, orderBy: { capturedAt: "asc" } },
      },
    });

    if (!assignment || assignment.studentId !== studentId || !assignment.sentToStudentAt) {
      return (
        <DashboardShell title="Assessment Result" subtitle="Not available" navLinks={navLinks}>
          <BackLink href="/lms/student/assessments" label="Back to Assessments" />
          <p className="text-sm text-muted-foreground">This result isn&apos;t available.</p>
        </DashboardShell>
      );
    }

    const answersByQuestion = new Map(assignment.answers.map((a) => [a.questionId, a]));
    const reviewAnswers: ReviewAnswer[] = assignment.assessment.questions.map((q) => {
      const a = answersByQuestion.get(q.id);
      return {
        answerId: a?.id ?? null,
        questionId: q.id,
        questionType: q.questionType,
        questionText: q.questionText,
        marks: q.marks,
        marksAwarded: a?.marksAwarded ?? null,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        selectedOption: a?.selectedOption ?? null,
        writtenAnswer: a?.writtenAnswer ?? null,
        codeSubmission: a?.codeSubmission ?? null,
        codeLanguage: a?.codeLanguage ?? null,
        testCasesPassed: a?.testCasesPassed ?? null,
        testCasesTotal: a?.testCasesTotal ?? null,
      };
    });

    return (
      <DashboardShell title={assignment.assessment.title} subtitle="Your result" navLinks={navLinks}>
        <BackLink href="/lms/student/assessments" label="Back to Assessments" />
        <div className="mb-6 rounded-xl border border-border bg-white p-6 text-center">
          <p className="text-sm text-muted-foreground">{TYPE_LABELS[assignment.assessment.type]}</p>
          <p className="mt-1 text-3xl font-bold text-indigo">
            {assignment.totalMarks ?? 0} / {assignment.maxMarks ?? 0}
          </p>
        </div>
        {assignment.snapshots.length > 0 && (
          <div className="mb-6">
            <SharedSnapshotGallery
              snapshots={assignment.snapshots.map((s) => ({
                id: s.id,
                imageUrl: s.imageUrl,
                capturedAt: s.capturedAt.toISOString(),
              }))}
            />
          </div>
        )}

        <AssessmentAnswerReview answers={reviewAnswers} />
      </DashboardShell>
    );
  }

  const assignments = await prisma.assessmentAssignment.findMany({
    where: { studentId },
    include: { assessment: { include: { questions: true } } },
    orderBy: { assignedAt: "desc" },
  });

  const toTake = assignments.filter((a) => a.status === "ASSIGNED" || a.status === "IN_PROGRESS");
  const completed = assignments.filter((a) => a.status === "SUBMITTED" || a.status === "AUTO_SUBMITTED");

  return (
    <DashboardShell title="Assessments" subtitle="Assigned to you" navLinks={navLinks}>
      {assignments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No assessments assigned yet.
        </div>
      ) : (
        <div className="space-y-8">
          {toTake.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">To Take</h2>
              <div className="space-y-3">
                {toTake.map((a) => {
                  const now = new Date();
                  const notOpenYet = a.assessment.availableFrom && now < a.assessment.availableFrom;
                  const windowClosed = a.assessment.availableUntil && now > a.assessment.availableUntil;
                  return (
                    <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4">
                      <div>
                        <p className="font-medium text-indigo">{a.assessment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {TYPE_LABELS[a.assessment.type]} &middot; {a.assessment.questions.length} question
                          {a.assessment.questions.length !== 1 ? "s" : ""}
                        </p>
                        {a.assessment.availableFrom && a.assessment.availableUntil && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {notOpenYet
                              ? `Opens ${format(a.assessment.availableFrom, "MMM d, h:mm a")}`
                              : windowClosed
                                ? "Window closed — can no longer be taken"
                                : `Open until ${format(a.assessment.availableUntil, "MMM d, h:mm a")}`}
                          </p>
                        )}
                      </div>
                      <Button
                        render={<Link href={`/lms/student/assessments/${a.id}/take`} />}
                        nativeButton={false}
                        size="sm"
                        disabled={!!notOpenYet || !!windowClosed}
                        className="bg-indigo text-white hover:bg-indigo/90"
                      >
                        {a.status === "IN_PROGRESS" ? "Resume" : "Start"} Assessment
                      </Button>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Once started, the assessment opens full-screen. Switching tabs or leaving full-screen counts as a
                violation — after 3, it is submitted automatically.
              </p>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Completed</h2>
              <div className="space-y-3">
                {completed.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4">
                    <div>
                      <p className="font-medium text-indigo">{a.assessment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {TYPE_LABELS[a.assessment.type]}
                        {a.autoSubmitted && " · Auto-submitted (proctoring violations)"}
                      </p>
                    </div>
                    {a.sentToStudentAt ? (
                      <Link href={`/lms/student/assessments?assignmentId=${a.id}`}>
                        <Badge className="bg-indigo/10 text-indigo hover:bg-indigo/20">
                          {a.totalMarks ?? 0} / {a.maxMarks ?? 0} marks — View details
                        </Badge>
                      </Link>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Awaiting results</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
