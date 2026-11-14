import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { COLLEGE_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
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
  const college = await prisma.college.findUnique({ where: { id: collegeId }, select: { name: true } });
  const shellUser = { name: college?.name ?? "College", subtitle: "College admin" };

  if (batchId) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { course: true, enrollments: { include: { student: true, attendanceRecords: true } } },
    });
    if (!batch || batch.collegeId !== collegeId) {
      return (
        <AppShell nav={COLLEGE_NAV} active="batches" user={shellUser} crumb="Batches" title="Batch" subtitle="Not found">
          <p className="muted">This batch doesn&apos;t belong to your college.</p>
        </AppShell>
      );
    }

    const [candidates, otherCourses] = await Promise.all([
      prisma.enrollment.findMany({ where: { collegeId, courseId: batch.courseId, batchId: null }, include: { student: true } }),
      prisma.course.findMany({ where: { id: { not: batch.courseId } }, orderBy: { name: "asc" } }),
    ]);

    return (
      <AppShell nav={COLLEGE_NAV} active="batches" user={shellUser} crumb="Batches" title={batch.name} subtitle={batch.course.name}>
        <BackLink href="/lms/college/batches" label="Back to all batches" />
        <section className="card">
          <div className="split">
            <span className="muted">
              {batch.enrollments.length}/{MANUAL_BATCH_CAP} students{batch.semester && ` · Sem ${batch.semester}`}
            </span>
            {batch.completed ? <span className="pill success">Training completed</span> : <span className="pill">Training in progress</span>}
          </div>
        </section>

        {candidates.length > 0 && (
          <section className="card">
            <AddToBatchForm batchId={batch.id} candidates={candidates.map((c) => ({ id: c.id, studentName: c.student.name }))} />
          </section>
        )}

        <section className="card">
          <h2 className="h2" style={{ marginBottom: 14 }}>
            Students
          </h2>
          {batch.enrollments.length === 0 ? (
            <p className="muted">No students in this batch yet.</p>
          ) : (
            <ul className="list">
              {batch.enrollments.map((e) => (
                <li key={e.id} className="list-row" style={{ flexWrap: "wrap" }}>
                  <div className="grow">
                    <div className="strong">{e.student.name}</div>
                    <div className="small muted">
                      {e.student.email} · {e.attendanceRecords.length} classes recorded
                    </div>
                  </div>
                  <MoveStudentForm enrollmentId={e.id} courses={otherCourses} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </AppShell>
    );
  }

  const [unbatched, batches, approvedContracts] = await Promise.all([
    prisma.enrollment.findMany({ where: { batchId: null, collegeId }, include: { student: true, course: true, college: true } }),
    prisma.batch.findMany({ where: { collegeId }, include: { course: true, trainer: true, enrollments: true }, orderBy: { createdAt: "desc" } }),
    prisma.collegeContract.findMany({ where: { collegeId, status: "APPROVED" }, orderBy: { decidedAt: "desc" } }),
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
    <AppShell nav={COLLEGE_NAV} active="batches" user={shellUser} crumb="Batches" title="Batches" subtitle={`Group approved students into batches of up to ${MANUAL_BATCH_CAP} so a trainer can be assigned.`}>
      <div className="row">
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Build a batch
          </h2>
          <ManualBatchBuilder enrollments={builderRows} lockedCollegeId={collegeId} contractRestrictions={contractRestrictions} />
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Your batches ({batches.length})
          </h2>
          {batches.length === 0 ? (
            <p className="muted">No batches yet.</p>
          ) : (
            <div className="grid" style={{ ["--min" as string]: "260px" }}>
              {batches.map((batch) => {
                const pct = Math.round((batch.enrollments.length / MANUAL_BATCH_CAP) * 100);
                return (
                  <a key={batch.id} className="box hover stack" style={{ gap: 10, textDecoration: "none", color: "inherit" }} href={`/lms/college/batches?batchId=${batch.id}`}>
                    <div className="split">
                      <span className={`pill ${batch.completed ? "success" : batch.enrollments.length > 0 ? "info" : ""}`}>
                        {batch.completed ? "Completed" : batch.enrollments.length > 0 ? "In progress" : "Not started"}
                      </span>
                      <span className="small muted">
                        {batch.enrollments.length}/{MANUAL_BATCH_CAP}
                      </span>
                    </div>
                    <h3 className="h3">
                      {batch.course.name} — {batch.name}
                    </h3>
                    <div className="progress" style={{ height: 6 }}>
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <div className="small">
                      {batch.trainer ? (
                        <>
                          Trainer: <strong>{batch.trainer.name}</strong>
                        </>
                      ) : (
                        <span style={{ color: "var(--warning-text)" }}>Trainer not yet assigned</span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
