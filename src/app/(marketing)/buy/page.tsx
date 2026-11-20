import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";
import { canViewBuyListing } from "@/lib/buy-visibility";

export const revalidate = 0;

export default async function BuyCatalogPage() {
  const all = await prisma.buyListing.findMany({
    where: { enabled: true },
    include: { course: { include: { _count: { select: { modules: true } } } } },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
  });
  const visible = await Promise.all(
    all.map(async (listing) => ((await canViewBuyListing(listing)) ? listing : null))
  );
  const listings = visible.filter((l): l is NonNullable<typeof l> => l !== null);

  return (
    <PublicShell
      header={{
        active: "buy",
        eyebrow: "Buy",
        title: (
          <>
            Own the course, <em>at your own pace</em>
          </>
        ),
        description: "Full course books and guides, emailed to you the moment your payment is confirmed. Read the free preview pages before you buy.",
      }}
    >
      <section className="card lift">
        {listings.length === 0 ? (
          <p className="empty">New course books are on their way.</p>
        ) : (
          <div className="by-grid">
            {listings.map((listing) => {
              const off = listing.mrp && listing.mrp > listing.price ? Math.round((1 - listing.price / listing.mrp) * 100) : 0;
              return (
                <Link key={listing.id} className="by-a" style={{ textDecoration: "none" }} href={`/buy/${listing.course.slug}`}>
                  <article className="by-card">
                    <div className="by-cover">
                      <span>
                        <Icon name="book" size={28} />
                      </span>
                      <b>{listing.course.name}</b>
                      <small>{listing.course._count.modules} course books</small>
                      {off > 0 && <em>{off}% off</em>}
                    </div>
                    <div className="by-cbody">
                      <h3>{listing.course.name}</h3>
                      <p>{listing.headline}</p>
                      <div className="by-price">
                        <b>₹{listing.price}</b>
                        {off > 0 && <s>₹{listing.mrp}</s>}
                      </div>
                      <span className="by-link">View &amp; preview →</span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "220px" }}>
          <div className="stat-inline">
            <span className="icon-box gold">
              <Icon name="eye" size={18} />
            </span>
            <div>
              <div className="strong">Preview first</div>
              <div className="small muted">Free pages from every book</div>
            </div>
          </div>
          <div className="stat-inline">
            <span className="icon-box gold">
              <Icon name="money" size={18} />
            </span>
            <div>
              <div className="strong">Pay by UPI</div>
              <div className="small muted">Any UPI app, one-time payment</div>
            </div>
          </div>
          <div className="stat-inline">
            <span className="icon-box gold">
              <Icon name="mail" size={18} />
            </span>
            <div>
              <div className="strong">Books by email</div>
              <div className="small muted">Sent once payment is verified</div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
