import Link from "next/link";
import { notFound } from "next/navigation";
import { canViewBuyListing } from "@/lib/buy-visibility";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";

export const revalidate = 0;

export default async function BuyModulePage({ params }: { params: Promise<{ courseSlug: string; moduleId: string }> }) {
  const { courseSlug, moduleId } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: { buyListing: true },
  });
  if (!course || !course.buyListing || !course.buyListing.enabled) notFound();
  if (!(await canViewBuyListing(course.buyListing))) notFound();

  const [mod, content, locks] = await Promise.all([
    prisma.courseModule.findUnique({ where: { id: moduleId } }),
    prisma.courseContent.findMany({ where: { courseModuleId: moduleId }, include: { courseSubModule: true }, orderBy: { title: "asc" } }),
    prisma.buyPreviewLock.findMany({ where: { buyListingId: course.buyListing.id } }),
  ]);
  if (!mod || mod.courseId !== course.id) notFound();

  const moduleLock = locks.find((l) => l.courseModuleId === moduleId);
  const contentLockByContentId = new Map(locks.filter((l) => l.courseContentId).map((l) => [l.courseContentId!, l]));

  return (
    <PublicShell
      header={{
        active: "buy",
        heroContent: (
          <div className="container" style={{ marginTop: 40 }}>
            <Link href={`/buy/${course.slug}`} style={{ color: "var(--on-navy-muted)", textDecoration: "none", fontSize: 13 }}>
              ← Back to {course.name}
            </Link>
            <h1 style={{ color: "#fff", fontSize: 32, marginTop: 10 }}>{mod.title}</h1>
          </div>
        ),
      }}
    >
      <div className="row lift">
        <section className="card grow">
          {mod.mainPdfUrl && (
            <div className="box" style={{ marginBottom: 14 }}>
              <div className="split">
                <span className="strong">{mod.mainPdfTitle ?? "Course book"}</span>
                {moduleLock?.previewFileUrl ? (
                  <a className="btn btn-sm" href={moduleLock.previewFileUrl} target="_blank" rel="noopener noreferrer">
                    Preview first {moduleLock.previewPages} pages
                  </a>
                ) : (
                  <span className="pill">Full access after purchase</span>
                )}
              </div>
            </div>
          )}

          <h2 className="h2" style={{ marginBottom: 14 }}>Sub-modules</h2>
          {content.length === 0 ? (
            <p className="empty">Nothing published for this module yet.</p>
          ) : (
            <ul className="list">
              {content.map((item) => {
                const lock = contentLockByContentId.get(item.id);
                return (
                  <li key={item.id} className="list-row">
                    <span className="grow">
                      <span className="strong" style={{ display: "block" }}>{item.courseSubModule ? item.courseSubModule.title : item.title}</span>
                    </span>
                    {lock?.previewFileUrl ? (
                      <a className="btn btn-sm" href={lock.previewFileUrl} target="_blank" rel="noopener noreferrer">
                        Preview first {lock.previewPages} pages
                      </a>
                    ) : (
                      <span className="pill">Full access after purchase</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="side stack">
          <div className="card stack" style={{ gap: 14 }}>
            <div className="h3">Get this course</div>
            <span style={{ fontWeight: 700, fontSize: 28, color: "var(--navy)" }}>₹{course.buyListing.price}</span>
            <Link className="btn btn-gold" href={`/buy/${course.slug}/checkout`}>
              Buy now
            </Link>
          </div>
        </aside>
      </div>
    </PublicShell>
  );
}
