import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { DomainTabs } from "@/components/lbf/DomainTabs";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { NotificationRow } from "@/components/lms/NotificationRow";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { NOTIFICATION_SECTIONS, NOTIFICATION_CATEGORY_KEY, notificationVisibleTo } from "@/lib/notifications";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function NotificationsPage() {
  const { session, keys, hasUnread } = await requireCompanyPageAccess([
    "overview.notifications.student",
    "overview.notifications.college",
    "overview.notifications.trainer",
    "overview.notifications.admin",
  ]);
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const visibleSections = NOTIFICATION_SECTIONS.filter((s) => keys.includes(NOTIFICATION_CATEGORY_KEY[s.category]));

  const sections = await Promise.all(
    visibleSections.map(async (section) => {
      const all = await prisma.notification.findMany({
        where: { category: section.category },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, message: true, href: true, read: true, createdAt: true, category: true, requiredKey: true },
      });
      const visible = all.filter((n) => notificationVisibleTo(n, keys));
      return { ...section, items: visible };
    })
  );

  const totalUnread = sections.reduce((sum, s) => sum + s.items.filter((n) => !n.read).length, 0);
  const allItems = sections.flatMap((s) => s.items).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const CAP = 3;

  function renderList(items: typeof allItems, viewAllHref: string) {
    if (items.length === 0) {
      return (
        <div className="empty">
          <span className="icon-box gold" style={{ margin: "0 auto 10px", width: 48, height: 48, borderRadius: "50%" }}>
            <Icon name="bell" size={22} />
          </span>
          <div className="h3" style={{ color: "var(--text)" }}>
            Nothing here yet.
          </div>
        </div>
      );
    }
    return (
      <>
        <ul className="list">
          {items.slice(0, CAP).map((n) => (
            <NotificationRow key={n.id} id={n.id} title={n.title} message={n.message} href={n.href} read={n.read} createdAt={n.createdAt.toISOString()} />
          ))}
        </ul>
        {items.length > CAP && (
          <Link className="list-row" href={viewAllHref} style={{ marginTop: 8, justifyContent: "center", fontWeight: 600 }}>
            View all {items.length}
            <Icon name="chevR" size={16} />
          </Link>
        )}
      </>
    );
  }

  const panels: Record<string, React.ReactNode> = { all: renderList(allItems, "/lms/company/notifications/all") };
  for (const s of sections) panels[s.category] = renderList(s.items, `/lms/company/notifications/${s.slug}`);
  const tabs = [{ key: "all", label: `All (${allItems.length})` }, ...sections.map((s) => ({ key: s.category, label: `${s.label} (${s.items.length})` }))];

  return (
    <AppShell
      nav={nav}
      active="notifications"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Notifications"
      title="Notifications"
      subtitle="Activity across the student, college and trainer portals."
      actions={
        totalUnread > 0 ? (
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
      <section className="card">
        {sections.length === 0 ? <p className="empty">You haven&apos;t been granted any notification categories yet.</p> : <DomainTabs tabs={tabs} panels={panels} />}
      </section>
    </AppShell>
  );
}
