import Link from "next/link";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCollegeStudentRows, getStudentDetail } from "@/lib/college-data";
import { BackLink } from "@/components/lms/BackLink";
import { StudentSearchTable } from "@/components/lms/StudentSearchTable";
import { StudentDetailView } from "@/components/lms/StudentDetailView";

export default async function CollegeStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; branch?: string; semester?: string; studentId?: string }>;
}) {
  const { view, branch, semester, studentId } = await searchParams;
  const session = await auth();
  const collegeId = session!.user.collegeId;

  if (studentId) {
    const detail = await getStudentDetail(studentId);
    return (
      <DashboardShell title="Student" subtitle="Full profile" navLinks={navLinks}>
        <BackLink href="/lms/college/students" label="Back to Students" />
        {!detail || detail.collegeId !== collegeId ? (
          <p className="text-sm text-muted-foreground">This student doesn&apos;t belong to your college.</p>
        ) : (
          <StudentDetailView student={detail} />
        )}
      </DashboardShell>
    );
  }

  const { rows } = await getCollegeStudentRows(collegeId);

  if (rows.length === 0) {
    return (
      <DashboardShell title="Students" subtitle="Enrolled students" navLinks={navLinks}>
        <p className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
          No students enrolled yet.
        </p>
      </DashboardShell>
    );
  }

  if (view === "all") {
    return (
      <DashboardShell title="All Students" subtitle="Search across your college" navLinks={navLinks}>
        <BackLink href="/lms/college/students" label="Back to browse by branch" />
        <StudentSearchTable
          rows={rows.map((r) => ({
            id: `${r.studentId}-${r.enrollmentId}`,
            studentId: r.studentId,
            name: r.studentName,
            email: r.studentEmail,
            branch: r.branch,
            semester: r.semester,
            courseName: r.courseName,
            pct: r.pct,
            eligible: r.eligible,
            cvUrl: r.cvUrl,
          }))}
        />
      </DashboardShell>
    );
  }

  if (branch && semester) {
    const scoped = rows.filter((r) => (r.branch ?? "Unspecified") === branch && String(r.semester ?? "Unspecified") === semester);
    return (
      <DashboardShell title={`${branch} — Sem ${semester}`} subtitle="Students" navLinks={navLinks}>
        <BackLink href={`/lms/college/students?branch=${encodeURIComponent(branch)}`} label="Back to semesters" />
        <div className="rounded-xl border border-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Certification</TableHead>
                <TableHead>CV</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoped.map((row, i) => (
                <TableRow key={`${row.studentId}-${i}`}>
                  <TableCell className="font-medium text-indigo">
                    <Link
                      href={`/lms/college/students?studentId=${row.studentId}`}
                      className="underline underline-offset-2 hover:text-indigo/70"
                    >
                      {row.studentName}
                    </Link>
                  </TableCell>
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
                  <TableCell>
                    {row.cvUrl ? (
                      <a href={row.cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo underline">
                        View CV
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardShell>
    );
  }

  if (branch) {
    const semesters = new Map<string, number>();
    for (const r of rows) {
      if ((r.branch ?? "Unspecified") !== branch) continue;
      const key = String(r.semester ?? "Unspecified");
      semesters.set(key, (semesters.get(key) ?? 0) + 1);
    }
    return (
      <DashboardShell title={branch} subtitle="Semesters" navLinks={navLinks}>
        <BackLink href="/lms/college/students" label="Back to all branches" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(semesters.entries()).map(([sem, count]) => (
            <Link
              key={sem}
              href={`/lms/college/students?branch=${encodeURIComponent(branch)}&semester=${sem}`}
              className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
            >
              <p className="font-semibold text-indigo">{sem === "Unspecified" ? "Unspecified Semester" : `Semester ${sem}`}</p>
              <p className="mt-1 text-sm text-muted-foreground">{count} students</p>
            </Link>
          ))}
        </div>
      </DashboardShell>
    );
  }

  const branches = new Map<string, number>();
  for (const r of rows) {
    const key = r.branch ?? "Unspecified";
    branches.set(key, (branches.get(key) ?? 0) + 1);
  }

  return (
    <DashboardShell title="Students" subtitle="Browse by branch" navLinks={navLinks}>
      <Link href="/lms/college/students?view=all" className="mb-6 inline-block text-sm text-indigo underline">
        View / search all students →
      </Link>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from(branches.entries()).map(([b, count]) => (
          <Link
            key={b}
            href={`/lms/college/students?branch=${encodeURIComponent(b)}`}
            className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
          >
            <p className="font-semibold text-indigo">{b}</p>
            <p className="mt-1 text-sm text-muted-foreground">{count} students</p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
