import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";

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

  const listing = course.buyListing;
  const moduleLockByModuleId = new Map(listing.previewLocks.filter((l) => l.courseModuleId).map((l) => [l.courseModuleId!, l]));

  return (
    <PublicShell
      header={{
        active: "buy",
        heroContent: (
          <div className="container" style={{ marginTop: 40 }}>
            <Link href="/buy" style={{ color: "var(--on-navy-muted)", textDecoration: "none", fontSize: 13 }}>
              ← All books
            </Link>
            <h1 style={{ color: "#fff", fontSize: 38, marginTop: 10 }}>{course.name}</h1>
            {listing.headline && <p style={{ color: "var(--on-navy-muted)", marginTop: 10 }}>{listing.headline}</p>}
          </div>
        ),
      }}
    >
      <div className="row lift">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>Modules</h2>
          {course.modules.length === 0 ? (
            <p className="empty">Nothing published for this course yet.</p>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {course.modules.map((mod) => {
                const lock = moduleLockByModuleId.get(mod.id);
                return (
                  <Link key={mod.id} className="list-row" href={`/buy/${course.slug}/${mod.id}`}>
                    <span className="grow">
                      <span className="strong" style={{ display: "block" }}>{mod.title}</span>
                      <span className="small muted">
                        {mod.mainPdfUrl ? (lock ? `Preview available — first ${lock.previewPages} pages` : "Full course book") : "See sub-modules"}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside className="side stack">
          <div className="card stack" style={{ gap: 14 }}>
            <div className="h3">Get this course</div>
            <span style={{ fontWeight: 700, fontSize: 28, color: "var(--navy)" }}>₹{listing.price}</span>
            <p className="small muted">One-time payment — books are emailed to you the moment payment is confirmed.</p>
            <Link className="btn btn-gold" href={`/buy/${course.slug}/checkout`}>
              Buy now
            </Link>
          </div>
        </aside>
      </div>
    </PublicShell>
  );
}
