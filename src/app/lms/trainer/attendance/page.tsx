import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { MarkAttendanceList } from "@/components/lbf/MarkAttendanceList";
import { submitSessionAttendance } from "@/lib/actions/trainer-attendance";
import { format } from "date-fns";

export default async function TrainerAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { sessionId } = await searchParams;
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });
  const shellUser = { name: trainer.name, subtitle: "Trainer" };

  if (!sessionId) {
    const pending = await prisma.trainingSession.findMany({
      where: { trainerId, attendanceTaken: false },
      include: { batch: { include: { college: true, course: true } }, courseModule: true },
      orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }],
    });

    return (
      <AppShell nav={TRAINER_NAV} active="attendance" user={shellUser} crumb="Attendance" title="Attendance" subtitle="Pick a session to mark. Invoices fill up as you mark attendance.">
        {pending.length > 0 && (
          <div className="alert gold">
            <Icon name="clock" size={18} className="shrink-0" />
            <span>
              You have <strong>{pending.length} session{pending.length !== 1 ? "s" : ""}</strong> waiting for attendance.
            </span>
          </div>
        )}
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Sessions
          </h2>
          {pending.length === 0 ? (
            <p className="muted">No sessions awaiting attendance.</p>
          ) : (
            <div className="table-wrap">
              <table className="table" style={{ minWidth: 820 }}>
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Batch</th>
                    <th>Module</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="strong">{format(s.sessionDate, "EEE, MMM d, yyyy")}</div>
                        <div className="small muted">
                          Slot {s.slotNumber} · {s.startTime}–{s.endTime}
                        </div>
                      </td>
                      <td>
                        {s.batch.college.name} — {s.batch.course.name} — {s.batch.name}
                      </td>
                      <td>{s.courseModule?.title ?? s.topic ?? "—"}</td>
                      <td>
                        <span className="pill warning">Pending</span>
                      </td>
                      <td className="actions">
                        <Link className="btn btn-primary btn-sm" href={`/lms/trainer/attendance?sessionId=${s.id}`}>
                          Mark attendance
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AppShell>
    );
  }

  const trainingSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: {
      batch: { include: { college: true, course: true, enrollments: { include: { student: true } } } },
      courseModule: true,
    },
  });

  if (!trainingSession || trainingSession.trainerId !== trainerId) {
    return (
      <AppShell nav={TRAINER_NAV} active="attendance" user={shellUser} crumb="Attendance" title="Attendance" subtitle="Session not found">
        <p className="muted">This session doesn&apos;t exist or isn&apos;t assigned to you.</p>
      </AppShell>
    );
  }

  if (trainingSession.attendanceTaken) {
    return (
      <AppShell nav={TRAINER_NAV} active="attendance" user={shellUser} crumb="Attendance" title="Attendance" subtitle="Already submitted">
        <p className="muted">Attendance for this session has already been submitted and can&apos;t be changed here.</p>
      </AppShell>
    );
  }

  const moduleTitle = trainingSession.courseModule?.title ?? trainingSession.topic ?? "this session";

  return (
    <AppShell
      nav={TRAINER_NAV}
      active="attendance"
      user={shellUser}
      crumb="Attendance › Mark attendance"
      title="Mark attendance"
      subtitle={`${trainingSession.batch.college.name} — ${trainingSession.batch.course.name} — ${trainingSession.batch.name}`}
      actions={
        <Link className="btn btn-ghost-light" href="/lms/trainer/attendance">
          <Icon name="arrowL" size={16} />
          Back to sessions
        </Link>
      }
    >
      <section className="card">
        <div className="split" style={{ marginBottom: 16, gap: 12 }}>
          <div className="stat-inline">
            <span className="icon-box gold">
              <Icon name="calendar" size={18} />
            </span>
            <div>
              <div className="strong">
                {format(trainingSession.sessionDate, "EEE, MMM d, yyyy")} · Slot {trainingSession.slotNumber} ({trainingSession.startTime}–{trainingSession.endTime})
              </div>
              <div className="small muted">Module: {moduleTitle}</div>
            </div>
          </div>
        </div>
        <MarkAttendanceList
          moduleTitle={moduleTitle}
          students={trainingSession.batch.enrollments.map((e) => ({ enrollmentId: e.id, name: e.student.name, usn: e.student.usn }))}
          action={submitSessionAttendance.bind(null, trainingSession.id)}
        />
      </section>
    </AppShell>
  );
}
