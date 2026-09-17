import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { ScheduleSessionForm } from "@/components/lms/ScheduleSessionForm";
import { BackLink } from "@/components/lms/BackLink";
import { format } from "date-fns";

export default async function CompanyScheduleTrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ trainerId?: string }>;
}) {
  const { trainerId } = await searchParams;

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
                <span className={s.attendanceTaken ? "text-green-700" : "text-muted-foreground"}>
                  {s.attendanceTaken ? "Attendance taken" : "Pending attendance"}
                </span>
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
