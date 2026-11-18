import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";
import { CheckoutForm } from "@/components/lms/CheckoutForm";

export const revalidate = 0;

export default async function BuyCheckoutPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;

  const course = await prisma.course.findUnique({ where: { slug: courseSlug }, include: { buyListing: true } });
  if (!course || !course.buyListing || !course.buyListing.enabled) notFound();

  return (
    <PublicShell
      header={{
        active: "buy",
        heroContent: (
          <div className="container" style={{ marginTop: 40 }}>
            <Link href={`/buy/${course.slug}`} style={{ color: "var(--on-navy-muted)", textDecoration: "none", fontSize: 13 }}>
              ← Back to {course.name}
            </Link>
            <h1 style={{ color: "#fff", fontSize: 32, marginTop: 10 }}>Buy {course.name}</h1>
          </div>
        ),
      }}
    >
      <div className="row lift">
        <section className="card side stack" style={{ gap: 10 }}>
          <div className="h3">Order summary</div>
          <div className="split">
            <span>{course.name}</span>
            <strong>₹{course.buyListing.price}</strong>
          </div>
        </section>
        <section className="card grow">
          <CheckoutForm listingId={course.buyListing.id} />
        </section>
      </div>
    </PublicShell>
  );
}
