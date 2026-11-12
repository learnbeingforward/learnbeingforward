import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GradeWrittenAnswerForm } from "@/components/lms/GradeWrittenAnswerForm";
import { AssessmentSnapshotGallery } from "@/components/lms/AssessmentSnapshotGallery";
import { sendResultToCollege, sendResultToStudent } from "@/lib/actions/assessments";
import { writtenAnswerBadge } from "@/lib/assessment-ui";

const TYPE_LABELS: Record<string, string> = {
  APTITUDE: "Aptitude",
  TECHNICAL_APTITUDE: "Technical Aptitude",
  CODING: "Coding",
};

export default async function AssessmentSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string }>;
}) {
  const { navLinks } = await requireCompanyPageAccess("assessments.submissions");

  const { assignmentId } = await searchParams;

  if (assignmentId) {
    const assignment = await prisma.assessmentAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        student: { include: { college: true } },
        assessment: true,
        answers: { include: { question: true } },
        snapshots: { orderBy: { capturedAt: "asc" } },
      },
    });

    if (!assignment) {
      return (
        <DashboardShell title="Submission" subtitle="Not found" navLinks={navLinks}>
          <BackLink href="/lms/company/assessments/submissions" label="Back to Submissions" />
          <p className="text-sm text-muted-foreground">This submission no longer exists.</p>
        </DashboardShell>
      );
    }

    const sortedAnswers = [...assignment.answers].sort((a, b) => a.question.order - b.question.order);

    return (
      <DashboardShell title={assignment.student.name} subtitle="Assessment submission" navLinks={navLinks}>
        <BackLink href="/lms/company/assessments/submissions" label="Back to Submissions" />

        <div className="mb-6 rounded-xl border border-border bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-indigo">{assignment.assessment.title}</p>
              <p className="text-sm text-muted-foreground">
                {TYPE_LABELS[assignment.assessment.type]} &middot; {assignment.student.name} &middot;{" "}
                {assignment.student.college?.name ?? "—"}
              </p>
            </div>
            <Badge className="bg-indigo/10 text-lg text-indigo hover:bg-indigo/10">
              {assignment.totalMarks ?? 0} / {assignment.maxMarks ?? 0}
            </Badge>
          </div>
          {assignment.autoSubmitted && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              Auto-submitted after proctoring violations — {assignment.violationCount} screen/tab violation(s),{" "}
              {assignment.audioViolationCount} audio violation(s).
            </p>
          )}
          {assignment.needsGrading && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Written answers below still need marks assigned — total will update as you grade them.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <form
              action={async (formData: FormData) => {
                "use server";
                await sendResultToCollege(assignmentId, formData);
              }}
            >
              <Button type="submit" size="sm" variant="outline" className="border-border text-indigo">
                {assignment.sentToCollegeAt ? "Re-send to College" : "Send to College"}
              </Button>
            </form>
            <form
              action={async (formData: FormData) => {
                "use server";
                await sendResultToStudent(assignmentId, formData);
              }}
            >
              <Button type="submit" size="sm" variant="outline" className="border-border text-indigo">
                {assignment.sentToStudentAt ? "Re-send to Student" : "Send to Student"}
              </Button>
            </form>
          </div>
        </div>

        {assignment.assessment.proctoringEnabled && (
          <div className="mb-6">
            <AssessmentSnapshotGallery
              assignmentId={assignmentId}
              snapshots={assignment.snapshots.map((s) => ({
                id: s.id,
                imageUrl: s.imageUrl,
                capturedAt: s.capturedAt.toISOString(),
                sharedWithStudent: s.sharedWithStudent,
                sharedWithCollege: s.sharedWithCollege,
              }))}
            />
          </div>
        )}

        <div className="space-y-3">
          {sortedAnswers.map((ans, i) => (
            <div key={ans.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-indigo">
                  Q{i + 1}. {ans.question.questionText}
                </p>
                {ans.question.questionType === "MCQ" ? (
                  <Badge
                    className={
                      ans.isCorrect
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"
                    }
                  >
                    {ans.isCorrect ? "Correct" : "Wrong"} &middot; {ans.marksAwarded ?? 0}/{ans.question.marks}
                  </Badge>
                ) : (
                  <Badge className={writtenAnswerBadge(ans.marksAwarded, ans.question.marks).className}>
                    {writtenAnswerBadge(ans.marksAwarded, ans.question.marks).label}
                  </Badge>
                )}
              </div>
              {ans.question.questionType === "MCQ" ? (
                <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  {(["A", "B", "C", "D"] as const).map((letter) => {
                    const text = ans.question[`option${letter}` as "optionA"];
                    const isSelected = ans.selectedOption === letter;
                    const isCorrectOption = ans.question.correctOption === letter;
                    return (
                      <p
                        key={letter}
                        className={`whitespace-pre-wrap ${
                          isCorrectOption
                            ? "font-medium text-green-700"
                            : isSelected
                              ? "font-medium text-red-700"
                              : ""
                        }`}
                      >
                        {letter}. {text} {isSelected && "(selected)"} {isCorrectOption && "(correct)"}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="rounded-lg bg-cream p-3 text-sm text-indigo">
                    {ans.writtenAnswer || <span className="text-muted-foreground">No answer given.</span>}
                  </p>
                  <GradeWrittenAnswerForm answerId={ans.id} maxMarks={ans.question.marks} currentMarks={ans.marksAwarded} />
                </div>
              )}
            </div>
          ))}
        </div>
      </DashboardShell>
    );
  }

  const assignments = await prisma.assessmentAssignment.findMany({
    where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
    include: { student: { include: { college: true } }, assessment: true },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <DashboardShell title="Assessment Submissions" subtitle="Students who have completed an assessment" navLinks={navLinks}>
      <BackLink href="/lms/company/assessments" label="Back to Assessments" />
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">College</th>
              <th className="p-3">Assessment</th>
              <th className="p-3">Marks</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {assignments.map((a) => (
              <tr key={a.id}>
                <td className="p-3">
                  <Link
                    href={`/lms/company/assessments/submissions?assignmentId=${a.id}`}
                    className="font-medium text-indigo underline underline-offset-2"
                  >
                    {a.student.name}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">{a.student.college?.name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">
                  {a.assessment.title} <span className="text-xs">({TYPE_LABELS[a.assessment.type]})</span>
                </td>
                <td className="p-3 text-muted-foreground">
                  {a.totalMarks ?? 0} / {a.maxMarks ?? 0}
                </td>
                <td className="p-3">
                  {a.needsGrading ? (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Needs Grading</Badge>
                  ) : a.autoSubmitted ? (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Auto-Submitted</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Graded</Badge>
                  )}
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
