import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { getCollegeStudentRows, getStudentDetail, certificationBadge } from "@/lib/college-data";
import { getEnrollmentProgress } from "@/lib/enrollment-progress";
import { BackLink } from "@/components/lms/BackLink";
import { StudentSearchTable } from "@/components/lms/StudentSearchTable";
import { StudentDetailView } from "@/components/lms/StudentDetailView";
import { EnrollmentProgressView } from "@/components/lms/EnrollmentProgressView";

const BASE_PATH = "/lms/college/students";

export default async function CollegeStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; branch?: string; semester?: string; studentId?: string; enrollmentId?: string }>;
}) {
  const { view, branch, semester, studentId, enrollmentId } = await searchParams;
  const session = await auth();
  const collegeId = session!.user.collegeId;
  const college = await prisma.college.findUnique({ where: { id: collegeId! }, select: { name: true } });
  const shellUser = { name: college?.name ?? "College", subtitle: "College admin" };

  const shell = (active: string, crumb: string, title: string, subtitle: string, children: React.ReactNode) => (
    <AppShell nav={COLLEGE_NAV} active={active} user={shellUser} crumb={crumb} title={title} subtitle={subtitle}>
      {children}
    </AppShell>
  );

  if (studentId && enrollmentId) {
    const progress = await getEnrollmentProgress(enrollmentId);
    return shell(
      "students",
      "Students",
      "Enrollment Progress",
      "Session-by-session detail",
      <>
        <BackLink href={`${BASE_PATH}?studentId=${studentId}`} label="Back to Student" />
        {!progress || progress.collegeId !== collegeId ? (
          <p className="muted">This enrollment doesn&apos;t belong to your college.</p>
        ) : (
          <EnrollmentProgressView progress={progress} />
        )}
      </>
    );
  }

  if (studentId) {
    const detail = await getStudentDetail(studentId);
    return shell(
      "students",
      "Students",
      "Student",
      "Full profile",
      <>
        <BackLink href={BASE_PATH} label="Back to Students" />
        {!detail || detail.collegeId !== collegeId ? (
          <p className="muted">This student doesn&apos;t belong to your college.</p>
        ) : (
          <StudentDetailView student={detail} basePath={BASE_PATH} batchLinkBase={(batchId) => `/lms/college/batches?batchId=${batchId}`} />
        )}
      </>
    );
  }

  const { rows } = await getCollegeStudentRows(collegeId);

  if (rows.length === 0) {
    return shell("students", "Students", "Students", "Enrolled students", <div className="empty">No students enrolled yet.</div>);
  }

  if (view === "all") {
    return shell(
      "all-students",
      "Students › All students",
      "All Students",
      "Search across your college",
      <>
        <BackLink href="/lms/college/students" label="Back to browse by branch" />
        <section className="card">
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
              certificationStatus: r.certificationStatus,
              cvUrl: r.cvUrl,
            }))}
          />
        </section>
      </>
    );
  }

  if (branch && semester) {
    const scoped = rows.filter((r) => (r.branch ?? "Unspecified") === branch && String(r.semester ?? "Unspecified") === semester);
    return shell(
      "students",
      "Students › Browse by branch",
      `${branch} — Sem ${semester}`,
      "Students",
      <>
        <BackLink href={`/lms/college/students?branch=${encodeURIComponent(branch)}`} label="Back to semesters" />
        <section className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Attendance</th>
                  <th>Certification</th>
                  <th>CV</th>
                </tr>
              </thead>
              <tbody>
                {scoped.map((row, i) => {
                  const badge = certificationBadge(row.certificationStatus, row.eligible);
                  return (
                    <tr key={`${row.studentId}-${i}`}>
                      <td className="strong">
                        <Link href={`/lms/college/students?studentId=${row.studentId}`}>{row.studentName}</Link>
                      </td>
                      <td>{row.courseName}</td>
                      <td>
                        {row.present}/{row.total} ({row.pct}%)
                      </td>
                      <td>
                        <span className={`pill ${badge.pillClass}`}>{badge.label}</span>
                      </td>
                      <td>{row.cvUrl ? <a href={row.cvUrl} target="_blank" rel="noopener noreferrer">View CV</a> : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  if (branch) {
    // Dedupe by student — rows is one row per enrollment, so a student with
    // two enrollments in the same branch would otherwise be counted twice.
    const semesterStudents = new Map<string, Set<string>>();
    for (const r of rows) {
      if ((r.branch ?? "Unspecified") !== branch) continue;
      const key = String(r.semester ?? "Unspecified");
      if (!semesterStudents.has(key)) semesterStudents.set(key, new Set());
      semesterStudents.get(key)!.add(r.studentId);
    }
    const semesters = new Map<string, number>(Array.from(semesterStudents.entries()).map(([k, s]) => [k, s.size]));
    return shell(
      "students",
      "Students › Browse by branch",
      branch,
      "Semesters",
      <>
        <BackLink href="/lms/college/students" label="Back to all branches" />
        <section className="card">
          <div className="grid" style={{ ["--min" as string]: "240px" }}>
            {Array.from(semesters.entries()).map(([sem, count]) => (
              <Link key={sem} className="list-row" href={`/lms/college/students?branch=${encodeURIComponent(branch)}&semester=${sem}`}>
                <span className="grow">
                  <span className="strong" style={{ display: "block" }}>
                    {sem === "Unspecified" ? "Unspecified Semester" : `Semester ${sem}`}
                  </span>
                  <span className="small muted">{count} students</span>
                </span>
                <Icon name="chevR" size={16} />
              </Link>
            ))}
          </div>
        </section>
      </>
    );
  }

  // Dedupe by student — rows is one row per enrollment, so a student enrolled
  // in two courses would otherwise be counted twice in their branch's total
  // (this is what made the branch counts here disagree with Profile's, which
  // counts students directly).
  const branchStudents = new Map<string, Set<string>>();
  const allStudentIds = new Set<string>();
  for (const r of rows) {
    const key = r.branch ?? "Unspecified";
    if (!branchStudents.has(key)) branchStudents.set(key, new Set());
    branchStudents.get(key)!.add(r.studentId);
    allStudentIds.add(r.studentId);
  }
  const branches = new Map<string, number>(Array.from(branchStudents.entries()).map(([k, s]) => [k, s.size]));

  return shell(
    "students",
    "Students › Browse by branch",
    "Students",
    `${allStudentIds.size} students across ${branches.size} branches.`,
    <section className="card">
      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={16} />
          <input className="input" type="search" placeholder="Search any student" aria-label="Search any student" />
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-sm" href="/lms/college/students?view=all">
            View all students
          </Link>
          <Link className="btn btn-primary btn-sm" href="/lms/college/students/new">
            <Icon name="plus" size={16} />
            Add student
          </Link>
        </div>
      </div>
      <div className="grid" style={{ ["--min" as string]: "240px" }}>
        {Array.from(branches.entries()).map(([b, count]) => (
          <Link key={b} className="box hover stack" style={{ gap: 10, textDecoration: "none", color: "inherit" }} href={`/lms/college/students?branch=${encodeURIComponent(b)}`}>
            <div className="split">
              <span className="icon-box navy">
                <Icon name="users" size={20} />
              </span>
              <span className="pill gold">{count} students</span>
            </div>
            <h3 className="h3">{b}</h3>
            <span className="small" style={{ fontWeight: 600, color: "var(--navy)" }}>
              View students →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
