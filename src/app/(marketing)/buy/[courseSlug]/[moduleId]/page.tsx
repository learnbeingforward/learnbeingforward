import Link from "next/link";
import { notFound } from "next/navigation";
import { canViewBuyListing } from "@/lib/buy-visibility";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";

export const revalidate = 0;

export default async function BuyModulePage({ params }: { params: Promise<{ courseSlug: string; moduleId: string }> }) {
  const { courseSlug, moduleId } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: { buyListing: true, modules: { orderBy: { order: "asc" } } },
  });
  if (!course || !course.buyListing || !course.buyListing.enabled) notFound();
  if (!(await canViewBuyListing(course.buyListing))) notFound();

  const mod = course.modules.find((m) => m.id === moduleId);
  if (!mod) notFound();

  const [content, locks] = await Promise.all([
    prisma.courseContent.findMany({ where: { courseModuleId: moduleId }, include: { courseSubModule: true }, orderBy: { title: "asc" } }),
    prisma.buyPreviewLock.findMany({ where: { buyListingId: course.buyListing.id } }),
  ]);

  const moduleLock = locks.find((l) => l.courseModuleId === moduleId);
  const contentLockByContentId = new Map(locks.filter((l) => l.courseContentId).map((l) => [l.courseContentId!, l]));

  const bookIndex = course.modules.findIndex((m) => m.id === moduleId);
  const prevMod = bookIndex > 0 ? course.modules[bookIndex - 1] : null;
  const nextMod = bookIndex < course.modules.length - 1 ? course.modules[bookIndex + 1] : null;
  const off = course.buyListing.mrp && course.buyListing.mrp > course.buyListing.price
    ? Math.round((1 - course.buyListing.price / course.buyListing.mrp) * 100)
    : 0;

  return (
    <PublicShell
      header={{
        active: "buy",
        heroContent: (
          <div className="container band-hero">
            <div className="eyebrow">
              <Link href="/buy" style={{ color: "inherit" }}>
                Buy
              </Link>{" "}
              ›{" "}
              <Link href={`/buy/${course.slug}`} style={{ color: "inherit" }}>
                {course.name}
              </Link>
            </div>
            <h1>{mod.mainPdfTitle ?? `${mod.title} — Complete Course Notes`}</h1>
            <p>
              Book {bookIndex + 1} of {course.modules.length} in {course.name}
            </p>
          </div>
        ),
      }}
    >
      <div className="row lift">
        <div className="stack grow" style={{ gap: 20, minWidth: 0 }}>
          <section className="card">
            <div className="split" style={{ flexWrap: "wrap", gap: 12 }}>
              <div className="stat-inline">
                <span className="icon-box gold">
                  <Icon name="book" size={16} />
                </span>
                <div>
                  <div className="strong">Full course book</div>
                  <div className="small muted">PDF · emailed after purchase</div>
                </div>
              </div>
              {moduleLock?.previewFileUrl ? (
                <Link
                  className="btn"
                  href={`/buy/preview?src=${encodeURIComponent(moduleLock.previewFileUrl)}&title=${encodeURIComponent(mod.mainPdfTitle ?? mod.title)}&back=${encodeURIComponent(`/buy/${course.slug}/${moduleId}`)}`}
                >
                  <Icon name="eye" size={16} />
                  Read {moduleLock.previewPages} free pages
                </Link>
              ) : (
                <span className="pill">
                  <Icon name="lock" size={12} /> Full access after purchase
                </span>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="h3" style={{ marginBottom: 12 }}>
              Sub-modules in this book ({content.length})
            </h2>
            {content.length === 0 ? (
              <p className="empty">Nothing published for this module yet.</p>
            ) : (
              <ul className="list">
                {content.map((item) => {
                  const lock = contentLockByContentId.get(item.id);
                  const title = item.courseSubModule ? item.courseSubModule.title : item.title;
                  return (
                    <li key={item.id} className="list-row">
                      <span className="icon-box">
                        <Icon name="file" size={16} />
                      </span>
                      <div className="grow">
                        <div className="strong">{title}</div>
                        <div className="small muted">Notes, code and practice</div>
                      </div>
                      {lock?.previewFileUrl ? (
                        <Link
                          className="btn btn-sm"
                          href={`/buy/preview?src=${encodeURIComponent(lock.previewFileUrl)}&title=${encodeURIComponent(title)}&back=${encodeURIComponent(`/buy/${course.slug}/${moduleId}`)}`}
                        >
                          Preview {lock.previewPages} pages
                        </Link>
                      ) : (
                        <span className="pill">
                          <Icon name="lock" size={12} /> Full access after purchase
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="split">
            {prevMod ? (
              <Link className="btn btn-sm" href={`/buy/${course.slug}/${prevMod.id}`}>
                <Icon name="arrowL" size={16} />
                Previous book
              </Link>
            ) : (
              <span />
            )}
            {nextMod && (
              <Link className="btn btn-sm" href={`/buy/${course.slug}/${nextMod.id}`}>
                Next book
                <Icon name="arrowR" size={16} />
              </Link>
            )}
          </div>
        </div>

        <aside className="card side" style={{ position: "sticky", top: 16 }}>
          <div className="label">Get this course</div>
          <div className="by-price big">
            <b>₹{course.buyListing.price}</b>
            {off > 0 && <s>₹{course.buyListing.mrp}</s>}
          </div>
          <p className="small muted" style={{ margin: "8px 0 14px" }}>
            This book comes with all {course.modules.length} books of {course.name}.
          </p>
          <Link className="btn btn-gold" style={{ width: "100%" }} href={`/buy/${course.slug}/checkout`}>
            <Icon name="cart" size={16} />
            Buy now
          </Link>
          <Link className="btn" style={{ width: "100%", marginTop: 8 }} href={`/buy/${course.slug}`}>
            See all books
          </Link>
        </aside>
      </div>
    </PublicShell>
  );
}
