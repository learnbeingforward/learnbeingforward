import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { format, isSameDay } from "date-fns";

export default async function TrainerSchedulePage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });

  const sessions = await prisma.trainingSession.findMany({
    where: { trainerId },
    include: { batch: { include: { college: true, course: true } }, courseModule: true },
    orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }],
  });

  const now = new Date();
  // Past sessions with no attendance taken are overdue, not "upcoming" — a
  // session from months ago sitting in the same list as tomorrow's class
  // made it easy to miss that it still needed marking.
  const overdue = sessions.filter((s) => !s.attendanceTaken && s.sessionDate < now);
  const pending = sessions.filter((s) => !s.attendanceTaken && s.sessionDate >= now);

  function groupByDate(list: typeof sessions) {
    const byDate: { date: Date; sessions: typeof sessions }[] = [];
    for (const s of list) {
      const group = byDate.find((g) => isSameDay(g.date, s.sessionDate));
      if (group) group.sessions.push(s);
      else byDate.push({ date: s.sessionDate, sessions: [s] });
    }
    return byDate;
  }
  const overdueByDate = groupByDate(overdue);
  const byDate = groupByDate(sessions);
  const upcoming = pending.slice(0, 6);

  return (
    <AppShell nav={TRAINER_NAV} active="schedule" user={{ name: trainer.name, subtitle: "Trainer" }} crumb="Schedule" title="Your schedule" subtitle="All classes assigned to you.">
      {sessions.length === 0 ? (
        <div className="empty">No classes scheduled yet.</div>
      ) : (
        <div className="row">
          <section className="card grow">
            {overdueByDate.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2 className="h2" style={{ marginBottom: 18, color: "var(--danger)" }}>
                  Overdue — needs attendance ({overdue.length})
                </h2>
                {overdueByDate.map((group) => (
                  <div key={`overdue-${group.date.toISOString()}`} style={{ marginBottom: 16 }}>
                    <div className="label" style={{ marginBottom: 10 }}>
                      {format(group.date, "EEE, MMM d, yyyy")}
                    </div>
                    <ul className="list">
                      {group.sessions.map((s) => (
                        <li key={s.id} className="list-row" style={{ flexWrap: "wrap" }}>
                          <div style={{ textAlign: "center", minWidth: 70 }}>
                            <div className="strong">{s.startTime}</div>
                            <div className="small muted">Slot {s.slotNumber}</div>
                          </div>
                          <div className="grow">
                            <div className="strong">{s.courseModule?.title ?? s.topic ?? "Topic TBD"}</div>
                            <div className="small muted">
                              {s.batch.college.name} — {s.batch.name}
                            </div>
                          </div>
                          <span className="pill danger">Overdue</span>
                          <Link className="btn btn-primary btn-sm" href="/lms/trainer/attendance">
                            Mark now
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="divider" />
              </div>
            )}
            <h2 className="h2" style={{ marginBottom: 18 }}>
              All sessions
            </h2>
            {byDate.map((group) => (
              <div key={group.date.toISOString()} style={{ marginBottom: 16 }}>
                <div className="label" style={{ marginBottom: 10 }}>
                  {format(group.date, "EEE, MMM d, yyyy")}
                </div>
                <ul className="list">
                  {group.sessions.map((s) => (
                    <li key={s.id} className="list-row" style={{ flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center", minWidth: 70 }}>
                        <div className="strong">{s.startTime}</div>
                        <div className="small muted">Slot {s.slotNumber}</div>
                      </div>
                      <div className="grow">
                        <div className="strong">{s.courseModule?.title ?? s.topic ?? "Topic TBD"}</div>
                        <div className="small muted">
                          {s.batch.college.name} — {s.batch.name}
                        </div>
                      </div>
                      {s.attendanceTaken ? (
                        <span className="pill success">Attendance taken</span>
                      ) : s.sessionDate < now ? (
                        <>
                          <span className="pill danger">Overdue</span>
                          <Link className="btn btn-primary btn-sm" href="/lms/trainer/attendance">
                            Mark now
                          </Link>
                        </>
                      ) : (
                        <>
                          <span className="pill warning">Attendance pending</span>
                          <Link className="btn btn-primary btn-sm" href="/lms/trainer/attendance">
                            Mark attendance
                          </Link>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
          <section className="card side">
            <h2 className="h2" style={{ marginBottom: 18 }}>
              Next up
            </h2>
            <ul className="timeline">
              {upcoming.map((s) => (
                <li key={s.id}>
                  <div className="strong">{s.courseModule?.title ?? s.topic ?? "Topic TBD"}</div>
                  <div className="small muted">
                    {format(s.sessionDate, "MMM d")} · Slot {s.slotNumber} · {s.startTime}–{s.endTime}
                  </div>
                </li>
              ))}
              {upcoming.length === 0 && <li className="small muted">Nothing pending.</li>}
            </ul>
          </section>
        </div>
      )}
    </AppShell>
  );
}
