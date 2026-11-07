import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { Button } from "@/components/ui/button";
import { NotificationRow } from "@/components/lms/NotificationRow";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import type { NotificationCategory } from "@prisma/client";

const SECTIONS: { category: NotificationCategory; label: string }[] = [
  { category: "STUDENT", label: "Students" },
  { category: "COLLEGE", label: "Colleges" },
  { category: "TRAINER", label: "Trainers" },
  { category: "ADMIN", label: "Admin / System" },
];

export default async function NotificationsPage() {
  const { navLinks } = await requireCompanyPageAccess("overview.notifications");

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  const byCategory = new Map<NotificationCategory, typeof notifications>();
  for (const section of SECTIONS) byCategory.set(section.category, []);
  for (const n of notifications) byCategory.get(n.category)?.push(n);

  return (
    <DashboardShell
      title="Notifications"
      subtitle="Activity across the student, college, and trainer portals"
      navLinks={navLinks}
    >
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
        </p>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" size="sm" variant="outline" className="border-border text-indigo">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const items = byCategory.get(section.category) ?? [];
          return (
            <div key={section.category} className="rounded-xl border border-border bg-white">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo">
                  {section.label} ({items.length})
                </p>
              </div>
              {items.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">Nothing here yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {items.map((n) => (
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
          );
        })}
      </div>
    </DashboardShell>
  );
}
