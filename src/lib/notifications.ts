import { prisma } from "@/lib/prisma";
import type { EmployeePageKey } from "@/lib/employee-access";

export type NotificationCategory = "STUDENT" | "COLLEGE" | "TRAINER" | "ADMIN";

export const NOTIFICATION_SECTIONS: { category: NotificationCategory; slug: string; label: string }[] = [
  { category: "STUDENT", slug: "students", label: "Students" },
  { category: "COLLEGE", slug: "colleges", label: "Colleges" },
  { category: "TRAINER", slug: "trainers", label: "Trainers" },
  { category: "ADMIN", slug: "admin", label: "Admin / System" },
];

export function categoryFromSlug(slug: string): NotificationCategory | null {
  return NOTIFICATION_SECTIONS.find((s) => s.slug === slug)?.category ?? null;
}

/**
 * Drops one row into the site-wide activity feed shown on the company side's
 * Notifications page. Called from inside other server actions right after the
 * event it's reporting actually happened — never throws (a notification failing
 * to record should never block the action that triggered it).
 */
export async function notify(
  category: NotificationCategory,
  title: string,
  opts?: { message?: string; href?: string; requiredKey?: string }
) {
  try {
    await prisma.notification.create({
      data: { category, title, message: opts?.message, href: opts?.href, requiredKey: opts?.requiredKey },
    });
  } catch (err) {
    console.error("[notifications] Failed to record notification:", err);
  }
}

/** Maps a notification's category to the Employee Access key that gates seeing
 * that category's notifications at all — separate from any extra requiredKey a
 * specific notification might also carry. */
export const NOTIFICATION_CATEGORY_KEY: Record<NotificationCategory, EmployeePageKey> = {
  STUDENT: "overview.notifications.student",
  COLLEGE: "overview.notifications.college",
  TRAINER: "overview.notifications.trainer",
  ADMIN: "overview.notifications.admin",
};

/** A notification is visible to a viewer who has the category key for its
 * category, and — if the notification also carries a requiredKey — that key too. */
export function notificationVisibleTo(n: { category: NotificationCategory; requiredKey: string | null }, keys: string[]) {
  if (!keys.includes(NOTIFICATION_CATEGORY_KEY[n.category])) return false;
  if (n.requiredKey && !keys.includes(n.requiredKey)) return false;
  return true;
}

export async function getUnreadNotificationCount(keys: string[]): Promise<number> {
  try {
    const categories = NOTIFICATION_SECTIONS.filter((s) => keys.includes(NOTIFICATION_CATEGORY_KEY[s.category])).map(
      (s) => s.category
    );
    if (categories.length === 0) return 0;
    const unread = await prisma.notification.findMany({
      where: { read: false, category: { in: categories } },
      select: { category: true, requiredKey: true },
    });
    return unread.filter((n) => notificationVisibleTo(n, keys)).length;
  } catch {
    return 0;
  }
}
