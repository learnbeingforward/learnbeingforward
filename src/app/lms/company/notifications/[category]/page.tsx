import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { NotificationRow } from "@/components/lms/NotificationRow";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { categoryFromSlug, NOTIFICATION_SECTIONS, NOTIFICATION_CATEGORY_KEY, notificationVisibleTo } from "@/lib/notifications";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function NotificationCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const { session, keys, hasUnread } = await requireCompanyPageAccess(NOTIFICATION_CATEGORY_KEY[category]);
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const section = NOTIFICATION_SECTIONS.find((s) => s.category === category)!;

  const all = await prisma.notification.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
    take: 300,
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
      title={section.label}
      subtitle="Notifications"
      actions={
        unreadCount > 0 ? (
          <form action={async () => { "use server"; await markAllNotificationsRead(category); }}>
            <button className="btn btn-ghost-light" type="submit">Mark all as read</button>
          </form>
        ) : null
      }
    >
      <BackLink href="/lms/company/notifications" label="Back to Notifications" />
      <p className="muted" style={{ marginBottom: 14 }}>{notifications.length} total{unreadCount > 0 ? ` — ${unreadCount} unread` : ""}</p>
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
