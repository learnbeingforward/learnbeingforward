import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";
import { buildUpiQrDataUrl } from "@/lib/buy-qr";
import { buyerClaimPaid } from "@/lib/actions/buy";

export const revalidate = 0;

export default async function BuyOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderId } = await params;
  const { token } = await searchParams;

  const order = await prisma.courseOrder.findUnique({
    where: { id: orderId },
    include: {
      buyListing: {
        include: {
          course: {
            include: { modules: { where: { mainPdfUrl: { not: null } }, orderBy: { order: "asc" } }, courseContents: { include: { courseSubModule: true }, orderBy: { title: "asc" } } },
          },
        },
      },
    },
  });
  if (!order || !token || order.token !== token) notFound();

  const course = order.buyListing.course;

  const shell = (title: string, children: React.ReactNode) => (
    <PublicShell header={{ active: "buy", eyebrow: "Your order", title, description: course.name }}>
      <div className="row lift">
        <section className="card grow">{children}</section>
      </div>
    </PublicShell>
  );

  if (order.status === "CANCELLED") {
    return shell("Order cancelled", <p className="empty">This order was cancelled. Contact us if that&apos;s unexpected.</p>);
  }

  if (order.status === "PAID") {
    return shell(
      "Your books",
      <>
        <p className="muted" style={{ marginBottom: 18 }}>Thanks, {order.buyerName} — here&apos;s everything for {course.name}.</p>
        <ul className="list">
          {course.modules.map((mod) => (
            <li key={mod.id} className="list-row">
              <span className="grow">{mod.mainPdfTitle ?? "Course book"}</span>
              <a className="btn btn-sm" href={`/api/buy/download?orderId=${order.id}&token=${order.token}&moduleId=${mod.id}`}>
                Download
              </a>
            </li>
          ))}
          {course.courseContents.map((item) => (
            <li key={item.id} className="list-row">
              <span className="grow">{item.courseSubModule ? item.courseSubModule.title : item.title}</span>
              <a className="btn btn-sm" href={`/api/buy/download?orderId=${order.id}&token=${order.token}&contentId=${item.id}`}>
                Download
              </a>
            </li>
          ))}
        </ul>
      </>
    );
  }

  // PENDING — show payment instructions.
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const qrDataUrl = settings?.buyQrImageUrl
    ? null
    : settings?.buyUpiId
      ? await buildUpiQrDataUrl(settings.buyUpiId, order.amount, "Learn Being Forward", `${course.name} — ${order.buyerName}`)
      : null;

  return shell(
    "Complete your payment",
    <div className="stack" style={{ gap: 20, alignItems: "flex-start" }}>
      <div className="split" style={{ width: "100%" }}>
        <span>{course.name}</span>
        <strong>₹{order.amount}</strong>
      </div>

      {(settings?.buyQrImageUrl || qrDataUrl) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={settings?.buyQrImageUrl ?? qrDataUrl ?? ""} alt="Payment QR code" width={240} height={240} style={{ borderRadius: 12, border: "1px solid var(--border)" }} />
      )}
      {settings?.buyUpiId && (
        <p>
          UPI ID: <strong>{settings.buyUpiId}</strong>
        </p>
      )}
      {!settings?.buyUpiId && !settings?.buyQrImageUrl && (
        <p className="alert warning">Payment details aren&apos;t set up yet — contact us to complete this purchase.</p>
      )}

      <p className="small muted">Pay the exact amount above, then confirm below. We&apos;ll review and email your books once payment is verified.</p>

      {order.buyerClaimedPaidAt ? (
        <p className="pill warning">Marked as paid — awaiting confirmation</p>
      ) : (
        <form action={buyerClaimPaid.bind(null, order.id, order.token)}>
          <button className="btn btn-gold" type="submit">
            I&apos;ve paid
          </button>
        </form>
      )}
    </div>
  );
}
