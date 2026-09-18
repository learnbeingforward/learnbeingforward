import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/lms/DeleteButton";
import { AddCourseContentForm } from "@/components/lms/AddCourseContentForm";
import { BackLink } from "@/components/lms/BackLink";
import { deleteCourseContent, decideContentAccessRequest } from "@/lib/actions/course-content";
import { format } from "date-fns";

export default async function CompanyCourseContentPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; moduleId?: string }>;
}) {
  const { courseId, moduleId } = await searchParams;
  const [courses, modules, subModules, content, pendingRequests] = await Promise.all([
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.courseModule.findMany({ orderBy: { title: "asc" } }),
    prisma.courseSubModule.findMany({ orderBy: { order: "asc" } }),
    prisma.courseContent.findMany({
      include: { course: true, courseModule: true, courseSubModule: true, links: true },
      orderBy: [{ course: { name: "asc" } }, { title: "asc" }],
    }),
    prisma.contentAccessRequest.findMany({
      where: { status: "PENDING" },
      include: { student: true, courseContent: { include: { course: true, courseModule: true } } },
      orderBy: { requestedAt: "asc" },
    }),
  ]);

  return (
    <DashboardShell title="Course Content" subtitle="Internal only — not on the public site" navLinks={navLinks}>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        This content is only visible inside the LMS. Students can request access to a module&apos;s
        content once their batch has had a class on it, and can download it once you approve.
      </p>

      {pendingRequests.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">
              Pending Access Requests ({pendingRequests.length})
            </p>
          </div>
          <div className="divide-y divide-border">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-indigo">{req.student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.courseContent.course.name} — {req.courseContent.courseModule?.title} &middot;{" "}
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
                  .filter((m) => content.some((c) => c.courseId === courseId && c.courseModuleId === m.id))
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
                        <p className="mt-1 text-sm text-muted-foreground">{count} item{count !== 1 ? "s" : ""}</p>
                      </Link>
                    );
                  })}
                {!modules.some((m) => content.some((c) => c.courseId === courseId && c.courseModuleId === m.id)) && (
                  <p className="p-4 text-sm text-muted-foreground">Nothing added for this course yet.</p>
                )}
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
