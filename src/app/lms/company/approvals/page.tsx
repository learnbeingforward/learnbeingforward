import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { approveAttendanceException, rejectAttendanceException } from "@/lib/actions/attendance-exceptions";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyApprovalsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("registrations.approvals");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const [pending, decided] = await Promise.all([
    prisma.attendanceException.findMany({
      where: { status: "PENDING" },
      include: { college: true, enrollment: { include: { student: true, course: true } } },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.attendanceException.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: { college: true, enrollment: { include: { student: true, course: true } } },
      orderBy: { decidedAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <AppShell
      nav={nav}
      active="attendance-approvals"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Registrations & Approvals › Approvals from College"
      title="Attendance exceptions"
      subtitle="Colleges request these when a student missed the attendance requirement for a valid reason."
    >
      <div className="alert gold">
        <Icon name="award" size={18} />
        <span>Approving makes the student immediately <strong>certificate-eligible</strong> for that course.</span>
      </div>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>Pending</h2>
        {pending.length === 0 ? (
          <p className="empty">No pending requests.</p>
        ) : (
          <ul className="list">
            {pending.map((req) => (
              <li key={req.id} className="list-row" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
                <div className="grow">
                  <div className="strong">
                    {req.enrollment.student.name}
                    {req.enrollment.student.usn && <span className="small muted" style={{ marginLeft: 8 }}>USN: {req.enrollment.student.usn}</span>}
                  </div>
                  <div className="small muted">{req.college?.name ?? "—"} · {req.enrollment.course.name}</div>
                  <div className="box" style={{ marginTop: 10, padding: 12 }}>
                    <div className="label">Reason from college</div>
                    <p style={{ marginTop: 4 }}>&ldquo;{req.reason}&rdquo;</p>
                  </div>
                  <div className="small muted" style={{ marginTop: 6 }}>Requested {format(req.requestedAt, "MMM d, yyyy")}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <form action={approveAttendanceException.bind(null, req.id)}>
                    <button className="btn btn-primary btn-sm" type="submit">Approve</button>
                  </form>
                  <form action={rejectAttendanceException.bind(null, req.id)}>
                    <button className="btn btn-sm" type="submit">Reject</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {decided.length > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>Recent decisions</h2>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Course</th><th>College</th><th>Decision</th></tr></thead>
              <tbody>
                {decided.map((req) => (
                  <tr key={req.id}>
                    <td className="strong">{req.enrollment.student.name}</td>
                    <td>{req.enrollment.course.name}</td>
                    <td>{req.college?.name ?? "—"}</td>
                    <td><span className={`pill ${req.status === "APPROVED" ? "success" : "danger"}`}>{req.status === "APPROVED" ? "Approved" : "Rejected"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AppShell>
  );
}
