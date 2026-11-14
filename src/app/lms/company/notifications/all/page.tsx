import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { NotificationRow } from "@/components/lms/NotificationRow";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { NOTIFICATION_CATEGORY_KEY, notificationVisibleTo } from "@/lib/notifications";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function AllNotificationsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess([
    "overview.notifications.student",
    "overview.notifications.college",
    "overview.notifications.trainer",
    "overview.notifications.admin",
  ]);
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const visibleCategories = (Object.keys(NOTIFICATION_CATEGORY_KEY) as (keyof typeof NOTIFICATION_CATEGORY_KEY)[]).filter((c) =>
    keys.includes(NOTIFICATION_CATEGORY_KEY[c])
  );

  const all = await prisma.notification.findMany({
    where: { category: { in: visibleCategories } },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { id: true, title: true, message: true, href: true, read: true, createdAt: true, category: true, requiredKey: true },
  });
  const notifications = all.filter((n) => notificationVisibleTo(n, keys));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppShell
      nav={nav}
      active="notifications"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Notifications"
      title="All Notifications"
      subtitle="Every category, newest first."
      actions={
        unreadCount > 0 ? (
          <form
            action={async () => {
              "use server";
              await markAllNotificationsRead();
            }}
          >
            <button className="btn btn-ghost-light" type="submit">
              Mark all as read
            </button>
          </form>
        ) : null
      }
    >
      <BackLink href="/lms/company/notifications" label="Back to Notifications" />
      <p className="muted" style={{ marginBottom: 14 }}>
        {notifications.length} total{unreadCount > 0 ? ` — ${unreadCount} unread` : ""}
      </p>
      <section className="card">
        {notifications.length === 0 ? (
          <p className="empty">Nothing here yet.</p>
        ) : (
          <ul className="list">
            {notifications.map((n) => (
              <NotificationRow key={n.id} id={n.id} title={n.title} message={n.message} href={n.href} read={n.read} createdAt={n.createdAt.toISOString()} />
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
