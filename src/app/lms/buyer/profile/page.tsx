import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { BUYER_NAV } from "@/components/lbf/nav-config";
import { ChangePasswordForm } from "@/components/lms/ChangePasswordForm";

export default async function BuyerProfilePage() {
  const session = await auth();
  const buyer = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });
  const shellUser = { name: buyer.name, subtitle: "Buyer" };

  return (
    <AppShell nav={BUYER_NAV} active="profile" user={shellUser} crumb="Your details" title="Profile" subtitle="Your account details.">
      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>Your details</h2>
          <dl className="stack" style={{ gap: 10 }}>
            <div className="split"><span className="muted">Name</span><span className="strong">{buyer.name}</span></div>
            <div className="split"><span className="muted">Email</span><span className="strong">{buyer.email}</span></div>
          </dl>
        </section>
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>Change password</h2>
          <ChangePasswordForm />
        </section>
      </div>
    </AppShell>
  );
}
