import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/lms/BackLink";
import { SharedSnapshotGallery } from "@/components/lms/SharedSnapshotGallery";
import { writtenAnswerBadge } from "@/lib/assessment-ui";

const TYPE_LABELS: Record<string, string> = {
  APTITUDE: "Aptitude",
  TECHNICAL_APTITUDE: "Technical Aptitude",
  CODING: "Coding",
};

export default async function CollegeAssessmentDataPage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string }>;
}) {
  const session = await auth();
  const collegeId = session!.user.collegeId;
  const { assignmentId } = await searchParams;

  if (assignmentId) {
    const assignment = await prisma.assessmentAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        student: true,
        assessment: true,
        answers: { include: { question: true } },
        snapshots: { where: { sharedWithCollege: true }, orderBy: { capturedAt: "asc" } },
      },
    });

    if (!assignment || !collegeId || assignment.student.collegeId !== collegeId || !assignment.sentToCollegeAt) {
      return (
        <DashboardShell title="Assessment Result" subtitle="Not available" navLinks={navLinks}>
          <BackLink href="/lms/college/assessment-data" label="Back to Assessment Data" />
          <p className="text-sm text-muted-foreground">This result isn&apos;t available.</p>
        </DashboardShell>
      );
    }

    const sortedAnswers = [...assignment.answers].sort((a, b) => a.question.order - b.question.order);

    return (
      <DashboardShell title={assignment.student.name} subtitle="Assessment result" navLinks={navLinks}>
        <BackLink href="/lms/college/assessment-data" label="Back to Assessment Data" />

        <div className="mb-6 rounded-xl border border-border bg-white p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {assignment.assessment.title} &middot; {TYPE_LABELS[assignment.assessment.type]}
          </p>
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
                        className={
                          isCorrectOption
                            ? "font-medium text-green-700"
                            : isSelected
                              ? "font-medium text-red-700"
                              : ""
                        }
                      >
                        {letter}. {text} {isSelected && "(your answer)"} {isCorrectOption && "(correct)"}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 rounded-lg bg-cream p-3 text-sm text-indigo">
                  {ans.writtenAnswer || <span className="text-muted-foreground">No answer given.</span>}
                </p>
              )}
            </div>
          ))}
        </div>
      </DashboardShell>
    );
  }

  const assignments = collegeId
    ? await prisma.assessmentAssignment.findMany({
        where: { student: { collegeId }, sentToCollegeAt: { not: null } },
        include: { student: true, assessment: true },
        orderBy: { sentToCollegeAt: "desc" },
      })
    : [];

  return (
    <DashboardShell title="Assessment Data" subtitle="Results shared by Learn Being Forward" navLinks={navLinks}>
      {assignments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No assessment results have been shared with your college yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Assessment</th>
                <th className="p-3">Type</th>
                <th className="p-3">Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-cream/50">
                  <td className="p-0">
                    <Link
                      href={`/lms/college/assessment-data?assignmentId=${a.id}`}
                      className="block p-3 font-medium text-indigo hover:underline"
                    >
                      {a.student.name}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">{a.assessment.title}</td>
                  <td className="p-3 text-muted-foreground">{TYPE_LABELS[a.assessment.type]}</td>
                  <td className="p-3">
                    <Link href={`/lms/college/assessment-data?assignmentId=${a.id}`}>
                      <Badge className="bg-indigo/10 text-indigo hover:bg-indigo/20">
                        {a.totalMarks ?? 0} / {a.maxMarks ?? 0} — View details
                      </Badge>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
