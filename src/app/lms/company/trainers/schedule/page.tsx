import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { ScheduleSessionForm } from "@/components/lms/ScheduleSessionForm";
import { format } from "date-fns";

export default async function CompanyScheduleTrainingPage() {
  const [batches, trainers, modules, upcoming] = await Promise.all([
    prisma.batch.findMany({
      include: { college: true },
      orderBy: { name: "asc" },
    }),
    prisma.trainer.findMany({ orderBy: { name: "asc" } }),
    prisma.courseModule.findMany({ orderBy: { order: "asc" } }),
    prisma.trainingSession.findMany({
      include: { batch: { include: { college: true, course: true } }, trainer: true, courseModule: true },
      orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }],
      take: 20,
    }),
  ]);

  const batchOptions = batches.map((b) => ({
    id: b.id,
    name: b.name,
    collegeName: b.college.name,
    courseId: b.courseId,
  }));
  const moduleOptions = modules.map((m) => ({ id: m.id, title: m.title, courseId: m.courseId }));

  return (
    <DashboardShell title="Schedule Training" subtitle="Trainers — assign a session" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Schedule one session-day at a time for a batch — pick the trainer, date, and up to 3 slots.
        Submit again for the next day.
      </p>

      <ScheduleSessionForm batches={batchOptions} trainers={trainers} modules={moduleOptions} />

      <div className="mt-8 rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Upcoming / Recent Sessions</p>
        </div>
        {upcoming.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No sessions scheduled yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {upcoming.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <p className="font-medium text-indigo">
                    {s.batch.college.name} — {s.batch.name}
                  </p>
                  <p className="text-muted-foreground">
                    {format(s.sessionDate, "MMM d, yyyy")} &middot; Slot {s.slotNumber} ({s.startTime}–{s.endTime})
                    &middot; {s.courseModule?.title ?? s.topic ?? "—"} &middot; {s.trainer.name}
                  </p>
                </div>
                <span className={s.attendanceTaken ? "text-green-700" : "text-muted-foreground"}>
                  {s.attendanceTaken ? "Attendance taken" : "Pending attendance"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
