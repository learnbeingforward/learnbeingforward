import Link from "next/link";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { buildSuperAdminNav } from "@/components/lbf/nav-config";
import { requireCompanyPageAccess } from "@/lib/employee-access";
import { BackLink } from "@/components/lms/BackLink";
import { DecideTrainerInvoiceForm } from "@/components/lms/DecideTrainerInvoiceForm";
import { ProposeTrainerInvoiceForm } from "@/components/lms/ProposeTrainerInvoiceForm";
import { TrainerInvoiceDetailView } from "@/components/lms/TrainerInvoiceDetailView";
import { SessionsTrainedBlocks, type BatchRosterEntry } from "@/components/lms/SessionsTrainedBlocks";
import { format } from "date-fns";

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Company admin", ADMIN2: "Company admin", EMPLOYEE: "Employee" };

async function loadBatchRosters(batchIds: string[]): Promise<Record<string, BatchRosterEntry[]>> {
  const uniqueIds = [...new Set(batchIds)];
  if (uniqueIds.length === 0) return {};
  const enrollments = await prisma.enrollment.findMany({ where: { batchId: { in: uniqueIds } }, include: { student: true } });
  const rosters: Record<string, BatchRosterEntry[]> = {};
  for (const e of enrollments) {
    if (!e.batchId) continue;
    (rosters[e.batchId] ??= []).push({ id: e.student.id, name: e.student.name, branch: e.student.branch, semester: e.student.semester });
  }
  return rosters;
}

export default async function CompanyTrainerInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ invoiceId?: string }>;
}) {
  const { invoiceId } = await searchParams;
  const { session, keys, hasUnread } = await requireCompanyPageAccess("trainers.invoices");
  const nav = buildSuperAdminNav(session.user.role, keys);
  const shellUser = { name: session.user.name ?? "Admin", subtitle: ROLE_LABEL[session.user.role ?? ""] ?? "Admin" };
  const isAdmin2 = session.user.role === "ADMIN2";

  if (invoiceId) {
    const invoice = await prisma.trainerInvoice.findUnique({
      where: { id: invoiceId },
      include: { trainer: true, lineItems: { include: { trainingSession: { include: { batch: { include: { college: true } } } } } } },
    });
    const rosters = invoice ? await loadBatchRosters(invoice.lineItems.map((li) => li.trainingSession.batchId)) : {};

    return (
      <AppShell nav={nav} active="trainers" user={shellUser} hasUnread={hasUnread} crumb="Accounts › Trainers › Invoices" title="Trainer Invoice" subtitle="Decision detail">
        <BackLink href="/lms/company/trainers/invoices" label="Back to Trainer Invoices" />
        {!invoice ? (
          <p className="muted">This invoice no longer exists.</p>
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
      </AppShell>
    );
  }

  const [pending, decided] = await Promise.all([
    prisma.trainerInvoice.findMany({
      where: { status: "PENDING", submitted: true },
      include: { trainer: true, lineItems: { include: { trainingSession: { include: { batch: { include: { college: true, course: true } } } } } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.trainerInvoice.findMany({ where: { status: { in: ["APPROVED", "REJECTED"] } }, include: { trainer: true }, orderBy: { decidedAt: "desc" }, take: 15 }),
  ]);

  const pendingRosters = await loadBatchRosters(pending.flatMap((inv) => inv.lineItems.map((li) => li.trainingSession.batchId)));

  const proposerIds = [...new Set(pending.map((inv) => inv.proposedByAdminId).filter((id): id is string => !!id))];
  const proposers = proposerIds.length ? await prisma.user.findMany({ where: { id: { in: proposerIds } }, select: { id: true, name: true } }) : [];
  const proposerNameById = new Map(proposers.map((p) => [p.id, p.name]));

  return (
    <AppShell
      nav={nav}
      active="trainers"
      user={shellUser}
      hasUnread={hasUnread}
      crumb="Accounts › Trainers › Invoices"
      title="Trainer invoices"
      subtitle="Review and approve invoices trainers submit for their sessions."
    >
      <BackLink href="/lms/company/trainers" label="Back to Trainers" />

      <section className="card">
        <h2 className="h2" style={{ marginBottom: 18 }}>Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="empty">No pending invoices.</p>
        ) : (
          <div className="stack" style={{ gap: 18 }}>
            {pending.map((inv) => (
              <div key={inv.id} className="box">
                <div className="split" style={{ flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div className="stat-inline">
                      <span className="avatar sm">{inv.trainer.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
                      <div>
                        <div className="strong">{inv.trainer.name}</div>
                        <div className="small muted">{inv.sessionCount} sessions · {inv.hours} hrs × ₹{inv.hourlyRate}/hr</div>
                      </div>
                    </div>
                    {inv.notes && <p style={{ marginTop: 8 }}>&ldquo;{inv.notes}&rdquo;</p>}
                    <div className="small muted" style={{ marginTop: 6 }}>Submitted {format(inv.submittedAt, "MMM d, yyyy")}</div>
                    {inv.pdfUrl && (
                      <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <FileText size={14} /> View Invoice PDF
                      </a>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong style={{ fontSize: 18 }}>₹{inv.totalAmount}</strong>
                    <div style={{ marginTop: 8 }}>
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
                            <p className="small muted" style={{ marginBottom: 4 }}>Recommended by {proposerNameById.get(inv.proposedByAdminId) ?? "the second admin"}</p>
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
                </div>
                <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
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
      </section>

      {decided.length > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>Recent decisions</h2>
          <div className="grid" style={{ ["--min" as string]: "240px" }}>
            {decided.map((inv) => (
              <Link key={inv.id} className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }} href={`/lms/company/trainers/invoices?invoiceId=${inv.id}`}>
                <div className="split">
                  <h3 className="h3">{inv.trainer.name}</h3>
                  <span className={`pill ${inv.status === "APPROVED" ? "success" : "danger"}`}>{inv.status === "APPROVED" ? "Approved" : "Rejected"}</span>
                </div>
                <p className="small muted" style={{ marginTop: 6 }}>₹{inv.approvedAmount ?? inv.totalAmount}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
