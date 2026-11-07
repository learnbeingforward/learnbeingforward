"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getViewerKeys } from "@/lib/employee-access";
import { notificationVisibleTo, type NotificationCategory } from "@/lib/notifications";

function revalidateNotificationPaths() {
  revalidatePath("/lms/company/notifications");
  revalidatePath("/lms/company/notifications/[category]", "page");
}

export async function markNotificationRead(id: string) {
  const keys = await getViewerKeys();
  const n = await prisma.notification.findUnique({ where: { id } });
  if (!n || !notificationVisibleTo(n, keys)) throw new Error("Not authorized.");

  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidateNotificationPaths();
}

export async function markAllNotificationsRead(category?: NotificationCategory) {
  const keys = await getViewerKeys();
  if (keys.length === 0) throw new Error("Not authorized.");

  const candidates = await prisma.notification.findMany({
    where: { read: false, ...(category ? { category } : {}) },
    select: { id: true, category: true, requiredKey: true },
  });
  const ids = candidates.filter((n) => notificationVisibleTo(n, keys)).map((n) => n.id);
  if (ids.length > 0) {
    await prisma.notification.updateMany({ where: { id: { in: ids } }, data: { read: true } });
  }
  revalidateNotificationPaths();
}
