import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { TrainersTable } from "@/components/lms/TrainersTable";
import { updateTrainerRate } from "@/lib/actions/trainers";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyTrainersPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess(["trainers.manage", "trainers.invoices"]);
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const canManage = keys.includes("trainers.manage");
  const canInvoices = keys.includes("trainers.invoices");

  const [trainers, pendingBatchRequests] = await Promise.all([
    prisma.trainer.findMany({ include: { loginUser: true, batches: true }, orderBy: { name: "asc" } }),
    prisma.batchRequest.count({ where: { status: "PENDING" } }),
  ]);

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
          <Link className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href="/lms/company/trainers/batches/requests">
            <span className="split" style={{ alignItems: "flex-start" }}>
              <span className="icon-box gold"><Icon name="bell" size={20} /></span>
              {pendingBatchRequests > 0 && <span className="pill warning">{pendingBatchRequests} pending</span>}
            </span>
            <h3 className="h3" style={{ marginTop: 12 }}>Batch requests</h3>
            <p className="small muted" style={{ marginTop: 4 }}>Approve batches colleges have asked to create.</p>
          </Link>
        )}
        {canManage && (
          <Link className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href="/lms/company/trainers/batches/calendar">
            <span className="icon-box gold"><Icon name="calendar" size={20} /></span>
            <h3 className="h3" style={{ marginTop: 12 }}>Batch calendar</h3>
            <p className="small muted" style={{ marginTop: 4 }}>Browse batches by the date they were created.</p>
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
        <div className="split" style={{ marginBottom: 18 }}>
          <div>
            <h2 className="h2">All trainers ({trainers.length})</h2>
            <p className="subtitle">Create trainer accounts from Add Account — trainers without a login can get one here.</p>
          </div>
        </div>
        {trainers.length === 0 ? (
          <p className="empty">No trainers yet.</p>
        ) : (
          <TrainersTable
            trainers={trainers.map((t) => ({
              id: t.id,
              name: t.name,
              email: t.email,
              batchCount: t.batches.length,
              hasLogin: !!t.loginUser,
              hourlyRate: t.hourlyRate,
              rateAction: canManage ? updateTrainerRate.bind(null, t.id) : null,
            }))}
            canManage={canManage}
          />
        )}
      </section>
    </AppShell>
  );
}
