import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { Button } from "@/components/ui/button";
import { AssessmentSnapshotGallery } from "@/components/lms/AssessmentSnapshotGallery";
import { AssessmentAnswerReview, type ReviewAnswer } from "@/components/lms/AssessmentAnswerReview";
import { sendResultToCollege, sendResultToStudent, allowAssessmentRetest } from "@/lib/actions/assessments";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

const TYPE_LABELS: Record<string, string> = {
  APTITUDE: "Aptitude",
  TECHNICAL_APTITUDE: "Technical Aptitude",
  CODING: "Coding",
};

const CAMERA_POSITION_LABELS: Record<string, string> = {
  TOP_CENTER: "Top center",
  TOP_LEFT: "Top left",
  TOP_RIGHT: "Top right",
  BOTTOM_LEFT: "Bottom left",
  BOTTOM_RIGHT: "Bottom right",
};

export default async function AssessmentSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string }>;
}) {
  const { session, keys, hasUnread } = await requireCompanyPageAccess([
    "assessments.submissions.view",
    "assessments.submissions.grade",
    "assessments.submissions.send",
  ]);
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const canGrade = keys.includes("assessments.submissions.grade");
  const canSend = keys.includes("assessments.submissions.send");

  const { assignmentId } = await searchParams;

  if (assignmentId) {
    const assignment = await prisma.assessmentAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        student: { include: { college: true } },
        assessment: { include: { questions: { orderBy: { order: "asc" } } } },
        answers: true,
        snapshots: { orderBy: { capturedAt: "asc" } },
      },
    });

    if (!assignment) {
      return (
        <AppShell nav={nav} active="submissions" user={shellUser} hasUnread={hasUnread} crumb="Assessments › Submissions" title="Submission" subtitle="Not found">
          <BackLink href="/lms/company/assessments/submissions" label="Back to Submissions" />
          <p className="muted">This submission no longer exists.</p>
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
      <AppShell nav={nav} active="submissions" user={shellUser} hasUnread={hasUnread} crumb="Assessments › Submissions" title={assignment.student.name} subtitle="Assessment submission">
        <BackLink href="/lms/company/assessments/submissions" label="Back to Submissions" />

        <section className="card">
          <div className="split" style={{ alignItems: "flex-start" }}>
            <div>
              <p className="h2">{assignment.assessment.title}</p>
              <p className="small muted" style={{ marginTop: 4 }}>
                {TYPE_LABELS[assignment.assessment.type]} · {assignment.student.name} · {assignment.student.college?.name ?? "—"}
              </p>
            </div>
            <span className="pill gold" style={{ fontSize: 16 }}>
              {assignment.totalMarks ?? 0} / {assignment.maxMarks ?? 0}
            </span>
          </div>
          {assignment.autoSubmitted && (
            <div className="alert danger" style={{ marginTop: 14 }}>
              <span>
                Auto-submitted after proctoring violations — {assignment.violationCount} screen/tab violation(s), {assignment.audioViolationCount} audio violation(s).
              </span>
            </div>
          )}
          {assignment.assessment.proctoringEnabled && assignment.snapshots.some((s) => s.flagReason) && (
            <div className="alert danger" style={{ marginTop: 14 }}>
              <span>
                ⚠ The in-browser AI proctor flagged {assignment.snapshots.filter((s) => s.flagReason).length} snapshot(s) during this attempt — see below. This does not auto-submit on its own.
              </span>
            </div>
          )}
          {assignment.cameraPosition && (
            <p className="small muted" style={{ marginTop: 10 }}>
              Student reported camera position: {CAMERA_POSITION_LABELS[assignment.cameraPosition] ?? assignment.cameraPosition}
            </p>
          )}
          {assignment.needsGrading && (
            <div className="alert warning" style={{ marginTop: 14 }}>
              <span>Written answers below still need marks assigned — total will update as you grade them.</span>
            </div>
          )}

          {canSend ? (
            <>
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
                <form action={allowAssessmentRetest.bind(null, assignmentId)}>
                  <Button type="submit" size="sm" variant="outline" className="border-amber-400 text-amber-700">
                    Allow Retest
                  </Button>
                </form>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                &quot;Allow Retest&quot; wipes this attempt (answers, violations, proctoring photos, marks) and puts it
                back to not-yet-started — use it if a student needs to redo the assessment from scratch.
              </p>
            </>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              You don&apos;t have permission to send results or allow a retest for this submission.
            </p>
          )}
        </section>

        {assignment.assessment.proctoringEnabled && (
          <section className="card">
            <AssessmentSnapshotGallery
              assignmentId={assignmentId}
              canManage={canSend}
              snapshots={assignment.snapshots.map((s) => ({
                id: s.id,
                imageUrl: s.imageUrl,
                capturedAt: s.capturedAt.toISOString(),
                sharedWithStudent: s.sharedWithStudent,
                sharedWithCollege: s.sharedWithCollege,
                flagReason: s.flagReason,
              }))}
            />
          </section>
        )}

        <AssessmentAnswerReview answers={reviewAnswers} editable={canGrade} />
      </AppShell>
    );
  }

  const assignments = await prisma.assessmentAssignment.findMany({
    where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
    include: { student: { include: { college: true } }, assessment: true, snapshots: true },
    orderBy: { submittedAt: "desc" },
  });

  const graded = assignments.filter((a) => !a.needsGrading && !a.autoSubmitted).length;
  const flagged = assignments.filter((a) => a.snapshots.some((s) => s.flagReason)).length;
  const scored = assignments.filter((a) => a.maxMarks && a.maxMarks > 0);
  const avgScore = scored.length > 0 ? Math.round(scored.reduce((sum, a) => sum + ((a.totalMarks ?? 0) / a.maxMarks!) * 100, 0) / scored.length) : 0;

  return (
    <AppShell
      nav={nav}
      active="submissions"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Assessments › Submissions"
      title="Submissions"
      subtitle="Scores, status and proctoring flags for every attempt."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/company/assessments">
          <Icon name="arrowL" size={16} />
          Back to Assessments
        </Link>
      }
    >
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "180px" }}>
          <div className="tile">
            <div className="label">Submissions</div>
            <div className="value">{assignments.length}</div>
          </div>
          <div className="tile">
            <div className="label">Average score</div>
            <div className="value">{avgScore}%</div>
          </div>
          <div className="tile success">
            <div className="label">Graded</div>
            <div className="value">{graded}</div>
          </div>
          <div className="tile warning">
            <div className="label">Flagged</div>
            <div className="value">{flagged}</div>
          </div>
        </div>
      </section>

      <section className="card">
        {assignments.length === 0 ? (
          <p className="empty">No submissions yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>College</th>
                  <th>Assessment</th>
                  <th>Marks</th>
                  <th>Proctoring</th>
                  <th>Status</th>
                  <th className="actions">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="stat-inline">
                        <span className="avatar sm">{a.student.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
                        <div>
                          <div className="strong">{a.student.name}</div>
                          <div className="small muted">{a.student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{a.student.college?.name ?? "—"}</td>
                    <td>
                      {a.assessment.title} <span className="pill" style={{ marginLeft: 4 }}>{TYPE_LABELS[a.assessment.type]}</span>
                    </td>
                    <td><strong>{a.totalMarks ?? 0}</strong> / {a.maxMarks ?? 0}</td>
                    <td>
                      {a.snapshots.some((s) => s.flagReason) ? <span className="pill danger">Flagged</span> : <span className="pill success">Clean</span>}
                    </td>
                    <td>
                      {a.needsGrading ? (
                        <span className="pill warning">Needs Grading</span>
                      ) : a.autoSubmitted ? (
                        <span className="pill danger">Auto-Submitted</span>
                      ) : (
                        <span className="pill success">Graded</span>
                      )}
                    </td>
                    <td className="actions">
                      <Link className="btn btn-sm" href={`/lms/company/assessments/submissions?assignmentId=${a.id}`}>
                        <Icon name="eye" size={14} />
                        View attempt
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
