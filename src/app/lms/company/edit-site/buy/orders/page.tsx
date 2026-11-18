import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { confirmOrderPaid, cancelOrder } from "@/lib/actions/buy";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function BuyOrdersPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const orders = await prisma.courseOrder.findMany({
    include: { buyListing: { include: { course: true } } },
    orderBy: { createdAt: "desc" },
  });

  const pending = orders.filter((o) => o.status === "PENDING");
  const decided = orders.filter((o) => o.status !== "PENDING");

  return (
    <AppShell nav={nav} active="edit-site" user={shellUser} hasUnread={hasUnread} crumb="Overview › Edit Site › Buy › Orders" title="Orders" subtitle="Confirm payment to email the buyer their books.">
      <BackLink href="/lms/company/edit-site/buy" label="Back to Buy" />

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 14 }}>Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="empty">Nothing pending.</p>
        ) : (
          <ul className="list">
            {pending.map((o) => (
              <li key={o.id} className="list-row" style={{ flexWrap: "wrap" }}>
                <div className="grow">
                  <div className="strong">{o.buyerName} — {o.buyListing.course.name}</div>
                  <div className="small muted">
                    {o.buyerEmail}{o.buyerPhone ? ` · ${o.buyerPhone}` : ""} · ₹{o.amount} · {new Date(o.createdAt).toLocaleDateString()}
                    {o.buyerClaimedPaidAt && " · buyer marked as paid"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <form action={confirmOrderPaid.bind(null, o.id)}>
                    <button className="btn btn-success btn-sm" type="submit">Confirm paid &amp; email books</button>
                  </form>
                  <form action={cancelOrder.bind(null, o.id)}>
                    <button className="btn btn-sm" type="submit">Cancel</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {decided.length > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 14 }}>History</h2>
          <ul className="list">
            {decided.map((o) => (
              <li key={o.id} className="list-row">
                <div className="grow">
                  <div className="strong">{o.buyerName} — {o.buyListing.course.name}</div>
                  <div className="small muted">{o.buyerEmail} · ₹{o.amount}{o.emailSentAt && " · books emailed"}</div>
                </div>
                <span className={`pill ${o.status === "PAID" ? "success" : ""}`}>{o.status === "PAID" ? "Paid" : "Cancelled"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
