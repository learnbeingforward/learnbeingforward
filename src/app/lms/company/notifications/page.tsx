import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationRow } from "@/components/lms/NotificationRow";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { NOTIFICATION_SECTIONS, NOTIFICATION_CATEGORY_KEY, notificationVisibleTo } from "@/lib/notifications";

const PREVIEW_COUNT = 2;

export default async function NotificationsPage() {
  const { navLinks, keys } = await requireCompanyPageAccess([
    "overview.notifications.student",
    "overview.notifications.college",
    "overview.notifications.trainer",
    "overview.notifications.admin",
  ]);

  const visibleSections = NOTIFICATION_SECTIONS.filter((s) => keys.includes(NOTIFICATION_CATEGORY_KEY[s.category]));

  const sections = await Promise.all(
    visibleSections.map(async (section) => {
      const all = await prisma.notification.findMany({
        where: { category: section.category },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, message: true, href: true, read: true, createdAt: true, category: true, requiredKey: true },
      });
      const visible = all.filter((n) => notificationVisibleTo(n, keys));
      return {
        ...section,
        total: visible.length,
        unread: visible.filter((n) => !n.read).length,
        recent: visible.slice(0, PREVIEW_COUNT),
      };
    })
  );

  const totalUnread = sections.reduce((sum, s) => sum + s.unread, 0);

  return (
    <DashboardShell
      title="Notifications"
      subtitle="Activity across the student, college, and trainer portals"
      navLinks={navLinks}
    >
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalUnread > 0 ? `${totalUnread} unread across all sections` : "You're all caught up."}
        </p>
        {totalUnread > 0 && (
          <form
            action={async () => {
              "use server";
              await markAllNotificationsRead();
            }}
          >
            <Button type="submit" size="sm" variant="outline" className="border-border text-indigo">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.category} className="rounded-xl border border-border bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo">
                {section.label}
                <Badge className="bg-indigo/10 text-indigo hover:bg-indigo/10">{section.total} total</Badge>
                {section.unread > 0 && (
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{section.unread} unread</Badge>
                )}
              </p>
              {section.total > PREVIEW_COUNT && (
                <Link
                  href={`/lms/company/notifications/${section.slug}`}
                  className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-indigo underline underline-offset-2"
                >
                  View all {section.total} <ChevronRight className="size-3.5" />
                </Link>
              )}
            </div>
            {section.recent.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Nothing here yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {section.recent.map((n) => (
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
        ))}
        {sections.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
            You haven&apos;t been granted any notification categories yet.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
