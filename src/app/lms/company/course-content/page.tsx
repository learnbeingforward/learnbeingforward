import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { AddCourseContentForm } from "@/components/lms/AddCourseContentForm";
import { SetModuleMainPdfForm } from "@/components/lms/SetModuleMainPdfForm";
import { BackLink } from "@/components/lms/BackLink";
import { deleteCourseContent } from "@/lib/actions/course-content";
import { decideBulkContentRequest } from "@/lib/actions/content-access";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

export default async function CompanyCourseContentPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; moduleId?: string; bulkGroupId?: string }>;
}) {
  const { courseId, moduleId, bulkGroupId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("course-content");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };

  const [courses, modules, subModules, content, pendingCount, pendingBulkRows] = await Promise.all([
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.courseModule.findMany({ orderBy: { title: "asc" } }),
    prisma.courseSubModule.findMany({ orderBy: { order: "asc" } }),
    prisma.courseContent.findMany({
      include: { course: true, courseModule: true, courseSubModule: true, links: true },
      orderBy: [{ course: { name: "asc" } }, { title: "asc" }],
    }),
    prisma.contentAccessRequest.count({ where: { status: "PENDING", groupId: null } }),
    prisma.contentAccessRequest.findMany({ where: { status: "PENDING", groupId: { not: null } }, orderBy: { requestedAt: "asc" } }),
  ]);

  const bulkGroupIds = Array.from(new Set(pendingBulkRows.map((r) => r.groupId!)));
  const bulkTrainerIds = Array.from(new Set(pendingBulkRows.map((r) => r.bulkTrainerId!).filter(Boolean)));
  const bulkBatchIds = Array.from(new Set(pendingBulkRows.map((r) => r.bulkBatchId!).filter(Boolean)));
  const [bulkTrainers, bulkBatches] = await Promise.all([
    prisma.trainer.findMany({ where: { id: { in: bulkTrainerIds } } }),
    prisma.batch.findMany({ where: { id: { in: bulkBatchIds } }, include: { course: true } }),
  ]);
  const trainerById = new Map(bulkTrainers.map((t) => [t.id, t]));
  const batchById = new Map(bulkBatches.map((b) => [b.id, b]));

  const bulkGroups = bulkGroupIds.map((gid) => {
    const rows = pendingBulkRows.filter((r) => r.groupId === gid);
    const studentCount = new Set(rows.map((r) => r.studentId)).size;
    const moduleRows = rows.filter((r) => r.courseContentId !== null);
    const bookRows = rows.filter((r) => r.courseModuleId !== null);
    const trainer = rows[0].bulkTrainerId ? trainerById.get(rows[0].bulkTrainerId) : null;
    const batch = rows[0].bulkBatchId ? batchById.get(rows[0].bulkBatchId) : null;
    return {
      groupId: gid,
      trainerName: trainer?.name ?? "—",
      batchName: batch?.name ?? "—",
      courseName: batch?.course.name ?? "—",
      studentCount,
      contentItemCount: moduleRows.length,
      includesBook: bookRows.length > 0,
      requestedAt: rows.reduce((min, r) => (r.requestedAt < min ? r.requestedAt : min), rows[0].requestedAt),
    };
  });

  return (
    <AppShell
      nav={nav}
      active="course-content"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Course Content"
      title="Course content"
      subtitle="Internal only — not on the public site. Students request a module once their batch has had that class."
    >
      {bulkGroups.length > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 4 }}>Trainer bulk content requests ({bulkGroups.length})</h2>
          <p className="small muted" style={{ marginBottom: 18 }}>A trainer requested to send content to a group of eligible students at once — approve or reject the whole request in one go.</p>
          <ul className="list">
            {bulkGroups.map((g) => (
              <li key={g.groupId} className="list-row" style={{ background: g.groupId === bulkGroupId ? "var(--gold-soft)" : undefined }}>
                <div className="grow">
                  <div className="strong">{g.trainerName} — {g.courseName} — {g.batchName}</div>
                  <div className="small muted">
                    {g.studentCount} student{g.studentCount !== 1 ? "s" : ""} · {g.contentItemCount} content item{g.contentItemCount !== 1 ? "s" : ""}
                    {g.includesBook && " · includes course book"} · {format(g.requestedAt, "MMM d, yyyy")}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <form action={decideBulkContentRequest.bind(null, g.groupId, true)}>
                    <button className="btn btn-primary btn-sm" type="submit">Approve All</button>
                  </form>
                  <form action={decideBulkContentRequest.bind(null, g.groupId, false)}>
                    <button className="btn btn-sm" type="submit">Reject All</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pendingCount > 0 && (
        <Link className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href="/lms/company/course-content/requests">
          <div className="split">
            <div>
              <h2 className="h2">Pending access requests ({pendingCount})</h2>
              <p className="small muted" style={{ marginTop: 4 }}>Students waiting on content or a course book — click to review and approve.</p>
            </div>
            <Icon name="chevR" size={20} />
          </div>
        </Link>
      )}

      <div className="row">
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>Add content</h2>
          <AddCourseContentForm courses={courses} modules={modules} subModules={subModules} />
        </section>

        <section className="card grow">
          {courseId && moduleId ? (
            <>
              <BackLink href={`/lms/company/course-content?courseId=${courseId}`} label="Back to modules" />
              {(() => {
                const mod = modules.find((m) => m.id === moduleId);
                return mod ? <SetModuleMainPdfForm courseModuleId={mod.id} mainPdfTitle={mod.mainPdfTitle} mainPdfUrl={mod.mainPdfUrl} /> : null;
              })()}
              <h2 className="h2" style={{ margin: "18px 0" }}>
                {modules.find((m) => m.id === moduleId)?.title} Content ({content.filter((c) => c.courseId === courseId && c.courseModuleId === moduleId).length})
              </h2>
              <div className="stack" style={{ gap: 10 }}>
                {content.filter((c) => c.courseId === courseId && c.courseModuleId === moduleId).map((item) => (
                  <div key={item.id} className="box">
                    <div className="split">
                      <div>
                        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="strong">
                          {item.courseSubModule ? item.courseSubModule.title : item.title}
                        </a>
                        {item.courseSubModule && <div className="small muted">Sub-module PDF</div>}
                      </div>
                      <DeleteButton action={deleteCourseContent.bind(null, item.id)} />
                    </div>
                    {item.links.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                        {item.links.map((l) => <span key={l.id} className="pill">{l.label}</span>)}
                      </div>
                    )}
                  </div>
                ))}
                {content.filter((c) => c.courseId === courseId && c.courseModuleId === moduleId).length === 0 && <p className="empty">Nothing added for this module yet.</p>}
              </div>
            </>
          ) : courseId ? (
            <>
              <BackLink href="/lms/company/course-content" label="Back to all courses" />
              <h2 className="h2" style={{ marginBottom: 18 }}>{courses.find((c) => c.id === courseId)?.name} — Modules</h2>
              <div className="grid" style={{ ["--min" as string]: "240px" }}>
                {modules
                  .filter((m) => m.courseId === courseId && (content.some((c) => c.courseId === courseId && c.courseModuleId === m.id) || m.mainPdfUrl))
                  .map((mod) => {
                    const count = content.filter((c) => c.courseId === courseId && c.courseModuleId === mod.id).length;
                    return (
                      <Link key={mod.id} className="list-row" href={`/lms/company/course-content?courseId=${courseId}&moduleId=${mod.id}`}>
                        <span className="icon-box gold"><Icon name="book" size={18} /></span>
                        <span className="grow">
                          <span className="strong" style={{ display: "block" }}>{mod.title}</span>
                          <span className="small muted">
                            {count > 0 && `${count} item${count !== 1 ? "s" : ""}`}
                            {count > 0 && mod.mainPdfUrl && " · "}
                            {mod.mainPdfUrl && "Course book attached"}
                            {count === 0 && !mod.mainPdfUrl && "0 items"}
                          </span>
                        </span>
                        <Icon name="chevR" size={16} />
                      </Link>
                    );
                  })}
              </div>
              {!modules.some((m) => m.courseId === courseId && (content.some((c) => c.courseId === courseId && c.courseModuleId === m.id) || m.mainPdfUrl)) && (
                <p className="empty">Nothing added for this course yet.</p>
              )}
            </>
          ) : (
            <>
              <h2 className="h2" style={{ marginBottom: 18 }}>Browse by course</h2>
              <div className="grid" style={{ ["--min" as string]: "240px" }}>
                {courses.map((course) => {
                  const count = content.filter((c) => c.courseId === course.id).length;
                  return (
                    <Link key={course.id} className="list-row" href={`/lms/company/course-content?courseId=${course.id}`}>
                      <span className="icon-box gold"><Icon name="book" size={18} /></span>
                      <span className="grow">
                        <span className="strong" style={{ display: "block" }}>{course.name}</span>
                        <span className="small muted">{count} item{count !== 1 ? "s" : ""}</span>
                      </span>
                      <Icon name="chevR" size={16} />
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
