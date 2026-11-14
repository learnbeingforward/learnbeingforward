import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { sendSessionContentToAttendedStudents, unshareSessionContent, deleteSessionContentAsAdmin } from "@/lib/actions/session-content";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function TrainerContentReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const { courseId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("overview.trainer-content");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const allContent = await prisma.sessionContent.findMany({
    include: { trainer: true, course: true, courseModule: true, courseSubModule: true },
    orderBy: { uploadedAt: "desc" },
  });

  if (courseId) {
    const course = allContent.find((c) => c.courseId === courseId)?.course;
    const items = allContent.filter((c) => c.courseId === courseId);

    return (
      <AppShell nav={nav} active="trainer-content" user={shellUser} hasUnread={hasUnread} crumb="Overview › Trainer-Submitted Content" title={course?.name ?? "Course"} subtitle="Trainer-submitted content">
        <BackLink href="/lms/company/trainer-content" label="Back to all courses" />
        <section className="card">
          {items.length === 0 ? (
            <p className="empty">Nothing submitted for this course yet.</p>
          ) : (
            <ul className="list">
              {items.map((item) => (
                <li key={item.id} className="list-row" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div className="grow">
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="strong">{item.title}</a>
                    <div className="small muted">
                      {item.trainer.name} · {item.courseModule?.title}
                      {item.courseSubModule && ` — ${item.courseSubModule.title}`} · {format(item.uploadedAt, "MMM d, yyyy")}
                    </div>
                    {item.description && <div className="small muted" style={{ marginTop: 4 }}>{item.description}</div>}
                    <span className={`pill ${item.sharedWithStudents ? "success" : "warning"}`} style={{ marginTop: 8, display: "inline-block" }}>
                      {item.sharedWithStudents ? `Sent ${item.sharedAt ? format(item.sharedAt, "MMM d, yyyy") : ""}` : "Not sent yet"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {item.sharedWithStudents ? (
                      <form action={unshareSessionContent.bind(null, item.id)}>
                        <button className="btn btn-sm" type="submit">Unshare</button>
                      </form>
                    ) : (
                      <form action={sendSessionContentToAttendedStudents.bind(null, item.id)}>
                        <button className="btn btn-primary btn-sm" type="submit">Send to Student</button>
                      </form>
                    )}
                    <DeleteButton action={deleteSessionContentAsAdmin.bind(null, item.id)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </AppShell>
    );
  }

  const byCourse = new Map<string, { name: string; count: number; sentCount: number }>();
  for (const item of allContent) {
    if (!item.courseId || !item.course) continue;
    const existing = byCourse.get(item.courseId) ?? { name: item.course.name, count: 0, sentCount: 0 };
    existing.count += 1;
    if (item.sharedWithStudents) existing.sentCount += 1;
    byCourse.set(item.courseId, existing);
  }

  return (
    <AppShell
      nav={nav}
      active="trainer-content"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Overview › Trainer-Submitted Content"
      title="Trainer-submitted content"
      subtitle="Content trainers upload lands here first — it never touches the official course content library."
    >
      {byCourse.size === 0 ? (
        <section className="card"><p className="empty">No trainer content submitted yet.</p></section>
      ) : (
        <div className="grid" style={{ ["--min" as string]: "240px" }}>
          {Array.from(byCourse.entries()).map(([cId, c]) => (
            <Link key={cId} className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href={`/lms/company/trainer-content?courseId=${cId}`}>
              <h3 className="h3">{c.name}</h3>
              <p className="small muted" style={{ marginTop: 6 }}>{c.count} item{c.count !== 1 ? "s" : ""} · {c.sentCount} sent</p>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
