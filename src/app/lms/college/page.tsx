import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { getCollegeStudentRows, summarizeByCourse } from "@/lib/college-data";

export default async function CollegeDashboardPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId;
  const college = await prisma.college.findUnique({ where: { id: collegeId! }, select: { name: true } });

  const { students, rows } = await getCollegeStudentRows(collegeId);
  const byCourse = summarizeByCourse(rows);
  const certificatesIssued = rows.filter((r) => r.certificationStatus === "ISSUED").length;

  const totalStudents = students.length;
  const avgAttendance = rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.pct, 0) / rows.length) : 0;
  const courseEntries = Array.from(byCourse.entries());

  const shellUser = { name: college?.name ?? "College", subtitle: "College admin" };

  return (
    <AppShell
      nav={COLLEGE_NAV}
      active="dashboard"
      user={shellUser}
      crumb="Campus overview"
      title={college?.name ?? "College"}
      subtitle="Your students' enrollment, attendance and training at a glance."
      actions={
        <Link className="btn btn-gold" href="/lms/college/students/new">
          <Icon name="plus" size={16} />
          Add student
        </Link>
      }
    >
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "200px" }}>
          <Link href="/lms/college/students?view=all" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="tile gold">
              <div className="label">Students enrolled</div>
              <div className="value">{totalStudents}</div>
            </div>
          </Link>
          <div className="tile">
            <div className="label">Average attendance</div>
            <div className="value">{avgAttendance}%</div>
          </div>
          <Link href="/lms/college/courses" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="tile">
              <div className="label">Courses active</div>
              <div className="value">{byCourse.size}</div>
            </div>
          </Link>
          <div className="tile success">
            <div className="label">Certificates issued</div>
            <div className="value">{certificatesIssued}</div>
          </div>
        </div>
      </section>

      {courseEntries.length > 0 && (
        <div className="row">
          <section className="card grow">
            <h2 className="h2" style={{ marginBottom: 18 }}>
              Average attendance by course
            </h2>
            <div className="bar-chart" role="img" aria-label="Average attendance by course">
              {courseEntries.map(([name, data]) => {
                const pct = Math.round(data.totalPct / data.count);
                return (
                  <div key={name} className="b">
                    <span className={pct >= 75 ? "gold" : ""} style={{ height: `${pct}%` }} />
                    {name.split(" ")[0]}
                    <strong style={{ color: "var(--text)" }}>{pct}%</strong>
                  </div>
                );
              })}
            </div>
            <p className="small muted" style={{ marginTop: 10 }}>
              Gold bar = at or above the 75% certificate threshold.
            </p>
          </section>
          <section className="card side">
            <h2 className="h2" style={{ marginBottom: 18 }}>
              Breakdown by course
            </h2>
            <ul className="list">
              {courseEntries.map(([name, data]) => (
                <li key={name}>
                  <Link className="list-row" href="/lms/college/courses">
                    <span className="grow">
                      <span className="strong" style={{ display: "block" }}>
                        {name}
                      </span>
                      <span className="small muted">
                        {data.count} student{data.count !== 1 ? "s" : ""} · {Math.round(data.totalPct / data.count)}% avg
                      </span>
                    </span>
                    <Icon name="chevR" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>
          Quick actions
        </h2>
        <div className="grid" style={{ ["--min" as string]: "240px" }}>
          <Link className="list-row" href="/lms/college/students/new">
            <span className="icon-box gold">
              <Icon name="plus" size={18} />
            </span>
            <span className="grow">Add a student</span>
            <Icon name="chevR" size={16} />
          </Link>
          <Link className="list-row" href="/lms/college/courses">
            <span className="icon-box gold">
              <Icon name="book" size={18} />
            </span>
            <span className="grow">Enroll students in a course</span>
            <Icon name="chevR" size={16} />
          </Link>
          <Link className="list-row" href="/lms/college/batches">
            <span className="icon-box gold">
              <Icon name="layers" size={18} />
            </span>
            <span className="grow">Build a batch</span>
            <Icon name="chevR" size={16} />
          </Link>
          <Link className="list-row" href="/lms/college/queries">
            <span className="icon-box gold">
              <Icon name="message" size={18} />
            </span>
            <span className="grow">Request an attendance exception</span>
            <Icon name="chevR" size={16} />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
