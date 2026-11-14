import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { STUDENT_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
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

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { name: true, college: { select: { name: true } } },
  });
  const shellUser = { name: student?.name ?? "Student", subtitle: student?.college?.name ?? "Student" };

  const [unlocked, courseBooks, myRequests, trainerContent] = await Promise.all([
    getUnlockedContentForStudent(studentId),
    getCourseBooksForStudent(studentId),
    prisma.contentAccessRequest.findMany({ where: { studentId } }),
    courseId || moduleId ? Promise.resolve([]) : getSharedTrainerContentForStudent(studentId),
  ]);

  const requestByContentId = new Map(myRequests.map((r) => [r.courseContentId, r]));
  const requestByModuleId = new Map(myRequests.map((r) => [r.courseModuleId, r]));

  const shell = (title: string, subtitle: string, children: React.ReactNode) => (
    <AppShell nav={STUDENT_NAV} active="content" user={shellUser} crumb="Course materials" title={title} subtitle={subtitle}>
      {children}
    </AppShell>
  );

  if (unlocked.length === 0 && courseBooks.length === 0 && trainerContent.length === 0) {
    return shell(
      "Content",
      "Modules unlock after your batch has had that class.",
      <div className="empty">Content unlocks here once your trainer has taken a class on that module and marked attendance. Nothing&apos;s unlocked yet.</div>
    );
  }

  // Level 3: a specific module's items
  if (courseId && moduleId) {
    const courseBook = courseBooks.find((m) => m.id === moduleId);
    const course = unlocked.find((i) => i.courseId === courseId)?.course ?? courseBook?.course;
    const courseModule = unlocked.find((i) => i.courseModuleId === moduleId)?.courseModule ?? courseBook;
    const items = unlocked.filter((i) => i.courseId === courseId && i.courseModuleId === moduleId);
    const bookRequest = requestByModuleId.get(moduleId);

    return shell(
      courseModule?.title ?? "Module",
      course?.name ?? "Content",
      <>
        <BackLink href={`/lms/student/content?courseId=${courseId}`} label={`Back to ${course?.name ?? "course"}`} />
        <section className="card">
          <ul className="list">
            {courseBook && (
              <li className="list-row">
                <span className="icon-box gold">
                  <Icon name="book" size={18} />
                </span>
                <div className="grow">
                  <div className="strong">{courseBook.mainPdfTitle}</div>
                  <div className="small muted">Whole course book</div>
                </div>
                {bookRequest?.status === "APPROVED" ? (
                  <a className="btn btn-sm" href={courseBook.mainPdfUrl!} target="_blank" rel="noopener noreferrer">
                    <Icon name="download" size={16} />
                    Download
                  </a>
                ) : bookRequest?.status === "PENDING" ? (
                  <span className="pill warning">Request sent</span>
                ) : (
                  <form action={requestModulePdfAccess.bind(null, moduleId)}>
                    <button className="btn btn-primary btn-sm" type="submit">
                      Request access
                    </button>
                  </form>
                )}
              </li>
            )}
            {items.map((item) => {
              const request = requestByContentId.get(item.id);
              return (
                <li key={item.id} className="list-row" style={{ alignItems: "flex-start" }}>
                  <span className="icon-box gold">
                    <Icon name="file" size={18} />
                  </span>
                  <div className="grow">
                    <div className="strong">{item.courseSubModule ? item.courseSubModule.title : item.title}</div>
                    <div className="small muted">
                      {item.courseSubModule ? "Complete learning guide" : "PDF"}
                      {item.links.length > 0 && ` · + ${item.links.length} learn-more link${item.links.length !== 1 ? "s" : ""}`}
                    </div>
                    {item.links.length > 0 && (
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        {item.links.map((l) => (
                          <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="small">
                            {l.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {request?.status === "APPROVED" ? (
                    <a className="btn btn-sm" href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Icon name="download" size={16} />
                      Download
                    </a>
                  ) : request?.status === "PENDING" ? (
                    <span className="pill warning">Request sent</span>
                  ) : (
                    <form action={requestContentAccess.bind(null, item.id)}>
                      <button className="btn btn-sm" type="submit">
                        Request access
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
            {items.length === 0 && !courseBook && <p className="muted" style={{ padding: 16 }}>Nothing unlocked for this module yet.</p>}
          </ul>
        </section>
      </>
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

    return shell(
      course?.name ?? "Course",
      "Modules",
      <>
        <BackLink href="/lms/student/content" label="Back to all courses" />
        <div className="grid" style={{ ["--min" as string]: "260px" }}>
          {Array.from(byModule.entries()).map(([modId, mod]) => (
            <a key={modId} className="list-row" href={`/lms/student/content?courseId=${courseId}&moduleId=${modId}`}>
              <span className="icon-box navy">
                <Icon name="layers" size={18} />
              </span>
              <div className="grow">
                <div className="strong">{mod.title}</div>
                <div className="small muted">
                  {mod.count > 0 && `${mod.count} sub-module${mod.count !== 1 ? "s" : ""}`}
                  {mod.count > 0 && mod.hasBook && " · "}
                  {mod.hasBook && "Course book available"}
                </div>
              </div>
              <Icon name="chevR" size={16} />
            </a>
          ))}
        </div>
      </>
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
    if (!byCourse.has(mod.courseId)) byCourse.set(mod.courseId, { name: mod.course.name, count: 0 });
  }

  return shell(
    "Content",
    "Modules unlock after your batch has had that class.",
    <>
      {trainerContent.length > 0 && (
        <section className="card">
          <h2 className="h2">From your trainers ({trainerContent.length})</h2>
          <ul className="list" style={{ marginTop: 14 }}>
            {trainerContent.map((c) => (
              <li key={c.id} className="list-row" style={{ alignItems: "flex-start" }}>
                <span className="icon-box gold">
                  <Icon name="file" size={18} />
                </span>
                <div className="grow">
                  <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="strong">
                    {c.title}
                  </a>
                  <div className="small muted">
                    {c.trainer.name} · {c.course?.name} — {c.courseModule?.title}
                    {c.courseSubModule && ` — ${c.courseSubModule.title}`}
                  </div>
                  {c.description && <div className="small muted">{c.description}</div>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {byCourse.size > 0 && (
        <section className="card">
          <div className="grid" style={{ ["--min" as string]: "260px" }}>
            {Array.from(byCourse.entries()).map(([cId, course]) => (
              <a key={cId} className="list-row" href={`/lms/student/content?courseId=${cId}`}>
                <span className="icon-box navy">
                  <Icon name="book" size={18} />
                </span>
                <div className="grow">
                  <div className="strong">{course.name}</div>
                  <div className="small muted">{course.count > 0 ? `${course.count} item${course.count !== 1 ? "s" : ""} unlocked` : "Course book available"}</div>
                </div>
                <Icon name="chevR" size={16} />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
