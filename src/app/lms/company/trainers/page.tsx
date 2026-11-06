import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateTrainerLoginButton } from "@/components/lms/CreateTrainerLoginButton";
import { updateTrainerRate } from "@/lib/actions/trainers";

export default async function CompanyTrainersPage() {
  const { session, keys, navLinks } = await requireCompanyPageAccess(["trainers.manage", "trainers.invoices"]);
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const canManage = keys.includes("trainers.manage");
  const canInvoices = keys.includes("trainers.invoices");

  const trainers = await prisma.trainer.findMany({
    include: { loginUser: true, batches: true },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardShell title="Trainers" subtitle="Manage trainers, batches & invoices" navLinks={navLinks}>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {canManage && (
          <Link
            href="/lms/company/trainers/batches"
            className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
          >
            <p className="font-semibold text-indigo">Batches</p>
            <p className="mt-1 text-sm text-muted-foreground">Group enrolled students into class batches.</p>
          </Link>
        )}
        {canManage && (
          <Link
            href="/lms/company/trainers/schedule"
            className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
          >
            <p className="font-semibold text-indigo">Schedule Training</p>
            <p className="mt-1 text-sm text-muted-foreground">Assign a trainer, date and session slots to a batch.</p>
          </Link>
        )}
        {canInvoices && (
          <Link
            href="/lms/company/trainers/invoices"
            className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
          >
            <p className="font-semibold text-indigo">Invoices</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSuperAdmin ? "Review and approve trainer invoices." : "Review trainer invoices and recommend a decision."}
            </p>
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">
            All Trainers ({trainers.length})
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create new trainer accounts from the Add Account page — trainers without a login yet can
            get one below.
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
                <div className="flex flex-wrap items-center gap-3">
                  <CreateTrainerLoginButton
                    trainerId={trainer.id}
                    hasEmail={!!trainer.email}
                    hasLogin={!!trainer.loginUser}
                  />
                  {canManage && (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
