"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyAccess } from "@/lib/employee-access";

export async function markNotificationRead(id: string) {
  await requireCompanyAccess("overview.notifications");
  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/lms/company/notifications");
}

export async function markAllNotificationsRead() {
  await requireCompanyAccess("overview.notifications");
  await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/lms/company/notifications");
}
