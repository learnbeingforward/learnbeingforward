import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon, type IconName } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { Badge } from "@/components/ui/badge";
import { CreateAssessmentForm } from "@/components/lms/CreateAssessmentForm";
import { AssignAssessmentForm } from "@/components/lms/AssignAssessmentForm";
import { deleteAssessment, type SectionKind } from "@/lib/actions/assessments";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { CreateAssessmentWizard } from "@/components/lms/builder/CreateAssessmentWizard";
import { ReviewPublishScreen } from "@/components/lms/builder/ReviewPublishScreen";
import { McqQuestionBuilder } from "@/components/lms/builder/McqQuestionBuilder";
import { CodingQuestionBuilder } from "@/components/lms/builder/CodingQuestionBuilder";
import type { SectionInfo } from "@/components/lms/builder/SectionsAndQuestionsBlock";
import type { TableQuestion } from "@/components/lms/builder/QuestionTable";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

const TYPE_LABELS: Record<string, string> = {
  APTITUDE: "Aptitude Assessment",
  TECHNICAL_APTITUDE: "Technical Aptitude Assessment",
  CODING: "Coding Assessment",
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  APTITUDE: "General aptitude and reasoning tests.",
  TECHNICAL_APTITUDE: "Role-specific technical screening.",
  CODING: "Hands-on coding problems with a real compiler.",
};

const TYPE_ICON: Record<string, IconName> = {
  APTITUDE: "target",
  TECHNICAL_APTITUDE: "layers",
  CODING: "code",
};

const TYPES = ["APTITUDE", "TECHNICAL_APTITUDE", "CODING"] as const;
type AssessmentTypeValue = (typeof TYPES)[number];

function isAssessmentType(value: string | undefined): value is AssessmentTypeValue {
  return !!value && (TYPES as readonly string[]).includes(value);
}

function AssessmentBox({ assessment, sentHref }: { assessment: { id: string; title: string; questions: unknown[]; assignments: unknown[]; durationMinutes: number; proctoringEnabled: boolean; availableFrom: Date | null; availableUntil: Date | null }; sentHref: string }) {
  const a = assessment;
  return (
    <li className="box stack" style={{ gap: 8 }}>
      <div className="split">
        <Link className="strong" href={`/lms/company/assessments?assessmentId=${a.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          {a.title}
        </Link>
        {a.proctoringEnabled && <span className="pill info">Proctored</span>}
      </div>
      <div className="small muted">
        {a.questions.length} question{a.questions.length !== 1 ? "s" : ""} · {a.assignments.length} sent · {a.durationMinutes} min
      </div>
      {a.availableFrom && a.availableUntil && (
        <div className="small">
          {format(a.availableFrom, "MMM d, h:mm a")} – {format(a.availableUntil, "MMM d, h:mm a")}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link className="btn btn-sm" href={`/lms/company/assessments?assessmentId=${a.id}`}>
          <Icon name="edit" size={14} />
          Edit questions
        </Link>
        {a.questions.length > 0 && (
          <Link className="btn btn-primary btn-sm" href={sentHref}>
            {a.assignments.length > 0 ? "Results" : "Send to students"}
          </Link>
        )}
        <DeleteButton action={deleteAssessment.bind(null, a.id)} />
      </div>
    </li>
  );
}

export default async function CompanyAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    assessmentId?: string;
    mode?: string;
    category?: string;
    view?: string;
    step?: string;
    screen?: string;
    sectionName?: string;
    questionId?: string;
  }>;
}) {
  const { session, navLinks, keys, hasUnread } = await requireCompanyPageAccess("assessments.build");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const { assessmentId, mode, category, view, step, screen, sectionName, questionId } = await searchParams;

  if (assessmentId) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: { orderBy: { order: "asc" }, include: { testCases: true } },
        assignments: true,
      },
    });

    if (!assessment) {
      return (
        <AppShell nav={nav} active="assessments" user={shellUser} hasUnread={hasUnread} crumb="Assessments" title="Assessment" subtitle="Not found">
          <BackLink href="/lms/company/assessments" label="Back to Assessments" />
          <p className="muted">This assessment no longer exists.</p>
        </AppShell>
      );
    }

    const backHref = `/lms/company/assessments?assessmentId=${assessmentId}`;

    if (mode === "send") {
      const students = await prisma.user.findMany({
        where: { role: "STUDENT" },
        include: { college: true },
        orderBy: { name: "asc" },
      });
      const assignedIds = new Set(assessment.assignments.map((a) => a.studentId));
      const assignable = students
        .filter((s) => s.college)
        .map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          collegeName: s.college!.name,
          alreadyAssigned: assignedIds.has(s.id),
        }));

      return (
        <AppShell nav={nav} active="assessments" user={shellUser} hasUnread={hasUnread} crumb="Assessments" title={assessment.title} subtitle="Send to students">
          <BackLink href={backHref} label="Back to Assessment" />
          <section className="card">
            <AssignAssessmentForm assessmentId={assessmentId} students={assignable} />
          </section>
        </AppShell>
      );
    }

    // ---------- Screens 2/3/4: Add/Edit a question (separate Assessment Portal design set — keep as-is) ----------
    if (screen === "add-aptitude" || screen === "add-technical") {
      const kind = screen === "add-aptitude" ? "aptitude" : "technical";
      const existingQ = questionId ? assessment.questions.find((q) => q.id === questionId) : undefined;
      return (
        <DashboardShell title="" subtitle="" navLinks={navLinks} hideTitleBlock>
          <McqQuestionBuilder
            assessmentId={assessmentId}
            assessmentTitle={assessment.title}
            sectionName={sectionName ?? "Aptitude"}
            kind={kind}
            backHref={backHref}
            progressLabel={`${assessment.questions.length} question${assessment.questions.length !== 1 ? "s" : ""} added`}
            existing={existingQ}
          />
        </DashboardShell>
      );
    }

    if (screen === "add-coding") {
      const existingQ = questionId ? assessment.questions.find((q) => q.id === questionId) : undefined;
      return (
        <DashboardShell title="" subtitle="" navLinks={navLinks} hideTitleBlock>
          <CodingQuestionBuilder
            assessmentId={assessmentId}
            assessmentTitle={assessment.title}
            sectionName={sectionName ?? "Coding"}
            backHref={backHref}
            progressLabel={`${assessment.questions.length} question${assessment.questions.length !== 1 ? "s" : ""} added`}
            existing={
              existingQ
                ? {
                    ...existingQ,
                    testCases: existingQ.testCases.map((tc) => ({ ...tc, label: tc.label, weight: tc.weight })),
                  }
                : undefined
            }
          />
        </DashboardShell>
      );
    }

    // ---------- Shared: group questions by section ----------
    const sectionKinds = JSON.parse(assessment.sectionKinds || "{}") as Record<string, SectionKind>;
    const shuffleMap = JSON.parse(assessment.shuffleSections || "{}") as Record<string, boolean>;
    const bySection = new Map<string, typeof assessment.questions>();
    for (const q of assessment.questions) {
      const key = q.sectionName ?? "Ungrouped";
      if (!bySection.has(key)) bySection.set(key, []);
      bySection.get(key)!.push(q);
    }
    // Every known section (even empty ones) gets a card; anything with questions
    // but no recorded kind (legacy data from before sections existed) still shows.
    const sectionNames = new Set([...Object.keys(sectionKinds), ...bySection.keys()]);
    const sections: SectionInfo[] = Array.from(sectionNames).map((name) => {
      const kind = sectionKinds[name] ?? "APTITUDE";
      const questions: TableQuestion[] = (bySection.get(name) ?? []).map((q) => ({
        id: q.id,
        order: q.order,
        questionType: q.questionType,
        questionText: q.questionText,
        title: q.title,
        marks: q.marks,
        difficulty: q.difficulty,
        status: q.status,
        testCaseCount: q.testCases.length,
        hiddenTestCaseCount: q.testCases.filter((tc) => tc.isHidden).length,
      }));
      return { name, kind, shuffleEnabled: !!shuffleMap[name], questions };
    });

    // ---------- Step 4: Review & Publish (separate Assessment Portal design set — keep as-is) ----------
    if (step === "4") {
      const draftCodingQuestions = assessment.questions.filter((q) => q.questionType === "CODING" && q.status !== "VALIDATED");
      return (
        <DashboardShell title="" subtitle="" navLinks={navLinks} hideTitleBlock>
          <ReviewPublishScreen
            assessment={assessment}
            backHref={backHref}
            sections={sections.map((s) => ({
              name: s.name,
              questionCount: s.questions.length,
              totalMarks: s.questions.reduce((m, q) => m + q.marks, 0),
            }))}
            draftCodingQuestions={draftCodingQuestions.map((q) => ({ id: q.id, questionText: q.title || q.questionText, sectionName: q.sectionName }))}
          />
        </DashboardShell>
      );
    }

    // ---------- Default: Screen 1 (Details + Sections & Questions + Proctoring & Rules) — the
    // assessment-builder wizard renders its own header to match the separate Assessment Portal
    // design set, so it keeps DashboardShell as-is. ----------
    return (
      <DashboardShell title="" subtitle="" navLinks={navLinks} hideTitleBlock>
        {assessment.published && (
          <div className="mx-auto mb-3 max-w-6xl">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
          </div>
        )}
        <CreateAssessmentWizard
          assessment={{
            id: assessment.id,
            title: assessment.title,
            description: assessment.description,
            durationMinutes: assessment.durationMinutes,
            assessmentCode: assessment.assessmentCode,
            passMark: assessment.passMark,
            availableFrom: assessment.availableFrom?.toISOString() ?? null,
            availableUntil: assessment.availableUntil?.toISOString() ?? null,
            proctoringEnabled: assessment.proctoringEnabled,
            requireFaceMatch: assessment.requireFaceMatch,
            requireScreenShare: assessment.requireScreenShare,
            blockCopyPaste: assessment.blockCopyPaste,
            tabSwitchLimit: assessment.tabSwitchLimit,
            instructionsTemplate: assessment.instructionsTemplate,
            submissionMessage: assessment.submissionMessage,
          }}
          sections={sections}
          backHref={backHref}
        />
      </DashboardShell>
    );
  }

  // ---------- Full list of a single category ----------
  if (isAssessmentType(category) && view === "list") {
    const inType = await prisma.assessment.findMany({
      where: { type: category },
      include: { questions: true, assignments: true },
      orderBy: { createdAt: "desc" },
    });

    return (
      <AppShell
        nav={nav}
        active="assessments"
        user={shellUser}
        hasUnread={hasUnread}
        crumb={`Assessments › ${TYPE_LABELS[category]}`}
        title={`${TYPE_LABELS[category]}s`}
        subtitle={`${inType.length} assessment${inType.length !== 1 ? "s" : ""} in this module`}
      >
        <BackLink href={`/lms/company/assessments?category=${category}`} label={`Back to ${TYPE_LABELS[category]}`} />
        <section className="card">
          {inType.length === 0 ? (
            <p className="empty">No {TYPE_LABELS[category].toLowerCase()}s yet.</p>
          ) : (
            <ul className="list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {inType.map((a) => (
                <AssessmentBox key={a.id} assessment={a} sentHref={a.assignments.length > 0 ? "/lms/company/assessments/submissions" : `/lms/company/assessments?assessmentId=${a.id}&mode=send`} />
              ))}
            </ul>
          )}
        </section>
      </AppShell>
    );
  }

  // ---------- One category: create form + a link into its full list ----------
  if (isAssessmentType(category)) {
    const inType = await prisma.assessment.findMany({
      where: { type: category },
      include: { questions: true, assignments: true },
      orderBy: { createdAt: "desc" },
    });

    return (
      <AppShell
        nav={nav}
        active="assessments"
        user={shellUser}
        hasUnread={hasUnread}
        crumb={`Assessments › ${TYPE_LABELS[category]}`}
        title={`${TYPE_LABELS[category]}s`}
        subtitle={`${inType.length} assessment${inType.length !== 1 ? "s" : ""} created in this category.`}
        actions={
          <Link className="btn btn-ghost-light" href="/lms/company/assessments">
            <Icon name="arrowL" size={16} />
            All categories
          </Link>
        }
      >
        <div className="row">
          <section className="card grow">
            <h2 className="h2" style={{ marginBottom: 18 }}>
              Create a new {TYPE_LABELS[category].toLowerCase()}
            </h2>
            <CreateAssessmentForm type={category} />
          </section>

          <section className="card side">
            <div className="split" style={{ marginBottom: 18 }}>
              <h2 className="h2">In this category ({inType.length})</h2>
            </div>
            {inType.length === 0 ? (
              <p className="empty">No assessments yet — create one to get started.</p>
            ) : (
              <>
                <ul className="list" style={{ maxHeight: 520, overflowY: "auto" }}>
                  {inType.slice(0, 3).map((a) => (
                    <AssessmentBox key={a.id} assessment={a} sentHref={a.assignments.length > 0 ? "/lms/company/assessments/submissions" : `/lms/company/assessments?assessmentId=${a.id}&mode=send`} />
                  ))}
                </ul>
                {inType.length > 3 && (
                  <Link className="btn btn-primary" href={`/lms/company/assessments?category=${category}&view=list`} style={{ marginTop: 12, width: "100%", justifyContent: "center" }}>
                    View All {inType.length} Assessment{inType.length !== 1 ? "s" : ""}
                  </Link>
                )}
              </>
            )}
          </section>
        </div>
      </AppShell>
    );
  }

  // ---------- Landing: pick a category ----------
  const [counts, recent] = await Promise.all([
    prisma.assessment.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.assessment.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { _count: { select: { questions: true, assignments: true } } },
    }),
  ]);
  const countByType = Object.fromEntries(counts.map((c) => [c.type, c._count._all]));

  return (
    <AppShell
      nav={nav}
      active="assessments"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Assessments › Build & Send"
      title="Assessments"
      subtitle="Build tests, send them to students, and review submissions."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/company/assessments/submissions">
          <Icon name="clipboard" size={16} />
          Submissions
        </Link>
      }
    >
      <div className="grid" style={{ ["--min" as string]: "280px" }}>
        {TYPES.map((type) => (
          <Link key={type} className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href={`/lms/company/assessments?category=${type}`}>
            <div className="split">
              <span className="icon-box navy">
                <Icon name={TYPE_ICON[type]} size={22} />
              </span>
              <span className="pill gold">{countByType[type] ?? 0} created</span>
            </div>
            <h3 className="h2" style={{ marginTop: 14 }}>
              {TYPE_LABELS[type].replace(" Assessment", "")}
            </h3>
            <p className="muted" style={{ marginTop: 6 }}>
              {TYPE_DESCRIPTIONS[type]}
            </p>
            <div style={{ marginTop: 16, fontWeight: 600, color: "var(--navy)" }}>Open →</div>
          </Link>
        ))}
      </div>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>
          Recent assessments
        </h2>
        {recent.length === 0 ? (
          <p className="empty">No assessments created yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Category</th>
                  <th>Questions</th>
                  <th>Window</th>
                  <th>Sent</th>
                  <th className="actions">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id}>
                    <td className="strong">{a.title}</td>
                    <td>
                      <span className="pill">{TYPE_LABELS[a.type].replace(" Assessment", "")}</span>
                    </td>
                    <td>{a._count.questions}</td>
                    <td>{a.availableFrom && a.availableUntil ? `${format(a.availableFrom, "MMM d, h:mm a")} – ${format(a.availableUntil, "MMM d, h:mm a")}` : "—"}</td>
                    <td>{a._count.assignments}</td>
                    <td className="actions">
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <Link className="btn btn-sm" href={`/lms/company/assessments?assessmentId=${a.id}`}>
                          Edit questions
                        </Link>
                        {a._count.questions > 0 &&
                          (a._count.assignments > 0 ? (
                            <Link className="btn btn-sm" href="/lms/company/assessments/submissions">
                              Results
                            </Link>
                          ) : (
                            <Link className="btn btn-primary btn-sm" href={`/lms/company/assessments?assessmentId=${a.id}&mode=send`}>
                              Send
                            </Link>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="alert gold">
        <Icon name="code" size={18} className="shrink-0" />
        <span>
          Question builders (Aptitude, Technical, Coding with test cases) and the student exam screens are in the separate <strong>Assessment Portal</strong> design set.
        </span>
      </div>
    </AppShell>
  );
}
