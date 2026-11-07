import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { AddCourseContentForm } from "@/components/lms/AddCourseContentForm";
import { SetModuleMainPdfForm } from "@/components/lms/SetModuleMainPdfForm";
import { BackLink } from "@/components/lms/BackLink";
import { deleteCourseContent, decideContentAccessRequest } from "@/lib/actions/course-content";
import { decideBulkContentRequest } from "@/lib/actions/content-access";
import { format } from "date-fns";

export default async function CompanyCourseContentPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; moduleId?: string; bulkGroupId?: string }>;
}) {
  const { courseId, moduleId, bulkGroupId } = await searchParams;
  const { navLinks } = await requireCompanyPageAccess("course-content");
  const [courses, modules, subModules, content, pendingContentRequests, pendingPdfRequests, pendingBulkRows] = await Promise.all([
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.courseModule.findMany({ orderBy: { title: "asc" } }),
    prisma.courseSubModule.findMany({ orderBy: { order: "asc" } }),
    prisma.courseContent.findMany({
      include: { course: true, courseModule: true, courseSubModule: true, links: true },
      orderBy: [{ course: { name: "asc" } }, { title: "asc" }],
    }),
    prisma.contentAccessRequest.findMany({
      where: { status: "PENDING", courseContentId: { not: null }, groupId: null },
      include: { student: true, courseContent: { include: { course: true, courseModule: true } } },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.contentAccessRequest.findMany({
      where: { status: "PENDING", courseModuleId: { not: null }, groupId: null },
      include: { student: true, courseModule: { include: { course: true } } },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.contentAccessRequest.findMany({
      where: { status: "PENDING", groupId: { not: null } },
      orderBy: { requestedAt: "asc" },
    }),
  ]);

  const pendingCount = pendingContentRequests.length + pendingPdfRequests.length;

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
    <DashboardShell title="Course Content" subtitle="Internal only — not on the public site" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        This content is only visible inside the LMS. Students can request access to a module&apos;s
        content once their batch has had a class on it, and can download it once you approve.
      </p>

      {bulkGroups.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">Trainer Bulk Content Requests ({bulkGroups.length})</p>
            <p className="mt-1 text-xs text-muted-foreground">
              A trainer requested to send content to a group of eligible students at once — approve or reject the
              whole request in one go.
            </p>
          </div>
          <div className="divide-y divide-border">
            {bulkGroups.map((g) => (
              <div
                key={g.groupId}
                className={`flex flex-wrap items-center justify-between gap-3 p-4 ${g.groupId === bulkGroupId ? "bg-gold/10" : ""}`}
              >
                <div>
                  <p className="text-sm font-medium text-indigo">
                    {g.trainerName} — {g.courseName} — {g.batchName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {g.studentCount} student{g.studentCount !== 1 ? "s" : ""} &middot; {g.contentItemCount} content
                    item{g.contentItemCount !== 1 ? "s" : ""}
                    {g.includesBook && " · includes course book"} &middot; {format(g.requestedAt, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={decideBulkContentRequest.bind(null, g.groupId, true)}>
                    <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                      Approve All
                    </Button>
                  </form>
                  <form action={decideBulkContentRequest.bind(null, g.groupId, false)}>
                    <Button type="submit" size="sm" variant="outline" className="border-border text-muted-foreground">
                      Reject All
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">Pending Access Requests ({pendingCount})</p>
            <p className="mt-1 text-xs text-muted-foreground">
              A student can ask for a specific content item and its course book separately — approve or reject
              each independently; only what you approve becomes downloadable.
            </p>
          </div>
          <div className="divide-y divide-border">
            {pendingContentRequests.map((req) => (
              <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-indigo">{req.student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Course content &middot; {req.courseContent!.course.name} — {req.courseContent!.courseModule?.title}{" "}
                    &middot; {format(req.requestedAt, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={decideContentAccessRequest.bind(null, req.id, true)}>
                    <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                      Approve
                    </Button>
                  </form>
                  <form action={decideContentAccessRequest.bind(null, req.id, false)}>
                    <Button type="submit" size="sm" variant="outline" className="border-border text-muted-foreground">
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
            ))}
            {pendingPdfRequests.map((req) => (
              <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 bg-indigo/5 p-4">
                <div>
                  <p className="text-sm font-medium text-indigo">{req.student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Course book PDF &middot; {req.courseModule!.course.name} — {req.courseModule!.title} &middot;{" "}
                    {format(req.requestedAt, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={decideContentAccessRequest.bind(null, req.id, true)}>
                    <Button type="submit" size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                      Approve
                    </Button>
                  </form>
                  <form action={decideContentAccessRequest.bind(null, req.id, false)}>
                    <Button type="submit" size="sm" variant="outline" className="border-border text-muted-foreground">
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            Add Content
          </h2>
          <AddCourseContentForm courses={courses} modules={modules} subModules={subModules} />
        </div>

        <div>
          {courseId && moduleId ? (
            <>
              <BackLink href={`/lms/company/course-content?courseId=${courseId}`} label="Back to modules" />
              {(() => {
                const mod = modules.find((m) => m.id === moduleId);
                return mod ? (
                  <SetModuleMainPdfForm courseModuleId={mod.id} mainPdfTitle={mod.mainPdfTitle} mainPdfUrl={mod.mainPdfUrl} />
                ) : null;
              })()}
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
                {modules.find((m) => m.id === moduleId)?.title} Content (
                {content.filter((c) => c.courseId === courseId && c.courseModuleId === moduleId).length})
              </h2>
              <div className="max-h-[800px] space-y-3 overflow-y-auto">
                {content
                  .filter((c) => c.courseId === courseId && c.courseModuleId === moduleId)
                  .map((item) => (
                    <div key={item.id} className="rounded-xl border border-border bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-indigo underline"
                          >
                            {item.courseSubModule ? item.courseSubModule.title : item.title}
                          </a>
                          {item.courseSubModule && (
                            <p className="text-xs text-muted-foreground">Sub-module PDF</p>
                          )}
                        </div>
                        <DeleteButton action={deleteCourseContent.bind(null, item.id)} />
                      </div>
                      {item.links.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border pt-2">
                          {item.links.map((l) => (
                            <span key={l.id} className="rounded-full bg-cream px-2 py-0.5 text-[10px] text-indigo/80">
                              {l.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                {content.filter((c) => c.courseId === courseId && c.courseModuleId === moduleId).length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground">Nothing added for this module yet.</p>
                )}
              </div>
            </>
          ) : courseId ? (
            <>
              <BackLink href="/lms/company/course-content" label="Back to all courses" />
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
                {courses.find((c) => c.id === courseId)?.name} — Modules
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {modules
                  .filter(
                    (m) =>
                      m.courseId === courseId &&
                      (content.some((c) => c.courseId === courseId && c.courseModuleId === m.id) || m.mainPdfUrl)
                  )
                  .map((mod) => {
                    const count = content.filter(
                      (c) => c.courseId === courseId && c.courseModuleId === mod.id
                    ).length;
                    return (
                      <Link
                        key={mod.id}
                        href={`/lms/company/course-content?courseId=${courseId}&moduleId=${mod.id}`}
                        className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
                      >
                        <p className="font-semibold text-indigo">{mod.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {count > 0 && `${count} item${count !== 1 ? "s" : ""}`}
                          {count > 0 && mod.mainPdfUrl && " · "}
                          {mod.mainPdfUrl && "Course book attached"}
                          {count === 0 && !mod.mainPdfUrl && "0 items"}
                        </p>
                      </Link>
                    );
                  })}
                {!modules.some(
                  (m) =>
                    m.courseId === courseId &&
                    (content.some((c) => c.courseId === courseId && c.courseModuleId === m.id) || m.mainPdfUrl)
                ) && <p className="p-4 text-sm text-muted-foreground">Nothing added for this course yet.</p>}
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
                Browse by Course
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {courses.map((course) => {
                  const count = content.filter((c) => c.courseId === course.id).length;
                  return (
                    <Link
                      key={course.id}
                      href={`/lms/company/course-content?courseId=${course.id}`}
                      className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
                    >
                      <p className="font-semibold text-indigo">{course.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{count} item{count !== 1 ? "s" : ""}</p>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
