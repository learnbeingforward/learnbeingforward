import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/lms/BackLink";
import { decideContentAccessRequest } from "@/lib/actions/course-content";
import { BulkDecideContentRequestsForm } from "@/components/lms/BulkDecideContentRequestsForm";
import { format } from "date-fns";

function labelFor(req: {
  courseContent: { course: { name: string }; courseModule: { title: string } | null } | null;
  courseModule: { course: { name: string }; title: string } | null;
}) {
  if (req.courseContent) {
    return `Course content — ${req.courseContent.course.name} — ${req.courseContent.courseModule?.title ?? "—"}`;
  }
  if (req.courseModule) {
    return `Course book — ${req.courseModule.course.name} — ${req.courseModule.title}`;
  }
  return "—";
}

export default async function CourseContentRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { studentId } = await searchParams;
  const { navLinks } = await requireCompanyPageAccess("course-content");

  const pending = await prisma.contentAccessRequest.findMany({
    where: { status: "PENDING", groupId: null },
    include: {
      student: true,
      courseContent: { include: { course: true, courseModule: true } },
      courseModule: { include: { course: true } },
    },
    orderBy: { requestedAt: "asc" },
  });

  if (studentId) {
    const studentRequests = pending.filter((r) => r.studentId === studentId);
    const studentName = studentRequests[0]?.student.name ?? "Student";

    return (
      <DashboardShell title={studentName} subtitle="Pending content requests" navLinks={navLinks}>
        <BackLink href="/lms/company/course-content/requests" label="Back to Pending Requests" />
        {studentRequests.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
            Nothing pending for this student anymore.
          </p>
        ) : (
          <BulkDecideContentRequestsForm
            requests={studentRequests.map((r) => ({
              id: r.id,
              label: `${labelFor(r)} · ${format(r.requestedAt, "MMM d, yyyy")}`,
              requestedAt: r.requestedAt.toISOString(),
            }))}
          />
        )}
      </DashboardShell>
    );
  }

  const byStudent = new Map<string, { name: string; requests: typeof pending }>();
  for (const r of pending) {
    const existing = byStudent.get(r.studentId);
    if (existing) existing.requests.push(r);
    else byStudent.set(r.studentId, { name: r.student.name, requests: [r] });
  }

  return (
    <DashboardShell title="Pending Content Requests" subtitle="Course Content" navLinks={navLinks}>
      <BackLink href="/lms/company/course-content" label="Back to Course Content" />
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        A student can ask for a specific content item and the course book separately — only what you approve
        becomes downloadable.
      </p>

      {byStudent.size === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No pending requests.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white">
          <div className="divide-y divide-border">
            {Array.from(byStudent.entries()).map(([sid, group]) => {
              if (group.requests.length === 1) {
                const req = group.requests[0];
                return (
                  <div key={sid} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-medium text-indigo">{group.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {labelFor(req)} &middot; {format(req.requestedAt, "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form action={decideContentAccessRequest.bind(null, req.id, true)}>
                        <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                          Approve
                        </Button>
                      </form>
                      <form action={decideContentAccessRequest.bind(null, req.id, false)}>
                        <Button type="submit" size="sm" variant="outline" className="border-border text-muted-foreground">
                          Reject
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={sid}
                  href={`/lms/company/course-content/requests?studentId=${sid}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-cream/60"
                >
                  <div>
                    <p className="text-sm font-medium text-indigo">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.requests.length} pending requests — review together</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
