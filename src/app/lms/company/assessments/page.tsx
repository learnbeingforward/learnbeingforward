import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { BackLink } from "@/components/lms/BackLink";
import { Badge } from "@/components/ui/badge";
import { CreateAssessmentForm } from "@/components/lms/CreateAssessmentForm";
import { AssessmentQuestionBuilder } from "@/components/lms/AssessmentQuestionBuilder";
import { AssignAssessmentForm } from "@/components/lms/AssignAssessmentForm";
import { deleteAssessment } from "@/lib/actions/assessments";
import { DeleteButton } from "@/components/lms/DeleteButton";

const TYPE_LABELS: Record<string, string> = {
  APTITUDE: "Aptitude Assessment",
  TECHNICAL_APTITUDE: "Technical Aptitude Assessment",
  CODING: "Coding Assessment",
};

const TYPES = ["APTITUDE", "TECHNICAL_APTITUDE", "CODING"] as const;

export default async function CompanyAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ assessmentId?: string; mode?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/lms/company");
  }

  const { assessmentId, mode } = await searchParams;

  if (assessmentId) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: { orderBy: { order: "asc" } }, assignments: true },
    });

    if (!assessment) {
      return (
        <DashboardShell title="Assessments" subtitle="Not found" navLinks={navLinks}>
          <BackLink href="/lms/company/assessments" label="Back to Assessments" />
          <p className="text-sm text-muted-foreground">This assessment no longer exists.</p>
        </DashboardShell>
      );
    }

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
        <BackLink href="/lms/company/assessments" label="Back to Assessments" />
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
        <AssessmentQuestionBuilder assessmentId={assessmentId} questions={assessment.questions} />
      </DashboardShell>
    );
  }

  const assessments = await prisma.assessment.findMany({
    include: { questions: true, assignments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell title="Assessments" subtitle="Aptitude, technical, and coding assessments" navLinks={navLinks}>
      <div className="space-y-8">
        {TYPES.map((type) => {
          const inType = assessments.filter((a) => a.type === type);
          return (
            <div key={type}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
                {TYPE_LABELS[type]}
              </h2>
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                {inType.map((a) => (
                  <div key={a.id} className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/lms/company/assessments?assessmentId=${a.id}`}
                          className="font-medium text-indigo underline underline-offset-2"
                        >
                          {a.title}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {a.questions.length} question{a.questions.length !== 1 ? "s" : ""} &middot;{" "}
                          {a.assignments.length} sent &middot; {a.durationMinutes} min
                        </p>
                      </div>
                      <DeleteButton action={deleteAssessment.bind(null, a.id)} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/lms/company/assessments?assessmentId=${a.id}`}
                        className="text-xs text-indigo underline"
                      >
                        Edit Questions
                      </Link>
                      {a.questions.length > 0 && (
                        <Link
                          href={`/lms/company/assessments?assessmentId=${a.id}&mode=send`}
                          className="text-xs text-indigo underline"
                        >
                          Send to Students
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                {inType.length === 0 && (
                  <p className="text-sm text-muted-foreground sm:col-span-2">No {TYPE_LABELS[type].toLowerCase()}s yet.</p>
                )}
              </div>
              <CreateAssessmentForm type={type} />
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
