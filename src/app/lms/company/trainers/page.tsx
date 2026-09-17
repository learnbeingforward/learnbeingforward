import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateTrainerRate } from "@/lib/actions/trainers";

export default async function CompanyTrainersPage() {
  const trainers = await prisma.trainer.findMany({
    include: { loginUser: true, batches: true },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardShell title="Trainers" subtitle="Manage trainers, batches & invoices" navLinks={navLinks}>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/lms/company/trainers/batches"
          className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
        >
          <p className="font-semibold text-indigo">Batches</p>
          <p className="mt-1 text-sm text-muted-foreground">Group enrolled students into class batches.</p>
        </Link>
        <Link
          href="/lms/company/trainers/schedule"
          className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
        >
          <p className="font-semibold text-indigo">Schedule Training</p>
          <p className="mt-1 text-sm text-muted-foreground">Assign a trainer, date and session slots to a batch.</p>
        </Link>
        <Link
          href="/lms/company/trainers/invoices"
          className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
        >
          <p className="font-semibold text-indigo">Invoices</p>
          <p className="mt-1 text-sm text-muted-foreground">Review and approve trainer invoices.</p>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">
            All Trainers ({trainers.length})
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a trainer login from the Employees page under Edit Site.
          </p>
        </div>
        {trainers.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No trainers yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <p className="font-medium text-indigo">{trainer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {trainer.email ?? "—"} &middot; {trainer.batches.length} batch
                    {trainer.batches.length !== 1 ? "es" : ""}
                    {!trainer.loginUser && " · No login yet"}
                  </p>
                </div>
                <form action={updateTrainerRate.bind(null, trainer.id)} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <Input
                    name="hourlyRate"
                    type="number"
                    min="0"
                    defaultValue={trainer.hourlyRate}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">/hr</span>
                  <Button type="submit" size="sm" variant="outline" className="border-border text-indigo">
                    Save
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
