import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Button } from "@/components/ui/button";
import { ManualBatchBuilder } from "@/components/lms/ManualBatchBuilder";
import { AssignTrainerSelect } from "@/components/lms/AssignTrainerSelect";
import { autoBatchAll, assignTrainerToBatch } from "@/lib/actions/batches";

export default async function CompanyBatchesPage() {
  const [unbatched, batches, trainers] = await Promise.all([
    prisma.enrollment.findMany({
      where: { batchId: null, collegeId: { not: null } },
      include: { student: true, course: true, college: true },
    }),
    prisma.batch.findMany({
      include: { college: true, course: true, trainer: true, enrollments: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.trainer.findMany({ orderBy: { name: "asc" } }),
  ]);

  const builderRows = unbatched.map((e) => ({
    id: e.id,
    studentName: e.student.name,
    collegeId: e.collegeId!,
    collegeName: e.college?.name ?? "—",
    courseId: e.courseId,
    courseName: e.course.name,
  }));

  return (
    <DashboardShell title="Batches" subtitle="Trainers — group students into class batches" navLinks={navLinks}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-white p-6">
        <div>
          <p className="font-semibold text-indigo">Auto-create batches</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Groups every unbatched enrolled student by college and course into batches of up to 30,
            evenly split.
          </p>
        </div>
        <form action={autoBatchAll}>
          <Button type="submit" className="bg-indigo text-white hover:bg-indigo/90">
            Auto-Batch Everyone
          </Button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
          Build a Batch Manually
        </h2>
        <ManualBatchBuilder enrollments={builderRows} />
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">All Batches ({batches.length})</p>
        </div>
        {batches.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No batches yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {batches.map((batch) => (
              <div key={batch.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <p className="font-medium text-indigo">{batch.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {batch.college.name} &middot; {batch.enrollments.length} students
                    {batch.trainer && ` · Trainer: ${batch.trainer.name}`}
                  </p>
                </div>
                <AssignTrainerSelect
                  batchId={batch.id}
                  trainers={trainers}
                  currentTrainerId={batch.trainerId}
                  action={assignTrainerToBatch}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
