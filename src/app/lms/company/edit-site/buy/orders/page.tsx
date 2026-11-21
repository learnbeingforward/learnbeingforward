import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { ConfirmOrderButton, RejectOrderForm, ResendOrderEmailButton } from "@/components/lms/OrderActionButtons";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };
const REJECT_REASONS = ["No payment with this UTR", "Amount does not match", "Duplicate order"];

export default async function BuyOrdersPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.edit-site");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const orders = await prisma.courseOrder.findMany({
    include: { buyListing: { include: { course: true } } },
    orderBy: { createdAt: "desc" },
  });

  const pending = orders.filter((o) => o.status === "PENDING");
  const paid = orders.filter((o) => o.status === "PAID");
  const rejected = orders.filter((o) => o.status === "CANCELLED");
  const revenue = paid.reduce((sum, o) => sum + o.amount, 0);
  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const unemailedPaidCount = paid.filter((o) => !o.emailSentAt).length;

  return (
    <AppShell nav={nav} active="edit-site" user={shellUser} hasUnread={hasUnread} crumb="Overview › Edit Site › Buy › Orders" title="Orders" subtitle="Check the UTR against your bank or UPI app before confirming.">
      <BackLink href="/lms/company/edit-site/buy" label="Back to Buy" />

      {!smtpConfigured && (
        <div className="alert danger">
          <Icon name="shield" size={18} className="shrink-0" />
          <span>
            Email isn&apos;t configured on this server (SMTP_HOST/SMTP_USER/SMTP_PASS are missing), so buyers aren&apos;t getting their login details —
            {unemailedPaidCount > 0 && ` ${unemailedPaidCount} paid order${unemailedPaidCount !== 1 ? "s are" : " is"} still unemailed. `}
            Set those in the server&apos;s environment (your Hostinger mailbox&apos;s SMTP settings), then use Resend below.
          </span>
        </div>
      )}

      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "170px" }}>
          <div className="tile warning">
            <div className="label">To verify</div>
            <div className="value">{pending.length}</div>
          </div>
          <div className="tile success">
            <div className="label">Paid orders</div>
            <div className="value">{paid.length}</div>
          </div>
          <div className="tile gold">
            <div className="label">Revenue</div>
            <div className="value">₹{revenue.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="alert info" style={{ marginBottom: 14 }}>
          <Icon name="shield" size={18} className="shrink-0" />
          <span>Check the UTR in your bank or UPI app before confirming. Confirming creates the buyer&apos;s account and emails their login straight away.</span>
        </div>
        <h2 className="h2" style={{ marginBottom: 14 }}>
          To verify ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="empty">Nothing pending.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Listing</th>
                  <th>Amount</th>
                  <th>UTR</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="strong">{o.buyerName}</div>
                      <div className="small muted">
                        {o.buyerEmail}
                        {o.buyerPhone ? ` · ${o.buyerPhone}` : ""} · {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{o.buyListing.course.name}</td>
                    <td>₹{o.amount}</td>
                    <td>
                      <span className="mono">{o.utr ?? "—"}</span>
                    </td>
                    <td className="actions">
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <RejectOrderForm orderId={o.id} reasons={REJECT_REASONS} />
                        <ConfirmOrderButton orderId={o.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {(paid.length > 0 || rejected.length > 0) && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 14 }}>
            History
          </h2>
          <ul className="list">
            {[...paid, ...rejected].map((o) => (
              <li key={o.id} className="list-row" style={{ flexWrap: "wrap" }}>
                <div className="grow">
                  <div className="strong">
                    {o.buyerName} — {o.buyListing.course.name}
                  </div>
                  <div className="small muted">
                    {o.buyerEmail} · ₹{o.amount}
                    {o.status === "CANCELLED" && o.rejectReason && ` · ${o.rejectReason}`}
                  </div>
                  {o.status === "PAID" && (
                    <span className={`pill ${o.emailSentAt ? "success" : "warning"}`} style={{ marginTop: 4, display: "inline-block" }}>
                      {o.emailSentAt ? "Login details emailed" : "Not emailed yet"}
                    </span>
                  )}
                </div>
                {o.status === "PAID" && <ResendOrderEmailButton orderId={o.id} />}
                <span className={`pill ${o.status === "PAID" ? "success" : "danger"}`}>{o.status === "PAID" ? "Paid" : "Rejected"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
