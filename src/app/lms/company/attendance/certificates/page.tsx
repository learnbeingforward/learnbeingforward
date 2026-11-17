import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";
import { approveCertificate } from "@/lib/actions/certifications";
import { BackLink } from "@/components/lms/BackLink";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

function hrefFor(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return `/lms/company/attendance/certificates${s ? `?${s}` : ""}`;
}

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; collegeId?: string; semester?: string; q?: string }>;
}) {
  const { courseId, collegeId, semester, q } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.attendance");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const enrollments = await prisma.enrollment.findMany({
    include: { student: true, course: true, college: true, attendanceRecords: true, certification: true },
    orderBy: { enrolledAt: "desc" },
  });

  const awaiting = enrollments
    .map((e) => {
      const total = e.attendanceRecords.length || e.totalClasses;
      const present = e.attendanceRecords.filter((r) => r.present).length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      return { enrollment: e, pct };
    })
    .filter(({ enrollment, pct }) => {
      const status = enrollment.certification?.status ?? "NOT_ELIGIBLE";
      const eligible = pct >= ATTENDANCE_THRESHOLD || !!enrollment.certification?.overrideApproved;
      return status !== "ISSUED" && eligible;
    });

  // Search: a flat match across every pending-eligible student, shown as its
  // own "pops to the top" results block regardless of where you are in the
  // course/college/semester drill-down below.
  const searchQuery = (q ?? "").trim().toLowerCase();
  const searchResults = searchQuery
    ? awaiting.filter(({ enrollment }) => enrollment.student.name.toLowerCase().includes(searchQuery))
    : [];

  function StudentRow({ enrollment, pct }: { enrollment: (typeof awaiting)[number]["enrollment"]; pct: number }) {
    return (
      <li key={enrollment.id} className="list-row" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="grow">
          <div className="strong">{enrollment.student.name}</div>
          <div className="small muted">
            {enrollment.course.name} · {enrollment.college?.name ?? "No college"}
            {enrollment.student.semester ? ` · Sem ${enrollment.student.semester}` : ""} · {pct}% attendance
          </div>
        </div>
        <form action={approveCertificate.bind(null, enrollment.id)}>
          <button className="btn btn-primary btn-sm" type="submit">Approve Certificate</button>
        </form>
      </li>
    );
  }

  const searchForm = (
    <form style={{ display: "flex", gap: 8 }}>
      {courseId && <input type="hidden" name="courseId" value={courseId} />}
      {collegeId && <input type="hidden" name="collegeId" value={collegeId} />}
      {semester && <input type="hidden" name="semester" value={semester} />}
      <input className="input" type="search" name="q" defaultValue={q ?? ""} placeholder="Search student by name…" style={{ minWidth: 220 }} />
      <button className="btn btn-sm" type="submit">Search</button>
    </form>
  );

  // ---------- Level 4: a specific semester's pending students ----------
  if (courseId && collegeId && semester) {
    const course = awaiting.find((r) => r.enrollment.courseId === courseId)?.enrollment.course;
    const college = awaiting.find((r) => r.enrollment.collegeId === collegeId)?.enrollment.college;
    const rows = awaiting.filter(
      (r) =>
        r.enrollment.courseId === courseId &&
        r.enrollment.collegeId === collegeId &&
        (semester === "none" ? !r.enrollment.student.semester : String(r.enrollment.student.semester) === semester)
    );
    return (
      <AppShell
        nav={nav}
        active="attendance"
        user={shellUser}
        hasUnread={hasUnread}
        crumb="Overview › Attendance › Certificates"
        title={`${course?.name ?? "Course"} — ${college?.name ?? "College"} — Sem ${semester === "none" ? "—" : semester}`}
        subtitle={`${rows.length} student${rows.length !== 1 ? "s" : ""} awaiting certificate approval`}
        actions={searchForm}
      >
        <BackLink href={hrefFor({ courseId, collegeId })} label="Back to semesters" />
        {searchQuery && (
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 12 }}>Search results ({searchResults.length})</h2>
            <ul className="list">{searchResults.map(({ enrollment, pct }) => <StudentRow key={enrollment.id} enrollment={enrollment} pct={pct} />)}</ul>
          </section>
        )}
        <section className="card">
          {rows.length === 0 ? <p className="empty">Nothing pending here.</p> : <ul className="list">{rows.map(({ enrollment, pct }) => <StudentRow key={enrollment.id} enrollment={enrollment} pct={pct} />)}</ul>}
        </section>
      </AppShell>
    );
  }

  // ---------- Level 3: semesters within a course + college ----------
  if (courseId && collegeId) {
    const course = awaiting.find((r) => r.enrollment.courseId === courseId)?.enrollment.course;
    const college = awaiting.find((r) => r.enrollment.collegeId === collegeId)?.enrollment.college;
    const scoped = awaiting.filter((r) => r.enrollment.courseId === courseId && r.enrollment.collegeId === collegeId);
    const semesters = new Map<string, number>();
    for (const r of scoped) {
      const key = r.enrollment.student.semester ? String(r.enrollment.student.semester) : "none";
      semesters.set(key, (semesters.get(key) ?? 0) + 1);
    }
    return (
      <AppShell
        nav={nav}
        active="attendance"
        user={shellUser}
        hasUnread={hasUnread}
        crumb="Overview › Attendance › Certificates"
        title={`${course?.name ?? "Course"} — ${college?.name ?? "College"}`}
        subtitle="Choose a semester"
        actions={searchForm}
      >
        <BackLink href={hrefFor({ courseId })} label="Back to colleges" />
        {searchQuery && (
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 12 }}>Search results ({searchResults.length})</h2>
            <ul className="list">{searchResults.map(({ enrollment, pct }) => <StudentRow key={enrollment.id} enrollment={enrollment} pct={pct} />)}</ul>
          </section>
        )}
        <section className="card">
          <div className="grid" style={{ ["--min" as string]: "180px" }}>
            {Array.from(semesters.entries()).map(([sem, count]) => (
              <Link key={sem} className="list-row" href={hrefFor({ courseId, collegeId, semester: sem })}>
                <span className="grow">
                  <span className="strong" style={{ display: "block" }}>{sem === "none" ? "No semester set" : `Semester ${sem}`}</span>
                  <span className="small muted">{count} pending</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </AppShell>
    );
  }

  // ---------- Level 2: colleges within a course ----------
  if (courseId) {
    const course = awaiting.find((r) => r.enrollment.courseId === courseId)?.enrollment.course;
    const scoped = awaiting.filter((r) => r.enrollment.courseId === courseId);
    const colleges = new Map<string, { name: string; count: number }>();
    for (const r of scoped) {
      const id = r.enrollment.collegeId ?? "none";
      const name = r.enrollment.college?.name ?? "No college";
      const entry = colleges.get(id) ?? { name, count: 0 };
      entry.count += 1;
      colleges.set(id, entry);
    }
    return (
      <AppShell
        nav={nav}
        active="attendance"
        user={shellUser}
        hasUnread={hasUnread}
        crumb="Overview › Attendance › Certificates"
        title={course?.name ?? "Course"}
        subtitle="Choose a college"
        actions={searchForm}
      >
        <BackLink href={hrefFor({})} label="Back to courses" />
        {searchQuery && (
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 12 }}>Search results ({searchResults.length})</h2>
            <ul className="list">{searchResults.map(({ enrollment, pct }) => <StudentRow key={enrollment.id} enrollment={enrollment} pct={pct} />)}</ul>
          </section>
        )}
        <section className="card">
          <div className="grid" style={{ ["--min" as string]: "220px" }}>
            {Array.from(colleges.entries()).map(([id, c]) => (
              <Link key={id} className="list-row" href={hrefFor({ courseId, collegeId: id })}>
                <span className="grow">
                  <span className="strong" style={{ display: "block" }}>{c.name}</span>
                  <span className="small muted">{c.count} pending</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </AppShell>
    );
  }

  // ---------- Level 1: courses ----------
  const courses = new Map<string, { name: string; count: number }>();
  for (const r of awaiting) {
    const entry = courses.get(r.enrollment.courseId) ?? { name: r.enrollment.course.name, count: 0 };
    entry.count += 1;
    courses.set(r.enrollment.courseId, entry);
  }

  return (
    <AppShell
      nav={nav}
      active="attendance"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Attendance › Certificates"
      title="Certificates — eligible, not yet issued"
      subtitle={`${awaiting.length} total, segregated by course`}
      actions={searchForm}
    >
      <BackLink href="/lms/company/attendance" label="Back to Attendance" />
      {searchQuery && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 12 }}>Search results ({searchResults.length})</h2>
          {searchResults.length === 0 ? (
            <p className="empty">No pending student matches &quot;{q}&quot;.</p>
          ) : (
            <ul className="list">{searchResults.map(({ enrollment, pct }) => <StudentRow key={enrollment.id} enrollment={enrollment} pct={pct} />)}</ul>
          )}
        </section>
      )}
      <section className="card">
        {courses.size === 0 ? (
          <p className="empty">Nothing pending right now.</p>
        ) : (
          <div className="grid" style={{ ["--min" as string]: "220px" }}>
            {Array.from(courses.entries()).map(([id, c]) => (
              <Link key={id} className="list-row" href={hrefFor({ courseId: id })}>
                <span className="icon-box navy" style={{ fontWeight: 700 }}>{c.name.slice(0, 1)}</span>
                <span className="grow">
                  <span className="strong" style={{ display: "block" }}>{c.name}</span>
                  <span className="small muted">{c.count} pending</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
