import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { PasswordResetRow } from "@/components/lms/PasswordResetRow";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyPasswordResetsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("registrations.password-resets");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const [pending, decided] = await Promise.all([
    prisma.passwordResetRequest.findMany({ where: { status: "PENDING" }, orderBy: { requestedAt: "asc" } }),
    prisma.passwordResetRequest.findMany({ where: { status: { in: ["APPROVED", "REJECTED"] } }, orderBy: { decidedAt: "desc" }, take: 15 }),
  ]);

  return (
    <AppShell
      nav={nav}
      active="password-resets"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Registrations & Approvals › Password Reset Requests"
      title="Password reset requests"
      subtitle="Forgot-password requests"
    >
      <p className="muted" style={{ maxWidth: 640 }}>
        Students, colleges, trainers, and second admins now reset their own password by email from the login page&apos;s &quot;Forgot password?&quot; link — you&apos;ll just get a notification once someone actually uses it, no action needed from you. This page only still shows older requests made before that existed, kept for reference. Need to reset an account directly yourself? Use Manage Accounts instead.
      </p>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="empty">No pending requests.</p>
        ) : (
          <div className="stack" style={{ gap: 0 }}>
            {pending.map((req) => (
              <div key={req.id} style={{ borderTop: "1px solid var(--border)" }}>
                <PasswordResetRow request={req} />
              </div>
            ))}
          </div>
        )}
      </section>

      {decided.length > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>Recent decisions</h2>
          <ul className="list">
            {decided.map((req) => (
              <li key={req.id} className="list-row">
                <span className="grow">
                  {req.name} — {req.email}
                  {req.decidedAt && <span className="small muted" style={{ marginLeft: 8 }}>{format(req.decidedAt, "MMM d, yyyy")}</span>}
                </span>
                <span className={`pill ${req.status === "APPROVED" ? "success" : "danger"}`}>{req.status === "APPROVED" ? "Sent" : "Rejected"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
