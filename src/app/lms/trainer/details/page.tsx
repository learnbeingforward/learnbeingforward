import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { TrainerProfileForm } from "@/components/lms/TrainerProfileForm";

export default async function TrainerDetailsPage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });

  return (
    <AppShell
      nav={TRAINER_NAV}
      active="details"
      user={{ name: trainer.name, subtitle: "Trainer" }}
      crumb="Personal details"
      title="Personal & bank details"
      subtitle="Keep these up to date — invoices need them."
    >
      <section className="card">
        <TrainerProfileForm trainer={trainer} />
      </section>
    </AppShell>
  );
}
