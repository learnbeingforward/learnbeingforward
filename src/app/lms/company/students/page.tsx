import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { StudentSearchTable } from "@/components/lms/StudentSearchTable";
import { StudentDetailView } from "@/components/lms/StudentDetailView";
import { EnrollmentProgressView } from "@/components/lms/EnrollmentProgressView";
import { BackLink } from "@/components/lms/BackLink";
import { getStudentDetail } from "@/lib/college-data";
import { getEnrollmentProgress } from "@/lib/enrollment-progress";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

const BASE_PATH = "/lms/company/students";

export default async function CompanyAllStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; enrollmentId?: string }>;
}) {
  const { studentId, enrollmentId } = await searchParams;
  const { navLinks } = await requireCompanyPageAccess("accounts.students");

  if (studentId && enrollmentId) {
    const progress = await getEnrollmentProgress(enrollmentId);
    return (
      <DashboardShell title="Enrollment Progress" subtitle="Session-by-session detail" navLinks={navLinks}>
        <BackLink href={`${BASE_PATH}?studentId=${studentId}`} label="Back to Student" />
        {!progress ? (
          <p className="text-sm text-muted-foreground">This enrollment no longer exists.</p>
        ) : (
          <EnrollmentProgressView progress={progress} />
        )}
      </DashboardShell>
    );
  }

  if (studentId) {
    const detail = await getStudentDetail(studentId);
    return (
      <DashboardShell title="Student" subtitle="Full profile" navLinks={navLinks}>
        <BackLink href={BASE_PATH} label="Back to All Students" />
        {!detail ? (
          <p className="text-sm text-muted-foreground">This student no longer exists.</p>
        ) : (
          <StudentDetailView
            student={detail}
            basePath={BASE_PATH}
            batchLinkBase={(batchId, batchCollegeId) => `/lms/company/trainers/batches?collegeId=${batchCollegeId}&batchId=${batchId}`}
            canDelete
          />
        )}
      </DashboardShell>
    );
  }

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
            studentId: student.id,
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
            studentId: student.id,
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
