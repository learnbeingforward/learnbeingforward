import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { Badge } from "@/components/ui/badge";
import { CreateAssessmentForm } from "@/components/lms/CreateAssessmentForm";
import { AssessmentQuestionBuilder } from "@/components/lms/AssessmentQuestionBuilder";
import { AssignAssessmentForm } from "@/components/lms/AssignAssessmentForm";
import { EditAssessmentSettingsForm } from "@/components/lms/EditAssessmentSettingsForm";
import { deleteAssessment } from "@/lib/actions/assessments";
import { DeleteButton } from "@/components/lms/DeleteButton";

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

const TYPES = ["APTITUDE", "TECHNICAL_APTITUDE", "CODING"] as const;
type AssessmentTypeValue = (typeof TYPES)[number];

function isAssessmentType(value: string | undefined): value is AssessmentTypeValue {
  return !!value && (TYPES as readonly string[]).includes(value);
}

function AssessmentCard({ assessment }: { assessment: { id: string; title: string; questions: unknown[]; assignments: unknown[]; durationMinutes: number; proctoringEnabled: boolean; availableFrom: Date | null; availableUntil: Date | null } }) {
  const a = assessment;
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/lms/company/assessments?assessmentId=${a.id}`} className="font-medium text-indigo underline underline-offset-2">
            {a.title}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {a.questions.length} question{a.questions.length !== 1 ? "s" : ""} &middot; {a.assignments.length} sent &middot;{" "}
            {a.durationMinutes} min
            {a.proctoringEnabled && " · Proctored"}
          </p>
          {a.availableFrom && a.availableUntil && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {a.availableFrom.toLocaleString()} – {a.availableUntil.toLocaleString()}
            </p>
          )}
        </div>
        <DeleteButton action={deleteAssessment.bind(null, a.id)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/lms/company/assessments?assessmentId=${a.id}`} className="text-xs text-indigo underline">
          Edit Questions
        </Link>
        {a.questions.length > 0 && (
          <Link href={`/lms/company/assessments?assessmentId=${a.id}&mode=send`} className="text-xs text-indigo underline">
            Send to Students
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function CompanyAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ assessmentId?: string; mode?: string; category?: string; view?: string }>;
}) {
  const { navLinks } = await requireCompanyPageAccess("assessments.build");

  const { assessmentId, mode, category, view } = await searchParams;

  if (assessmentId) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: { orderBy: { order: "asc" }, include: { _count: { select: { testCases: true } } } },
        assignments: true,
      },
    });

    if (!assessment) {
      return (
        <DashboardShell title="Assessments" subtitle="Not found" navLinks={navLinks}>
          <BackLink href="/lms/company/assessments" label="Back to Assessments" />
          <p className="text-sm text-muted-foreground">This assessment no longer exists.</p>
        </DashboardShell>
      );
    }

    const categoryListHref = `/lms/company/assessments?category=${assessment.type}&view=list`;

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
        <DashboardShell title={assessment.title} subtitle="Send to students" navLinks={navLinks}>
          <BackLink href={`/lms/company/assessments?assessmentId=${assessmentId}`} label="Back to Assessment" />
          <AssignAssessmentForm assessmentId={assessmentId} students={assignable} />
        </DashboardShell>
      );
    }

    return (
      <DashboardShell title={assessment.title} subtitle={TYPE_LABELS[assessment.type]} navLinks={navLinks}>
        <BackLink href={categoryListHref} label={`Back to ${TYPE_LABELS[assessment.type]}s`} />
        <EditAssessmentSettingsForm
          assessmentId={assessmentId}
          title={assessment.title}
          description={assessment.description}
          durationMinutes={assessment.durationMinutes}
          proctoringEnabled={assessment.proctoringEnabled}
          availableFrom={assessment.availableFrom?.toISOString() ?? null}
          availableUntil={assessment.availableUntil?.toISOString() ?? null}
        />
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {assessment.questions.length > 0 && (
            <Link
              href={`/lms/company/assessments?assessmentId=${assessmentId}&mode=send`}
              className="rounded-lg bg-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-indigo/90"
            >
              Finish &amp; Send to Students
            </Link>
          )}
          {assessment.published && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
          )}
        </div>
        <AssessmentQuestionBuilder
          assessmentId={assessmentId}
          questions={assessment.questions.map((q) => ({ ...q, testCaseCount: q._count.testCases }))}
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
      <DashboardShell
        title={`${TYPE_LABELS[category]}s`}
        subtitle={`${inType.length} assessment${inType.length !== 1 ? "s" : ""} in this module`}
        navLinks={navLinks}
      >
        <BackLink href={`/lms/company/assessments?category=${category}`} label={`Back to ${TYPE_LABELS[category]}`} />
        <div className="grid gap-3 sm:grid-cols-2">
          {inType.map((a) => (
            <AssessmentCard key={a.id} assessment={a} />
          ))}
          {inType.length === 0 && <p className="text-sm text-muted-foreground sm:col-span-2">No {TYPE_LABELS[category].toLowerCase()}s yet.</p>}
        </div>
      </DashboardShell>
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
      <DashboardShell title={TYPE_LABELS[category]} subtitle={TYPE_DESCRIPTIONS[category]} navLinks={navLinks}>
        <BackLink href="/lms/company/assessments" label="Back to Categories" />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4">
          <p className="text-sm text-indigo">
            <span className="font-semibold">{inType.length}</span> assessment{inType.length !== 1 ? "s" : ""} created in this module.
          </p>
          {inType.length > 0 && (
            <Link
              href={`/lms/company/assessments?category=${category}&view=list`}
              className="rounded-lg bg-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-indigo/90"
            >
              View All {inType.length} Assessment{inType.length !== 1 ? "s" : ""}
            </Link>
          )}
        </div>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Create a New {TYPE_LABELS[category]}</h2>
        <CreateAssessmentForm type={category} />
      </DashboardShell>
    );
  }

  // ---------- Landing: pick a category ----------
  const counts = await prisma.assessment.groupBy({ by: ["type"], _count: { _all: true } });
  const countByType = Object.fromEntries(counts.map((c) => [c.type, c._count._all]));

  return (
    <DashboardShell title="Assessments" subtitle="Choose a category to create or manage assessments" navLinks={navLinks}>
      <div className="grid gap-4 sm:grid-cols-3">
        {TYPES.map((type) => (
          <Link
            key={type}
            href={`/lms/company/assessments?category=${type}`}
            className="rounded-xl border border-border bg-white p-6 text-center transition-colors hover:border-indigo/40 hover:shadow-md"
          >
            <p className="text-lg font-semibold text-indigo">{TYPE_LABELS[type]}</p>
            <p className="mt-1 text-xs text-muted-foreground">{TYPE_DESCRIPTIONS[type]}</p>
            <p className="mt-4 text-3xl font-bold text-indigo">{countByType[type] ?? 0}</p>
            <p className="text-xs text-muted-foreground">created</p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
