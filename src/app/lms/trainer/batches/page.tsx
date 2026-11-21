import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { BackLink } from "@/components/lms/BackLink";
import { DomainTabs } from "@/components/lbf/DomainTabs";
import { format } from "date-fns";

export default async function TrainerBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>;
}) {
  const { batchId } = await searchParams;
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });
  const shellUser = { name: trainer.name, subtitle: "Trainer" };

  if (batchId) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        college: true,
        course: { include: { modules: { orderBy: { order: "asc" } } } },
        trainingSessions: { include: { courseModule: true }, orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }] },
        enrollments: { include: { student: true, attendanceRecords: true } },
      },
    });
    if (!batch || batch.trainerId !== trainerId) {
      return (
        <AppShell nav={TRAINER_NAV} active="batches" user={shellUser} crumb="My Batches" title="Batch" subtitle="Not found">
          <BackLink href="/lms/trainer/batches" label="Back to My Batches" />
          <p className="muted">This batch isn&apos;t assigned to you.</p>
        </AppShell>
      );
    }

    const now = new Date();
    const completed = batch.trainingSessions.filter((s) => s.attendanceTaken);
    const overdue = batch.trainingSessions.filter((s) => !s.attendanceTaken && s.sessionDate < now);
    const upcoming = batch.trainingSessions.filter((s) => !s.attendanceTaken && s.sessionDate >= now);
    const coveredModuleIds = new Set(completed.map((s) => s.courseModuleId).filter((id): id is string => !!id));

    return (
      <AppShell
        nav={TRAINER_NAV}
        active="batches"
        user={shellUser}
        crumb={`My Batches › ${batch.name}`}
        title={batch.name}
        subtitle={`${batch.college.name} · ${batch.enrollments.length} students`}
        actions={
          <Link className="btn btn-ghost-light" href="/lms/trainer/batches">
            <Icon name="arrowL" size={16} />
            Back to My Batches
          </Link>
        }
      >
        <section className="card">
          <div className="grid" style={{ ["--min" as string]: "150px" }}>
            <div className="tile">
              <div className="label">Students</div>
              <div className="value">{batch.enrollments.length}</div>
            </div>
            <div className="tile">
              <div className="label">Completed sessions</div>
              <div className="value">{completed.length}</div>
            </div>
            <div className="tile danger">
              <div className="label">Attendance overdue</div>
              <div className="value">{overdue.length}</div>
            </div>
            <div className="tile">
              <div className="label">Modules covered</div>
              <div className="value">
                {coveredModuleIds.size} / {batch.course.modules.length}
              </div>
            </div>
          </div>
        </section>
        <div className="row">
          <div className="stack grow" style={{ gap: 20 }}>
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 18 }}>
                Sessions
              </h2>
              <div className="label" style={{ marginBottom: 8 }}>
                Waiting for attendance
              </div>
              {[...overdue, ...upcoming].length === 0 ? (
                <p className="muted small">Nothing waiting on attendance.</p>
              ) : (
                <ul className="list">
                  {[...overdue, ...upcoming].map((s) => (
                    <li key={s.id} className="list-row" style={{ flexWrap: "wrap" }}>
                      <span className="slot">
                        Slot {s.slotNumber}
                        <small>
                          {s.startTime}–{s.endTime}
                        </small>
                      </span>
                      <div className="grow">
                        <div className="strong">{s.courseModule?.title ?? s.topic ?? "—"}</div>
                        <div className="small muted">{format(s.sessionDate, "EEE, MMM d, yyyy")}</div>
                      </div>
                      <span className={`pill ${s.sessionDate < now ? "danger" : "warning"}`}>
                        {s.sessionDate < now ? "Overdue" : "Pending"}
                      </span>
                      <Link className="btn btn-primary btn-sm" href="/lms/trainer/attendance">
                        Mark attendance
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="label" style={{ margin: "18px 0 8px" }}>
                Completed
              </div>
              {completed.length === 0 ? (
                <p className="muted small">No sessions completed yet.</p>
              ) : (
                <ul className="list">
                  {completed.map((s) => (
                    <li key={s.id} className="list-row">
                      <span className="grow strong">{s.courseModule?.title ?? s.topic ?? "—"}</span>
                      <span className="small muted">{format(s.sessionDate, "MMM d, yyyy")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 18 }}>
                Students ({batch.enrollments.length})
              </h2>
              <div className="table-wrap">
                <table className="table m-cards" style={{ minWidth: 560 }}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>USN</th>
                      <th>Attended</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.enrollments.map((e) => {
                      const total = e.attendanceRecords.length;
                      const present = e.attendanceRecords.filter((r) => r.present).length;
                      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                      const initials = e.student.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <tr key={e.id}>
                          <td data-label="Student">
                            <div className="stat-inline">
                              <span className="avatar sm">{initials}</span>
                              <div>
                                <div className="strong">{e.student.name}</div>
                                <div className="small muted">{batch.college.name}</div>
                              </div>
                            </div>
                          </td>
                          <td data-label="USN">{e.student.usn ?? "—"}</td>
                          <td data-label="Attended">
                            {present} / {total}
                          </td>
                          <td data-label="Attendance">
                            {total === 0 ? <span className="muted small">No classes yet</span> : `${pct}%`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          <section className="card side">
            <h2 className="h2" style={{ marginBottom: 18 }}>
              Course progress
            </h2>
            <ul className="list">
              {batch.course.modules.map((m) => (
                <li key={m.id} className="split" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="strong">{m.title}</span>
                  <span className={`pill ${coveredModuleIds.has(m.id) ? "success" : ""}`}>
                    {coveredModuleIds.has(m.id) ? "Covered" : "Not started"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="small muted" style={{ marginTop: 12 }}>
              A module is covered when you mark attendance for a session on it. Present students then get its content.
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  const batches = await prisma.batch.findMany({
    where: { trainerId },
    include: { college: true, course: { include: { modules: true } }, trainingSessions: true, enrollments: true },
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });
  const active = batches.filter((b) => !b.completed);
  const done = batches.filter((b) => b.completed);

  const now = new Date();
  const card = (b: (typeof batches)[number]) => {
    const completedCount = b.trainingSessions.filter((s) => s.attendanceTaken).length;
    const overdueCount = b.trainingSessions.filter((s) => !s.attendanceTaken && s.sessionDate < now).length;
    const upcomingCount = b.trainingSessions.length - completedCount - overdueCount;
    const totalModules = b.course.modules.length;
    const modulesCovered = new Set(b.trainingSessions.filter((s) => s.attendanceTaken).map((s) => s.courseModuleId)).size;
    const pct = totalModules > 0 ? Math.round((modulesCovered / totalModules) * 100) : 0;
    return (
      <article key={b.id} className="box stack" style={{ gap: 12 }}>
        <div className="split">
          <span className="icon-box navy">
            <Icon name="users" size={20} />
          </span>
          <span className={`pill ${b.completed ? "" : "success"}`}>{b.completed ? "Completed" : "Active"}</span>
        </div>
        <div>
          <h3 className="h3">{b.name}</h3>
          <div className="small muted">{b.college.name}</div>
        </div>
        <div className="grid" style={{ ["--min" as string]: "90px", gap: 8 }}>
          <div className="tile" style={{ padding: 12 }}>
            <div className="label">Students</div>
            <div className="value" style={{ fontSize: 20 }}>
              {b.enrollments.length}
            </div>
          </div>
          <div className="tile" style={{ padding: 12 }}>
            <div className="label">Done</div>
            <div className="value" style={{ fontSize: 20 }}>
              {completedCount}
            </div>
          </div>
          <div className="tile gold" style={{ padding: 12 }}>
            <div className="label">Upcoming</div>
            <div className="value" style={{ fontSize: 20 }}>
              {upcomingCount}
            </div>
          </div>
          {overdueCount > 0 && (
            <div className="tile warning" style={{ padding: 12 }}>
              <div className="label">Overdue</div>
              <div className="value" style={{ fontSize: 20, color: "var(--danger)" }}>
                {overdueCount}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="split small">
            <span className="muted">Course progress</span>
            <span>
              {modulesCovered} / {totalModules} modules
            </span>
          </div>
          <div className="progress gold" style={{ marginTop: 6 }}>
            <span style={{ width: `${Math.max(pct, 4)}%` }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-sm" href="/lms/trainer/schedule">
            <Icon name="calendar" size={16} />
            Schedule
          </Link>
          <Link className="btn btn-sm" href={`/lms/trainer/batches?batchId=${b.id}`}>
            <Icon name="users" size={16} />
            Students
          </Link>
          <Link className="btn btn-primary btn-sm" href="/lms/trainer/attendance">
            Mark attendance
          </Link>
        </div>
      </article>
    );
  };

  return (
    <AppShell nav={TRAINER_NAV} active="batches" user={shellUser} crumb="My Batches" title="My batches" subtitle="Every batch assigned to you, including completed ones.">
      {batches.length === 0 ? (
        <div className="empty">No batches assigned yet.</div>
      ) : (
        <section className="card">
          <DomainTabs
            tabs={[
              { key: "active", label: `Active (${active.length})` },
              { key: "done", label: `Completed (${done.length})` },
            ]}
            panels={{
              active: <div className="grid" style={{ ["--min" as string]: "340px" }}>{active.map(card)}</div>,
              done: <div className="grid" style={{ ["--min" as string]: "340px" }}>{done.map(card)}</div>,
            }}
          />
        </section>
      )}
    </AppShell>
  );
}
