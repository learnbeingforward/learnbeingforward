import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { TrainerProfileForm } from "@/components/lms/TrainerProfileForm";
import { getBillableSessions } from "@/lib/actions/trainer-invoices";

export default async function TrainerProfilePage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });

  const now = new Date();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const [activeBatches, upcomingSessions, attendancePending, billable] = await Promise.all([
    prisma.batch.count({ where: { trainerId, completed: false } }),
    prisma.trainingSession.count({ where: { trainerId, sessionDate: { gte: todayStart }, attendanceTaken: false } }),
    prisma.trainingSession.count({ where: { trainerId, sessionDate: { lt: now }, attendanceTaken: false } }),
    getBillableSessions(trainerId),
  ]);
  const readyToInvoice = billable.length * 2 * trainer.hourlyRate;

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
          <div className="tile warning">
            <div className="label">Attendance pending</div>
            <div className="value">{attendancePending}</div>
          </div>
          <div className="tile">
            <div className="label">Ready to invoice</div>
            <div className="value">₹{readyToInvoice}</div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>
          Personal &amp; bank details
        </h2>
        <TrainerProfileForm trainer={trainer} />
      </section>
    </AppShell>
  );
}
