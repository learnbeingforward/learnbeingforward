import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { BUYER_NAV } from "@/components/lbf/nav-config";
import PdfViewer from "@/components/pdf-viewer/PdfViewer";

type PanelItem = { kind: "book" | "content"; id: string; title: string };
type ViewerItem = { title: string; sub: string; href: string; state: "current" | "open" };

function toHref(it: PanelItem, back?: string) {
  const q = new URLSearchParams();
  if (it.kind === "book") q.set("moduleId", it.id);
  else q.set("contentId", it.id);
  q.set("title", it.title);
  if (back) q.set("back", back);
  return `/lms/buyer/view?${q.toString()}`;
}

/** Every book and sub-module item in the course, in the same order the buyer's
 * purchases page lists them (course books first, then sub-module content) —
 * a buyer's order covers the whole course, not individual items, so there's
 * no locked/approved split to track here, unlike the student version. */
async function getCoursePanel(courseId: string): Promise<{ courseName: string; items: PanelItem[] }> {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  const [modules, content] = await Promise.all([
    prisma.courseModule.findMany({ where: { courseId, mainPdfUrl: { not: null } }, orderBy: { order: "asc" } }),
    prisma.courseContent.findMany({ where: { courseId }, include: { courseSubModule: true }, orderBy: { title: "asc" } }),
  ]);

  const items: PanelItem[] = [
    ...modules.map((m): PanelItem => ({ kind: "book", id: m.id, title: m.mainPdfTitle ?? m.title })),
    ...content.map((c): PanelItem => ({ kind: "content", id: c.id, title: c.courseSubModule ? c.courseSubModule.title : c.title })),
  ];

  return { courseName: course?.name ?? "Course", items };
}

function buildViewerItems(panel: PanelItem[], currentKind: "book" | "content", currentId: string, back?: string): (ViewerItem & PanelItem)[] {
  return panel.map((it) => {
    const isCurrent = it.kind === currentKind && it.id === currentId;
    return { ...it, sub: it.kind === "book" ? "Course book" : "PDF", href: toHref(it, back), state: isCurrent ? "current" : "open" };
  });
}

export default async function BuyerContentViewerPage({
  searchParams,
}: {
  searchParams: Promise<{ contentId?: string; moduleId?: string; title?: string; back?: string }>;
}) {
  const { contentId, moduleId, title: titleParam, back } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const buyer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } });
  if (!buyer) redirect("/auth");
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const watermark = `${buyer.name} · ${buyer.email} · ${today}`;
  const backHref = back || "/lms/buyer";

  let refId: string;
  let title: string;
  let subtitle: string;
  let courseId: string;
  let currentKind: "book" | "content";

  if (contentId) {
    const item = await prisma.courseContent.findUnique({
      where: { id: contentId },
      include: { course: true, courseModule: true, courseSubModule: true, links: { orderBy: { order: "asc" } } },
    });
    if (!item) notFound();
    refId = item.id;
    title = item.courseSubModule ? item.courseSubModule.title : item.title;
    subtitle = `${item.course.name}${item.courseModule ? ` · ${item.courseModule.title}` : ""}`;
    courseId = item.courseId;
    currentKind = "content";

    const panel = await getCoursePanel(courseId);
    const viewerItems = buildViewerItems(panel.items, currentKind, refId, back);
    const oi = viewerItems.findIndex((v) => v.kind === "content" && v.id === refId);

    return render({
      refId,
      title: titleParam ?? title,
      subtitle,
      backHref,
      watermark,
      prev: oi > 0 ? { title: viewerItems[oi - 1].title, href: viewerItems[oi - 1].href } : null,
      next: oi >= 0 && oi < viewerItems.length - 1 ? { title: viewerItems[oi + 1].title, href: viewerItems[oi + 1].href } : null,
      moduleTitle: panel.courseName,
      moduleSub: `${viewerItems.length} item${viewerItems.length === 1 ? "" : "s"}`,
      items: viewerItems,
      links: item.links.map((l) => ({ title: l.label, href: l.url })),
      buyerName: buyer.name,
    });
  }

  if (moduleId) {
    const courseModule = await prisma.courseModule.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!courseModule || !courseModule.mainPdfUrl) notFound();
    refId = courseModule.id;
    title = courseModule.mainPdfTitle ?? courseModule.title;
    subtitle = `${courseModule.course.name} · ${courseModule.title}`;
    courseId = courseModule.courseId;
    currentKind = "book";

    const panel = await getCoursePanel(courseId);
    const viewerItems = buildViewerItems(panel.items, currentKind, refId, back);
    const oi = viewerItems.findIndex((v) => v.kind === "book" && v.id === refId);

    return render({
      refId,
      title: titleParam ?? title,
      subtitle,
      backHref,
      watermark,
      prev: oi > 0 ? { title: viewerItems[oi - 1].title, href: viewerItems[oi - 1].href } : null,
      next: oi >= 0 && oi < viewerItems.length - 1 ? { title: viewerItems[oi + 1].title, href: viewerItems[oi + 1].href } : null,
      moduleTitle: panel.courseName,
      moduleSub: `${viewerItems.length} item${viewerItems.length === 1 ? "" : "s"}`,
      items: viewerItems,
      links: [],
      buyerName: buyer.name,
    });
  }

  notFound();
}

function render(p: {
  refId: string;
  title: string;
  subtitle: string;
  backHref: string;
  watermark: string;
  prev: { title: string; href: string } | null;
  next: { title: string; href: string } | null;
  moduleTitle: string;
  moduleSub: string;
  items: ViewerItem[];
  links: { title: string; href: string }[];
  buyerName: string;
}) {
  return (
    <AppShell nav={BUYER_NAV} active="purchases" user={{ name: p.buyerName, subtitle: "Buyer" }} title={p.title} immersive>
      {/* See src/app/lms/student/content/view/page.tsx for why this is here
          instead of in the shared, "do not edit" styles.css. */}
      <style>{`
        main.app-main-immersive{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;padding:0;margin:0;width:100%;max-width:none}
        main.app-main-immersive > .pv{flex:1;min-width:0}
      `}</style>
      <PdfViewer
        pdfUrl={`/api/content/${p.refId}/file`}
        title={p.title}
        subtitle={p.subtitle}
        backHref={p.backHref}
        watermark={p.watermark}
        prev={p.prev}
        next={p.next}
        moduleTitle={p.moduleTitle}
        moduleSub={p.moduleSub}
        items={p.items}
        links={p.links}
      />
    </AppShell>
  );
}
