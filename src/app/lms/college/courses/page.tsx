import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { getCollegeStudentRows, summarizeByCourse } from "@/lib/college-data";
import { BulkEnrollStudentsForm } from "@/components/lms/BulkEnrollStudentsForm";

export default async function CollegeCoursesPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId;
  const college = await prisma.college.findUnique({ where: { id: collegeId! }, select: { name: true } });
  const shellUser = { name: college?.name ?? "College", subtitle: "College admin" };

  const { rows } = await getCollegeStudentRows(collegeId);
  const byCourse = summarizeByCourse(rows);

  const [pendingRequests, allCourses, activeStudents] = await Promise.all([
    collegeId
      ? prisma.enrollmentRequest.findMany({ where: { collegeId, status: "PENDING" }, include: { student: true, course: true }, orderBy: { requestedAt: "asc" } })
      : Promise.resolve([]),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    collegeId
      ? prisma.user.findMany({ where: { role: "STUDENT", collegeId, studentStatus: "ACTIVE" }, select: { id: true, name: true, usn: true, branch: true }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ]);

  const studentIds = activeStudents.map((s) => s.id);
  const [existingEnrollments, pendingByCourse] = await Promise.all([
    studentIds.length > 0 ? prisma.enrollment.findMany({ where: { studentId: { in: studentIds } }, select: { studentId: true, courseId: true } }) : Promise.resolve([]),
    studentIds.length > 0 ? prisma.enrollmentRequest.findMany({ where: { studentId: { in: studentIds }, status: "PENDING" }, select: { studentId: true, courseId: true } }) : Promise.resolve([]),
  ]);

  const enrolledSet = new Set(existingEnrollments.map((e) => `${e.studentId}::${e.courseId}`));
  const pendingSet = new Set(pendingByCourse.map((e) => `${e.studentId}::${e.courseId}`));
  const candidatesByCourse: Record<string, { id: string; name: string; usn: string | null; branch: string | null }[]> = {};
  for (const course of allCourses) {
    candidatesByCourse[course.id] = activeStudents.filter((s) => !enrolledSet.has(`${s.id}::${course.id}`) && !pendingSet.has(`${s.id}::${course.id}`));
  }

  const studentsByCourse = new Map<string, { name: string; studentId: string }[]>();
  for (const row of rows) {
    const list = studentsByCourse.get(row.courseName) ?? [];
    list.push({ name: row.studentName, studentId: row.studentId });
    studentsByCourse.set(row.courseName, list);
  }

  return (
    <AppShell nav={COLLEGE_NAV} active="courses" user={shellUser} crumb="Courses" title="Courses" subtitle="Enroll many students into a course at once. The company approves each request.">
      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Enroll students in a course
          </h2>
          <BulkEnrollStudentsForm courses={allCourses.map((c) => ({ id: c.id, name: c.name }))} candidatesByCourse={candidatesByCourse} />

          {pendingRequests.length > 0 && (
            <div className="alert gold" style={{ marginTop: 20 }}>
              <Icon name="clock" size={18} className="shrink-0" />
              <span style={{ display: "block" }}>
                <strong>Awaiting company approval</strong>
                <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="split" style={{ background: "#fff", borderRadius: 8, padding: "8px 12px" }}>
                      <span>
                        <strong>{req.student.name}</strong> requested {req.course.name}
                      </span>
                      <span className="pill gold">Pending</span>
                    </div>
                  ))}
                </div>
              </span>
            </div>
          )}
        </section>

        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Course activity
          </h2>
          {byCourse.size === 0 ? (
            <p className="muted">No active courses yet.</p>
          ) : (
            <ul className="list">
              {Array.from(byCourse.entries()).map(([course, data]) => {
                const pct = Math.round(data.totalPct / data.count);
                return (
                  <li key={course} className="box" style={{ padding: 14 }}>
                    <div className="split">
                      <span className="strong">{course}</span>
                      <span className="pill">{data.count} students</span>
                    </div>
                    <div className="split small" style={{ marginTop: 8 }}>
                      <span className="muted">Avg attendance</span>
                      <strong>{pct}%</strong>
                    </div>
                    <div className={`progress${pct >= 75 ? "" : " gold"}`} style={{ marginTop: 6 }}>
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {byCourse.size > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Students by course
          </h2>
          <div className="stack" style={{ gap: 16 }}>
            {Array.from(byCourse.entries()).map(([course]) => (
              <div key={course}>
                <p className="strong">{course}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {(studentsByCourse.get(course) ?? []).map((s, i) => (
                    <Link key={`${s.studentId}-${i}`} className="chip" style={{ textDecoration: "none" }} href={`/lms/college/students?studentId=${s.studentId}`}>
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
