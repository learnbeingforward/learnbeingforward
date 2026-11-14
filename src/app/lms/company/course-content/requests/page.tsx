import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { decideContentAccessRequest } from "@/lib/actions/course-content";
import { BulkDecideContentRequestsForm } from "@/components/lms/BulkDecideContentRequestsForm";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

function labelFor(req: {
  courseContent: { course: { name: string }; courseModule: { title: string } | null } | null;
  courseModule: { course: { name: string }; title: string } | null;
}) {
  if (req.courseContent) return `Course content — ${req.courseContent.course.name} — ${req.courseContent.courseModule?.title ?? "—"}`;
  if (req.courseModule) return `Course book — ${req.courseModule.course.name} — ${req.courseModule.title}`;
  return "—";
}

export default async function CourseContentRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { studentId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("course-content");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const pending = await prisma.contentAccessRequest.findMany({
    where: { status: "PENDING", groupId: null },
    include: { student: true, courseContent: { include: { course: true, courseModule: true } }, courseModule: { include: { course: true } } },
    orderBy: { requestedAt: "asc" },
  });

  if (studentId) {
    const studentRequests = pending.filter((r) => r.studentId === studentId);
    const studentName = studentRequests[0]?.student.name ?? "Student";

    return (
      <AppShell nav={nav} active="course-content" user={shellUser} hasUnread={hasUnread} crumb="Course Content › Requests" title={studentName} subtitle="Pending content requests">
        <BackLink href="/lms/company/course-content/requests" label="Back to Pending Requests" />
        {studentRequests.length === 0 ? (
          <section className="card"><p className="empty">Nothing pending for this student anymore.</p></section>
        ) : (
          <section className="card">
            <BulkDecideContentRequestsForm
              requests={studentRequests.map((r) => ({ id: r.id, label: `${labelFor(r)} · ${format(r.requestedAt, "MMM d, yyyy")}`, requestedAt: r.requestedAt.toISOString() }))}
            />
          </section>
        )}
      </AppShell>
    );
  }

  const byStudent = new Map<string, { name: string; requests: typeof pending }>();
  for (const r of pending) {
    const existing = byStudent.get(r.studentId);
    if (existing) existing.requests.push(r);
    else byStudent.set(r.studentId, { name: r.student.name, requests: [r] });
  }

  return (
    <AppShell nav={nav} active="course-content" user={shellUser} hasUnread={hasUnread} crumb="Course Content › Requests" title="Pending content requests" subtitle="A student can ask for a specific content item and the course book separately — only what you approve becomes downloadable.">
      <BackLink href="/lms/company/course-content" label="Back to Course Content" />
      <section className="card">
        {byStudent.size === 0 ? (
          <p className="empty">No pending requests.</p>
        ) : (
          <ul className="list">
            {Array.from(byStudent.entries()).map(([sid, group]) => {
              if (group.requests.length === 1) {
                const req = group.requests[0];
                return (
                  <li key={sid} className="list-row">
                    <div className="grow">
                      <div className="strong">{group.name}</div>
                      <div className="small muted">{labelFor(req)} · {format(req.requestedAt, "MMM d, yyyy")}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <form action={decideContentAccessRequest.bind(null, req.id, true)}>
                        <button className="btn btn-primary btn-sm" type="submit">Approve</button>
                      </form>
                      <form action={decideContentAccessRequest.bind(null, req.id, false)}>
                        <button className="btn btn-sm" type="submit">Reject</button>
                      </form>
                    </div>
                  </li>
                );
              }
              return (
                <Link key={sid} className="list-row" href={`/lms/company/course-content/requests?studentId=${sid}`}>
                  <span className="grow">
                    <span className="strong" style={{ display: "block" }}>{group.name}</span>
                    <span className="small muted">{group.requests.length} pending requests — review together</span>
                  </span>
                  <Icon name="chevR" size={16} />
                </Link>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
