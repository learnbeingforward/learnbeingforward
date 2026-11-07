"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyAccess } from "@/lib/employee-access";
import type { NotificationCategory } from "@/lib/notifications";

function revalidateNotificationPaths() {
  revalidatePath("/lms/company/notifications");
  revalidatePath("/lms/company/notifications/[category]", "page");
}

export async function markNotificationRead(id: string) {
  await requireCompanyAccess("overview.notifications");
  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidateNotificationPaths();
}

export async function markAllNotificationsRead(category?: NotificationCategory) {
  await requireCompanyAccess("overview.notifications");
  await prisma.notification.updateMany({ where: { read: false, ...(category ? { category } : {}) }, data: { read: true } });
  revalidateNotificationPaths();
}
