import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationRow } from "@/components/lms/NotificationRow";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { NOTIFICATION_SECTIONS } from "@/lib/notifications";

const PREVIEW_COUNT = 2;

export default async function NotificationsPage() {
  const { navLinks } = await requireCompanyPageAccess("overview.notifications");

  const sections = await Promise.all(
    NOTIFICATION_SECTIONS.map(async (section) => {
      const [total, unread, recent] = await Promise.all([
        prisma.notification.count({ where: { category: section.category } }),
        prisma.notification.count({ where: { category: section.category, read: false } }),
        prisma.notification.findMany({
          where: { category: section.category },
          orderBy: { createdAt: "desc" },
          take: PREVIEW_COUNT,
        }),
      ]);
      return { ...section, total, unread, recent };
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
      </div>
    </DashboardShell>
  );
}
