import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/lbf/AppShell";
import { TRAINER_NAV } from "@/components/lbf/nav-config";
import { Icon } from "@/components/lbf/icons";
import { BackLink } from "@/components/lms/BackLink";
import { getBillableSessions } from "@/lib/actions/trainer-invoices";
import { SubmitInvoiceForm } from "@/components/lms/SubmitInvoiceForm";
import { TrainerInvoiceDetailView } from "@/components/lms/TrainerInvoiceDetailView";
import { SubmitDraftInvoiceButton } from "@/components/lms/SubmitDraftInvoiceButton";
import type { BatchRosterEntry } from "@/components/lms/SessionsTrainedBlocks";
import { format } from "date-fns";

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

export default async function TrainerInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ invoiceId?: string }>;
}) {
  const { invoiceId } = await searchParams;
  const session = await auth();
  const trainerId = session!.user.trainerId!;
  const trainer = await prisma.trainer.findUniqueOrThrow({ where: { id: trainerId } });
  const shellUser = { name: trainer.name, subtitle: "Trainer" };

  if (invoiceId) {
    const invoice = await prisma.trainerInvoice.findUnique({
      where: { id: invoiceId },
      include: { trainer: true, lineItems: { include: { trainingSession: { include: { batch: { include: { college: true } } } } } } },
    });
    const rosters = invoice ? await loadBatchRosters(invoice.lineItems.map((li) => li.trainingSession.batchId)) : {};

    return (
      <AppShell nav={TRAINER_NAV} active="invoice" user={shellUser} crumb="Invoice" title="Invoice" subtitle="Invoice detail">
        <BackLink href="/lms/trainer/invoice" label="Back to Invoice" />
        {!invoice || invoice.trainerId !== trainerId ? (
          <p className="muted">This invoice doesn&apos;t belong to you.</p>
        ) : (
          <>
            {!invoice.submitted && (
              <div className="alert gold">
                <span>
                  This invoice is still a draft — the company can&apos;t see it until you submit it.
                  <div style={{ marginTop: 10 }}>
                    <SubmitDraftInvoiceButton invoiceId={invoice.id} />
                  </div>
                </span>
              </div>
            )}
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
          </>
        )}
      </AppShell>
    );
  }

  const [billable, pastInvoices] = await Promise.all([
    getBillableSessions(trainerId),
    prisma.trainerInvoice.findMany({ where: { trainerId }, orderBy: { submittedAt: "desc" } }),
  ]);
  const hours = billable.length * 2;
  const total = hours * trainer.hourlyRate;

  return (
    <AppShell nav={TRAINER_NAV} active="invoice" user={shellUser} crumb="Invoice" title="Invoice" subtitle="Your training payments.">
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "180px" }}>
          <div className="tile gold">
            <div className="label">Sessions ready</div>
            <div className="value">{billable.length}</div>
          </div>
          <div className="tile">
            <div className="label">Total hours</div>
            <div className="value">{hours}</div>
          </div>
          <div className="tile">
            <div className="label">Rate</div>
            <div className="value">₹{trainer.hourlyRate}/hr</div>
          </div>
          <div className="tile success">
            <div className="label">Total</div>
            <div className="value">₹{total}</div>
          </div>
        </div>
      </section>

      <div className="row">
        <section className="card grow">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Ready to invoice ({billable.length} session{billable.length !== 1 ? "s" : ""})
          </h2>
          {billable.length === 0 ? (
            <div className="empty">
              <span className="icon-box gold" style={{ margin: "0 auto 10px", width: 48, height: 48, borderRadius: "50%" }}>
                <Icon name="clock" size={22} />
              </span>
              <div className="h3" style={{ color: "var(--text)" }}>
                No completed sessions are ready to invoice yet.
              </div>
              <p className="small muted" style={{ marginTop: 6 }}>
                This fills up as you mark attendance for your classes.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table" style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Module</th>
                    <th>Hours</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {billable.map((s) => (
                    <tr key={s.id}>
                      <td>{format(s.sessionDate, "MMM d")}</td>
                      <td>
                        {s.batch.college.name} — {s.batch.name}
                      </td>
                      <td>{s.courseModule?.title ?? s.topic ?? "—"}</td>
                      <td>2</td>
                      <td>₹{2 * trainer.hourlyRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="card side">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Generate invoice
          </h2>
          <div className="stack" style={{ gap: 14 }}>
            <div className="list-row">
              <span className="grow">Total hours</span>
              <strong>{hours}</strong>
            </div>
            <div className="list-row">
              <span className="grow">Rate</span>
              <strong>₹{trainer.hourlyRate}/hr</strong>
            </div>
            <div className="list-row" style={{ background: "var(--gold-soft)" }}>
              <span className="grow strong">Total</span>
              <strong style={{ fontSize: 20 }}>₹{total}</strong>
            </div>
            <SubmitInvoiceForm disabled={billable.length === 0} />
            <span className="hint">Needs at least 1 completed session and your bank details.</span>
          </div>
        </section>
      </div>

      {pastInvoices.length > 0 && (
        <section className="card">
          <h2 className="h2" style={{ marginBottom: 18 }}>
            Past invoices
          </h2>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pastInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link href={`/lms/trainer/invoice?invoiceId=${inv.id}`} className="strong">
                        INV-{inv.id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td>{format(inv.submittedAt, "MMM yyyy")}</td>
                    <td>₹{inv.totalAmount}</td>
                    <td>
                      <span
                        className={`pill ${
                          !inv.submitted ? "" : inv.status === "APPROVED" ? "success" : inv.status === "REJECTED" ? "danger" : "warning"
                        }`}
                      >
                        {!inv.submitted ? "Draft" : inv.status === "APPROVED" ? "Approved" : inv.status === "REJECTED" ? "Rejected" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AppShell>
  );
}
