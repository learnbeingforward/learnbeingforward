import { prisma } from "@/lib/prisma";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

export type SessionRecord = {
  id: string;
  date: Date;
  present: boolean;
  topic: string | null;
};

export type EnrollmentProgress = {
  enrollmentId: string;
  collegeId: string | null;
  studentName: string;
  courseName: string;
  trainerName: string | null;
  batchName: string | null;
  totalClasses: number;
  held: number;
  present: number;
  pct: number;
  threshold: number;
  certificationStatus: "NOT_ELIGIBLE" | "ELIGIBLE" | "ISSUED";
  overrideApproved: boolean;
  sessions: SessionRecord[];
};

export async function getEnrollmentProgress(enrollmentId: string): Promise<EnrollmentProgress | null> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      student: true,
      course: true,
      trainer: true,
      batch: true,
      certification: true,
      attendanceRecords: {
        include: { trainingSession: { include: { courseModule: true } } },
        orderBy: { classDate: "asc" },
      },
    },
  });
  if (!enrollment) return null;

  const held = enrollment.attendanceRecords.length;
  const present = enrollment.attendanceRecords.filter((r) => r.present).length;
  const pct = held > 0 ? Math.round((present / held) * 100) : 0;
  const eligible = pct >= ATTENDANCE_THRESHOLD || !!enrollment.certification?.overrideApproved;

  return {
    enrollmentId: enrollment.id,
    collegeId: enrollment.collegeId,
    studentName: enrollment.student.name,
    courseName: enrollment.course.name,
    trainerName: enrollment.trainer?.name ?? null,
    batchName: enrollment.batch?.name ?? null,
    totalClasses: enrollment.totalClasses,
    held,
    present,
    pct,
    threshold: ATTENDANCE_THRESHOLD,
    certificationStatus:
      enrollment.certification?.status ?? (eligible ? "ELIGIBLE" : "NOT_ELIGIBLE"),
    overrideApproved: !!enrollment.certification?.overrideApproved,
    sessions: enrollment.attendanceRecords.map((r) => ({
      id: r.id,
      date: r.classDate,
      present: r.present,
      topic: r.trainingSession?.courseModule?.title ?? r.trainingSession?.topic ?? null,
    })),
  };
}
