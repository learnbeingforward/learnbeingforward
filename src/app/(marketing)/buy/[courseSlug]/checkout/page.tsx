import Link from "next/link";
import { notFound } from "next/navigation";
import { canViewBuyListing } from "@/lib/buy-visibility";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";
import { Icon } from "@/components/lbf/icons";
import { CheckoutForm } from "@/components/lms/CheckoutForm";
import { buildUpiQrDataUrl } from "@/lib/buy-qr";

export const revalidate = 0;

export default async function BuyCheckoutPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;

  const [course, settings] = await Promise.all([
    prisma.course.findUnique({ where: { slug: courseSlug }, include: { buyListing: true, modules: true } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);
  if (!course || !course.buyListing || !course.buyListing.enabled) notFound();
  if (!(await canViewBuyListing(course.buyListing))) notFound();

  const { price, mrp } = course.buyListing;
  const off = mrp && mrp > price ? mrp - price : 0;

  const qrDataUrl = settings?.buyQrImageUrl
    ? null
    : settings?.buyUpiId
      ? await buildUpiQrDataUrl(settings.buyUpiId, price, "Learn Being Forward", course.name)
      : null;

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
              </Link>{" "}
              › Checkout
            </div>
            <h1>Checkout</h1>
            <p>Two quick steps: your details, then pay by UPI.</p>
          </div>
        ),
      }}
    >
      <div className="row lift">
        <section className="card grow">
          <CheckoutForm
            listingId={course.buyListing.id}
            price={price}
            payeeName={settings?.buyUpiId ? "Learn Being Forward" : null}
            upiId={settings?.buyUpiId ?? null}
            qrDataUrl={settings?.buyQrImageUrl ?? qrDataUrl}
          />
        </section>
        <aside className="card side" style={{ position: "sticky", top: 16 }}>
          <div className="label" style={{ marginBottom: 10 }}>
            Order summary
          </div>
          <div className="split">
            <div>
              <div className="strong">{course.name}</div>
              <div className="small muted">{course.modules.length} course books · PDF</div>
            </div>
            <b>₹{price}</b>
          </div>
          {off > 0 && (
            <div className="split small muted" style={{ marginTop: 8 }}>
              <span>You save</span>
              <span>₹{off}</span>
            </div>
          )}
          <div className="split" style={{ borderTop: "1px solid var(--border)", marginTop: 14, paddingTop: 14 }}>
            <b>Total</b>
            <b style={{ fontSize: 20, color: "var(--navy)" }}>₹{price}</b>
          </div>
          <ul className="by-inc" style={{ marginBottom: 0 }}>
            <li>
              <Icon name="check" size={16} />
              Books emailed after payment is verified
            </li>
            <li>
              <Icon name="check" size={16} />
              One-time payment
            </li>
          </ul>
        </aside>
      </div>
    </PublicShell>
  );
}
