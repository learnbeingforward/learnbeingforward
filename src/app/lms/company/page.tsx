import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { BackLink } from "@/components/lms/BackLink";
import {
  approveEnrollmentRequest,
  rejectEnrollmentRequest,
  approveEnrollmentRequests,
  approveAllEnrollmentRequests,
} from "@/lib/actions/enrollment-requests";
import { requireCompanyPageAccess } from "@/lib/employee-access";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string; collegeId?: string }>;
}) {
  const { requestId, collegeId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.requests");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  if (requestId) {
    const request = await prisma.enrollmentRequest.findUnique({ where: { id: requestId }, include: { student: true, course: true, college: true } });
    return (
      <AppShell nav={nav} active="dashboard" user={shellUser} hasUnread={hasUnread} crumb="Overview › Requests" title="Enrollment Request" subtitle="Decision detail">
        <BackLink href="/lms/company" label="Back to Requests" />
        {!request ? (
          <p className="muted">This request no longer exists.</p>
        ) : (
          <section className="card" style={{ maxWidth: 520 }}>
            <div className="split" style={{ marginBottom: 16 }}>
              <h2 className="h2">{request.student.name}</h2>
              <span className={`pill ${request.status === "APPROVED" ? "success" : request.status === "REJECTED" ? "danger" : "gold"}`}>{request.status}</span>
            </div>
            <dl className="stack" style={{ gap: 10, fontSize: 14 }}>
              <div className="split"><dt className="muted">Email</dt><dd>{request.student.email}</dd></div>
              <div className="split"><dt className="muted">College</dt><dd>{request.college?.name ?? "—"}</dd></div>
              <div className="split"><dt className="muted">Course</dt><dd>{request.course.name}</dd></div>
              <div className="split"><dt className="muted">Requested</dt><dd>{format(request.requestedAt, "MMM d, yyyy")}</dd></div>
              <div className="split"><dt className="muted">Decided</dt><dd>{request.decidedAt ? format(request.decidedAt, "MMM d, yyyy") : "—"}</dd></div>
            </dl>
          </section>
        )}
      </AppShell>
    );
  }

  if (collegeId) {
    const [college, pendingForCollege] = await Promise.all([
      prisma.college.findUnique({ where: { id: collegeId } }),
      prisma.enrollmentRequest.findMany({ where: { status: "PENDING", collegeId }, include: { student: true, course: true }, orderBy: { requestedAt: "asc" } }),
    ]);

    return (
      <AppShell nav={nav} active="dashboard" user={shellUser} hasUnread={hasUnread} crumb="Overview › Requests" title={college?.name ?? "College"} subtitle="Pending enrollment requests">
        <BackLink href="/lms/company" label="Back to Requests" />
        <section className="card">
          <div className="split" style={{ marginBottom: 18 }}>
            <h2 className="h2">Pending ({pendingForCollege.length})</h2>
            {pendingForCollege.length > 1 && (
              <form action={approveEnrollmentRequests.bind(null, pendingForCollege.map((r) => r.id))}>
                <button className="btn btn-primary btn-sm" type="submit">Approve All ({pendingForCollege.length})</button>
              </form>
            )}
          </div>
          {pendingForCollege.length === 0 ? (
            <p className="muted">No pending requests for this college.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Student</th><th>Course</th><th>Requested</th><th className="actions">Action</th></tr></thead>
                <tbody>
                  {pendingForCollege.map((req) => (
                    <tr key={req.id}>
                      <td className="strong">{req.student.name}</td>
                      <td>{req.course.name}</td>
                      <td>{format(req.requestedAt, "MMM d, yyyy")}</td>
                      <td className="actions">
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                          <form action={approveEnrollmentRequest.bind(null, req.id)}>
                            <button className="btn btn-primary btn-sm" type="submit">Approve</button>
                          </form>
                          <form action={rejectEnrollmentRequest.bind(null, req.id)}>
                            <button className="btn btn-sm" type="submit">Reject</button>
                          </form>
                        </div>
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

  const [pending, recentDecided, studentCount, collegeCount, certsToIssue] = await Promise.all([
    prisma.enrollmentRequest.findMany({ where: { status: "PENDING" }, include: { student: true, course: true, college: true }, orderBy: { requestedAt: "asc" } }),
    prisma.enrollmentRequest.findMany({ where: { status: { in: ["APPROVED", "REJECTED"] } }, include: { student: true, course: true, college: true }, orderBy: { decidedAt: "desc" }, take: 6 }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.college.count(),
    prisma.certification.count({ where: { OR: [{ status: "ELIGIBLE" }, { overrideApproved: true, status: { not: "ISSUED" } }] } }),
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
    <AppShell
      nav={nav}
      active="dashboard"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Requests"
      title="Company Dashboard"
      subtitle="Course enrollment requests from students, grouped by college."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/company/notifications">
          <Icon name="bell" size={16} />
          Notifications
        </Link>
      }
    >
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "180px" }}>
          <div className="tile gold">
            <div className="label">Pending requests</div>
            <div className="value">{pending.length}</div>
          </div>
          <div className="tile">
            <div className="label">Colleges represented</div>
            <div className="value">{groups.length}</div>
          </div>
          <div className="tile">
            <div className="label">Courses requested</div>
            <div className="value">{new Set(pending.map((r) => r.courseId)).size}</div>
          </div>
          <div className="tile">
            <div className="label">Students</div>
            <div className="value">{studentCount}</div>
            <div className="delta">across {collegeCount} colleges</div>
          </div>
          <div className="tile warning">
            <div className="label">Certificates to issue</div>
            <div className="value">{certsToIssue}</div>
            <div className="delta">eligible, not issued</div>
          </div>
        </div>
      </section>

      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Pending approval, by college
          </h2>
          {groups.length === 0 ? (
            <div className="empty">
              <span className="icon-box gold" style={{ margin: "0 auto 10px", width: 48, height: 48, borderRadius: "50%" }}>
                <Icon name="check" size={22} />
              </span>
              <div className="h3" style={{ color: "var(--text)" }}>
                No pending enrollment requests right now.
              </div>
              <p className="small muted" style={{ marginTop: 6 }}>
                New requests appear here grouped by college, with Approve / Reject on each.
              </p>
            </div>
          ) : (
            <>
              {pending.length > 1 && (
                <form action={approveAllEnrollmentRequests} style={{ marginBottom: 12 }}>
                  <button className="btn btn-primary btn-sm" type="submit">Approve All Colleges ({pending.length})</button>
                </form>
              )}
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
            </>
          )}
        </section>

        <section className="card side">
          <div className="split" style={{ marginBottom: 18 }}>
            <h2 className="h2">Recent decisions</h2>
          </div>
          <ul className="list">
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
            {recentDecided.length === 0 && <p className="muted">Nothing decided yet.</p>}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>
          Quick actions
        </h2>
        <div className="grid" style={{ ["--min" as string]: "240px" }}>
          <Link className="list-row" href="/lms/company/accounts">
            <span className="icon-box gold"><Icon name="plus" size={18} /></span>
            <span className="grow">Add an account</span>
            <Icon name="chevR" size={16} />
          </Link>
          <Link className="list-row" href="/lms/company/trainers/schedule">
            <span className="icon-box gold"><Icon name="calendar" size={18} /></span>
            <span className="grow">Schedule training</span>
            <Icon name="chevR" size={16} />
          </Link>
          <Link className="list-row" href="/lms/company/assessments">
            <span className="icon-box gold"><Icon name="code" size={18} /></span>
            <span className="grow">Build an assessment</span>
            <Icon name="chevR" size={16} />
          </Link>
          <Link className="list-row" href="/lms/company/course-content">
            <span className="icon-box gold"><Icon name="upload" size={18} /></span>
            <span className="grow">Upload course content</span>
            <Icon name="chevR" size={16} />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
