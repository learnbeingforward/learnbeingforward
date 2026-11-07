import Link from "next/link";
import { Download, Clock, BookOpen } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { studentNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/lms/BackLink";
import { getUnlockedContentForStudent, getCourseBooksForStudent, getSharedTrainerContentForStudent } from "@/lib/content-access";
import { requestContentAccess, requestModulePdfAccess } from "@/lib/actions/content-access";

export default async function StudentContentPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; moduleId?: string }>;
}) {
  const { courseId, moduleId } = await searchParams;
  const session = await auth();
  const studentId = session!.user.id;

  const [unlocked, courseBooks, myRequests, trainerContent] = await Promise.all([
    getUnlockedContentForStudent(studentId),
    getCourseBooksForStudent(studentId),
    prisma.contentAccessRequest.findMany({ where: { studentId } }),
    courseId || moduleId ? Promise.resolve([]) : getSharedTrainerContentForStudent(studentId),
  ]);

  const requestByContentId = new Map(myRequests.map((r) => [r.courseContentId, r]));
  const requestByModuleId = new Map(myRequests.map((r) => [r.courseModuleId, r]));

  if (unlocked.length === 0 && courseBooks.length === 0 && trainerContent.length === 0) {
    return (
      <DashboardShell title="Content" subtitle="Course materials" navLinks={navLinks}>
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          Content unlocks here once your trainer has taken a class on that module and marked
          attendance. Nothing&apos;s unlocked yet.
        </div>
      </DashboardShell>
    );
  }

  // Level 3: a specific module's sub-modules (or flat items, for legacy module-level content)
  if (courseId && moduleId) {
    const courseBook = courseBooks.find((m) => m.id === moduleId);
    const course = unlocked.find((i) => i.courseId === courseId)?.course ?? courseBook?.course;
    const courseModule = unlocked.find((i) => i.courseModuleId === moduleId)?.courseModule ?? courseBook;
    const items = unlocked.filter((i) => i.courseId === courseId && i.courseModuleId === moduleId);
    const bookRequest = requestByModuleId.get(moduleId);

    return (
      <DashboardShell title={courseModule?.title ?? "Module"} subtitle={course?.name ?? "Content"} navLinks={navLinks}>
        <BackLink href={`/lms/student/content?courseId=${courseId}`} label={`Back to ${course?.name ?? "course"}`} />
        <div className="space-y-3">
          {courseBook && (
            <div className="rounded-xl border border-indigo/20 bg-indigo/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-indigo" />
                  <div>
                    <p className="text-sm font-semibold text-indigo">{courseBook.mainPdfTitle}</p>
                    <p className="text-xs text-muted-foreground">Whole course book</p>
                  </div>
                </div>
                {bookRequest?.status === "APPROVED" ? (
                  <Button
                    render={<a href={courseBook.mainPdfUrl!} target="_blank" rel="noopener noreferrer" />}
                    nativeButton={false}
                    size="sm"
                    className="bg-indigo text-white hover:bg-indigo/90"
                  >
                    <Download className="size-3.5" />
                    Download
                  </Button>
                ) : bookRequest?.status === "PENDING" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-indigo">
                    <Clock className="size-3.5" /> Request pending
                  </span>
                ) : (
                  <form action={requestModulePdfAccess.bind(null, moduleId)}>
                    <Button type="submit" size="sm" variant="outline" className="border-indigo/30 text-indigo">
                      Request Access
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}
          {items.map((item) => {
            const request = requestByContentId.get(item.id);
            return (
              <div key={item.id} className="rounded-xl border border-border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-indigo">
                      {item.courseSubModule ? item.courseSubModule.title : item.title}
                    </p>
                    {item.courseSubModule && (
                      <p className="text-xs text-muted-foreground">Complete learning guide</p>
                    )}
                  </div>
                  {request?.status === "APPROVED" ? (
                    <Button
                      render={<a href={item.fileUrl} target="_blank" rel="noopener noreferrer" />}
                      nativeButton={false}
                      size="sm"
                      className="bg-indigo text-white hover:bg-indigo/90"
                    >
                      <Download className="size-3.5" />
                      Download
                    </Button>
                  ) : request?.status === "PENDING" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-indigo">
                      <Clock className="size-3.5" /> Request pending
                    </span>
                  ) : (
                    <form action={requestContentAccess.bind(null, item.id)}>
                      <Button type="submit" size="sm" variant="outline" className="border-border text-indigo">
                        Request Access
                      </Button>
                    </form>
                  )}
                </div>
                {item.links.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-border pt-3">
                    <p className="text-xs font-medium text-muted-foreground">Learn more:</p>
                    {item.links.map((l) => (
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-indigo underline"
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {items.length === 0 && !courseBook && (
            <p className="p-4 text-sm text-muted-foreground">Nothing unlocked for this module yet.</p>
          )}
        </div>
      </DashboardShell>
    );
  }

  // Level 2: a course's modules
  if (courseId) {
    const course = unlocked.find((i) => i.courseId === courseId)?.course ?? courseBooks.find((m) => m.courseId === courseId)?.course;
    const courseItems = unlocked.filter((i) => i.courseId === courseId);

    const byModule = new Map<string, { title: string; count: number; hasBook: boolean }>();
    for (const item of courseItems) {
      if (!item.courseModuleId || !item.courseModule) continue;
      const existing = byModule.get(item.courseModuleId);
      if (existing) existing.count += 1;
      else byModule.set(item.courseModuleId, { title: item.courseModule.title, count: 1, hasBook: false });
    }
    for (const mod of courseBooks.filter((m) => m.courseId === courseId)) {
      const existing = byModule.get(mod.id);
      if (existing) existing.hasBook = true;
      else byModule.set(mod.id, { title: mod.title, count: 0, hasBook: true });
    }

    return (
      <DashboardShell title={course?.name ?? "Course"} subtitle="Modules" navLinks={navLinks}>
        <BackLink href="/lms/student/content" label="Back to all courses" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(byModule.entries()).map(([modId, mod]) => (
            <Link
              key={modId}
              href={`/lms/student/content?courseId=${courseId}&moduleId=${modId}`}
              className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
            >
              <p className="font-semibold text-indigo">{mod.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {mod.count > 0 && `${mod.count} sub-module${mod.count !== 1 ? "s" : ""}`}
                {mod.count > 0 && mod.hasBook && " · "}
                {mod.hasBook && "Course book available"}
              </p>
            </Link>
          ))}
        </div>
      </DashboardShell>
    );
  }

  // Level 1: courses with unlocked content or a course book
  const byCourse = new Map<string, { name: string; count: number }>();
  for (const item of unlocked) {
    const existing = byCourse.get(item.courseId);
    if (existing) existing.count += 1;
    else byCourse.set(item.courseId, { name: item.course.name, count: 1 });
  }
  for (const mod of courseBooks) {
    if (!byCourse.has(mod.courseId)) {
      byCourse.set(mod.courseId, { name: mod.course.name, count: 0 });
    }
  }

  return (
    <DashboardShell title="Content" subtitle="Course materials" navLinks={navLinks}>
      {trainerContent.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">
            From Your Trainers ({trainerContent.length})
          </h2>
          <div className="space-y-3">
            {trainerContent.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-white p-4">
                <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo underline">
                  {c.title}
                </a>
                <p className="text-xs text-muted-foreground">
                  {c.trainer.name} &middot; {c.course?.name} — {c.courseModule?.title}
                  {c.courseSubModule && ` — ${c.courseSubModule.title}`}
                </p>
                {c.description && <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {byCourse.size > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(byCourse.entries()).map(([cId, course]) => (
            <Link
              key={cId}
              href={`/lms/student/content?courseId=${cId}`}
              className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
            >
              <p className="font-semibold text-indigo">{course.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {course.count > 0 ? `${course.count} item${course.count !== 1 ? "s" : ""} unlocked` : "Course book available"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
