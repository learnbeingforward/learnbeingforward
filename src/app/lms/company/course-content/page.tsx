import { Fragment } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { DomainTabs } from "@/components/lbf/DomainTabs";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { AddCourseContentForm } from "@/components/lms/AddCourseContentForm";
import { SetModuleMainPdfForm } from "@/components/lms/SetModuleMainPdfForm";
import { BackLink } from "@/components/lms/BackLink";
import { CourseStudioSidebar } from "@/components/lms/CourseStudioSidebar";
import { InlineRenameInput } from "@/components/lms/InlineRenameInput";
import { TreeDeleteButton } from "@/components/lms/TreeDeleteButton";
import { TreeAddChildButton } from "@/components/lms/TreeAddChildButton";
import {
  deleteCourseContent,
  renameCourseModule,
  renameCourseSubModule,
  createCourseModule,
  createCourseSubModule,
  deleteCourseModule,
  deleteCourseSubModule,
} from "@/lib/actions/course-content";
import { decideBulkContentRequest } from "@/lib/actions/content-access";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };
const DOMAIN_LABEL: Record<string, string> = { TECHNICAL: "Technical", APTITUDE: "Aptitude", SOFT_SKILL: "Soft skill" };

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
    prisma.course.findMany({ orderBy: { name: "asc" }, include: { buyListing: true } }),
    prisma.courseModule.findMany({ orderBy: { order: "asc" } }),
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

  const sidebarCourses = courses.map((c) => ({
    id: c.id,
    name: c.name,
    moduleCount: modules.filter((m) => m.courseId === c.id).length,
    itemCount: content.filter((item) => item.courseId === c.id).length,
    onBuy: !!c.buyListing,
  }));

  const selectedCourse = courseId ? courses.find((c) => c.id === courseId) : undefined;
  const selectedModule = moduleId ? modules.find((m) => m.id === moduleId) : undefined;
  const courseModules = selectedCourse ? modules.filter((m) => m.courseId === selectedCourse.id) : [];
  const pdfCount =
    (selectedCourse ? content.filter((item) => item.courseId === selectedCourse.id).length : 0) +
    courseModules.filter((m) => m.mainPdfUrl).length;

  return (
    <AppShell
      nav={nav}
      active="course-content"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Course Content"
      title="Course Studio"
      subtitle="Create courses, modules, sub-modules and topics, attach PDFs, and choose when each batch gets them."
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

      <div className="st-wrap">
        <CourseStudioSidebar courses={sidebarCourses} selectedCourseId={selectedCourse?.id} />

        <section className="st-main">
          {!selectedCourse ? (
            <section className="card">
              <h2 className="h2" style={{ marginBottom: 18 }}>Pick a course</h2>
              <p className="muted">Select a course on the left, or create a new one, to manage its structure.</p>
              <div className="row" style={{ marginTop: 18 }}>
                <section className="card side">
                  <h2 className="h2" style={{ marginBottom: 18 }}>Add content</h2>
                  <AddCourseContentForm courses={courses} modules={modules} subModules={subModules} />
                </section>
              </div>
            </section>
          ) : moduleId && selectedModule ? (
            <section className="card">
              <BackLink href={`/lms/company/course-content?courseId=${selectedCourse.id}`} label="Back to structure" />
              <SetModuleMainPdfForm courseModuleId={selectedModule.id} mainPdfTitle={selectedModule.mainPdfTitle} mainPdfUrl={selectedModule.mainPdfUrl} />
              <h2 className="h2" style={{ margin: "18px 0" }}>
                {selectedModule.title} Content ({content.filter((c) => c.courseId === selectedCourse.id && c.courseModuleId === moduleId).length})
              </h2>
              <div className="stack" style={{ gap: 10 }}>
                {content.filter((c) => c.courseId === selectedCourse.id && c.courseModuleId === moduleId).map((item) => (
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
                {content.filter((c) => c.courseId === selectedCourse.id && c.courseModuleId === moduleId).length === 0 && (
                  <p className="empty">Nothing added for this module yet.</p>
                )}
              </div>
              <div style={{ marginTop: 18 }}>
                <AddCourseContentForm courses={courses} modules={modules} subModules={subModules} />
              </div>
            </section>
          ) : (
            <>
              <div className="card st-head">
                <div className="split" style={{ flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div className="label">
                      {DOMAIN_LABEL[selectedCourse.domain] ?? selectedCourse.domain} · {selectedCourse.isPlaceholder ? "Draft" : "Live"}
                    </div>
                    <h2 className="h2" style={{ marginTop: 4 }}>{selectedCourse.name}</h2>
                    <div className="st-badges">
                      {!selectedCourse.isPlaceholder && (
                        <span className="pill success">
                          <Icon name="globe" size={12} /> On website
                        </span>
                      )}
                      <span className="pill">{pdfCount} PDF{pdfCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link className="btn btn-sm" href="/lms/student/content">
                      <Icon name="eye" size={16} />
                      Student view
                    </Link>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <DomainTabs
                    tabs={[
                      { key: "structure", label: "Structure" },
                      { key: "release", label: "Share with batches" },
                      { key: "settings", label: "Course settings" },
                    ]}
                    panels={{
                      structure: (
                        <div className="st-body">
                          <div className="card">
                            <div className="split" style={{ marginBottom: 12 }}>
                              <div>
                                <h3 className="h3">Structure</h3>
                                <p className="small muted">Course → Module → Sub-module. Click a name to rename.</p>
                              </div>
                            </div>
                            <ul className="st-tree">
                              {courseModules.map((mod) => {
                                const modPdfCount = content.filter((c) => c.courseModuleId === mod.id).length;
                                return (
                                  <Fragment key={mod.id}>
                                    <li className="st-node" style={{ ["--d" as string]: 0 }}>
                                      <span className="st-grip" title="Drag to reorder">
                                        <Icon name="grip" size={16} />
                                      </span>
                                      <button className="st-tog" type="button" aria-label="Collapse">
                                        <Icon name="chevD" size={14} />
                                      </button>
                                      <span className="st-lvl l0">Module</span>
                                      <InlineRenameInput defaultValue={mod.title} action={renameCourseModule.bind(null, mod.id)} ariaLabel="Module name" />
                                      {mod.mainPdfUrl ? (
                                        <span className="st-chip gold" title={mod.mainPdfTitle ?? undefined}>
                                          <Icon name="book" size={12} />
                                          Book
                                        </span>
                                      ) : null}
                                      <span className="small muted">{modPdfCount}</span>
                                      <span className="st-acts">
                                        <TreeAddChildButton
                                          title="Add sub-module inside"
                                          promptLabel="New sub-module name"
                                          action={async (title) => {
                                            "use server";
                                            await createCourseSubModule(mod.id, title);
                                          }}
                                        />
                                        <Link className="btn-icon" href={`/lms/company/course-content?courseId=${selectedCourse.id}&moduleId=${mod.id}`} title="Details">
                                          <Icon name="edit" size={16} />
                                        </Link>
                                        <TreeDeleteButton title="Delete" action={deleteCourseModule.bind(null, mod.id)} />
                                      </span>
                                    </li>
                                    {subModules
                                      .filter((sm) => sm.courseModuleId === mod.id)
                                      .map((sm) => {
                                        const smPdf = content.find((c) => c.courseSubModuleId === sm.id);
                                        return (
                                          <li key={sm.id} className="st-node" style={{ ["--d" as string]: 1 }}>
                                            <span className="st-grip" title="Drag to reorder">
                                              <Icon name="grip" size={16} />
                                            </span>
                                            <button className="st-tog" type="button" aria-label="Collapse" style={{ visibility: "hidden" }}>
                                              <Icon name="chevD" size={14} />
                                            </button>
                                            <span className="st-lvl l1">Sub-module</span>
                                            <InlineRenameInput defaultValue={sm.title} action={renameCourseSubModule.bind(null, sm.id)} ariaLabel="Sub-module name" />
                                            {smPdf ? (
                                              <span className="st-chip ok" title={smPdf.title}>
                                                <Icon name="file" size={12} />
                                                PDF
                                              </span>
                                            ) : (
                                              <span className="small muted">No PDF yet</span>
                                            )}
                                            <span className="st-acts">
                                              <Link className="btn-icon" href={`/lms/company/course-content?courseId=${selectedCourse.id}&moduleId=${mod.id}`} title="Details">
                                                <Icon name="edit" size={16} />
                                              </Link>
                                              <TreeDeleteButton title="Delete" action={deleteCourseSubModule.bind(null, sm.id)} />
                                            </span>
                                          </li>
                                        );
                                      })}
                                  </Fragment>
                                );
                              })}
                            </ul>
                            {courseModules.length === 0 && <p className="empty">No modules yet — add the first one below.</p>}
                            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                              <TreeAddChildButton
                                variant="full"
                                title="Add module"
                                promptLabel="New module name"
                                action={async (title) => {
                                  "use server";
                                  await createCourseModule(selectedCourse.id, title);
                                }}
                              />
                            </div>
                          </div>
                          <aside className="card st-detail">
                            <div className="empty" style={{ border: 0 }}>
                              <span className="icon-box gold" style={{ margin: "0 auto 10px" }}>
                                <Icon name="edit" size={16} />
                              </span>
                              <div className="h3" style={{ color: "var(--text)" }}>Select an item</div>
                              <p className="small muted" style={{ marginTop: 6 }}>
                                Press the edit icon on any row to attach its PDF and learn-more links.
                              </p>
                            </div>
                          </aside>
                        </div>
                      ),
                      release: (
                        <div className="card">
                          <div className="empty">
                            <span className="icon-box gold" style={{ margin: "0 auto 10px", width: 48, height: 48, borderRadius: "50%" }}>
                              <Icon name="users" size={22} />
                            </span>
                            <div className="h3" style={{ color: "var(--text)" }}>Sharing with batches isn&apos;t set up yet.</div>
                            <p className="small muted" style={{ marginTop: 6 }}>
                              This will let you choose exactly when each batch gets this course&apos;s content — coming soon.
                            </p>
                          </div>
                        </div>
                      ),
                      settings: (
                        <div className="card">
                          <div className="empty">
                            <span className="icon-box gold" style={{ margin: "0 auto 10px", width: 48, height: 48, borderRadius: "50%" }}>
                              <Icon name="settings" size={22} />
                            </span>
                            <div className="h3" style={{ color: "var(--text)" }}>Course settings aren&apos;t set up yet.</div>
                            <p className="small muted" style={{ marginTop: 6 }}>
                              This will let you edit this course&apos;s name, category and public description — coming soon.
                            </p>
                          </div>
                        </div>
                      ),
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
