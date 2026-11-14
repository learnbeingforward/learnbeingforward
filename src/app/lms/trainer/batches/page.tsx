import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { BackLink } from "@/components/lms/BackLink";
import { DomainTabs } from "@/components/lbf/DomainTabs";
import { format } from "date-fns";

export default async function TrainerBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>;
}) {
  const { batchId } = await searchParams;
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });
  const shellUser = { name: trainer.name, subtitle: "Trainer" };

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
        <AppShell nav={TRAINER_NAV} active="batches" user={shellUser} crumb="My Batches" title="Batch" subtitle="Not found">
          <BackLink href="/lms/trainer/batches" label="Back to My Batches" />
          <p className="muted">This batch isn&apos;t assigned to you.</p>
        </AppShell>
      );
    }

    const completed = batch.trainingSessions.filter((s) => s.attendanceTaken);
    const upcoming = batch.trainingSessions.filter((s) => !s.attendanceTaken);

    return (
      <AppShell nav={TRAINER_NAV} active="batches" user={shellUser} crumb="My Batches" title={batch.name} subtitle={`${batch.college.name} — ${batch.course.name}`}>
        <BackLink href="/lms/trainer/batches" label="Back to My Batches" />
        <section className="card">
          <h2 className="h2" style={{ color: "var(--success-text)" }}>
            Completed sessions ({completed.length})
          </h2>
          {completed.length === 0 ? (
            <p className="muted" style={{ marginTop: 12 }}>No sessions completed yet.</p>
          ) : (
            <ul className="list" style={{ marginTop: 12 }}>
              {completed.map((s) => (
                <li key={s.id} className="list-row">
                  <span className="grow strong">{s.courseModule?.title ?? s.topic ?? "—"}</span>
                  <span className="small muted">
                    {format(s.sessionDate, "MMM d, yyyy")} · Slot {s.slotNumber} ({s.startTime}–{s.endTime})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="h2" style={{ color: "var(--warning-text)" }}>
            Upcoming sessions ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <p className="muted" style={{ marginTop: 12 }}>Nothing scheduled yet.</p>
          ) : (
            <ul className="list" style={{ marginTop: 12 }}>
              {upcoming.map((s) => (
                <li key={s.id} className="list-row">
                  <span className="grow strong">{s.courseModule?.title ?? s.topic ?? "—"}</span>
                  <span className="small muted">
                    {format(s.sessionDate, "MMM d, yyyy")} · Slot {s.slotNumber} ({s.startTime}–{s.endTime})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </AppShell>
    );
  }

  const batches = await prisma.batch.findMany({
    where: { trainerId },
    include: { college: true, course: { include: { modules: true } }, trainingSessions: true, enrollments: true },
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });
  const active = batches.filter((b) => !b.completed);
  const done = batches.filter((b) => b.completed);

  const card = (b: (typeof batches)[number]) => {
    const completedCount = b.trainingSessions.filter((s) => s.attendanceTaken).length;
    const upcomingCount = b.trainingSessions.length - completedCount;
    const totalModules = b.course.modules.length;
    const modulesCovered = new Set(b.trainingSessions.filter((s) => s.attendanceTaken).map((s) => s.courseModuleId)).size;
    const pct = totalModules > 0 ? Math.round((modulesCovered / totalModules) * 100) : 0;
    return (
      <article key={b.id} className="box stack" style={{ gap: 12 }}>
        <div className="split">
          <span className="icon-box navy">
            <Icon name="users" size={20} />
          </span>
          <span className={`pill ${b.completed ? "" : "success"}`}>{b.completed ? "Completed" : "Active"}</span>
        </div>
        <div>
          <h3 className="h3">{b.name}</h3>
          <div className="small muted">{b.college.name}</div>
        </div>
        <div className="grid" style={{ ["--min" as string]: "90px", gap: 8 }}>
          <div className="tile" style={{ padding: 12 }}>
            <div className="label">Students</div>
            <div className="value" style={{ fontSize: 20 }}>
              {b.enrollments.length}
            </div>
          </div>
          <div className="tile" style={{ padding: 12 }}>
            <div className="label">Done</div>
            <div className="value" style={{ fontSize: 20 }}>
              {completedCount}
            </div>
          </div>
          <div className="tile gold" style={{ padding: 12 }}>
            <div className="label">Upcoming</div>
            <div className="value" style={{ fontSize: 20 }}>
              {upcomingCount}
            </div>
          </div>
        </div>
        <div>
          <div className="split small">
            <span className="muted">Course progress</span>
            <span>
              {modulesCovered} / {totalModules} modules
            </span>
          </div>
          <div className="progress gold" style={{ marginTop: 6 }}>
            <span style={{ width: `${Math.max(pct, 4)}%` }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-sm" href="/lms/trainer/schedule">
            <Icon name="calendar" size={16} />
            Schedule
          </Link>
          <Link className="btn btn-sm" href={`/lms/trainer/batches?batchId=${b.id}`}>
            <Icon name="users" size={16} />
            Students
          </Link>
          <Link className="btn btn-primary btn-sm" href="/lms/trainer/attendance">
            Mark attendance
          </Link>
        </div>
      </article>
    );
  };

  return (
    <AppShell nav={TRAINER_NAV} active="batches" user={shellUser} crumb="My Batches" title="My batches" subtitle="Every batch assigned to you, including completed ones.">
      {batches.length === 0 ? (
        <div className="empty">No batches assigned yet.</div>
      ) : (
        <section className="card">
          <DomainTabs
            tabs={[
              { key: "active", label: `Active (${active.length})` },
              { key: "done", label: `Completed (${done.length})` },
            ]}
            panels={{
              active: <div className="grid" style={{ ["--min" as string]: "340px" }}>{active.map(card)}</div>,
              done: <div className="grid" style={{ ["--min" as string]: "340px" }}>{done.map(card)}</div>,
            }}
          />
        </section>
      )}
    </AppShell>
  );
}
