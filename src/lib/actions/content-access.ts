"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requestContentAccess(courseContentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("Only students can request content access.");
  }

  const existing = await prisma.contentAccessRequest.findUnique({
    where: { studentId_courseContentId: { studentId: session.user.id, courseContentId } },
  });
  if (existing) return;

  await prisma.contentAccessRequest.create({
    data: { studentId: session.user.id, courseContentId },
  });

  revalidatePath("/lms/student/content");
  revalidatePath("/lms/company/course-content");
}
