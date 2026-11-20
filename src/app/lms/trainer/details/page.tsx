import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { TrainerProfileForm } from "@/components/lms/TrainerProfileForm";

export default async function TrainerDetailsPage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });

  const now = new Date();
  const [activeBatches, upcomingSessions, overdueSessions] = await Promise.all([
    prisma.batch.count({ where: { trainerId, completed: false } }),
    prisma.trainingSession.count({ where: { trainerId, attendanceTaken: false, sessionDate: { gte: now } } }),
    prisma.trainingSession.count({ where: { trainerId, attendanceTaken: false, sessionDate: { lt: now } } }),
  ]);

  return (
    <AppShell
      nav={TRAINER_NAV}
      active="details"
      user={{ name: trainer.name, subtitle: "Trainer" }}
      crumb="Trainer dashboard"
      title={`Welcome back, ${trainer.name}`}
      subtitle="Keep your details and bank info up to date — invoices need them."
    >
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "180px" }}>
          <div className="tile">
            <div className="label">Active batches</div>
            <div className="value">{activeBatches}</div>
          </div>
          <div className="tile gold">
            <div className="label">Upcoming sessions</div>
            <div className="value">{upcomingSessions}</div>
          </div>
          <div className={overdueSessions > 0 ? "tile warning" : "tile"}>
            <div className="label">Attendance pending</div>
            <div className="value">{overdueSessions}</div>
          </div>
          <div className="tile">
            <div className="label">Ready to invoice</div>
            <div className="value">₹0</div>
          </div>
        </div>
      </section>

      <TrainerProfileForm trainer={trainer} />
    </AppShell>
  );
}
