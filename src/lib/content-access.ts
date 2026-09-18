import { prisma } from "@/lib/prisma";

export async function getUnlockedContentForStudent(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, batchId: { not: null } },
    select: { batchId: true, courseId: true },
  });

  if (enrollments.length === 0) return [];

  const batchIds = enrollments.map((e) => e.batchId).filter((id): id is string => id !== null);

  const unlockedModules = await prisma.trainingSession.findMany({
    where: { batchId: { in: batchIds }, attendanceTaken: true, courseModuleId: { not: null } },
    select: { courseModuleId: true },
    distinct: ["courseModuleId"],
  });

  const unlockedModuleIds = unlockedModules
    .map((s) => s.courseModuleId)
    .filter((id): id is string => id !== null);

  if (unlockedModuleIds.length === 0) return [];

  return prisma.courseContent.findMany({
    where: { courseModuleId: { in: unlockedModuleIds } },
    include: { course: true, courseModule: true, courseSubModule: true, links: { orderBy: { order: "asc" } } },
    orderBy: { title: "asc" },
  });
}
