import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Button } from "@/components/ui/button";
import { ManualBatchBuilder } from "@/components/lms/ManualBatchBuilder";
import { AssignTrainerSelect } from "@/components/lms/AssignTrainerSelect";
import { BackLink } from "@/components/lms/BackLink";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { AddToBatchForm } from "@/components/lms/AddToBatchForm";
import {
  autoBatchAll,
  assignTrainerToBatch,
  removeStudentFromBatch,
  deleteBatch,
} from "@/lib/actions/batches";
import { MANUAL_BATCH_CAP } from "@/lib/batching";

export default async function CompanyBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ collegeId?: string; batchId?: string }>;
}) {
  const { collegeId, batchId } = await searchParams;

  // Level 2: a single batch's roster
  if (collegeId && batchId) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        college: true,
        course: true,
        enrollments: { include: { student: true, attendanceRecords: true } },
      },
    });
    const candidates = batch
      ? await prisma.enrollment.findMany({
          where: { collegeId: batch.collegeId, courseId: batch.courseId, batchId: null },
          include: { student: true },
        })
      : [];

    if (!batch) {
      return (
        <DashboardShell title="Batch" subtitle="Not found" navLinks={navLinks}>
          <p className="text-sm text-muted-foreground">This batch no longer exists.</p>
        </DashboardShell>
      );
    }

    return (
      <DashboardShell title={batch.name} subtitle={batch.college.name} navLinks={navLinks}>
        <BackLink href={`/lms/company/trainers/batches?collegeId=${collegeId}`} label={`Back to ${batch.college.name}`} />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-6">
          <p className="text-sm text-muted-foreground">
            {batch.course.name} &middot; {batch.enrollments.length}/{MANUAL_BATCH_CAP} students
            {batch.semester && ` · Sem ${batch.semester}`}
          </p>
          <form action={deleteBatch.bind(null, batch.id)}>
            <Button type="submit" size="sm" variant="outline" className="border-destructive text-destructive">
              Delete Batch
            </Button>
          </form>
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
                <DeleteButton action={removeStudentFromBatch.bind(null, e.id)} />
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
    semester: e.student.semester,
  }));

  // Level 1: batches within a specific college
  if (collegeId) {
    const college = batches.find((b) => b.collegeId === collegeId)?.college;
    const collegeBatches = batches.filter((b) => b.collegeId === collegeId);

    return (
      <DashboardShell title={college?.name ?? "College"} subtitle="Batches" navLinks={navLinks}>
        <BackLink href="/lms/company/trainers/batches" label="Back to all colleges" />
        <div className="rounded-xl border border-border bg-white">
          <div className="divide-y divide-border">
            {collegeBatches.map((batch) => (
              <div key={batch.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
                <Link href={`/lms/company/trainers/batches?collegeId=${collegeId}&batchId=${batch.id}`} className="flex-1">
                  <p className="font-medium text-indigo hover:underline">{batch.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {batch.enrollments.length} students
                    {batch.trainer && ` · Trainer: ${batch.trainer.name}`}
                  </p>
                </Link>
                <AssignTrainerSelect
                  batchId={batch.id}
                  trainers={trainers}
                  currentTrainerId={batch.trainerId}
                  action={assignTrainerToBatch}
                />
              </div>
            ))}
            {collegeBatches.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">No batches for this college yet.</p>
            )}
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Level 0: college cards + global tools
  const colleges = new Map<string, { name: string; count: number }>();
  for (const b of batches) {
    const entry = colleges.get(b.collegeId) ?? { name: b.college.name, count: 0 };
    entry.count += 1;
    colleges.set(b.collegeId, entry);
  }

  return (
    <DashboardShell title="Batches" subtitle="Trainers — group students into class batches" navLinks={navLinks}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-white p-6">
        <div>
          <p className="font-semibold text-indigo">Auto-create batches</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Groups every unbatched enrolled student by college, course, and semester into batches
            of up to 50, evenly split.
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

      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">By College</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from(colleges.entries()).map(([id, c]) => (
          <Link
            key={id}
            href={`/lms/company/trainers/batches?collegeId=${id}`}
            className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
          >
            <p className="font-semibold text-indigo">{c.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.count} batches</p>
          </Link>
        ))}
        {colleges.size === 0 && <p className="text-sm text-muted-foreground">No batches created yet.</p>}
      </div>
    </DashboardShell>
  );
}
