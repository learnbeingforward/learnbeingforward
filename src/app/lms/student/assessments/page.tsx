import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { STUDENT_NAV } from "@/components/lbf/nav-config";
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

  const student = await prisma.user.findUnique({ where: { id: studentId }, select: { name: true, college: { select: { name: true } } } });
  const shellUser = { name: student?.name ?? "Student", subtitle: student?.college?.name ?? "Student" };

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
        <AppShell nav={STUDENT_NAV} active="assessments" user={shellUser} crumb="Assessments" title="Assessment Result" subtitle="Not available">
          <BackLink href="/lms/student/assessments" label="Back to Assessments" />
          <p className="muted">This result isn&apos;t available.</p>
        </AppShell>
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
        sectionName: q.sectionName,
        snippetLanguage: q.snippetLanguage,
        snippetCode: q.snippetCode,
        answerType: q.answerType,
        correctOptions: q.correctOptions,
        numericAnswer: q.numericAnswer,
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
      <AppShell nav={STUDENT_NAV} active="assessments" user={shellUser} crumb="Assessments" title={assignment.assessment.title} subtitle="Your result">
        <BackLink href="/lms/student/assessments" label="Back to Assessments" />
        <section className="card" style={{ textAlign: "center" }}>
          <p className="small muted">{TYPE_LABELS[assignment.assessment.type]}</p>
          <p className="h1" style={{ marginTop: 4 }}>
            {assignment.totalMarks ?? 0} / {assignment.maxMarks ?? 0}
          </p>
        </section>
        {assignment.snapshots.length > 0 && (
          <section className="card">
            <SharedSnapshotGallery
              snapshots={assignment.snapshots.map((s) => ({
                id: s.id,
                imageUrl: s.imageUrl,
                capturedAt: s.capturedAt.toISOString(),
              }))}
            />
          </section>
        )}

        <AssessmentAnswerReview answers={reviewAnswers} />
      </AppShell>
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
    <AppShell nav={STUDENT_NAV} active="assessments" user={shellUser} crumb="Assessments" title="Assessments" subtitle="Assigned to you">
      {assignments.length === 0 ? (
        <div className="empty">No assessments assigned yet.</div>
      ) : (
        <>
          {toTake.length > 0 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 18 }}>To Take</h2>
              <ul className="list">
                {toTake.map((a) => {
                  const now = new Date();
                  const notOpenYet = a.assessment.availableFrom && now < a.assessment.availableFrom;
                  const windowClosed = a.assessment.availableUntil && now > a.assessment.availableUntil;
                  return (
                    <li key={a.id} className="list-row">
                      <div className="grow">
                        <div className="strong">{a.assessment.title}</div>
                        <div className="small muted">
                          {TYPE_LABELS[a.assessment.type]} · {a.assessment.questions.length} question{a.assessment.questions.length !== 1 ? "s" : ""}
                        </div>
                        {a.assessment.availableFrom && a.assessment.availableUntil && (
                          <div className="small muted" style={{ marginTop: 2 }}>
                            {notOpenYet
                              ? `Opens ${format(a.assessment.availableFrom, "MMM d, h:mm a")}`
                              : windowClosed
                                ? "Window closed — can no longer be taken"
                                : `Open until ${format(a.assessment.availableUntil, "MMM d, h:mm a")}`}
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/lms/student/assessments/${a.id}/take`}
                        className={`btn btn-primary btn-sm ${notOpenYet || windowClosed ? "disabled" : ""}`}
                        aria-disabled={!!notOpenYet || !!windowClosed}
                        style={notOpenYet || windowClosed ? { pointerEvents: "none", opacity: 0.5 } : undefined}
                      >
                        {a.status === "IN_PROGRESS" ? "Resume" : "Start"} Assessment
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="small muted" style={{ marginTop: 12 }}>
                Once started, the assessment opens full-screen. Switching tabs or leaving full-screen counts as a violation — after 3, it is submitted automatically.
              </p>
            </section>
          )}

          {completed.length > 0 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 18 }}>Completed</h2>
              <ul className="list">
                {completed.map((a) => (
                  <li key={a.id} className="list-row">
                    <div className="grow">
                      <div className="strong">{a.assessment.title}</div>
                      <div className="small muted">
                        {TYPE_LABELS[a.assessment.type]}
                        {a.autoSubmitted && " · Auto-submitted (proctoring violations)"}
                      </div>
                    </div>
                    {a.sentToStudentAt ? (
                      <Link href={`/lms/student/assessments?assignmentId=${a.id}`} className="pill info">
                        {a.totalMarks ?? 0} / {a.maxMarks ?? 0} marks — View details
                      </Link>
                    ) : (
                      <span className="pill warning">Awaiting results</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}
