import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyBuyersPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess("accounts.manage.buyers");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const buyers = await prisma.user.findMany({
    where: { role: "BUYER" },
    include: { courseOrders: { where: { status: "PAID" }, include: { buyListing: { include: { course: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell nav={nav} active="buyers" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Buyers" title="Buyers" subtitle={`${buyers.length} account${buyers.length !== 1 ? "s" : ""} created from Buy purchases — never students, never tied to a college.`}>
      <section className="card">
        {buyers.length === 0 ? (
          <p className="empty">No buyer accounts yet — created automatically once an order is confirmed paid.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Buyer</th><th>Email</th><th>Purchases</th><th>Joined</th></tr></thead>
              <tbody>
                {buyers.map((b) => (
                  <tr key={b.id}>
                    <td className="strong">{b.name}</td>
                    <td>{b.email}</td>
                    <td>{b.courseOrders.map((o) => o.buyListing.course.name).join(", ") || "—"}</td>
                    <td>{new Date(b.createdAt).toLocaleDateString()}</td>
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
