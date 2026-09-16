import { Users, TrendingUp, BookOpenCheck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

export default async function CollegeDashboardPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId;

  const students = await prisma.user.findMany({
    where: { role: "STUDENT", ...(collegeId ? { collegeId } : {}) },
    include: {
      enrollments: {
        include: { course: true, attendanceRecords: true, certification: true },
      },
    },
    orderBy: { name: "asc" },
  });

  type Row = {
    studentId: string;
    studentName: string;
    courseName: string;
    present: number;
    total: number;
    pct: number;
    eligible: boolean;
  };

  const rows: Row[] = students.flatMap((student) =>
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

  const totalStudents = students.length;
  const avgAttendance =
    rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.pct, 0) / rows.length) : 0;

  const byCourse = new Map<string, { count: number; totalPct: number }>();
  for (const row of rows) {
    const entry = byCourse.get(row.courseName) ?? { count: 0, totalPct: 0 };
    entry.count += 1;
    entry.totalPct += row.pct;
    byCourse.set(row.courseName, entry);
  }

  return (
    <DashboardShell title="College Dashboard" subtitle="Campus overview">
      <div className="mb-8 grid gap-5 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
            <Users className="size-5.5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">Students Enrolled</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
            <TrendingUp className="size-5.5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo">{avgAttendance}%</p>
            <p className="text-xs text-muted-foreground">Average Attendance</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
            <BookOpenCheck className="size-5.5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo">{byCourse.size}</p>
            <p className="text-xs text-muted-foreground">Courses Active</p>
          </div>
        </div>
      </div>

      {byCourse.size > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-white p-6">
          <p className="mb-4 text-sm font-semibold text-indigo">Breakdown by Course</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from(byCourse.entries()).map(([course, data]) => (
              <div
                key={course}
                className="flex items-center justify-between rounded-lg border border-border bg-cream px-4 py-3 text-sm"
              >
                <span className="font-medium text-indigo">{course}</span>
                <span className="text-muted-foreground">
                  {data.count} student{data.count !== 1 ? "s" : ""} &middot;{" "}
                  {Math.round(data.totalPct / data.count)}% avg
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Enrolled Students</p>
        </div>

        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No students enrolled yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Certification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={`${row.studentId}-${i}`}>
                  <TableCell className="font-medium text-indigo">{row.studentName}</TableCell>
                  <TableCell className="text-muted-foreground">{row.courseName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.present}/{row.total} ({row.pct}%)
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        row.eligible
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      }
                    >
                      {row.eligible ? "Eligible" : "Not Yet Eligible"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardShell>
  );
}
