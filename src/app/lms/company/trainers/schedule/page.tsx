import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { ScheduleSessionForm } from "@/components/lms/ScheduleSessionForm";
import { BackLink } from "@/components/lms/BackLink";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { Button } from "@/components/ui/button";
import { submitSessionAttendance } from "@/lib/actions/trainer-attendance";
import { deleteTrainingSession } from "@/lib/actions/batches";
import { format } from "date-fns";

export default async function CompanyScheduleTrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ trainerId?: string; sessionId?: string }>;
}) {
  const { trainerId, sessionId } = await searchParams;

  // Level 2: mark attendance for a specific pending session
  if (trainerId && sessionId) {
    const trainingSession = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        batch: {
          include: { college: true, course: true, enrollments: { include: { student: true } } },
        },
        courseModule: true,
      },
    });

    if (!trainingSession || trainingSession.trainerId !== trainerId) {
      return (
        <DashboardShell title="Attendance" subtitle="Session not found" navLinks={navLinks}>
          <BackLink href={`/lms/company/trainers/schedule?trainerId=${trainerId}`} label="Back to sessions" />
          <p className="text-sm text-muted-foreground">This session doesn&apos;t exist.</p>
        </DashboardShell>
      );
    }

    if (trainingSession.attendanceTaken) {
      return (
        <DashboardShell title="Attendance" subtitle="Already submitted" navLinks={navLinks}>
          <BackLink href={`/lms/company/trainers/schedule?trainerId=${trainerId}`} label="Back to sessions" />
          <p className="text-sm text-muted-foreground">
            Attendance for this session has already been submitted.
          </p>
        </DashboardShell>
      );
    }

    return (
      <DashboardShell
        title="Mark Attendance"
        subtitle={`${trainingSession.batch.college.name} — ${trainingSession.batch.name}`}
        navLinks={navLinks}
      >
        <BackLink href={`/lms/company/trainers/schedule?trainerId=${trainerId}`} label="Back to sessions" />
        <p className="mb-4 text-sm text-muted-foreground">
          {format(trainingSession.sessionDate, "EEE, MMM d, yyyy")} &middot; Slot{" "}
          {trainingSession.slotNumber} ({trainingSession.startTime}–{trainingSession.endTime}) &middot;{" "}
          {trainingSession.courseModule?.title ?? trainingSession.topic ?? "—"}
        </p>

        <form
          action={submitSessionAttendance.bind(null, trainingSession.id)}
          className="rounded-xl border border-border bg-white"
        >
          <div className="divide-y divide-border">
            {trainingSession.batch.enrollments.map((enrollment) => (
              <label
                key={enrollment.id}
                className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-cream"
              >
                <span className="text-indigo">
                  {enrollment.student.name}
                  {enrollment.student.usn && (
                    <span className="ml-2 text-xs text-muted-foreground">USN: {enrollment.student.usn}</span>
                  )}
                </span>
                <span className="flex items-center gap-2">
                  Present
                  <input type="checkbox" name={`present_${enrollment.id}`} defaultChecked className="size-4" />
                </span>
              </label>
            ))}
          </div>
          <div className="p-4">
            <Button type="submit" className="bg-indigo text-white hover:bg-indigo/90">
              Submit Attendance
            </Button>
          </div>
        </form>
      </DashboardShell>
    );
  }

  const [batches, trainers, modules, sessions] = await Promise.all([
    prisma.batch.findMany({
      include: { college: true },
      orderBy: { name: "asc" },
    }),
    prisma.trainer.findMany({ orderBy: { name: "asc" } }),
    prisma.courseModule.findMany({ orderBy: { order: "asc" } }),
    prisma.trainingSession.findMany({
      include: { batch: { include: { college: true, course: true } }, trainer: true, courseModule: true },
      orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }],
    }),
  ]);

  const batchOptions = batches.map((b) => ({
    id: b.id,
    name: b.name,
    collegeName: b.college.name,
    courseId: b.courseId,
    trainerId: b.trainerId,
  }));
  const moduleOptions = modules.map((m) => ({ id: m.id, title: m.title, courseId: m.courseId }));

  // Level 1: a specific trainer's session list
  if (trainerId) {
    const trainer = trainers.find((t) => t.id === trainerId);
    const trainerSessions = sessions.filter((s) => s.trainerId === trainerId);

    return (
      <DashboardShell title={trainer?.name ?? "Trainer"} subtitle="Schedule" navLinks={navLinks}>
        <BackLink href="/lms/company/trainers/schedule" label="Back to all trainers" />
        <div className="rounded-xl border border-border bg-white">
          <div className="divide-y divide-border">
            {trainerSessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <p className="font-medium text-indigo">
                    {s.batch.college.name} — {s.batch.name}
                  </p>
                  <p className="text-muted-foreground">
                    {format(s.sessionDate, "MMM d, yyyy")} &middot; Slot {s.slotNumber} ({s.startTime}–{s.endTime})
                    &middot; {s.courseModule?.title ?? s.topic ?? "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {s.attendanceTaken ? (
                    <span className="text-sm text-green-700">Attendance taken</span>
                  ) : (
                    <>
                      <Link
                        href={`/lms/company/trainers/schedule?trainerId=${trainerId}&sessionId=${s.id}`}
                        className="text-sm font-medium text-indigo underline underline-offset-2"
                      >
                        Mark Attendance
                      </Link>
                      <DeleteButton action={deleteTrainingSession.bind(null, s.id)} />
                    </>
                  )}
                </div>
              </div>
            ))}
            {trainerSessions.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">No sessions scheduled for this trainer yet.</p>
            )}
          </div>
        </div>
      </DashboardShell>
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
    <DashboardShell title="Schedule Training" subtitle="Trainers — assign a session" navLinks={navLinks}>
      <BackLink href="/lms/company/trainers" label="Back to Trainers" />
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Schedule one session-day at a time for a batch — pick the trainer, date, and up to 3 slots.
        Submit again for the next day.
      </p>

      <ScheduleSessionForm batches={batchOptions} trainers={trainers} modules={moduleOptions} />

      <p className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-indigo">
        Sessions by Trainer
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from(sessionsByTrainer.entries()).map(([id, t]) => (
          <Link
            key={id}
            href={`/lms/company/trainers/schedule?trainerId=${id}`}
            className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
          >
            <p className="font-semibold text-indigo">{t.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.count} session{t.count !== 1 ? "s" : ""}
              {t.pending > 0 && ` · ${t.pending} pending attendance`}
            </p>
          </Link>
        ))}
        {sessionsByTrainer.size === 0 && (
          <p className="text-sm text-muted-foreground">No sessions scheduled yet.</p>
        )}
      </div>
    </DashboardShell>
  );
}
