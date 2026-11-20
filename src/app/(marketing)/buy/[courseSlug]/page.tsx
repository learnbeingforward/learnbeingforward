import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";
import { canViewBuyListing } from "@/lib/buy-visibility";

export const revalidate = 0;

export default async function BuyCoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: { orderBy: { order: "asc" } },
      buyListing: { include: { previewLocks: true } },
    },
  });
  if (!course || !course.buyListing || !course.buyListing.enabled) notFound();
  if (!(await canViewBuyListing(course.buyListing))) notFound();

  const listing = course.buyListing;
  const off = listing.mrp && listing.mrp > listing.price ? Math.round((1 - listing.price / listing.mrp) * 100) : 0;
  const moduleLockByModuleId = new Map(listing.previewLocks.filter((l) => l.courseModuleId).map((l) => [l.courseModuleId!, l]));

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
              › Course books
            </div>
            <h1>{course.name}</h1>
            {listing.headline && <p>{listing.headline}</p>}
          </div>
        ),
      }}
    >
      <div className="row lift">
        <section className="card grow">
          <div className="label">Course books</div>
          <h2 className="h2" style={{ margin: "4px 0 6px" }}>
            {course.name}
          </h2>
          {listing.headline && <p className="muted">{listing.headline}</p>}
          {course.modules.length === 0 ? (
            <p className="empty" style={{ marginTop: 18 }}>
              Nothing published for this course yet.
            </p>
          ) : (
            <ul className="list" style={{ marginTop: 18 }}>
              {course.modules.map((mod) => {
                const lock = moduleLockByModuleId.get(mod.id);
                return (
                  <li key={mod.id} className="list-row">
                    <span className="icon-box gold">
                      <Icon name={lock ? "book" : "lock"} size={16} />
                    </span>
                    <div className="grow">
                      <Link className="strong" style={{ color: "inherit" }} href={`/buy/${course.slug}/${mod.id}`}>
                        {mod.mainPdfTitle ?? `${mod.title} — Complete Course Notes`}
                      </Link>
                      <div className="small muted">{lock ? `${lock.previewPages} free preview pages` : "Full access after purchase"}</div>
                    </div>
                    {lock && (
                      <Link className="btn btn-sm" href={`/buy/${course.slug}/${mod.id}`}>
                        <Icon name="eye" size={16} />
                        Preview
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="card side" style={{ position: "sticky", top: 16 }}>
          <div className="label">Get this course</div>
          <div className="by-price big">
            <b>₹{listing.price}</b>
            {off > 0 && <s>₹{listing.mrp}</s>}
            {off > 0 && <span className="pill success">{off}% off</span>}
          </div>
          <ul className="by-inc">
            <li>
              <Icon name="check" size={16} />
              All {course.modules.length} course book{course.modules.length !== 1 ? "s" : ""} (PDF)
            </li>
            <li>
              <Icon name="check" size={16} />
              Viewable inside your account once payment is confirmed
            </li>
            <li>
              <Icon name="check" size={16} />
              One-time payment, yours to keep
            </li>
          </ul>
          <Link className="btn btn-gold" style={{ width: "100%" }} href={`/buy/${course.slug}/checkout`}>
            <Icon name="cart" size={16} />
            Buy now
          </Link>
          <p className="small muted" style={{ marginTop: 10, textAlign: "center" }}>
            Pay by any UPI app.
          </p>
        </aside>
      </div>
    </PublicShell>
  );
}
