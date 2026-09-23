import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { companyNavLinks } from "@/lib/lms-nav-links";
import { isCompanyStaff } from "@/lib/auth-helpers";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/lms/BackLink";
import { DecideTrainerInvoiceForm } from "@/components/lms/DecideTrainerInvoiceForm";
import { ProposeTrainerInvoiceForm } from "@/components/lms/ProposeTrainerInvoiceForm";
import { TrainerInvoiceDetailView } from "@/components/lms/TrainerInvoiceDetailView";
import { SessionsTrainedBlocks, type BatchRosterEntry } from "@/components/lms/SessionsTrainedBlocks";
import { format } from "date-fns";

async function loadBatchRosters(batchIds: string[]): Promise<Record<string, BatchRosterEntry[]>> {
  const uniqueIds = [...new Set(batchIds)];
  if (uniqueIds.length === 0) return {};
  const enrollments = await prisma.enrollment.findMany({
    where: { batchId: { in: uniqueIds } },
    include: { student: true },
  });
  const rosters: Record<string, BatchRosterEntry[]> = {};
  for (const e of enrollments) {
    if (!e.batchId) continue;
    (rosters[e.batchId] ??= []).push({
      id: e.student.id,
      name: e.student.name,
      branch: e.student.branch,
      semester: e.student.semester,
    });
  }
  return rosters;
}

export default async function CompanyTrainerInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ invoiceId?: string }>;
}) {
  const { invoiceId } = await searchParams;
  const session = await auth();
  if (!isCompanyStaff(session?.user.role)) redirect("/lms/company");
  const isAdmin2 = session!.user.role === "ADMIN2";
  const navLinks = companyNavLinks;

  if (invoiceId) {
    const invoice = await prisma.trainerInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        trainer: true,
        lineItems: { include: { trainingSession: { include: { batch: { include: { college: true } } } } } },
      },
    });
    const rosters = invoice
      ? await loadBatchRosters(invoice.lineItems.map((li) => li.trainingSession.batchId))
      : {};

    return (
      <DashboardShell title="Trainer Invoice" subtitle="Decision detail" navLinks={navLinks}>
        <BackLink href="/lms/company/trainers/invoices" label="Back to Trainer Invoices" />
        {!invoice ? (
          <p className="text-sm text-muted-foreground">This invoice no longer exists.</p>
        ) : (
          <TrainerInvoiceDetailView
            invoice={{
              trainerName: invoice.trainer.name,
              status: invoice.status,
              sessionCount: invoice.sessionCount,
              hours: invoice.hours,
              hourlyRate: invoice.hourlyRate,
              totalAmount: invoice.totalAmount,
              approvedAmount: invoice.approvedAmount,
              deductionAmount: invoice.deductionAmount,
              deductionReason: invoice.deductionReason,
              paymentTimelineDays: invoice.paymentTimelineDays,
              notes: invoice.notes,
              submittedAt: invoice.submittedAt,
              decidedAt: invoice.decidedAt,
              pdfUrl: invoice.pdfUrl,
              approvalPdfUrl: invoice.approvalPdfUrl,
              bankAccountName: invoice.trainer.bankAccountName,
              bankAccountNumber: invoice.trainer.bankAccountNumber,
              bankIfsc: invoice.trainer.bankIfsc,
              bankName: invoice.trainer.bankName,
              lineItems: invoice.lineItems.map((li) => ({
                id: li.id,
                date: li.trainingSession.sessionDate,
                collegeName: li.trainingSession.batch.college.name,
                batchName: li.trainingSession.batch.name,
                batchId: li.trainingSession.batchId,
                hours: 2,
              })),
              rosters,
            }}
          />
        )}
      </DashboardShell>
    );
  }

  const [pending, decided] = await Promise.all([
    prisma.trainerInvoice.findMany({
      where: { status: "PENDING", submitted: true },
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

  const pendingRosters = await loadBatchRosters(
    pending.flatMap((inv) => inv.lineItems.map((li) => li.trainingSession.batchId))
  );

  const proposerIds = [...new Set(pending.map((inv) => inv.proposedByAdminId).filter((id): id is string => !!id))];
  const proposers = proposerIds.length
    ? await prisma.user.findMany({ where: { id: { in: proposerIds } }, select: { id: true, name: true } })
    : [];
  const proposerNameById = new Map(proposers.map((p) => [p.id, p.name]));

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
                  <div className="w-full shrink-0 sm:w-auto">
                    {isAdmin2 ? (
                      <ProposeTrainerInvoiceForm
                        invoiceId={inv.id}
                        totalAmount={inv.totalAmount}
                        existingProposal={
                          inv.proposedByAdminId
                            ? {
                                proposedApprove: inv.proposedApprove!,
                                proposedDeductionAmount: inv.proposedDeductionAmount,
                                proposedDeductionReason: inv.proposedDeductionReason,
                                proposedPaymentTimelineDays: inv.proposedPaymentTimelineDays,
                                proposedNote: inv.proposedNote,
                              }
                            : null
                        }
                      />
                    ) : (
                      <>
                        {inv.proposedByAdminId && (
                          <p className="mb-1 text-xs text-muted-foreground">
                            Recommended by {proposerNameById.get(inv.proposedByAdminId) ?? "the second admin"}
                          </p>
                        )}
                        <DecideTrainerInvoiceForm
                          invoiceId={inv.id}
                          totalAmount={inv.totalAmount}
                          proposal={
                            inv.proposedByAdminId
                              ? {
                                  proposedApprove: inv.proposedApprove!,
                                  proposedDeductionAmount: inv.proposedDeductionAmount,
                                  proposedDeductionReason: inv.proposedDeductionReason,
                                  proposedPaymentTimelineDays: inv.proposedPaymentTimelineDays,
                                  proposedNote: inv.proposedNote,
                                }
                              : null
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  <SessionsTrainedBlocks
                    lineItems={inv.lineItems.map((li) => ({
                      id: li.id,
                      date: li.trainingSession.sessionDate,
                      collegeName: li.trainingSession.batch.college.name,
                      batchName: li.trainingSession.batch.name,
                      batchId: li.trainingSession.batchId,
                      hours: 2,
                    }))}
                    rosters={pendingRosters}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo">Recent Decisions</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {decided.map((inv) => (
              <Link
                key={inv.id}
                href={`/lms/company/trainers/invoices?invoiceId=${inv.id}`}
                className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-indigo/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-indigo">{inv.trainer.name}</p>
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
                <p className="mt-1 text-sm text-muted-foreground">₹{inv.approvedAmount ?? inv.totalAmount}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
