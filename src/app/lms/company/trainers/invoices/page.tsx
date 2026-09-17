import Link from "next/link";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks as navLinks } from "@/lib/lms-nav-links";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/lms/BackLink";
import { DecideTrainerInvoiceForm } from "@/components/lms/DecideTrainerInvoiceForm";
import { format } from "date-fns";

export default async function CompanyTrainerInvoicesPage() {
  const [pending, decided] = await Promise.all([
    prisma.trainerInvoice.findMany({
      where: { status: "PENDING" },
      include: {
        trainer: true,
        lineItems: { include: { trainingSession: { include: { batch: { include: { college: true, course: true } } } } } },
      },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.trainerInvoice.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: { trainer: true },
      orderBy: { decidedAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <DashboardShell title="Trainer Invoices" subtitle="Review and approve payments" navLinks={navLinks}>
      <BackLink href="/lms/company/trainers" label="Back to Trainers" />
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Pending ({pending.length})</p>
        </div>
        {pending.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No pending invoices.</p>
        ) : (
          <div className="divide-y divide-border">
            {pending.map((inv) => (
              <div key={inv.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-indigo">{inv.trainer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {inv.sessionCount} sessions &middot; {inv.hours} hrs &middot; ₹{inv.hourlyRate}/hr &middot;{" "}
                      <span className="font-semibold text-indigo">₹{inv.totalAmount}</span>
                    </p>
                    {inv.notes && <p className="mt-1 text-sm text-indigo/80">&ldquo;{inv.notes}&rdquo;</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {format(inv.submittedAt, "MMM d, yyyy")}
                    </p>
                    {inv.pdfUrl && (
                      <Link
                        href={inv.pdfUrl}
                        target="_blank"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo underline underline-offset-2"
                      >
                        <FileText className="size-3.5" /> View Invoice PDF
                      </Link>
                    )}
                  </div>
                  <div className="shrink-0">
                    <DecideTrainerInvoiceForm invoiceId={inv.id} totalAmount={inv.totalAmount} />
                  </div>
                </div>
                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  {inv.lineItems.map((li) => (
                    <p key={li.id} className="text-xs text-muted-foreground">
                      {format(li.trainingSession.sessionDate, "MMM d, yyyy")} &middot;{" "}
                      {li.trainingSession.batch.college.name} — {li.trainingSession.batch.name} &middot; 2 hrs
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-white">
          <div className="border-b border-border p-6">
            <p className="text-sm font-semibold text-indigo">Recent Decisions</p>
          </div>
          <div className="divide-y divide-border">
            {decided.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm text-indigo">
                    {inv.trainer.name} — ₹{inv.approvedAmount ?? inv.totalAmount}
                  </p>
                  {inv.approvalPdfUrl && (
                    <Link
                      href={inv.approvalPdfUrl}
                      target="_blank"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-indigo underline underline-offset-2"
                    >
                      <FileText className="size-3.5" /> View Decision PDF
                    </Link>
                  )}
                </div>
                <Badge
                  className={
                    inv.status === "APPROVED"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                  }
                >
                  {inv.status === "APPROVED" ? "Approved" : "Rejected"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
