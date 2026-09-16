import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendanceBarChart } from "@/components/charts/AttendanceCharts";
import { approveCertificate } from "@/lib/actions/certifications";

export default async function CompanyAttendancePage() {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: true,
      course: true,
      college: true,
      trainer: true,
      attendanceRecords: true,
      certification: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  const rows = enrollments.map((e) => {
    const total = e.attendanceRecords.length || e.totalClasses;
    const present = e.attendanceRecords.filter((r) => r.present).length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    return { enrollment: e, total, present, pct };
  });

  const byCourse = new Map<string, { count: number; totalPct: number }>();
  for (const row of rows) {
    const key = row.enrollment.course.name;
    const entry = byCourse.get(key) ?? { count: 0, totalPct: 0 };
    entry.count += 1;
    entry.totalPct += row.pct;
    byCourse.set(key, entry);
  }
  const chartData = Array.from(byCourse.entries()).map(([name, data]) => ({
    name,
    pct: Math.round(data.totalPct / data.count),
  }));

  return (
    <DashboardShell title="Attendance" subtitle="Platform-wide progress" navLinks={navLinks}>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No enrollments yet.
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-xl border border-border bg-white p-6">
            <p className="mb-2 text-sm font-semibold text-indigo">Average Attendance by Course</p>
            <AttendanceBarChart data={chartData} />
          </div>

          <div className="rounded-xl border border-border bg-white">
            <div className="border-b border-border p-6">
              <p className="text-sm font-semibold text-indigo">All Enrollments</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ enrollment, total, present, pct }) => {
                  const eligible = pct >= ATTENDANCE_THRESHOLD;
                  const status = enrollment.certification?.status ?? "NOT_ELIGIBLE";

                  return (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium text-indigo">{enrollment.student.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {enrollment.college?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{enrollment.course.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {enrollment.trainer?.name ?? "Unassigned"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {present}/{total} ({pct}%)
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            status === "ISSUED"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : eligible
                                ? "bg-gold/20 text-indigo hover:bg-gold/20"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          }
                        >
                          {status === "ISSUED" ? "Issued" : eligible ? "Eligible" : "Not Yet Eligible"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {status === "ISSUED" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="size-3.5" /> Approved
                          </span>
                        ) : eligible ? (
                          <form action={approveCertificate.bind(null, enrollment.id)}>
                            <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                              Approve Certificate
                            </Button>
                          </form>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
