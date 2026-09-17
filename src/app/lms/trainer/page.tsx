import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { trainerNavLinks as navLinks } from "@/lib/lms-nav-links";
import { TrainerProfileForm } from "@/components/lms/TrainerProfileForm";

export default async function TrainerProfilePage() {
  const session = await auth();
  const trainer = await prisma.trainer.findUniqueOrThrow({
    where: { id: session!.user.trainerId! },
  });

  return (
    <DashboardShell title="Personal Details" subtitle="Trainer dashboard" navLinks={navLinks}>
      <TrainerProfileForm trainer={trainer} />
    </DashboardShell>
  );
}
