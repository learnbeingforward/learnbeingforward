import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BuyersTable } from "@/components/lms/BuyersTable";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyBuyersPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("accounts.manage.buyers");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const [paidOrders, buyerCount, pendingCount] = await Promise.all([
    prisma.courseOrder.findMany({
      where: { status: "PAID", buyerUserId: { not: null } },
      include: { buyListing: { include: { course: true } }, buyerUser: true },
      orderBy: { paidAt: "desc" },
    }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.courseOrder.count({ where: { status: "PENDING" } }),
  ]);

  const revenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const courseNames = Array.from(new Set(paidOrders.map((o) => o.buyListing.course.name))).sort();

  return (
    <AppShell
      nav={nav}
      active="buyers"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Accounts › Buyers"
      title="Buyers"
      subtitle="People who bought course books on the website. An account is created automatically once their order is confirmed paid."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/company/accounts">
          <Icon name="arrowL" size={16} />
          Back to Accounts
        </Link>
      }
    >
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "170px" }}>
          <div className="tile">
            <div className="label">Buyers</div>
            <div className="value">{buyerCount}</div>
          </div>
          <div className="tile success">
            <div className="label">Orders paid</div>
            <div className="value">{paidOrders.length}</div>
          </div>
          <div className="tile gold">
            <div className="label">Revenue</div>
            <div className="value">₹{revenue.toLocaleString("en-IN")}</div>
          </div>
          <div className="tile warning">
            <div className="label">Waiting to verify</div>
            <div className="value">{pendingCount}</div>
            <div className="delta">in Edit Site › Buy › Orders</div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">Buyer accounts ({buyerCount})</h2>
          <Link className="btn btn-gold btn-sm" href="/lms/company/edit-site/buy/orders">
            <Icon name="cart" size={16} />
            Orders to verify{pendingCount > 0 ? ` (${pendingCount})` : ""}
          </Link>
        </div>
        {paidOrders.length === 0 ? (
          <p className="empty">No buyer accounts yet — created automatically once an order is confirmed paid.</p>
        ) : (
          <BuyersTable
            orders={paidOrders.map((o) => ({
              orderId: o.id,
              userId: o.buyerUser!.id,
              name: o.buyerUser!.name,
              email: o.buyerUser!.email,
              courseName: o.buyListing.course.name,
              amount: o.amount,
              code: `ORD-${o.id.slice(-6).toUpperCase()}`,
              since: (o.paidAt ?? o.createdAt).toISOString(),
            }))}
            courseNames={courseNames}
          />
        )}
      </section>

      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <h2 className="h2">How buyer accounts are made</h2>
        </div>
        <ul className="list small">
          <li className="list-row">
            <span className="icon-box gold">
              <Icon name="cart" size={16} />
            </span>
            <div className="grow">
              <b>Order confirmed</b>
              <div className="muted">An admin confirms the UPI payment in Buy › Orders.</div>
            </div>
          </li>
          <li className="list-row">
            <span className="icon-box gold">
              <Icon name="user" size={16} />
            </span>
            <div className="grow">
              <b>Account created</b>
              <div className="muted">A buyer login is made with the order&apos;s name and email, and their login details are emailed.</div>
            </div>
          </li>
          <li className="list-row">
            <span className="icon-box gold">
              <Icon name="book" size={16} />
            </span>
            <div className="grow">
              <b>Books delivered</b>
              <div className="muted">The books are emailed and also appear inside the buyer&apos;s account.</div>
            </div>
          </li>
        </ul>
      </section>
    </AppShell>
  );
}
