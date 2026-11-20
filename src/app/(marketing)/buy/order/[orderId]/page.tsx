import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/lbf/PublicShell";

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
    include: { buyListing: { include: { course: true } } },
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
    return shell(
      "Order rejected",
      <div className="stack" style={{ gap: 10 }}>
        <p className="muted">We couldn&apos;t verify this payment{order.rejectReason ? `: ${order.rejectReason}` : "."}</p>
        <p className="small muted">If you believe this is a mistake, contact support@learnbeingforward.in with your order ID ({order.id}) and UTR.</p>
      </div>
    );
  }

  if (order.status === "PAID") {
    return shell(
      "You're all set",
      <div className="stack" style={{ gap: 14 }}>
        <p className="muted">
          Thanks, {order.buyerName} — payment for {course.name} is confirmed. We&apos;ve emailed{" "}
          <strong>{order.buyerEmail}</strong> your login details — your book is viewable inside your own account there,
          not as a download.
        </p>
        <Link className="btn btn-gold" href="/auth" style={{ alignSelf: "flex-start" }}>
          Log in
        </Link>
      </div>
    );
  }

  // PENDING — the buyer already gave their UTR at checkout; just confirm receipt.
  return shell(
    "Order received",
    <div className="stack" style={{ gap: 10 }}>
      <p className="muted">
        Thanks, {order.buyerName} — order <strong>{order.id}</strong> for {course.name} (₹{order.amount}) is received with
        UTR <strong>{order.utr}</strong>.
      </p>
      <p className="small muted">We&apos;ll verify the payment and email your login details to {order.buyerEmail} — usually within a few hours.</p>
      <p className="pill warning" style={{ alignSelf: "flex-start" }}>
        Awaiting verification
      </p>
    </div>
  );
}
