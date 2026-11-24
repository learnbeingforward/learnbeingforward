import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { BUYER_NAV } from "@/components/lbf/nav-config";
import { BackLink } from "@/components/lms/BackLink";
import { PdfCanvasViewer } from "@/components/lms/PdfCanvasViewer";

export default async function BuyerContentViewerPage({
  searchParams,
}: {
  searchParams: Promise<{ contentId?: string; moduleId?: string; title?: string; back?: string }>;
}) {
  const { contentId, moduleId, title, back } = await searchParams;
  const session = await auth();
  const buyer = await prisma.user.findUnique({ where: { id: session!.user.id }, select: { name: true } });
  const shellUser = { name: buyer?.name ?? "Buyer", subtitle: "Buyer" };

  const params = new URLSearchParams();
  if (contentId) params.set("contentId", contentId);
  if (moduleId) params.set("moduleId", moduleId);
  const viewerSrc = `/api/content/view?${params.toString()}`;

  return (
    <AppShell nav={BUYER_NAV} active="purchases" user={shellUser} crumb="My Purchases" title={title ?? "Viewing"} subtitle="Viewable here only — not available to download or share.">
      <BackLink href={back || "/lms/buyer"} label="Back to My Purchases" />
      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <PdfCanvasViewer src={viewerSrc} title={title ?? "Document"} />
      </section>
    </AppShell>
  );
}
