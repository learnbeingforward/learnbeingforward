import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { collegeNavLinks as navLinks } from "@/lib/lms-nav-links";
import { ManualBatchBuilder } from "@/components/lms/ManualBatchBuilder";
import { BackLink } from "@/components/lms/BackLink";
import { AddToBatchForm } from "@/components/lms/AddToBatchForm";
import { MoveStudentForm } from "@/components/lms/MoveStudentForm";
import { MANUAL_BATCH_CAP } from "@/lib/batching";

export default async function CollegeBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>;
}) {
  const { batchId } = await searchParams;
  const session = await auth();
  const collegeId = session!.user.collegeId!;

  if (batchId) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { course: true, enrollments: { include: { student: true, attendanceRecords: true } } },
    });
    if (!batch || batch.collegeId !== collegeId) {
      return (
        <DashboardShell title="Batch" subtitle="Not found" navLinks={navLinks}>
          <p className="text-sm text-muted-foreground">This batch doesn&apos;t belong to your college.</p>
        </DashboardShell>
      );
    }

    const [candidates, otherCourses] = await Promise.all([
      prisma.enrollment.findMany({
        where: { collegeId, courseId: batch.courseId, batchId: null },
        include: { student: true },
      }),
      prisma.course.findMany({ where: { id: { not: batch.courseId } }, orderBy: { name: "asc" } }),
    ]);

    return (
      <DashboardShell title={batch.name} subtitle={batch.course.name} navLinks={navLinks}>
        <BackLink href="/lms/college/batches" label="Back to all batches" />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-6">
          <p className="text-sm text-muted-foreground">
            {batch.enrollments.length}/{MANUAL_BATCH_CAP} students
            {batch.semester && ` · Sem ${batch.semester}`}
          </p>
          {batch.completed ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
              <CheckCircle2 className="size-4" /> Training Completed
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Training in progress</span>
          )}
        </div>

        {candidates.length > 0 && (
          <div className="mb-6">
            <AddToBatchForm batchId={batch.id} candidates={candidates.map((c) => ({ id: c.id, studentName: c.student.name }))} />
          </div>
        )}

        <div className="rounded-xl border border-border bg-white">
          <div className="divide-y divide-border">
            {batch.enrollments.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-indigo">{e.student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.student.email} &middot; {e.attendanceRecords.length} classes recorded
                  </p>
                </div>
                <MoveStudentForm enrollmentId={e.id} courses={otherCourses} />
              </div>
            ))}
            {batch.enrollments.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">No students in this batch yet.</p>
            )}
          </div>
        </div>
      </DashboardShell>
    );
  }

  const [unbatched, batches, approvedContracts] = await Promise.all([
    prisma.enrollment.findMany({
      where: { batchId: null, collegeId },
      include: { student: true, course: true, college: true },
    }),
    prisma.batch.findMany({
      where: { collegeId },
      include: { course: true, trainer: true, enrollments: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.collegeContract.findMany({
      where: { collegeId, status: "APPROVED" },
      orderBy: { decidedAt: "desc" },
    }),
  ]);

  const builderRows = unbatched.map((e) => ({
    id: e.id,
    studentName: e.student.name,
    collegeId: e.collegeId!,
    collegeName: e.college?.name ?? "—",
    courseId: e.courseId,
    courseName: e.course.name,
    branch: e.student.branch,
    semester: e.student.semester,
  }));

  const contractRestrictions: Record<string, { branch: string | null; semester: number | null }> = {};
  for (const c of approvedContracts) {
    const key = `${collegeId}::${c.courseId}`;
    if (!(key in contractRestrictions) && (c.targetBranch || c.targetSemester)) {
      contractRestrictions[key] = { branch: c.targetBranch, semester: c.targetSemester };
    }
  }

  return (
    <DashboardShell title="Batches" subtitle="Group your students into class batches" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Once your students are approved into a course, group them here into batches of up to{" "}
        {MANUAL_BATCH_CAP} so the company can assign a trainer and schedule classes.
      </p>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
          Build a Batch
        </h2>
        <ManualBatchBuilder
          enrollments={builderRows}
          lockedCollegeId={collegeId}
          contractRestrictions={contractRestrictions}
        />
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
              <a
                key={batch.id}
                href={`/lms/college/batches?batchId=${batch.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-cream"
              >
                <p className="text-sm text-indigo underline">
                  {batch.name} &middot; {batch.enrollments.length} students
                </p>
                <div className="flex items-center gap-3">
                  {batch.completed && (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                      <CheckCircle2 className="size-3.5" /> Completed
                    </span>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {batch.trainer ? `Trainer: ${batch.trainer.name}` : "Trainer not yet assigned"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
