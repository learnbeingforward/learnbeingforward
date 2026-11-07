import { CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { trainerNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/lms/BackLink";
import { format } from "date-fns";

export default async function TrainerBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>;
}) {
  const { batchId } = await searchParams;
  const session = await auth();
  const trainerId = session!.user.trainerId!;

  if (batchId) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        college: true,
        course: true,
        trainingSessions: { include: { courseModule: true }, orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }] },
      },
    });
    if (!batch || batch.trainerId !== trainerId) {
      return (
        <DashboardShell title="Batch" subtitle="Not found" navLinks={navLinks}>
          <BackLink href="/lms/trainer/batches" label="Back to My Batches" />
          <p className="text-sm text-muted-foreground">This batch isn&apos;t assigned to you.</p>
        </DashboardShell>
      );
    }

    const completed = batch.trainingSessions.filter((s) => s.attendanceTaken);
    const upcoming = batch.trainingSessions.filter((s) => !s.attendanceTaken);

    return (
      <DashboardShell title={batch.name} subtitle={`${batch.college.name} — ${batch.course.name}`} navLinks={navLinks}>
        <BackLink href="/lms/trainer/batches" label="Back to My Batches" />

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white">
            <div className="border-b border-border p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
                <CheckCircle2 className="size-4" /> Completed Sessions ({completed.length})
              </p>
            </div>
            {completed.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No sessions completed yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {completed.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                    <p className="text-indigo">{s.courseModule?.title ?? s.topic ?? "—"}</p>
                    <p className="text-muted-foreground">
                      {format(s.sessionDate, "MMM d, yyyy")} &middot; Slot {s.slotNumber} ({s.startTime}–{s.endTime})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white">
            <div className="border-b border-border p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <Clock className="size-4" /> Upcoming Sessions ({upcoming.length})
              </p>
            </div>
            {upcoming.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Nothing scheduled yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {upcoming.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                    <p className="text-indigo">{s.courseModule?.title ?? s.topic ?? "—"}</p>
                    <p className="text-muted-foreground">
                      {format(s.sessionDate, "MMM d, yyyy")} &middot; Slot {s.slotNumber} ({s.startTime}–{s.endTime})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    );
  }

  const batches = await prisma.batch.findMany({
    where: { trainerId },
    include: { college: true, course: true, trainingSessions: true },
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });

  return (
    <DashboardShell title="My Batches" subtitle="Every batch assigned to you, including completed ones" navLinks={navLinks}>
      {batches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          No batches assigned yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((b) => {
            const completedCount = b.trainingSessions.filter((s) => s.attendanceTaken).length;
            const upcomingCount = b.trainingSessions.length - completedCount;
            return (
              <Link
                key={b.id}
                href={`/lms/trainer/batches?batchId=${b.id}`}
                className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-indigo">{b.name}</p>
                  {b.completed && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {b.college.name} — {b.course.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {completedCount} completed &middot; {upcomingCount} upcoming
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
