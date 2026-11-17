import { prisma } from "@/lib/prisma";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

/** Whether this student meets the attendance bar for the given course — the
 * same rule certification eligibility uses. Used to decide whether an admin
 * deciding a content-access request needs the extra "send to college"
 * option, or can just approve/reject directly like any other request. */
export async function getStudentCourseAttendance(studentId: string, courseId: string): Promise<{ pct: number; eligible: boolean }> {
  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId, courseId },
    include: { attendanceRecords: true, certification: true },
  });
  if (!enrollment) return { pct: 0, eligible: false };
  const total = enrollment.attendanceRecords.length || enrollment.totalClasses;
  const present = enrollment.attendanceRecords.filter((r) => r.present).length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const eligible = pct >= ATTENDANCE_THRESHOLD || !!enrollment.certification?.overrideApproved;
  return { pct, eligible };
}

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

/**
 * Trainer-uploaded content the admin has explicitly sent, filtered to only what
 * this specific student actually attended — a shared item is visible to a student
 * only if they have a present=true attendance record for a session that trainer
 * taught covering that exact module. Computed here at read time rather than stored
 * per student, so it always reflects real attendance.
 */
export async function getSharedTrainerContentForStudent(studentId: string) {
  const attendedSessions = await prisma.trainingSession.findMany({
    where: {
      courseModuleId: { not: null },
      attendanceRecords: { some: { present: true, enrollment: { studentId } } },
    },
    select: { trainerId: true, courseModuleId: true },
    distinct: ["trainerId", "courseModuleId"],
  });
  if (attendedSessions.length === 0) return [];

  const attendedSet = new Set(attendedSessions.map((s) => `${s.trainerId}::${s.courseModuleId}`));

  const shared = await prisma.sessionContent.findMany({
    where: { sharedWithStudents: true, courseModuleId: { not: null } },
    include: { trainer: true, course: true, courseModule: true, courseSubModule: true },
    orderBy: { sharedAt: "desc" },
  });

  return shared.filter((c) => attendedSet.has(`${c.trainerId}::${c.courseModuleId}`));
}

// Course book PDFs are a whole-course reference, not tied to a specific class session —
// visible to a student as soon as they're enrolled in the course, independent of the
// per-module attendance-based unlock above. Still gated behind its own access request.
export async function getCourseBooksForStudent(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    select: { courseId: true },
  });
  if (enrollments.length === 0) return [];

  const courseIds = enrollments.map((e) => e.courseId);

  return prisma.courseModule.findMany({
    where: { courseId: { in: courseIds }, mainPdfUrl: { not: null } },
    include: { course: true },
    orderBy: { title: "asc" },
  });
}
