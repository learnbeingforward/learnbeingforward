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

  const byDate: { date: Date; sessions: typeof sessions }[] = [];
  for (const s of sessions) {
    const group = byDate.find((g) => isSameDay(g.date, s.sessionDate));
    if (group) group.sessions.push(s);
    else byDate.push({ date: s.sessionDate, sessions: [s] });
  }
  const upcoming = sessions.filter((s) => !s.attendanceTaken).slice(0, 6);

  return (
    <AppShell nav={TRAINER_NAV} active="schedule" user={{ name: trainer.name, subtitle: "Trainer" }} crumb="Schedule" title="Your schedule" subtitle="All classes assigned to you.">
      {sessions.length === 0 ? (
        <div className="empty">No classes scheduled yet.</div>
      ) : (
        <div className="row">
          <section className="card grow">
            <h2 className="h2" style={{ marginBottom: 18 }}>
              Upcoming &amp; pending
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
                          {s.batch.college.name} — {s.batch.course.name} — {s.batch.name}
                        </div>
                      </div>
                      {s.attendanceTaken ? (
                        <span className="pill success">Attendance taken</span>
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
