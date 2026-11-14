import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { ScheduleSessionForm } from "@/components/lms/ScheduleSessionForm";
import { BackLink } from "@/components/lms/BackLink";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { submitSessionAttendance } from "@/lib/actions/trainer-attendance";
import { deleteTrainingSession } from "@/lib/actions/batches";
import { SessionModuleSelect } from "@/components/lms/SessionModuleSelect";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyScheduleTrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ trainerId?: string; sessionId?: string }>;
}) {
  const { trainerId, sessionId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("trainers.manage");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  if (trainerId && sessionId) {
    const trainingSession = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: { batch: { include: { college: true, course: true, enrollments: { include: { student: true } } } }, courseModule: true },
    });

    if (!trainingSession || trainingSession.trainerId !== trainerId) {
      return (
        <AppShell nav={nav} active="trainers" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Trainers › Schedule" title="Attendance" subtitle="Session not found">
          <BackLink href={`/lms/company/trainers/schedule?trainerId=${trainerId}`} label="Back to sessions" />
          <p className="muted">This session doesn&apos;t exist.</p>
        </AppShell>
      );
    }

    if (trainingSession.attendanceTaken) {
      return (
        <AppShell nav={nav} active="trainers" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Trainers › Schedule" title="Attendance" subtitle="Already submitted">
          <BackLink href={`/lms/company/trainers/schedule?trainerId=${trainerId}`} label="Back to sessions" />
          <p className="muted">Attendance for this session has already been submitted.</p>
        </AppShell>
      );
    }

    return (
      <AppShell
        nav={nav}
        active="trainers"
        user={shellUser}
        hasUnread={hasUnread}
        crumb="Accounts › Trainers › Schedule"
        title="Mark Attendance"
        subtitle={`${trainingSession.batch.college.name} — ${trainingSession.batch.name}`}
      >
        <BackLink href={`/lms/company/trainers/schedule?trainerId=${trainerId}`} label="Back to sessions" />
        <p className="muted" style={{ marginBottom: 14 }}>
          {format(trainingSession.sessionDate, "EEE, MMM d, yyyy")} · Slot {trainingSession.slotNumber} ({trainingSession.startTime}–{trainingSession.endTime}) ·{" "}
          {trainingSession.courseModule?.title ?? trainingSession.topic ?? "—"}
        </p>

        <section className="card">
          <form action={submitSessionAttendance.bind(null, trainingSession.id)}>
            <ul className="list">
              {trainingSession.batch.enrollments.map((enrollment) => (
                <li key={enrollment.id} className="list-row">
                  <span className="grow">
                    {enrollment.student.name}
                    {enrollment.student.usn && <span className="small muted" style={{ marginLeft: 8 }}>USN: {enrollment.student.usn}</span>}
                  </span>
                  <label className="check">
                    Present
                    <input type="checkbox" name={`present_${enrollment.id}`} defaultChecked />
                  </label>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" type="submit" style={{ marginTop: 16 }}>Submit Attendance</button>
          </form>
        </section>
      </AppShell>
    );
  }

  const [batches, trainers, modules, sessions] = await Promise.all([
    prisma.batch.findMany({ include: { college: true }, orderBy: { name: "asc" } }),
    prisma.trainer.findMany({ orderBy: { name: "asc" } }),
    prisma.courseModule.findMany({ orderBy: { order: "asc" } }),
    prisma.trainingSession.findMany({
      include: { batch: { include: { college: true, course: true } }, trainer: true, courseModule: true },
      orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }],
    }),
  ]);

  const batchOptions = batches.map((b) => ({ id: b.id, name: b.name, collegeName: b.college.name, courseId: b.courseId, trainerId: b.trainerId }));
  const moduleOptions = modules.map((m) => ({ id: m.id, title: m.title, courseId: m.courseId }));

  if (trainerId) {
    const trainer = trainers.find((t) => t.id === trainerId);
    const trainerSessions = sessions.filter((s) => s.trainerId === trainerId);

    return (
      <AppShell nav={nav} active="trainers" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Trainers › Schedule" title={trainer?.name ?? "Trainer"} subtitle="Schedule">
        <BackLink href="/lms/company/trainers/schedule" label="Back to all trainers" />
        <section className="card">
          {trainerSessions.length === 0 ? (
            <p className="empty">No sessions scheduled for this trainer yet.</p>
          ) : (
            <ul className="list">
              {trainerSessions.map((s) => (
                <li key={s.id} className="list-row" style={{ flexWrap: "wrap" }}>
                  <div className="grow">
                    <div className="strong">{s.batch.college.name} — {s.batch.name}</div>
                    <div className="small muted">{format(s.sessionDate, "MMM d, yyyy")} · Slot {s.slotNumber} ({s.startTime}–{s.endTime})</div>
                    <div style={{ marginTop: 6 }}>
                      <SessionModuleSelect sessionId={s.id} currentModuleId={s.courseModuleId} topic={s.topic} modules={moduleOptions.filter((m) => m.courseId === s.batch.courseId)} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {s.attendanceTaken ? (
                      <span className="pill success">Attendance taken</span>
                    ) : (
                      <>
                        <Link className="btn btn-sm" href={`/lms/company/trainers/schedule?trainerId=${trainerId}&sessionId=${s.id}`}>Mark Attendance</Link>
                        <DeleteButton action={deleteTrainingSession.bind(null, s.id)} />
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </AppShell>
    );
  }

  const sessionsByTrainer = new Map<string, { name: string; count: number; pending: number }>();
  for (const s of sessions) {
    const entry = sessionsByTrainer.get(s.trainerId) ?? { name: s.trainer.name, count: 0, pending: 0 };
    entry.count += 1;
    if (!s.attendanceTaken) entry.pending += 1;
    sessionsByTrainer.set(s.trainerId, entry);
  }

  return (
    <AppShell
      nav={nav}
      active="trainers"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Accounts › Trainers › Schedule"
      title="Schedule Training"
      subtitle="Schedule one session-day at a time for a batch — pick the trainer, date, and up to 3 slots. Submit again for the next day."
    >
      <BackLink href="/lms/company/trainers" label="Back to Trainers" />

      <section className="card">
        <ScheduleSessionForm batches={batchOptions} trainers={trainers} modules={moduleOptions} />
      </section>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>Sessions by trainer</h2>
        {sessionsByTrainer.size === 0 ? (
          <p className="empty">No sessions scheduled yet.</p>
        ) : (
          <div className="grid" style={{ ["--min" as string]: "240px" }}>
            {Array.from(sessionsByTrainer.entries()).map(([id, t]) => (
              <Link key={id} className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href={`/lms/company/trainers/schedule?trainerId=${id}`}>
                <h3 className="h3">{t.name}</h3>
                <p className="small muted" style={{ marginTop: 6 }}>{t.count} session{t.count !== 1 ? "s" : ""}{t.pending > 0 && ` · ${t.pending} pending attendance`}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
