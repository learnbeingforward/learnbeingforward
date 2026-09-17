import Link from "next/link";
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
import { BackLink } from "@/components/lms/BackLink";

export default async function CompanyAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ collegeId?: string; batchId?: string }>;
}) {
  const { collegeId, batchId } = await searchParams;

  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: true,
      course: true,
      college: true,
      trainer: true,
      batch: true,
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

  function chartFor(rowSet: typeof rows) {
    const byCourse = new Map<string, { count: number; totalPct: number }>();
    for (const row of rowSet) {
      const key = row.enrollment.course.name;
      const entry = byCourse.get(key) ?? { count: 0, totalPct: 0 };
      entry.count += 1;
      entry.totalPct += row.pct;
      byCourse.set(key, entry);
    }
    return Array.from(byCourse.entries()).map(([name, data]) => ({
      name,
      pct: Math.round(data.totalPct / data.count),
    }));
  }

  // Level 2: a specific batch within a college
  if (collegeId && batchId) {
    const batchRows = rows.filter((r) => r.enrollment.batchId === batchId);
    const batch = batchRows[0]?.enrollment.batch;
    const college = batchRows[0]?.enrollment.college;

    return (
      <DashboardShell title={batch?.name ?? "Batch"} subtitle={college?.name ?? "Attendance"} navLinks={navLinks}>
        <BackLink href={`/lms/company/attendance?collegeId=${collegeId}`} label={`Back to ${college?.name ?? "college"}`} />
        <div className="rounded-xl border border-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead>CV</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchRows.map(({ enrollment, total, present, pct }) => {
                const eligible = pct >= ATTENDANCE_THRESHOLD || enrollment.certification?.overrideApproved;
                const status = enrollment.certification?.status ?? "NOT_ELIGIBLE";

                return (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium text-indigo">{enrollment.student.name}</TableCell>
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
                    <TableCell>
                      {enrollment.student.cvUrl ? (
                        <a
                          href={enrollment.student.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo underline"
                        >
                          View CV
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
      </DashboardShell>
    );
  }

  // Level 1: batches within a specific college
  if (collegeId) {
    const collegeRows = rows.filter((r) => r.enrollment.collegeId === collegeId);
    const college = collegeRows[0]?.enrollment.college;
    const batches = new Map<string, { name: string; count: number }>();
    for (const r of collegeRows) {
      if (!r.enrollment.batchId || !r.enrollment.batch) continue;
      const entry = batches.get(r.enrollment.batchId) ?? { name: r.enrollment.batch.name, count: 0 };
      entry.count += 1;
      batches.set(r.enrollment.batchId, entry);
    }

    return (
      <DashboardShell title={college?.name ?? "College"} subtitle="Attendance by batch" navLinks={navLinks}>
        <BackLink href="/lms/company/attendance" label="Back to all colleges" />

        {collegeRows.length > 0 && (
          <div className="mb-8 rounded-xl border border-border bg-white p-6">
            <p className="mb-2 text-sm font-semibold text-indigo">Average Attendance by Course</p>
            <AttendanceBarChart data={chartFor(collegeRows)} />
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(batches.entries()).map(([id, b]) => (
            <Link
              key={id}
              href={`/lms/company/attendance?collegeId=${collegeId}&batchId=${id}`}
              className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
            >
              <p className="font-semibold text-indigo">{b.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{b.count} students</p>
            </Link>
          ))}
          {batches.size === 0 && (
            <p className="text-sm text-muted-foreground">No batched enrollments for this college yet.</p>
          )}
        </div>
      </DashboardShell>
    );
  }

  // Level 0: all colleges
  const colleges = new Map<string, { name: string; count: number }>();
  for (const r of rows) {
    if (!r.enrollment.collegeId || !r.enrollment.college) continue;
    const entry = colleges.get(r.enrollment.collegeId) ?? { name: r.enrollment.college.name, count: 0 };
    entry.count += 1;
    colleges.set(r.enrollment.collegeId, entry);
  }

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
            <AttendanceBarChart data={chartFor(rows)} />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            By College
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from(colleges.entries()).map(([id, c]) => (
              <Link
                key={id}
                href={`/lms/company/attendance?collegeId=${id}`}
                className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
              >
                <p className="font-semibold text-indigo">{c.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.count} enrollments</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
