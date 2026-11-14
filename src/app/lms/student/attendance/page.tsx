import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { STUDENT_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

export default async function StudentAttendancePage() {
  const session = await auth();
  const userId = session!.user.id;

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, college: { select: { name: true } } },
  });
  const shellUser = { name: student?.name ?? "Student", subtitle: student?.college?.name ?? "Student" };

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId },
    include: { course: true, attendanceRecords: true, certification: true },
    orderBy: { enrolledAt: "asc" },
  });

  const rows = enrollments.map((e) => {
    const classesHeld = e.attendanceRecords.length;
    const total = classesHeld || e.totalClasses;
    const present = e.attendanceRecords.filter((r) => r.present).length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    const eligible = pct >= ATTENDANCE_THRESHOLD || !!e.certification?.overrideApproved;
    const remaining = Math.max(e.totalClasses - classesHeld, 0);
    return { enrollment: e, classesHeld, total, present, pct, eligible, remaining };
  });

  return (
    <AppShell nav={STUDENT_NAV} active="attendance" user={shellUser} crumb="Your progress" title="Attendance" subtitle={`${ATTENDANCE_THRESHOLD}% attendance is required for certification.`}>
      {rows.length === 0 ? (
        <div className="empty">No enrollments yet — nothing to show here.</div>
      ) : (
        <>
          {rows.length > 1 && (
            <section className="card">
              <div className="split" style={{ marginBottom: 18 }}>
                <h2 className="h2">Attendance across courses</h2>
              </div>
              <div className="bar-chart" style={{ height: 120 }} role="img" aria-label="Attendance across courses">
                {rows.map((r, i) => (
                  <div key={r.enrollment.id} className="b">
                    <span className={i === 0 ? "gold" : ""} style={{ height: `${Math.max(r.pct, 2)}%` }} />
                    {r.enrollment.course.name} <strong style={{ color: "var(--text)" }}>{r.pct}%</strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid" style={{ ["--min" as string]: "420px" }}>
            {rows.map(({ enrollment, classesHeld, total, present, pct, eligible, remaining }) => (
              <section key={enrollment.id} className="card">
                <div className="split" style={{ marginBottom: 18 }}>
                  <h2 className="h2">{enrollment.course.name}</h2>
                </div>
                <div className="grid" style={{ ["--min" as string]: "110px", gap: 10 }}>
                  <div className="tile">
                    <div className="label">Held</div>
                    <div className="value">{classesHeld}</div>
                  </div>
                  <div className="tile success">
                    <div className="label">Attended</div>
                    <div className="value">{present}</div>
                  </div>
                  <div className="tile">
                    <div className="label">Upcoming</div>
                    <div className="value">{remaining}</div>
                  </div>
                  <div className="tile gold">
                    <div className="label">Attendance</div>
                    <div className="value">{pct}%</div>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div className="split small">
                    <span>Attended vs missed</span>
                    <span>
                      {present} / {total}
                    </span>
                  </div>
                  <div className="progress" style={{ marginTop: 6, height: 10 }}>
                    <span style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {enrollment.certification?.status === "ISSUED" ? (
                  <div className={`alert ${enrollment.certification.overrideApproved ? "info" : "success"}`} style={{ marginTop: 14 }}>
                    <Icon name="award" size={18} className="shrink-0" />
                    <span>
                      {enrollment.certification.overrideApproved
                        ? "Certificate issued through an attendance exception your college requested and Learn Being Forward approved."
                        : "Certificate issued and approved by your trainer."}
                    </span>
                    <Link className="btn btn-success btn-sm" href={`/lms/student/certificate/${enrollment.id}`}>
                      <Icon name="download" size={16} />
                      Download
                    </Link>
                  </div>
                ) : eligible ? (
                  <div className="alert gold" style={{ marginTop: 14 }}>
                    <Icon name="award" size={18} className="shrink-0" />
                    <span>You&apos;ve met the attendance requirement — waiting on your trainer&apos;s final approval before the certificate is issued.</span>
                  </div>
                ) : (
                  <div className="alert warning" style={{ marginTop: 14 }}>
                    <Icon name="award" size={18} className="shrink-0" />
                    <span>Not yet eligible — keep your attendance above {ATTENDANCE_THRESHOLD}% to qualify.</span>
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
