import Link from "next/link";
import { Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { getCollegeStudentRows, summarizeByCourse } from "@/lib/college-data";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { BulkEnrollStudentsForm } from "@/components/lms/BulkEnrollStudentsForm";

export default async function CollegeCoursesPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId;

  const { rows } = await getCollegeStudentRows(collegeId);
  const byCourse = summarizeByCourse(rows);

  const [pendingRequests, allCourses, activeStudents] = await Promise.all([
    collegeId
      ? prisma.enrollmentRequest.findMany({
          where: { collegeId, status: "PENDING" },
          include: { student: true, course: true },
          orderBy: { requestedAt: "asc" },
        })
      : Promise.resolve([]),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    collegeId
      ? prisma.user.findMany({
          where: { role: "STUDENT", collegeId, studentStatus: "ACTIVE" },
          select: { id: true, name: true, usn: true, branch: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  // Filtered by studentId rather than the enrollment/request's own collegeId field —
  // some older rows have that field unset or stale, which would otherwise make an
  // already-enrolled student wrongly show up as a bulk-enroll candidate again.
  const studentIds = activeStudents.map((s) => s.id);
  const [existingEnrollments, pendingByCourse] = await Promise.all([
    studentIds.length > 0
      ? prisma.enrollment.findMany({ where: { studentId: { in: studentIds } }, select: { studentId: true, courseId: true } })
      : Promise.resolve([]),
    studentIds.length > 0
      ? prisma.enrollmentRequest.findMany({
          where: { studentId: { in: studentIds }, status: "PENDING" },
          select: { studentId: true, courseId: true },
        })
      : Promise.resolve([]),
  ]);

  const enrolledSet = new Set(existingEnrollments.map((e) => `${e.studentId}::${e.courseId}`));
  const pendingSet = new Set(pendingByCourse.map((e) => `${e.studentId}::${e.courseId}`));
  const candidatesByCourse: Record<string, { id: string; name: string; usn: string | null; branch: string | null }[]> = {};
  for (const course of allCourses) {
    candidatesByCourse[course.id] = activeStudents.filter(
      (s) => !enrolledSet.has(`${s.id}::${course.id}`) && !pendingSet.has(`${s.id}::${course.id}`)
    );
  }

  const studentsByCourse = new Map<string, { name: string; studentId: string }[]>();
  for (const row of rows) {
    const list = studentsByCourse.get(row.courseName) ?? [];
    list.push({ name: row.studentName, studentId: row.studentId });
    studentsByCourse.set(row.courseName, list);
  }

  return (
    <DashboardShell title="Courses" subtitle="Course activity" navLinks={navLinks}>
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
          Enroll Students in a Course
        </h2>
        <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
          Pick a course, then select students — grouped by branch, with a select-all per branch — to request
          enrollment for all of them at once instead of one by one. The company still needs to approve each
          request before it becomes active.
        </p>
        <BulkEnrollStudentsForm courses={allCourses.map((c) => ({ id: c.id, name: c.name }))} candidatesByCourse={candidatesByCourse} />
      </div>

      {pendingRequests.length > 0 && (
        <div className="mb-8 rounded-xl border border-gold/40 bg-gold/10 p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo">
            <Clock className="size-4" /> Awaiting company approval
          </p>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm"
              >
                <span className="text-indigo">
                  <strong>{req.student.name}</strong> requested {req.course.name}
                </span>
                <Badge className="bg-gold/20 text-indigo hover:bg-gold/20">Pending</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {byCourse.size === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No active courses yet.
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byCourse.entries()).map(([course, data]) => (
            <div key={course} className="rounded-xl border border-border bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-indigo">{course}</h3>
                <span className="text-sm text-muted-foreground">
                  {data.count} student{data.count !== 1 ? "s" : ""} &middot;{" "}
                  {Math.round(data.totalPct / data.count)}% avg attendance
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(studentsByCourse.get(course) ?? []).map((s, i) => (
                  <Link
                    key={`${s.studentId}-${i}`}
                    href={`/lms/college/students?studentId=${s.studentId}`}
                    className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-indigo/80 hover:bg-indigo/10"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
