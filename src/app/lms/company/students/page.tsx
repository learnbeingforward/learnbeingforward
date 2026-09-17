import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { StudentSearchTable } from "@/components/lms/StudentSearchTable";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

export default async function CompanyAllStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      college: true,
      enrollments: { include: { course: true, attendanceRecords: true, certification: true } },
    },
    orderBy: { name: "asc" },
  });

  const rows = students.flatMap((student) =>
    student.enrollments.length > 0
      ? student.enrollments.map((enrollment) => {
          const total = enrollment.attendanceRecords.length || enrollment.totalClasses;
          const present = enrollment.attendanceRecords.filter((r) => r.present).length;
          const pct = total > 0 ? Math.round((present / total) * 100) : 0;
          const eligible = pct >= ATTENDANCE_THRESHOLD || enrollment.certification?.overrideApproved;
          return {
            id: `${student.id}-${enrollment.id}`,
            name: student.name,
            email: student.email,
            collegeName: student.college?.name ?? "—",
            branch: student.branch,
            semester: student.semester,
            courseName: enrollment.course.name,
            pct,
            eligible: Boolean(eligible),
            cvUrl: student.cvUrl,
          };
        })
      : [
          {
            id: student.id,
            name: student.name,
            email: student.email,
            collegeName: student.college?.name ?? "—",
            branch: student.branch,
            semester: student.semester,
            courseName: "—",
            pct: 0,
            eligible: false,
            cvUrl: student.cvUrl,
          },
        ]
  );

  return (
    <DashboardShell title="All Students" subtitle="Every student, every college" navLinks={navLinks}>
      <StudentSearchTable rows={rows} showCollege />
    </DashboardShell>
  );
}
