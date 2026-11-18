import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { deleteBatchesCreatedOn } from "@/lib/actions/batches";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function BatchCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("trainers.manage");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const batches = await prisma.batch.findMany({
    include: { college: true, course: true, trainingSessions: true },
    orderBy: { createdAt: "desc" },
  });

  const byDate = new Map<string, typeof batches>();
  for (const b of batches) {
    const key = dateKey(b.createdAt);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(b);
  }
  const sortedDates = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : -1));

  if (date && byDate.has(date)) {
    const dayBatches = byDate.get(date)!;
    const deletableCount = dayBatches.filter((b) => !b.trainingSessions.some((s) => s.attendanceTaken)).length;

    return (
      <AppShell
        nav={nav}
        active="trainers"
        user={shellUser}
        hasUnread={hasUnread}
        crumb="Accounts › Trainers › Batches › Calendar"
        title={new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { dateStyle: "long" })}
        subtitle={`${dayBatches.length} batch${dayBatches.length !== 1 ? "es" : ""} created this day`}
        actions={
          isSuperAdmin && deletableCount > 0 ? (
            <form action={deleteBatchesCreatedOn.bind(null, date)}>
              <button className="btn btn-danger btn-sm" type="submit">
                Delete all {deletableCount} batch{deletableCount !== 1 ? "es" : ""} created this day
              </button>
            </form>
          ) : undefined
        }
      >
        <BackLink href="/lms/company/trainers/batches/calendar" label="Back to calendar" />
        <section className="card">
          <ul className="list">
            {dayBatches.map((b) => {
              const hasAttendance = b.trainingSessions.some((s) => s.attendanceTaken);
              return (
                <li key={b.id} className="list-row" style={{ flexWrap: "wrap" }}>
                  <div className="grow">
                    <div className="strong">
                      {b.college.name} · {b.name}
                    </div>
                    <div className="small muted">{b.course.name}</div>
                  </div>
                  {hasAttendance && <span className="pill">Has attendance — protected</span>}
                </li>
              );
            })}
          </ul>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      nav={nav}
      active="trainers"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Accounts › Trainers › Batches › Calendar"
      title="Batch calendar"
      subtitle="Every batch, grouped by the day it was created."
    >
      <BackLink href="/lms/company/trainers/batches" label="Back to Batches" />
      <section className="card">
        {sortedDates.length === 0 ? (
          <p className="empty">No batches created yet.</p>
        ) : (
          <div className="grid" style={{ ["--min" as string]: "220px" }}>
            {sortedDates.map((key) => {
              const dayBatches = byDate.get(key)!;
              return (
                <a
                  key={key}
                  className="box hover stack"
                  style={{ gap: 6, textDecoration: "none", color: "inherit" }}
                  href={`/lms/company/trainers/batches/calendar?date=${key}`}
                >
                  <span className="strong">{new Date(`${key}T00:00:00`).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  <span className="small muted">
                    {dayBatches.length} batch{dayBatches.length !== 1 ? "es" : ""}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
