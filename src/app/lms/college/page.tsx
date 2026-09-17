import Link from "next/link";
import { Users, TrendingUp, BookOpenCheck } from "lucide-react";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCollegeStudentRows, summarizeByCourse } from "@/lib/college-data";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { AttendanceBarChart } from "@/components/charts/AttendanceCharts";

export default async function CollegeDashboardPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId;

  const { students, rows } = await getCollegeStudentRows(collegeId);
  const byCourse = summarizeByCourse(rows);

  const totalStudents = students.length;
  const avgAttendance =
    rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.pct, 0) / rows.length) : 0;
  const chartData = Array.from(byCourse.entries()).map(([name, data]) => ({
    name,
    pct: Math.round(data.totalPct / data.count),
  }));

  return (
    <DashboardShell title="College Dashboard" subtitle="Campus overview" navLinks={navLinks}>
      <div className="mb-8 grid gap-5 sm:grid-cols-3">
        <Link
          href="/lms/college/students?view=all"
          className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
        >
          <div className="flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
            <Users className="size-5.5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">Students Enrolled</p>
          </div>
        </Link>

        <a
          href="#attendance-by-course"
          className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
        >
          <div className="flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
            <TrendingUp className="size-5.5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo">{avgAttendance}%</p>
            <p className="text-xs text-muted-foreground">Average Attendance</p>
          </div>
        </a>

        <Link
          href="/lms/college/courses"
          className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
        >
          <div className="flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
            <BookOpenCheck className="size-5.5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo">{byCourse.size}</p>
            <p className="text-xs text-muted-foreground">Courses Active</p>
          </div>
        </Link>
      </div>

      {byCourse.size > 0 && (
        <>
          <div id="attendance-by-course" className="mb-8 rounded-xl border border-border bg-white p-6">
            <p className="mb-2 text-sm font-semibold text-indigo">Average Attendance by Course</p>
            <AttendanceBarChart data={chartData} />
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <p className="mb-4 text-sm font-semibold text-indigo">Breakdown by Course</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from(byCourse.entries()).map(([course, data]) => (
                <Link
                  key={course}
                  href="/lms/college/courses"
                  className="flex items-center justify-between rounded-lg border border-border bg-cream px-4 py-3 text-sm transition-colors hover:border-indigo/40"
                >
                  <span className="font-medium text-indigo">{course}</span>
                  <span className="text-muted-foreground">
                    {data.count} student{data.count !== 1 ? "s" : ""} &middot;{" "}
                    {Math.round(data.totalPct / data.count)}% avg
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
