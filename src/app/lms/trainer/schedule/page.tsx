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
  const upcomingAndPending = sessions.filter((s) => !s.attendanceTaken);

  function groupByDate(list: typeof sessions) {
    const byDate: { date: Date; sessions: typeof sessions }[] = [];
    for (const s of list) {
      const group = byDate.find((g) => isSameDay(g.date, s.sessionDate));
      if (group) group.sessions.push(s);
      else byDate.push({ date: s.sessionDate, sessions: [s] });
    }
    return byDate;
  }
  const byDate = groupByDate(upcomingAndPending);

  // The timeline sidebar follows whichever batch has the soonest session
  // still needing attendance — that's the batch the trainer is most likely
  // mid-way through right now.
  const timelineBatchId = upcomingAndPending[0]?.batchId ?? sessions[0]?.batchId;
  const timelineBatch = timelineBatchId ? sessions.find((s) => s.batchId === timelineBatchId)?.batch : undefined;
  const timelineSessions = timelineBatchId ? sessions.filter((s) => s.batchId === timelineBatchId).slice(0, 8) : [];

  return (
    <AppShell nav={TRAINER_NAV} active="schedule" user={{ name: trainer.name, subtitle: "Trainer" }} crumb="Schedule" title="Your schedule" subtitle="All classes assigned to you.">
      {sessions.length === 0 ? (
        <div className="empty">No classes scheduled yet.</div>
      ) : (
        <div className="row">
          <section className="card grow">
            <div className="split" style={{ marginBottom: 18 }}>
              <div>
                <h2 className="h2">Upcoming &amp; pending</h2>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div className="segmented">
                  <button aria-pressed="true" type="button">List</button>
                  <button aria-pressed="false" type="button">Calendar</button>
                </div>
              </div>
            </div>
            {byDate.length === 0 ? (
              <p className="empty">Nothing pending right now.</p>
            ) : (
              byDate.map((group) => (
                <div key={group.date.toISOString()} style={{ marginBottom: 16 }}>
                  <div className="label" style={{ marginBottom: 10 }}>
                    {format(group.date, "EEE, MMM d, yyyy")}
                  </div>
                  <ul className="list">
                    {group.sessions.map((s) => {
                      const overdue = s.sessionDate < now;
                      return (
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
                          <span className={`pill ${overdue ? "danger" : "warning"}`}>
                            {overdue ? "Attendance overdue" : "Attendance pending"}
                          </span>
                          <Link className="btn btn-primary btn-sm" href="/lms/trainer/attendance">
                            Mark attendance
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </section>
          <section className="card side">
            <div className="split" style={{ marginBottom: 18 }}>
              <div>
                <h2 className="h2">{timelineBatch ? `${timelineBatch.name} timeline` : "Batch timeline"}</h2>
              </div>
            </div>
            <ul className="timeline">
              {timelineSessions.map((s) => (
                <li key={s.id}>
                  <div className="strong">{s.courseModule?.title ?? s.topic ?? "Topic TBD"}</div>
                  <div className="small muted">
                    {format(s.sessionDate, "MMM d")} · Slot {s.slotNumber} · {s.startTime}–{s.endTime}
                  </div>
                </li>
              ))}
              {timelineSessions.length === 0 && <li className="small muted">Nothing scheduled.</li>}
            </ul>
          </section>
        </div>
      )}
    </AppShell>
  );
}
