import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { STUDENT_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { BackLink } from "@/components/lms/BackLink";
import { DomainTabs } from "@/components/lbf/DomainTabs";
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
  const now = new Date();

  return (
    <AppShell nav={STUDENT_NAV} active="assessments" user={shellUser} crumb="Assigned to you" title="Assessments" subtitle="Tests your college or Learn Being Forward assigned.">
      <div className="alert warning">
        <Icon name="shield" size={18} className="shrink-0" />
        <span>
          Assessments open <strong>full-screen</strong>. Switching tabs or leaving full-screen counts as a violation — after <strong>3</strong>, it is submitted automatically.
        </span>
      </div>
      {assignments.length === 0 ? (
        <div className="empty">No assessments assigned yet.</div>
      ) : (
        <section className="card">
          <div className="split" style={{ marginBottom: 18 }}>
            <h2 className="h2">Your assessments</h2>
          </div>
          <DomainTabs
            tabs={[
              { key: "toTake", label: `To take (${toTake.length})` },
              { key: "completed", label: `Completed (${completed.length})` },
            ]}
            panels={{
              toTake: (
                <div className="grid" style={{ ["--min" as string]: "280px" }}>
                  {toTake.map((a) => {
                    const notOpenYet = a.assessment.availableFrom && now < a.assessment.availableFrom;
                    const windowClosed = a.assessment.availableUntil && now > a.assessment.availableUntil;
                    return (
                      <article key={a.id} className="box stack" style={{ gap: 10 }}>
                        <div className="split">
                          <span className="pill">{TYPE_LABELS[a.assessment.type]}</span>
                          <span className={`pill ${notOpenYet ? "info" : windowClosed ? "danger" : "success"}`}>
                            {notOpenYet ? "Opens soon" : windowClosed ? "Window closed" : "Open now"}
                          </span>
                        </div>
                        <h3 className="h3">{a.assessment.title}</h3>
                        <div className="small muted">
                          {a.assessment.questions.length} question{a.assessment.questions.length !== 1 ? "s" : ""} · {a.assessment.durationMinutes} min
                          {a.assessment.proctoringEnabled && " · Proctored"}
                        </div>
                        {a.assessment.availableFrom && a.assessment.availableUntil && (
                          <div className="small">
                            {notOpenYet
                              ? `Opens ${format(a.assessment.availableFrom, "MMM d, h:mm a")}`
                              : windowClosed
                                ? `${format(a.assessment.availableFrom, "MMM d, h:mm a")} – ${format(a.assessment.availableUntil, "MMM d, h:mm a")}`
                                : `Closes ${format(a.assessment.availableUntil, "MMM d, h:mm a")}`}
                          </div>
                        )}
                        {notOpenYet || windowClosed ? (
                          <button className="btn btn-sm" type="button" disabled>
                            {windowClosed ? "Can no longer be taken" : "Not open yet"}
                          </button>
                        ) : (
                          <Link href={`/lms/student/assessments/${a.id}/take`} className="btn btn-primary btn-sm">
                            <Icon name="play" size={16} />
                            {a.status === "IN_PROGRESS" ? "Resume assessment" : "Start assessment"}
                          </Link>
                        )}
                      </article>
                    );
                  })}
                  {toTake.length === 0 && <p className="empty">Nothing waiting on you right now.</p>}
                </div>
              ),
              completed: (
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
                  {completed.length === 0 && <p className="empty">Nothing completed yet.</p>}
                </ul>
              ),
            }}
          />
          <p className="small muted" style={{ marginTop: 12 }}>
            Start assessment leads to the System Check → Instructions → Exam screens in the Assessment Portal design set.
          </p>
        </section>
      )}
    </AppShell>
  );
}
