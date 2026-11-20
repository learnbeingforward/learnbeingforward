import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { getBillableSessions } from "@/lib/actions/trainer-invoices";
import { format } from "date-fns";

export default async function TrainerDashboardPage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });

  const now = new Date();
  const [activeBatches, overdueSessions, nextSession, billable, batches] = await Promise.all([
    prisma.batch.count({ where: { trainerId, completed: false } }),
    prisma.trainingSession.findMany({
      where: { trainerId, attendanceTaken: false, sessionDate: { lt: now } },
      include: { batch: { include: { college: true, course: true } }, courseModule: true },
      orderBy: { sessionDate: "asc" },
    }),
    prisma.trainingSession.findFirst({
      where: { trainerId, attendanceTaken: false, sessionDate: { gte: now } },
      include: { batch: { include: { college: true } } },
      orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }],
    }),
    getBillableSessions(trainerId),
    prisma.batch.findMany({
      where: { trainerId, completed: false },
      include: { college: true, course: { include: { modules: true } }, trainingSessions: true, enrollments: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);
  const readyToInvoice = billable.length * 2 * trainer.hourlyRate;
  const hasBankDetails = !!(trainer.bankAccountName && trainer.bankAccountNumber && trainer.bankIfsc);

  const upcomingSessions = await prisma.trainingSession.findMany({
    where: { trainerId, attendanceTaken: false, sessionDate: { gte: now } },
    include: { courseModule: true },
    orderBy: [{ sessionDate: "asc" }, { slotNumber: "asc" }],
    take: 6,
  });

  return (
    <AppShell
      nav={TRAINER_NAV}
      active="dashboard"
      user={{ name: trainer.name, subtitle: "Trainer" }}
      crumb="Trainer dashboard"
      title={`Welcome back, ${trainer.name}`}
      subtitle="What needs you today."
      actions={
        <Link className="btn btn-ghost-light" href="/lms/trainer/details">
          <Icon name="user" size={16} />
          Personal details
        </Link>
      }
    >
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "170px" }}>
          <div className="tile">
            <div className="label">Active batches</div>
            <div className="value">{activeBatches}</div>
          </div>
          <div className={overdueSessions.length > 0 ? "tile danger" : "tile"}>
            <div className="label">Attendance to mark</div>
            <div className="value">{overdueSessions.length}</div>
            {overdueSessions.length > 0 && (
              <div className="delta">oldest from {format(overdueSessions[0].sessionDate, "MMM d")}</div>
            )}
          </div>
          <div className="tile">
            <div className="label">Next session</div>
            <div className="value">{nextSession ? format(nextSession.sessionDate, "MMM d") : "—"}</div>
            <div className="delta">{nextSession ? `${nextSession.batch.college.name}` : "nothing scheduled yet"}</div>
          </div>
          <div className="tile gold">
            <div className="label">Ready to invoice</div>
            <div className="value">₹{readyToInvoice}</div>
            <div className="delta">rate ₹{trainer.hourlyRate}/hr</div>
          </div>
        </div>
      </section>

      <div className="row">
        <div className="stack grow" style={{ gap: 20 }}>
          {(overdueSessions.length > 0 || !hasBankDetails) && (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 18 }}>
                Action needed
              </h2>
              <ul className="list">
                {overdueSessions.length > 0 && (
                  <li className="list-row">
                    <span className="icon-box" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
                      <Icon name="clock" size={16} />
                    </span>
                    <div className="grow">
                      <div className="strong">
                        {overdueSessions.length} session{overdueSessions.length !== 1 ? "s" : ""} from{" "}
                        {format(overdueSessions[0].sessionDate, "EEE, MMM d")} still need{overdueSessions.length === 1 ? "s" : ""} attendance
                      </div>
                      <div className="small muted">
                        {overdueSessions[0].courseModule?.title ?? overdueSessions[0].topic ?? "Session"} — {overdueSessions[0].batch.college.name} ·{" "}
                        {overdueSessions[0].batch.name}. Students can&apos;t open these modules and the hours can&apos;t be invoiced until you mark them.
                      </div>
                    </div>
                    <Link className="btn btn-primary btn-sm" href="/lms/trainer/attendance">
                      Mark now
                    </Link>
                  </li>
                )}
                {!hasBankDetails && (
                  <li className="list-row">
                    <span className="icon-box gold">
                      <Icon name="money" size={16} />
                    </span>
                    <div className="grow">
                      <div className="strong">Add your bank details</div>
                      <div className="small muted">Account holder, account number and IFSC are needed before you can generate an invoice.</div>
                    </div>
                    <Link className="btn btn-sm" href="/lms/trainer/details">
                      Add details
                    </Link>
                  </li>
                )}
              </ul>
            </section>
          )}

          <section className="card">
            <div className="split" style={{ marginBottom: 18 }}>
              <h2 className="h2">My batches</h2>
              <Link className="btn btn-sm" href="/lms/trainer/batches">
                <Icon name="arrowR" size={16} />
                All batches
              </Link>
            </div>
            {batches.length === 0 ? (
              <p className="muted">No active batches right now.</p>
            ) : (
              <div className="stack" style={{ gap: 12 }}>
                {batches.map((b) => {
                  const completedCount = b.trainingSessions.filter((s) => s.attendanceTaken).length;
                  const overdueCount = b.trainingSessions.filter((s) => !s.attendanceTaken && s.sessionDate < now).length;
                  const totalModules = b.course.modules.length;
                  const modulesCovered = new Set(b.trainingSessions.filter((s) => s.attendanceTaken).map((s) => s.courseModuleId)).size;
                  const pct = totalModules > 0 ? Math.round((modulesCovered / totalModules) * 100) : 0;
                  return (
                    <Link key={b.id} className="box enr" href={`/lms/trainer/batches?batchId=${b.id}`}>
                      <div className="split" style={{ flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div className="h3">{b.name}</div>
                          <div className="small muted">
                            {b.college.name} · {b.enrollments.length} students
                          </div>
                        </div>
                        <span className="pill success">Active</span>
                      </div>
                      <div className="grid" style={{ ["--min" as string]: "120px", marginTop: 14 }}>
                        <div>
                          <div className="label">Sessions done</div>
                          <div className="strong">{completedCount}</div>
                        </div>
                        <div>
                          <div className="label">To mark</div>
                          <div className="strong" style={{ color: overdueCount > 0 ? "var(--danger)" : undefined }}>
                            {overdueCount}
                          </div>
                        </div>
                        <div>
                          <div className="label">Modules covered</div>
                          <div className="strong">
                            {modulesCovered} / {totalModules}
                          </div>
                        </div>
                      </div>
                      <div className="progress" style={{ marginTop: 12 }}>
                        <span style={{ width: `${pct}%` }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Your sessions
          </h2>
          <ul className="timeline">
            {upcomingSessions.map((s) => (
              <li key={s.id}>
                <div className="strong">{s.courseModule?.title ?? s.topic ?? "Topic TBD"}</div>
                <div className="small muted">
                  {format(s.sessionDate, "MMM d")} · Slot {s.slotNumber} · {s.startTime}–{s.endTime} · attendance pending
                </div>
              </li>
            ))}
          </ul>
          {upcomingSessions.length === 0 && (
            <p className="small muted" style={{ marginTop: 12 }}>
              New sessions appear here when the admin schedules them.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
