import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";
import { canViewBuyListing } from "@/lib/buy-visibility";

export const revalidate = 0;

export default async function BuyCatalogPage() {
  const all = await prisma.buyListing.findMany({
    where: { enabled: true },
    include: { course: true },
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
        title: "Own the course, at your own pace",
        description: "Full course books and guides, delivered to your email the moment payment is confirmed.",
      }}
    >
      <div className="row lift">
        <section className="card grow">
          {listings.length === 0 ? (
            <p className="empty">Nothing available to buy right now — check back soon.</p>
          ) : (
            <div className="grid" style={{ ["--min" as string]: "260px" }}>
              {listings.map((listing) => {
                const off = listing.mrp && listing.mrp > listing.price ? Math.round((1 - listing.price / listing.mrp) * 100) : 0;
                return (
                  <Link key={listing.id} className="box hover stack" style={{ gap: 10, textDecoration: "none", color: "inherit", position: "relative" }} href={`/buy/${listing.course.slug}`}>
                    {listing.featured && (
                      <span className="pill gold" style={{ position: "absolute", top: 14, right: 14 }}>
                        Featured
                      </span>
                    )}
                    <h3 className="h3">{listing.course.name}</h3>
                    {listing.headline && <p className="small muted">{listing.headline}</p>}
                    <span style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ fontWeight: 700, fontSize: 22, color: "var(--navy)" }}>₹{listing.price}</span>
                      {off > 0 && (
                        <>
                          <span className="muted" style={{ textDecoration: "line-through" }}>
                            ₹{listing.mrp}
                          </span>
                          <span className="pill success">{off}% off</span>
                        </>
                      )}
                    </span>
                    <span className="small" style={{ fontWeight: 600, color: "var(--navy)" }}>View &amp; preview →</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
