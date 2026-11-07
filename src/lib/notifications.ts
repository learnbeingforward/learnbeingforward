import { prisma } from "@/lib/prisma";

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
  opts?: { message?: string; href?: string }
) {
  try {
    await prisma.notification.create({
      data: { category, title, message: opts?.message, href: opts?.href },
    });
  } catch (err) {
    console.error("[notifications] Failed to record notification:", err);
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    return await prisma.notification.count({ where: { read: false } });
  } catch {
    return 0;
  }
}
