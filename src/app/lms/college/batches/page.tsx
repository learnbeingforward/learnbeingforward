import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { ManualBatchBuilder } from "@/components/lms/ManualBatchBuilder";

export default async function CollegeBatchesPage() {
  const session = await auth();
  const collegeId = session!.user.collegeId!;

  const [unbatched, batches] = await Promise.all([
    prisma.enrollment.findMany({
      where: { batchId: null, collegeId },
      include: { student: true, course: true, college: true },
    }),
    prisma.batch.findMany({
      where: { collegeId },
      include: { course: true, trainer: true, enrollments: true },
      orderBy: { createdAt: "desc" },
    }),
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
    <DashboardShell title="Batches" subtitle="Group your students into class batches" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Once your students are approved into a course, group them here into batches of up to 30 so
        the company can assign a trainer and schedule classes.
      </p>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
          Build a Batch
        </h2>
        <ManualBatchBuilder enrollments={builderRows} lockedCollegeId={collegeId} />
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Your Batches ({batches.length})</p>
        </div>
        {batches.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No batches yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {batches.map((batch) => (
              <div key={batch.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-indigo">
                  {batch.name} &middot; {batch.enrollments.length} students
                </p>
                <p className="text-sm text-muted-foreground">
                  {batch.trainer ? `Trainer: ${batch.trainer.name}` : "Trainer not yet assigned"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
