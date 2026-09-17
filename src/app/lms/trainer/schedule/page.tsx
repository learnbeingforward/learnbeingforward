import { CheckCircle2, Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { trainerNavLinks as navLinks } from "@/lib/lms-nav-links";
import { format } from "date-fns";

export default async function TrainerSchedulePage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;

  const sessions = await prisma.trainingSession.findMany({
    where: { trainerId },
    include: { batch: { include: { college: true, course: true } }, courseModule: true },
    orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }],
  });

  return (
    <DashboardShell title="Schedule" subtitle="Your assigned classes" navLinks={navLinks}>
      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No classes scheduled yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white">
          <div className="divide-y divide-border">
            {sessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-medium text-indigo">
                    {s.batch.college.name} — {s.batch.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {s.batch.course.name} &middot; {s.courseModule?.title ?? s.topic ?? "Topic TBD"}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium text-indigo">{format(s.sessionDate, "EEE, MMM d, yyyy")}</p>
                  <p className="text-muted-foreground">
                    Slot {s.slotNumber} &middot; {s.startTime}–{s.endTime}
                  </p>
                </div>
                <span
                  className={
                    s.attendanceTaken
                      ? "inline-flex items-center gap-1 text-xs font-medium text-green-700"
                      : "inline-flex items-center gap-1 text-xs font-medium text-amber-700"
                  }
                >
                  {s.attendanceTaken ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : (
                    <Clock className="size-3.5" />
                  )}
                  {s.attendanceTaken ? "Attendance taken" : "Attendance pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
