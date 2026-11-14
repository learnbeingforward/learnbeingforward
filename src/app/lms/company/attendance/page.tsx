import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";
import { approveCertificate } from "@/lib/actions/certifications";
import { BackLink } from "@/components/lms/BackLink";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ collegeId?: string; batchId?: string }>;
}) {
  const { collegeId, batchId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.attendance");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const enrollments = await prisma.enrollment.findMany({
    include: { student: true, course: true, college: true, trainer: true, batch: true, attendanceRecords: true, certification: true },
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
    return Array.from(byCourse.entries()).map(([name, data]) => ({ name, pct: Math.round(data.totalPct / data.count) }));
  }

  if (collegeId && batchId) {
    const batchRows = rows.filter((r) => r.enrollment.batchId === batchId);
    const batch = batchRows[0]?.enrollment.batch;
    const college = batchRows[0]?.enrollment.college;

    return (
      <AppShell nav={nav} active="attendance" user={shellUser} hasUnread={hasUnread} crumb="Overview › Attendance" title={batch?.name ?? "Batch"} subtitle={college?.name ?? "Attendance"}>
        <BackLink href={`/lms/company/attendance?collegeId=${collegeId}`} label={`Back to ${college?.name ?? "college"}`} />
        <section className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Student</th><th>Course</th><th>Trainer</th><th>Attendance</th><th>Certificate</th><th>CV</th><th className="actions">Action</th></tr>
              </thead>
              <tbody>
                {batchRows.map(({ enrollment, total, present, pct }) => {
                  const eligible = pct >= ATTENDANCE_THRESHOLD || enrollment.certification?.overrideApproved;
                  const status = enrollment.certification?.status ?? "NOT_ELIGIBLE";
                  return (
                    <tr key={enrollment.id}>
                      <td className="strong">{enrollment.student.name}</td>
                      <td>{enrollment.course.name}</td>
                      <td>{enrollment.trainer?.name ?? "Unassigned"}</td>
                      <td>{present}/{total} ({pct}%)</td>
                      <td>
                        <span className={`pill ${status === "ISSUED" ? "success" : eligible ? "gold" : "warning"}`}>
                          {status === "ISSUED" ? "Issued" : eligible ? "Eligible" : "Not yet eligible"}
                        </span>
                      </td>
                      <td>{enrollment.student.cvUrl ? <a href={enrollment.student.cvUrl} target="_blank" rel="noopener noreferrer">View CV</a> : "—"}</td>
                      <td className="actions">
                        {status === "ISSUED" ? (
                          <span className="small muted">Approved</span>
                        ) : eligible ? (
                          <form action={approveCertificate.bind(null, enrollment.id)}>
                            <button className="btn btn-primary btn-sm" type="submit">Approve Certificate</button>
                          </form>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </AppShell>
    );
  }

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
    const chart = chartFor(collegeRows);

    return (
      <AppShell nav={nav} active="attendance" user={shellUser} hasUnread={hasUnread} crumb="Overview › Attendance" title={college?.name ?? "College"} subtitle="Attendance by batch">
        <BackLink href="/lms/company/attendance" label="Back to all colleges" />
        {chart.length > 0 && (
          <section className="card">
            <h2 className="h2" style={{ marginBottom: 18 }}>Average attendance by course</h2>
            <div className="bar-chart" role="img" aria-label="Average attendance by course">
              {chart.map((c) => (
                <div key={c.name} className="b">
                  <div className="track">
                    <span className={c.pct >= 75 ? "gold" : ""} style={{ height: `${c.pct}%` }} />
                  </div>
                  <div className="label">
                    {c.name.split(" ")[0]}
                    <br />
                    <strong style={{ color: "var(--text)" }}>{c.pct}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>Batches</h2>
          {batches.size === 0 ? (
            <p className="muted">No batched enrollments for this college yet.</p>
          ) : (
            <div className="grid" style={{ ["--min" as string]: "240px" }}>
              {Array.from(batches.entries()).map(([id, b]) => (
                <Link key={id} className="list-row" href={`/lms/company/attendance?collegeId=${collegeId}&batchId=${id}`}>
                  <span className="grow"><span className="strong" style={{ display: "block" }}>{b.name}</span><span className="small muted">{b.count} students</span></span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </AppShell>
    );
  }

  const colleges = new Map<string, { name: string; count: number; totalPct: number }>();
  for (const r of rows) {
    if (!r.enrollment.collegeId || !r.enrollment.college) continue;
    const entry = colleges.get(r.enrollment.collegeId) ?? { name: r.enrollment.college.name, count: 0, totalPct: 0 };
    entry.count += 1;
    entry.totalPct += r.pct;
    colleges.set(r.enrollment.collegeId, entry);
  }

  const awaitingCertificates = rows.filter(({ enrollment, pct }) => {
    const status = enrollment.certification?.status ?? "NOT_ELIGIBLE";
    const eligible = pct >= ATTENDANCE_THRESHOLD || enrollment.certification?.overrideApproved;
    return status !== "ISSUED" && eligible;
  });
  const issuedCount = rows.filter((r) => r.enrollment.certification?.status === "ISSUED").length;
  const avgAttendance = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length) : 0;
  const chart = chartFor(rows);

  return (
    <AppShell nav={nav} active="attendance" user={shellUser} hasUnread={hasUnread} crumb="Overview › Attendance" title="Attendance" subtitle="Platform-wide progress and certificate eligibility.">
      {rows.length === 0 ? (
        <div className="empty">No enrollments yet.</div>
      ) : (
        <>
          <section className="card">
            <div className="grid" style={{ ["--min" as string]: "200px" }}>
              <div className="tile"><div className="label">Avg attendance</div><div className="value">{avgAttendance}%</div></div>
              <div className="tile"><div className="label">Enrollments</div><div className="value">{rows.length}</div></div>
              <div className="tile warning"><div className="label">Certificate-eligible, not issued</div><div className="value">{awaitingCertificates.length}</div></div>
              <div className="tile success"><div className="label">Certificates issued</div><div className="value">{issuedCount}</div></div>
            </div>
          </section>

          <div className="row">
            <section className="card grow">
              <h2 className="h2" style={{ marginBottom: 18 }}>Average attendance by course</h2>
              <div className="bar-chart" role="img" aria-label="Average attendance by course">
                {chart.map((c) => (
                  <div key={c.name} className="b">
                    <div className="track">
                      <span className={c.pct >= 75 ? "gold" : ""} style={{ height: `${c.pct}%` }} />
                    </div>
                    <div className="label">
                      {c.name.split(" ")[0]}
                      <br />
                      <strong style={{ color: "var(--text)" }}>{c.pct}%</strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="card side">
              <h2 className="h2" style={{ marginBottom: 18 }}>By college</h2>
              <ul className="list" style={{ maxHeight: 220, overflowY: "auto" }}>
                {Array.from(colleges.entries()).map(([id, c]) => {
                  const pct = Math.round(c.totalPct / c.count);
                  return (
                    <li key={id}>
                      <Link href={`/lms/company/attendance?collegeId=${id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="split small">
                          <span className="strong">{c.name}</span>
                          <span className="muted">{c.count} enrollments</span>
                        </div>
                        <div className="progress" style={{ marginTop: 6 }}><span style={{ width: `${pct}%` }} /></div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {awaitingCertificates.length > 0 && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 18 }}>Eligible for certificate, not yet issued ({awaitingCertificates.length})</h2>
              <ul className="list" style={{ maxHeight: 280, overflowY: "auto" }}>
                {awaitingCertificates.map(({ enrollment, pct }) => (
                  <li key={enrollment.id} className="list-row">
                    <div className="grow">
                      <div className="strong">{enrollment.student.name}</div>
                      <div className="small muted">{enrollment.course.name} · {enrollment.college?.name ?? "—"} · {pct}% attendance</div>
                    </div>
                    <form action={approveCertificate.bind(null, enrollment.id)}>
                      <button className="btn btn-primary btn-sm" type="submit">Approve Certificate</button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}
