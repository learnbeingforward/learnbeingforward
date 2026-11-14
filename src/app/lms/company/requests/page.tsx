import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { BackLink } from "@/components/lms/BackLink";
import { approveEnrollmentRequests, approveAllEnrollmentRequests } from "@/lib/actions/enrollment-requests";
import { requireCompanyPageAccess } from "@/lib/employee-access";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyRequestsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.requests");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const [pending, recentDecided] = await Promise.all([
    prisma.enrollmentRequest.findMany({ where: { status: "PENDING" }, include: { student: true, course: true, college: true }, orderBy: { requestedAt: "asc" } }),
    prisma.enrollmentRequest.findMany({ where: { status: { in: ["APPROVED", "REJECTED"] } }, include: { student: true, course: true, college: true }, orderBy: { decidedAt: "desc" }, take: 100 }),
  ]);

  const collegeGroups = new Map<string, { collegeId: string | null; collegeName: string; count: number }>();
  for (const req of pending) {
    const key = req.collegeId ?? "none";
    const existing = collegeGroups.get(key);
    if (existing) existing.count++;
    else collegeGroups.set(key, { collegeId: req.collegeId, collegeName: req.college?.name ?? "No College", count: 1 });
  }
  const groups = Array.from(collegeGroups.values()).sort((a, b) => b.count - a.count);

  return (
    <AppShell nav={nav} active="dashboard" user={shellUser} hasUnread={hasUnread} crumb="Overview › Requests" title="All Requests" subtitle="Every pending approval and recent decision, in full.">
      <BackLink href="/lms/company" label="Back to Dashboard" />

      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Pending approval, by college ({groups.length})</h2>
          {pending.length > 1 && (
            <form action={approveAllEnrollmentRequests}>
              <button className="btn btn-primary btn-sm" type="submit">Approve All Colleges ({pending.length})</button>
            </form>
          )}
        </div>
        {groups.length === 0 ? (
          <p className="empty">No pending enrollment requests right now.</p>
        ) : (
          <ul className="list">
            {groups.map((g) => (
              <li key={g.collegeId ?? "none"} className="list-row">
                <Link className="grow strong" href={g.collegeId ? `/lms/company?collegeId=${g.collegeId}` : "/lms/company"}>
                  {g.collegeName}
                </Link>
                <span className="pill gold">{g.count} pending</span>
                {g.count > 1 && (
                  <form action={approveEnrollmentRequests.bind(null, pending.filter((r) => (r.collegeId ?? "none") === (g.collegeId ?? "none")).map((r) => r.id))}>
                    <button className="btn btn-sm" type="submit">Approve All</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>Recent decisions ({recentDecided.length})</h2>
        {recentDecided.length === 0 ? (
          <p className="empty">Nothing decided yet.</p>
        ) : (
          <ul className="list" style={{ maxHeight: 600, overflowY: "auto" }}>
            {recentDecided.map((req) => (
              <li key={req.id} className="list-row">
                <div className="grow">
                  <div className="stat-inline">
                    <span className="avatar sm">{req.student.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
                    <div>
                      <div className="strong">{req.student.name}</div>
                      <div className="small muted">{req.course.name} · {req.college?.name ?? "—"}</div>
                    </div>
                  </div>
                </div>
                <span className={`pill ${req.status === "APPROVED" ? "success" : "danger"}`}>{req.status === "APPROVED" ? "Approved" : "Rejected"}</span>
                <span className="small muted">{req.decidedAt ? format(req.decidedAt, "MMM d") : "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
