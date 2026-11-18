import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";

export const revalidate = 0;

export default async function BuyCatalogPage() {
  const listings = await prisma.buyListing.findMany({
    where: { enabled: true },
    include: { course: true },
    orderBy: { order: "asc" },
  });

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
              {listings.map((listing) => (
                <Link key={listing.id} className="box hover stack" style={{ gap: 10, textDecoration: "none", color: "inherit" }} href={`/buy/${listing.course.slug}`}>
                  <h3 className="h3">{listing.course.name}</h3>
                  {listing.headline && <p className="small muted">{listing.headline}</p>}
                  <span style={{ fontWeight: 700, fontSize: 22, color: "var(--navy)" }}>₹{listing.price}</span>
                  <span className="small" style={{ fontWeight: 600, color: "var(--navy)" }}>View &amp; preview →</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
