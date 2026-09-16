import { prisma } from "@/lib/prisma";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

export type StudentRow = {
  studentId: string;
  studentName: string;
  courseName: string;
  present: number;
  total: number;
  pct: number;
  eligible: boolean;
};

export async function getCollegeStudentRows(collegeId: string | null) {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT", ...(collegeId ? { collegeId } : {}) },
    include: {
      enrollments: {
        include: { course: true, attendanceRecords: true, certification: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const rows: StudentRow[] = students.flatMap((student) =>
    student.enrollments.map((enrollment) => {
      const total = enrollment.attendanceRecords.length || enrollment.totalClasses;
      const present = enrollment.attendanceRecords.filter((r) => r.present).length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        studentId: student.id,
        studentName: student.name,
        courseName: enrollment.course.name,
        present,
        total,
        pct,
        eligible: pct >= ATTENDANCE_THRESHOLD,
      };
    })
  );

  return { students, rows };
}

export function summarizeByCourse(rows: StudentRow[]) {
  const byCourse = new Map<string, { count: number; totalPct: number }>();
  for (const row of rows) {
    const entry = byCourse.get(row.courseName) ?? { count: 0, totalPct: 0 };
    entry.count += 1;
    entry.totalPct += row.pct;
    byCourse.set(row.courseName, entry);
  }
  return byCourse;
}
