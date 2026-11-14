import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { CreateTrainerLoginButton } from "@/components/lms/CreateTrainerLoginButton";
import { updateTrainerRate } from "@/lib/actions/trainers";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyTrainersPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess(["trainers.manage", "trainers.invoices"]);
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const canManage = keys.includes("trainers.manage");
  const canInvoices = keys.includes("trainers.invoices");

  const trainers = await prisma.trainer.findMany({ include: { loginUser: true, batches: true }, orderBy: { name: "asc" } });

  return (
    <AppShell
      nav={nav}
      active="trainers"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Accounts › Trainers"
      title="Trainers"
      subtitle="Batches, schedules, invoices and hourly rates."
      actions={<Link className="btn btn-ghost-light" href="/lms/company/accounts"><Icon name="plus" size={16} />Add trainer</Link>}
    >
      <div className="grid" style={{ ["--min" as string]: "260px" }}>
        {canManage && (
          <Link className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href="/lms/company/trainers/batches">
            <span className="icon-box gold"><Icon name="users" size={20} /></span>
            <h3 className="h3" style={{ marginTop: 12 }}>Batches</h3>
            <p className="small muted" style={{ marginTop: 4 }}>Group enrolled students into class batches.</p>
          </Link>
        )}
        {canManage && (
          <Link className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href="/lms/company/trainers/schedule">
            <span className="icon-box gold"><Icon name="calendar" size={20} /></span>
            <h3 className="h3" style={{ marginTop: 12 }}>Schedule training</h3>
            <p className="small muted" style={{ marginTop: 4 }}>Assign a trainer, date and session slots to a batch.</p>
          </Link>
        )}
        {canInvoices && (
          <Link className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href="/lms/company/trainers/invoices">
            <span className="icon-box gold"><Icon name="money" size={20} /></span>
            <h3 className="h3" style={{ marginTop: 12 }}>Invoices</h3>
            <p className="small muted" style={{ marginTop: 4 }}>{isSuperAdmin ? "Review and approve trainer invoices." : "Review trainer invoices and recommend a decision."}</p>
          </Link>
        )}
      </div>

      <section className="card">
        <h2 className="h2">All trainers ({trainers.length})</h2>
        <p className="small muted" style={{ marginTop: 4, marginBottom: 18 }}>
          Create new trainer accounts from the Add Account page — trainers without a login yet can get one below.
        </p>
        {trainers.length === 0 ? (
          <p className="empty">No trainers yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Trainer</th><th>Batches</th><th>Login</th><th>Hourly rate</th></tr></thead>
              <tbody>
                {trainers.map((trainer) => (
                  <tr key={trainer.id}>
                    <td>
                      <div className="stat-inline">
                        <span className="avatar sm">{trainer.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
                        <div>
                          <div className="strong">{trainer.name}</div>
                          <div className="small muted">{trainer.email ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td>{trainer.batches.length} batch{trainer.batches.length !== 1 ? "es" : ""}</td>
                    <td>
                      {trainer.loginUser ? (
                        <span className="pill success">Active</span>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="pill warning">No login yet</span>
                          <CreateTrainerLoginButton trainerId={trainer.id} hasEmail={!!trainer.email} hasLogin={!!trainer.loginUser} />
                        </div>
                      )}
                    </td>
                    <td>
                      {canManage ? (
                        <form action={updateTrainerRate.bind(null, trainer.id)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="input-group" style={{ width: 130 }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>₹</span>
                            <input className="input" type="number" min={0} name="hourlyRate" defaultValue={trainer.hourlyRate} />
                          </span>
                          <button className="btn btn-primary btn-sm" type="submit">Save</button>
                        </form>
                      ) : (
                        <>₹{trainer.hourlyRate}/hr</>
                      )}
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
