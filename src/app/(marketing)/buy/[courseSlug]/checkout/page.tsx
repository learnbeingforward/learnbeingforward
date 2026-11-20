import Link from "next/link";
import { notFound } from "next/navigation";
import { canViewBuyListing } from "@/lib/buy-visibility";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";
import { CheckoutForm } from "@/components/lms/CheckoutForm";
import { buildUpiQrDataUrl } from "@/lib/buy-qr";

export const revalidate = 0;

export default async function BuyCheckoutPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;

  const [course, settings] = await Promise.all([
    prisma.course.findUnique({ where: { slug: courseSlug }, include: { buyListing: true } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);
  if (!course || !course.buyListing || !course.buyListing.enabled) notFound();
  if (!(await canViewBuyListing(course.buyListing))) notFound();

  const qrDataUrl = settings?.buyQrImageUrl
    ? null
    : settings?.buyUpiId
      ? await buildUpiQrDataUrl(settings.buyUpiId, course.buyListing.price, "Learn Being Forward", course.name)
      : null;

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
        <section className="card side stack" style={{ gap: 14, textAlign: "center" }}>
          <div className="h3" style={{ textAlign: "left" }}>
            Order summary
          </div>
          <div className="split" style={{ textAlign: "left" }}>
            <span>{course.name}</span>
            <strong>₹{course.buyListing.price}</strong>
          </div>
          {(settings?.buyQrImageUrl || qrDataUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings?.buyQrImageUrl ?? qrDataUrl ?? ""}
              alt="Payment QR code"
              width={200}
              height={200}
              style={{ margin: "0 auto", borderRadius: 12, border: "1px solid var(--border)" }}
            />
          )}
          {settings?.buyUpiId && (
            <div>
              <div className="strong">{settings.buyUpiId}</div>
              <p className="small muted" style={{ marginTop: 4 }}>
                Scan with any UPI app and pay exactly ₹{course.buyListing.price}, then enter the 12-digit UTR from your app below.
              </p>
            </div>
          )}
          {!settings?.buyUpiId && !settings?.buyQrImageUrl && (
            <p className="alert warning" style={{ textAlign: "left" }}>
              Payment details aren&apos;t set up yet — contact us to complete this purchase.
            </p>
          )}
        </section>
        <section className="card grow">
          <CheckoutForm listingId={course.buyListing.id} />
        </section>
      </div>
    </PublicShell>
  );
}
