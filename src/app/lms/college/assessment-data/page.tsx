import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
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
  const college = await prisma.college.findUnique({ where: { id: collegeId! }, select: { name: true } });
  const shellUser = { name: college?.name ?? "College", subtitle: "College admin" };
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
        <AppShell nav={COLLEGE_NAV} active="assessment-data" user={shellUser} crumb="Assessment Data" title="Assessment Result" subtitle="Not available">
          <BackLink href="/lms/college/assessment-data" label="Back to Assessment Data" />
          <p className="muted">This result isn&apos;t available.</p>
        </AppShell>
      );
    }

    const sortedAnswers = [...assignment.answers].sort((a, b) => a.question.order - b.question.order);

    return (
      <AppShell nav={COLLEGE_NAV} active="assessment-data" user={shellUser} crumb="Assessment Data" title={assignment.student.name} subtitle="Assessment result">
        <BackLink href="/lms/college/assessment-data" label="Back to Assessment Data" />

        <section className="card" style={{ textAlign: "center" }}>
          <p className="muted">
            {assignment.assessment.title} · {TYPE_LABELS[assignment.assessment.type]}
          </p>
          <p className="title" style={{ marginTop: 6, fontSize: 32 }}>
            {assignment.totalMarks ?? 0} / {assignment.maxMarks ?? 0}
          </p>
        </section>

        {assignment.snapshots.length > 0 && (
          <SharedSnapshotGallery snapshots={assignment.snapshots.map((s) => ({ id: s.id, imageUrl: s.imageUrl, capturedAt: s.capturedAt.toISOString() }))} />
        )}

        <div className="stack" style={{ gap: 12 }}>
          {sortedAnswers.map((ans, i) => (
            <section key={ans.id} className="card">
              <div className="split">
                <p className="strong">
                  Q{i + 1}. {ans.question.questionText}
                </p>
                {ans.question.questionType === "MCQ" ? (
                  <span className={`pill ${ans.isCorrect ? "success" : "danger"}`}>
                    {ans.isCorrect ? "Correct" : "Wrong"} · {ans.marksAwarded ?? 0}/{ans.question.marks}
                  </span>
                ) : (
                  <span className={`pill ${writtenAnswerBadge(ans.marksAwarded, ans.question.marks).className.includes("green") ? "success" : "warning"}`}>
                    {writtenAnswerBadge(ans.marksAwarded, ans.question.marks).label}
                  </span>
                )}
              </div>
              {ans.question.questionType === "MCQ" ? (
                <div className="grid" style={{ ["--min" as string]: "220px", marginTop: 10, fontSize: 13 }}>
                  {(["A", "B", "C", "D"] as const).map((letter) => {
                    const text = ans.question[`option${letter}` as "optionA"];
                    const isSelected = ans.selectedOption === letter;
                    const isCorrectOption = ans.question.correctOption === letter;
                    return (
                      <p key={letter} style={{ color: isCorrectOption ? "var(--success-text)" : isSelected ? "var(--danger)" : "var(--muted)" }}>
                        {letter}. {text} {isSelected && "(your answer)"} {isCorrectOption && "(correct)"}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="muted" style={{ marginTop: 10, background: "var(--surface)", borderRadius: 8, padding: 12 }}>
                  {ans.writtenAnswer || "No answer given."}
                </p>
              )}
            </section>
          ))}
        </div>
      </AppShell>
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
    <AppShell nav={COLLEGE_NAV} active="assessment-data" user={shellUser} crumb="Assessment Data" title="Assessment data" subtitle="Results shared with you by Learn Being Forward.">
      <section className="card">
        {assignments.length === 0 ? (
          <div className="empty">No assessment results have been shared with your college yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assessment</th>
                  <th>Type</th>
                  <th>Marks</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="strong">
                      <Link href={`/lms/college/assessment-data?assignmentId=${a.id}`}>{a.student.name}</Link>
                    </td>
                    <td>{a.assessment.title}</td>
                    <td>{TYPE_LABELS[a.assessment.type]}</td>
                    <td>
                      <Link href={`/lms/college/assessment-data?assignmentId=${a.id}`} className="pill info">
                        {a.totalMarks ?? 0} / {a.maxMarks ?? 0} — View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
