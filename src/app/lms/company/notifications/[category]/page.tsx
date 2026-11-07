import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { Button } from "@/components/ui/button";
import { NotificationRow } from "@/components/lms/NotificationRow";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { categoryFromSlug, NOTIFICATION_SECTIONS, NOTIFICATION_CATEGORY_KEY, notificationVisibleTo } from "@/lib/notifications";

export default async function NotificationCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const { navLinks, keys } = await requireCompanyPageAccess(NOTIFICATION_CATEGORY_KEY[category]);
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
    <DashboardShell title={section.label} subtitle="Notifications" navLinks={navLinks}>
      <BackLink href="/lms/company/notifications" label="Back to Notifications" />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {notifications.length} total{unreadCount > 0 ? ` — ${unreadCount} unread` : ""}
        </p>
        {unreadCount > 0 && (
          <form
            action={async () => {
              "use server";
              await markAllNotificationsRead(category);
            }}
          >
            <Button type="submit" size="sm" variant="outline" className="border-border text-indigo">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white">
        {notifications.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <NotificationRow
                key={n.id}
                id={n.id}
                title={n.title}
                message={n.message}
                href={n.href}
                read={n.read}
                createdAt={n.createdAt.toISOString()}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
