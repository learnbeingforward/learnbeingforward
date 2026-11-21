import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";

export default async function TrainerMouPage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });

  return (
    <AppShell
      nav={TRAINER_NAV}
      active="mou"
      user={{ name: trainer.name, subtitle: "Trainer" }}
      crumb="MOU"
      title="MOU"
      subtitle="Your trainer MOUs — one for each college and batch you train."
    >
      <section className="card">
        <div className="empty">
          <span className="icon-box gold" style={{ margin: "0 auto 10px", width: 48, height: 48, borderRadius: "50%" }}>
            <Icon name="file" size={22} />
          </span>
          <div className="h3" style={{ color: "var(--text)" }}>
            MOUs aren&apos;t set up yet.
          </div>
          <p className="small muted" style={{ marginTop: 6 }}>
            This will show a signable MOU for every college and batch you train, with payment terms, signing, and sharing it back — coming soon.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
