import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { ManualBatchBuilder } from "@/components/lms/ManualBatchBuilder";
import { AssignTrainerSelect } from "@/components/lms/AssignTrainerSelect";
import { BackLink } from "@/components/lms/BackLink";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { AddToBatchForm } from "@/components/lms/AddToBatchForm";
import { MoveStudentForm } from "@/components/lms/MoveStudentForm";
import { autoBatchAll, assignTrainerToBatch, removeStudentFromBatch, deleteBatch, markBatchCompleted } from "@/lib/actions/batches";
import { MANUAL_BATCH_CAP } from "@/lib/batching";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ collegeId?: string; batchId?: string }>;
}) {
  const { collegeId, batchId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("trainers.manage");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  if (collegeId && batchId) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { college: true, course: true, enrollments: { include: { student: true, attendanceRecords: true } } },
    });
    const [candidates, otherCourses] = batch
      ? await Promise.all([
          prisma.enrollment.findMany({ where: { collegeId: batch.collegeId, courseId: batch.courseId, batchId: null }, include: { student: true } }),
          prisma.course.findMany({ where: { id: { not: batch.courseId } }, orderBy: { name: "asc" } }),
        ])
      : [[], []];

    if (!batch) {
      return (
        <AppShell nav={nav} active="trainers" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Trainers › Batches" title="Batch" subtitle="Not found">
          <p className="muted">This batch no longer exists.</p>
        </AppShell>
      );
    }

    return (
      <AppShell nav={nav} active="trainers" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Trainers › Batches" title={batch.name} subtitle={batch.college.name}>
        <BackLink href={`/lms/company/trainers/batches?collegeId=${collegeId}`} label={`Back to ${batch.college.name}`} />

        <section className="card">
          <div className="split">
            <p className="muted">
              {batch.course.name} · {batch.enrollments.length}/{MANUAL_BATCH_CAP} students
              {batch.semester && ` · Sem ${batch.semester}`}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {batch.completed ? (
                <span className="pill success"><CheckCircle2 size={14} style={{ marginRight: 4 }} />Training Completed</span>
              ) : (
                <form action={markBatchCompleted.bind(null, batch.id)}>
                  <button className="btn btn-sm" type="submit">Mark Completed</button>
                </form>
              )}
              {isSuperAdmin && (
                <form action={deleteBatch.bind(null, batch.id)}>
                  <button className="btn btn-danger btn-sm" type="submit">Delete Batch</button>
                </form>
              )}
            </div>
          </div>
        </section>

        {candidates.length > 0 && (
          <section className="card">
            <AddToBatchForm batchId={batch.id} candidates={candidates.map((c) => ({ id: c.id, studentName: c.student.name }))} />
          </section>
        )}

        <section className="card">
          {batch.enrollments.length === 0 ? (
            <p className="empty">No students in this batch yet.</p>
          ) : (
            <ul className="list">
              {batch.enrollments.map((e) => (
                <li key={e.id} className="list-row">
                  <div className="grow">
                    <div className="strong">{e.student.name}</div>
                    <div className="small muted">{e.student.email} · {e.attendanceRecords.length} classes recorded</div>
                  </div>
                  {isSuperAdmin ? <DeleteButton action={removeStudentFromBatch.bind(null, e.id)} /> : <MoveStudentForm enrollmentId={e.id} courses={otherCourses} />}
                </li>
              ))}
            </ul>
          )}
        </section>
      </AppShell>
    );
  }

  const [unbatched, batches, trainers, approvedContracts] = await Promise.all([
    prisma.enrollment.findMany({ where: { batchId: null, collegeId: { not: null } }, include: { student: true, course: true, college: true } }),
    prisma.batch.findMany({ include: { college: true, course: true, trainer: true, enrollments: true }, orderBy: { createdAt: "desc" } }),
    prisma.trainer.findMany({ orderBy: { name: "asc" } }),
    prisma.collegeContract.findMany({ where: { status: "APPROVED" }, orderBy: { decidedAt: "desc" } }),
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
    const key = `${c.collegeId}::${c.courseId}`;
    if (!(key in contractRestrictions) && (c.targetBranch || c.targetSemester)) {
      contractRestrictions[key] = { branch: c.targetBranch, semester: c.targetSemester };
    }
  }

  if (collegeId) {
    const college = batches.find((b) => b.collegeId === collegeId)?.college;
    const collegeBatches = batches.filter((b) => b.collegeId === collegeId);

    return (
      <AppShell nav={nav} active="trainers" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Trainers › Batches" title={college?.name ?? "College"} subtitle="Batches">
        <BackLink href="/lms/company/trainers/batches" label="Back to all colleges" />
        <section className="card">
          {collegeBatches.length === 0 ? (
            <p className="empty">No batches for this college yet.</p>
          ) : (
            <ul className="list">
              {collegeBatches.map((batch) => (
                <li key={batch.id} className="list-row">
                  <Link className="grow" href={`/lms/company/trainers/batches?collegeId=${collegeId}&batchId=${batch.id}`}>
                    <div className="strong">
                      {batch.name}
                      {batch.completed && <span className="pill success" style={{ marginLeft: 8 }}>Completed</span>}
                    </div>
                    <div className="small muted">{batch.enrollments.length} students{batch.trainer && ` · Trainer: ${batch.trainer.name}`}</div>
                  </Link>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <AssignTrainerSelect batchId={batch.id} trainers={trainers} currentTrainerId={batch.trainerId} action={assignTrainerToBatch} />
                    {isSuperAdmin && <DeleteButton action={deleteBatch.bind(null, batch.id)} />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </AppShell>
    );
  }

  const colleges = new Map<string, { name: string; count: number }>();
  for (const b of batches) {
    const entry = colleges.get(b.collegeId) ?? { name: b.college.name, count: 0 };
    entry.count += 1;
    colleges.set(b.collegeId, entry);
  }

  return (
    <AppShell nav={nav} active="trainers" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Trainers › Batches" title="Batches" subtitle="Group enrolled students into class batches.">
      <BackLink href="/lms/company/trainers" label="Back to Trainers" />

      <div className="row">
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>Auto-create batches</h2>
          <p className="muted">Groups every unbatched enrolled student by college, course and semester into batches of up to 50, evenly split.</p>
          <form action={autoBatchAll} style={{ marginTop: 14 }}>
            <button className="btn btn-gold" type="submit">Auto-batch everyone</button>
          </form>
        </section>

        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>Build a batch manually</h2>
          <ManualBatchBuilder enrollments={builderRows} contractRestrictions={contractRestrictions} />
        </section>
      </div>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>By college</h2>
        {colleges.size === 0 ? (
          <p className="empty">No batches created yet.</p>
        ) : (
          <div className="grid" style={{ ["--min" as string]: "260px" }}>
            {Array.from(colleges.entries()).map(([id, c]) => (
              <Link key={id} className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href={`/lms/company/trainers/batches?collegeId=${id}`}>
                <h3 className="h3">{c.name}</h3>
                <p className="small muted" style={{ marginTop: 6 }}>{c.count} batches</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
