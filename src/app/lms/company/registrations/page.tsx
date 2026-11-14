import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { approveRegistration, rejectRegistration, approveAllRegistrations } from "@/lib/actions/registration";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyRegistrationsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("registrations.new");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const pending = await prisma.user.findMany({
    where: { role: "STUDENT", studentStatus: "PENDING_APPROVAL" },
    include: { college: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <AppShell
      nav={nav}
      active="registrations"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Registrations & Approvals › New Registrations"
      title="New registrations"
      subtitle="A student appears here after they sign up and their details matched a roster entry their college added."
    >
      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Pending ({pending.length})</h2>
          {pending.length > 1 && (
            <form action={approveAllRegistrations}>
              <button className="btn btn-primary btn-sm" type="submit">Approve All ({pending.length})</button>
            </form>
          )}
        </div>
        {pending.length === 0 ? (
          <p className="empty">No pending registrations.</p>
        ) : (
          <ul className="list">
            {pending.map((student) => (
              <li key={student.id} className="list-row" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
                <div className="grow">
                  <div className="strong">
                    {student.name}
                    {student.usn && <span className="small muted" style={{ marginLeft: 8 }}>USN: {student.usn}</span>}
                  </div>
                  <div className="small muted">{student.email} · {student.college?.name ?? "—"}</div>
                  <div className="small muted">Signed up {format(student.createdAt, "MMM d, yyyy")}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <form action={approveRegistration.bind(null, student.id)}>
                    <button className="btn btn-primary btn-sm" type="submit">Approve</button>
                  </form>
                  <form action={rejectRegistration.bind(null, student.id)}>
                    <button className="btn btn-sm" type="submit">Reject</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
