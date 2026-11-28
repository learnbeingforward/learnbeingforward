import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { STUDENT_NAV } from "@/components/lbf/nav-config";
import PdfViewer from "@/components/pdf-viewer/PdfViewer";

type PanelItem = { kind: "book" | "content"; id: string; title: string; status: "approved" | "pending" | "none" };
type ViewerItem = { title: string; sub: string; href: string; state: "current" | "open" | "locked" };

function toHref(courseId: string, moduleId: string, it: PanelItem, back?: string) {
  const q = new URLSearchParams();
  if (it.kind === "book") q.set("moduleId", it.id);
  else q.set("contentId", it.id);
  q.set("title", it.title);
  if (back) q.set("back", back);
  return `/lms/student/content/view?${q.toString()}`;
}

/** Every item in a module (the whole-course book, if any, plus its regular
 * content items), each tagged with this student's own approval status for
 * it — used to build both the contents panel and the prev/next pills. The
 * listing page already only ever links to a module whose items are
 * "unlocked" (the trainer has taken that class), so everything here is at
 * least unlocked; the remaining open/locked split is purely about whether
 * this student's own access request for it has been approved yet. */
async function getModulePanel(courseModuleId: string, studentId: string): Promise<{ moduleTitle: string; courseName: string; items: PanelItem[] }> {
  const courseModule = await prisma.courseModule.findUnique({ where: { id: courseModuleId }, include: { course: true } });
  if (!courseModule) return { moduleTitle: "Module", courseName: "Content", items: [] };

  const siblings = await prisma.courseContent.findMany({
    where: { courseModuleId },
    include: { courseSubModule: true },
    orderBy: { title: "asc" },
  });
  const requests = await prisma.contentAccessRequest.findMany({
    where: { studentId, OR: [{ courseModuleId }, { courseContentId: { in: siblings.map((s) => s.id) } }] },
  });
  const statusOf = (r?: { status: string }) => (r?.status === "APPROVED" ? "approved" : r?.status === "PENDING" ? "pending" : "none");

  const items: PanelItem[] = [];
  if (courseModule.mainPdfUrl) {
    const bookRequest = requests.find((r) => r.courseModuleId === courseModuleId && !r.courseContentId);
    items.push({ kind: "book", id: courseModule.id, title: courseModule.mainPdfTitle ?? "Course book", status: statusOf(bookRequest) });
  }
  for (const s of siblings) {
    const request = requests.find((r) => r.courseContentId === s.id);
    items.push({ kind: "content", id: s.id, title: s.courseSubModule ? s.courseSubModule.title : s.title, status: statusOf(request) });
  }

  return { moduleTitle: courseModule.title, courseName: courseModule.course.name, items };
}

function buildViewerItems(panel: PanelItem[], currentKind: "book" | "content", currentId: string, courseId: string, moduleId: string, back?: string) {
  return panel.map((it): ViewerItem & { kind: PanelItem["kind"]; id: string } => {
    const isCurrent = it.kind === currentKind && it.id === currentId;
    const state: ViewerItem["state"] = isCurrent ? "current" : it.status === "approved" ? "open" : "locked";
    const sub = isCurrent || state === "open" ? (it.kind === "book" ? "Course book" : "PDF") : it.status === "pending" ? "Request pending" : "Request access to view";
    return { kind: it.kind, id: it.id, title: it.title, sub, href: toHref(courseId, moduleId, it, back), state };
  });
}

export default async function ContentViewPage({
  searchParams,
}: {
  searchParams: Promise<{ contentId?: string; moduleId?: string; sessionContentId?: string; title?: string; back?: string }>;
}) {
  const { contentId, moduleId, sessionContentId, title: titleParam, back } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/auth");
  const studentId = session.user.id;

  const student = await prisma.user.findUnique({ where: { id: studentId }, select: { name: true, email: true } });
  if (!student) redirect("/auth");
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const watermark = `${student.name} · ${student.email} · ${today}`;
  const backHref = back || "/lms/student/content";

  let refId: string;
  let title: string;
  let subtitle: string;
  let moduleTitle: string;
  let moduleSub: string;
  let items: ViewerItem[] = [];
  let links: { title: string; href: string }[] = [];
  let prev: { title: string; href: string } | null = null;
  let next: { title: string; href: string } | null = null;

  if (contentId) {
    const item = await prisma.courseContent.findUnique({
      where: { id: contentId },
      include: { course: true, courseModule: true, courseSubModule: true, links: { orderBy: { order: "asc" } } },
    });
    if (!item) notFound();

    refId = item.id;
    title = item.courseSubModule ? item.courseSubModule.title : item.title;
    subtitle = `${item.course.name}${item.courseModule ? ` · ${item.courseModule.title}` : ""}`;
    links = item.links.map((l) => ({ title: l.label, href: l.url }));

    if (item.courseModuleId) {
      const panel = await getModulePanel(item.courseModuleId, studentId);
      moduleTitle = panel.moduleTitle;
      moduleSub = `${panel.courseName} · ${panel.items.length} item${panel.items.length === 1 ? "" : "s"}`;
      const viewerItems = buildViewerItems(panel.items, "content", item.id, item.courseId, item.courseModuleId, back);
      items = viewerItems;
      const openOnly = viewerItems.filter((v) => v.state !== "locked");
      const oi = openOnly.findIndex((v) => v.kind === "content" && v.id === item.id);
      prev = oi > 0 ? { title: openOnly[oi - 1].title, href: openOnly[oi - 1].href } : null;
      next = oi >= 0 && oi < openOnly.length - 1 ? { title: openOnly[oi + 1].title, href: openOnly[oi + 1].href } : null;
    } else {
      moduleTitle = title;
      moduleSub = item.course.name;
      items = [{ title, sub: "PDF", href: "#", state: "current" }];
    }
  } else if (moduleId) {
    const courseModule = await prisma.courseModule.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!courseModule || !courseModule.mainPdfUrl) notFound();

    refId = courseModule.id;
    title = courseModule.mainPdfTitle ?? courseModule.title;
    subtitle = `${courseModule.course.name} · ${courseModule.title}`;

    const panel = await getModulePanel(moduleId, studentId);
    moduleTitle = panel.moduleTitle;
    moduleSub = `${panel.courseName} · ${panel.items.length} item${panel.items.length === 1 ? "" : "s"}`;
    const viewerItems = buildViewerItems(panel.items, "book", courseModule.id, courseModule.courseId, moduleId, back);
    items = viewerItems;
    const openOnly = viewerItems.filter((v) => v.state !== "locked");
    const oi = openOnly.findIndex((v) => v.kind === "book" && v.id === courseModule.id);
    prev = oi > 0 ? { title: openOnly[oi - 1].title, href: openOnly[oi - 1].href } : null;
    next = oi >= 0 && oi < openOnly.length - 1 ? { title: openOnly[oi + 1].title, href: openOnly[oi + 1].href } : null;
  } else if (sessionContentId) {
    const content = await prisma.sessionContent.findUnique({
      where: { id: sessionContentId },
      include: { trainer: true, course: true, courseModule: true, courseSubModule: true },
    });
    if (!content || !content.sharedWithStudents) notFound();

    refId = content.id;
    title = content.courseSubModule ? content.courseSubModule.title : content.title;
    subtitle = [content.course?.name, content.courseModule?.title].filter(Boolean).join(" · ") || `Shared by ${content.trainer.name}`;
    moduleTitle = content.courseModule?.title ?? "Shared content";
    moduleSub = `Shared by ${content.trainer.name}`;
    items = [{ title, sub: "PDF", href: "#", state: "current" }];
  } else {
    notFound();
  }

  return (
    <AppShell nav={STUDENT_NAV} active="content" user={{ name: student.name, subtitle: "Student" }} title={titleParam ?? title} immersive>
      {/* The site's own .container/.lift/.stack rules (styles.css, "do not
          edit; change design first") assume a page-head banner above them to
          compensate for — this route has none, so they're overridden here
          instead of there, scoped to this one page only. */}
      <style>{`
        main.app-main-immersive{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;padding:0;margin:0;width:100%;max-width:none}
        main.app-main-immersive > .pv{flex:1;min-width:0}
      `}</style>
      <PdfViewer
        pdfUrl={`/api/content/${refId}/file`}
        title={titleParam ?? title}
        subtitle={subtitle}
        backHref={backHref}
        watermark={watermark}
        prev={prev}
        next={next}
        moduleTitle={moduleTitle}
        moduleSub={moduleSub}
        items={items}
        links={links}
      />
    </AppShell>
  );
}
