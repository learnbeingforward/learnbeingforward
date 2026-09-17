import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { trainerNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { getBillableSessions } from "@/lib/actions/trainer-invoices";
import { SubmitInvoiceForm } from "@/components/lms/SubmitInvoiceForm";
import { format } from "date-fns";

export default async function TrainerInvoicePage() {
  const session = await auth();
  const trainerId = session!.user.trainerId!;

  const [trainer, billable, pastInvoices] = await Promise.all([
    prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } }),
    getBillableSessions(trainerId),
    prisma.trainerInvoice.findMany({
      where: { trainerId },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const hours = billable.length * 2;
  const total = hours * trainer.hourlyRate;

  return (
    <DashboardShell title="Invoice" subtitle="Your training payments" navLinks={navLinks}>
      <div className="mb-8 rounded-xl border border-border bg-white p-6">
        <p className="mb-4 text-sm font-semibold text-indigo">
          Ready to invoice ({billable.length} session{billable.length !== 1 ? "s" : ""})
        </p>
        {billable.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No completed sessions are ready to invoice yet — this fills up as you mark attendance for
            your classes.
          </p>
        ) : (
          <div className="mb-4 divide-y divide-border rounded-lg border border-border">
            {billable.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <span className="text-indigo">
                  {format(s.sessionDate, "MMM d, yyyy")} &middot; {s.batch.college.name} — {s.batch.name}
                </span>
                <span className="text-muted-foreground">
                  {s.courseModule?.title ?? s.topic ?? "—"} &middot; 2 hrs
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-6 rounded-lg bg-cream px-4 py-3 text-sm">
          <span>
            <span className="text-muted-foreground">Total hours:</span>{" "}
            <span className="font-semibold text-indigo">{hours}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Rate:</span>{" "}
            <span className="font-semibold text-indigo">₹{trainer.hourlyRate}/hr</span>
          </span>
          <span>
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-semibold text-indigo">₹{total}</span>
          </span>
        </div>

        <SubmitInvoiceForm disabled={billable.length === 0} />
      </div>

      {pastInvoices.length > 0 && (
        <div className="rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">Past Invoices</p>
          </div>
          <div className="divide-y divide-border">
            {pastInvoices.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <span className="text-indigo">
                  {format(inv.submittedAt, "MMM d, yyyy")} &middot; {inv.sessionCount} sessions &middot;{" "}
                  {inv.hours} hrs &middot; ₹{inv.totalAmount}
                </span>
                <Badge
                  className={
                    inv.status === "APPROVED"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : inv.status === "REJECTED"
                        ? "bg-red-100 text-red-700 hover:bg-red-100"
                        : "bg-gold/20 text-indigo hover:bg-gold/20"
                  }
                >
                  {inv.status === "APPROVED" ? "Approved" : inv.status === "REJECTED" ? "Rejected" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
