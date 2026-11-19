import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { BUYER_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { BackLink } from "@/components/lms/BackLink";

export default async function BuyerPurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const { courseId } = await searchParams;
  const session = await auth();
  const buyerUserId = session!.user.id;

  const buyer = await prisma.user.findUnique({ where: { id: buyerUserId }, select: { name: true } });
  const shellUser = { name: buyer?.name ?? "Buyer", subtitle: "Buyer" };

  const orders = await prisma.courseOrder.findMany({
    where: { buyerUserId, status: "PAID" },
    include: { buyListing: { include: { course: true } } },
    orderBy: { paidAt: "desc" },
  });

  if (courseId) {
    const order = orders.find((o) => o.buyListing.courseId === courseId);
    if (!order) {
      return (
        <AppShell nav={BUYER_NAV} active="purchases" user={shellUser} crumb="My Purchases" title="Course" subtitle="Not found">
          <BackLink href="/lms/buyer" label="Back to My Purchases" />
          <p className="muted">You haven&apos;t purchased this course.</p>
        </AppShell>
      );
    }

    const [modules, content] = await Promise.all([
      prisma.courseModule.findMany({ where: { courseId, mainPdfUrl: { not: null } }, orderBy: { order: "asc" } }),
      prisma.courseContent.findMany({ where: { courseId }, include: { courseSubModule: true }, orderBy: { title: "asc" } }),
    ]);
    const isCodingPatterns = order.buyListing.course.slug === "coding-patterns";

    return (
      <AppShell nav={BUYER_NAV} active="purchases" user={shellUser} crumb="My Purchases" title={order.buyListing.course.name} subtitle="Viewable here only — not available to download or share.">
        <BackLink href="/lms/buyer" label="Back to My Purchases" />

        {isCodingPatterns && (
          <section className="card">
            <div className="split">
              <div>
                <h2 className="h2">Interactive pattern visualiser</h2>
                <p className="small muted" style={{ marginTop: 4 }}>Full access to every pattern in every level — unlocked for your account.</p>
              </div>
              <Link className="btn btn-gold" href="/coding-patterns">Open visualiser →</Link>
            </div>
          </section>
        )}

        <section className="card">
          <h2 className="h2" style={{ marginBottom: 14 }}>Course books</h2>
          {modules.length === 0 ? (
            <p className="muted">No course book PDFs on this course.</p>
          ) : (
            <ul className="list">
              {modules.map((mod) => (
                <li key={mod.id} className="list-row">
                  <span className="icon-box gold"><Icon name="book" size={18} /></span>
                  <span className="grow">{mod.mainPdfTitle ?? mod.title}</span>
                  <Link
                    className="btn btn-sm"
                    href={`/lms/buyer/view?moduleId=${mod.id}&title=${encodeURIComponent(mod.mainPdfTitle ?? mod.title)}&back=${encodeURIComponent(`/lms/buyer?courseId=${courseId}`)}`}
                  >
                    <Icon name="eye" size={16} /> View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="h2" style={{ marginBottom: 14 }}>Sub-module PDFs</h2>
          {content.length === 0 ? (
            <p className="muted">No sub-module PDFs on this course.</p>
          ) : (
            <ul className="list">
              {content.map((item) => (
                <li key={item.id} className="list-row">
                  <span className="icon-box gold"><Icon name="file" size={18} /></span>
                  <span className="grow">{item.courseSubModule ? item.courseSubModule.title : item.title}</span>
                  <Link
                    className="btn btn-sm"
                    href={`/lms/buyer/view?contentId=${item.id}&title=${encodeURIComponent(item.courseSubModule ? item.courseSubModule.title : item.title)}&back=${encodeURIComponent(`/lms/buyer?courseId=${courseId}`)}`}
                  >
                    <Icon name="eye" size={16} /> View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell nav={BUYER_NAV} active="purchases" user={shellUser} crumb="My Purchases" title="My Purchases" subtitle="Everything you've bought — viewable here, anytime.">
      {orders.length === 0 ? (
        <div className="empty">Nothing purchased yet. <Link href="/buy">Browse courses →</Link></div>
      ) : (
        <section className="card">
          <div className="grid" style={{ ["--min" as string]: "260px" }}>
            {orders.map((o) => (
              <Link key={o.id} className="list-row" href={`/lms/buyer?courseId=${o.buyListing.courseId}`}>
                <span className="icon-box navy"><Icon name="book" size={18} /></span>
                <span className="grow">
                  <span className="strong" style={{ display: "block" }}>{o.buyListing.course.name}</span>
                  <span className="small muted">Purchased {o.paidAt ? new Date(o.paidAt).toLocaleDateString() : ""}</span>
                </span>
                <Icon name="chevR" size={16} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
