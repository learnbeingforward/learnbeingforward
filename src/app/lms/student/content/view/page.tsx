import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { STUDENT_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";

export default async function StudentContentViewerPage({
  searchParams,
}: {
  searchParams: Promise<{ contentId?: string; moduleId?: string; sessionContentId?: string; title?: string; back?: string }>;
}) {
  const { contentId, moduleId, sessionContentId, title, back } = await searchParams;
  const session = await auth();
  const studentId = session!.user.id;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { name: true, college: { select: { name: true } } },
  });
  const shellUser = { name: student?.name ?? "Student", subtitle: student?.college?.name ?? "Student" };

  const params = new URLSearchParams();
  if (contentId) params.set("contentId", contentId);
  if (moduleId) params.set("moduleId", moduleId);
  if (sessionContentId) params.set("sessionContentId", sessionContentId);
  const viewerSrc = `/api/content/view?${params.toString()}#toolbar=0&navpanes=0`;

  const viewer = (
    <section className="card cv-main">
      <div style={{ height: "80vh" }}>
        <iframe src={viewerSrc} title={title ?? "Document"} style={{ width: "100%", height: "100%", border: "none" }} />
      </div>
    </section>
  );

  // Only the item branch has a meaningful set of siblings + "learn more"
  // links — a whole course book or an ad-hoc trainer upload has no module
  // of siblings to show alongside it.
  if (contentId) {
    const item = await prisma.courseContent.findUnique({
      where: { id: contentId },
      include: { course: true, courseModule: true, links: { orderBy: { order: "asc" } } },
    });

    if (item && item.courseModuleId) {
      const siblings = await prisma.courseContent.findMany({ where: { courseModuleId: item.courseModuleId }, orderBy: { title: "asc" } });
      const myRequests = await prisma.contentAccessRequest.findMany({
        where: { studentId, courseContentId: { in: siblings.map((s) => s.id) } },
      });
      const requestByContentId = new Map(myRequests.map((r) => [r.courseContentId, r]));
      const currentIndex = siblings.findIndex((s) => s.id === item.id);
      const next = siblings[currentIndex + 1];

      return (
        <AppShell
          nav={STUDENT_NAV}
          active="content"
          user={shellUser}
          crumb={`Content › ${item.course.name} › ${item.courseModule?.title ?? "Module"}`}
          title={item.title}
          subtitle="Viewable here only — not available to download or share."
          actions={
            <Link className="btn btn-ghost-light" href={back || "/lms/student/content"}>
              <Icon name="arrowL" size={16} />
              Back to content
            </Link>
          }
        >
          <div className="cv-wrap">
            <section className="card cv-side">
              <div className="split" style={{ marginBottom: 18 }}>
                <h2 className="h2">{item.courseModule?.title ?? "Module"}</h2>
              </div>
              <ul className="cv-items">
                {siblings.map((s) => {
                  const isCurrent = s.id === item.id;
                  const request = requestByContentId.get(s.id);
                  const state = isCurrent ? "open" : request?.status === "APPROVED" ? "open" : "request";
                  return (
                    <li key={s.id} className={state}>
                      <span>
                        <Icon name={isCurrent || state === "open" ? "file" : "lock"} size={14} />
                      </span>
                      <b>{s.title}</b>
                      {isCurrent ? (
                        <em>Reading</em>
                      ) : state === "open" ? (
                        <Link
                          href={`/lms/student/content/view?contentId=${s.id}&title=${encodeURIComponent(s.title)}&back=${encodeURIComponent(back || "/lms/student/content")}`}
                          className="pill success"
                        >
                          View
                        </Link>
                      ) : request?.status === "PENDING" ? (
                        <span className="pill gold">Request sent</span>
                      ) : (
                        <span className="pill gold">Request access</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
            {viewer}
            <section className="card cv-links">
              <div className="split" style={{ marginBottom: 18 }}>
                <h2 className="h2">Learn more</h2>
              </div>
              {item.links.length === 0 ? (
                <p className="small muted">No extra links for this one.</p>
              ) : (
                <ul className="list">
                  {item.links.map((l) => (
                    <li key={l.id}>
                      <a className="list-row" href={l.url} target="_blank" rel="noopener noreferrer">
                        <Icon name="link" size={16} />
                        <span className="grow small strong">{l.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {next && (
                <div style={{ marginTop: 16 }}>
                  <Link
                    className="btn btn-gold btn-sm"
                    href={`/lms/student/content/view?contentId=${next.id}&title=${encodeURIComponent(next.title)}&back=${encodeURIComponent(back || "/lms/student/content")}`}
                  >
                    <Icon name="arrowR" size={16} />
                    Next: {next.title}
                  </Link>
                </div>
              )}
            </section>
          </div>
        </AppShell>
      );
    }
  }

  return (
    <AppShell
      nav={STUDENT_NAV}
      active="content"
      user={shellUser}
      crumb="Course materials"
      title={title ?? "Viewing"}
      subtitle="Viewable here only — not available to download or share."
      actions={
        <Link className="btn btn-ghost-light" href={back || "/lms/student/content"}>
          <Icon name="arrowL" size={16} />
          Back to content
        </Link>
      }
    >
      {viewer}
    </AppShell>
  );
}
