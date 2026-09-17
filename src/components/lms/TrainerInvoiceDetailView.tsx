import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export type TrainerInvoiceDetail = {
  trainerName: string;
  status: string;
  sessionCount: number;
  hours: number;
  hourlyRate: number;
  totalAmount: number;
  approvedAmount: number | null;
  deductionAmount: number | null;
  deductionReason: string | null;
  paymentTimelineDays: number | null;
  notes: string | null;
  submittedAt: Date;
  decidedAt: Date | null;
  pdfUrl: string | null;
  approvalPdfUrl: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankName: string | null;
  lineItems: { id: string; date: Date; collegeName: string; batchName: string; hours: number }[];
};

export function TrainerInvoiceDetailView({ invoice }: { invoice: TrainerInvoiceDetail }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-indigo">{invoice.trainerName}</h2>
          <Badge
            className={
              invoice.status === "APPROVED"
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : invoice.status === "REJECTED"
                  ? "bg-red-100 text-red-700 hover:bg-red-100"
                  : "bg-gold/20 text-indigo hover:bg-gold/20"
            }
          >
            {invoice.status}
          </Badge>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Sessions</dt>
            <dd className="text-indigo">{invoice.sessionCount}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Hours</dt>
            <dd className="text-indigo">{invoice.hours}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Rate</dt>
            <dd className="text-indigo">₹{invoice.hourlyRate}/hr</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Submitted Amount</dt>
            <dd className="font-semibold text-indigo">₹{invoice.totalAmount}</dd>
          </div>
          {invoice.status === "APPROVED" && (
            <>
              {invoice.deductionAmount ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Deduction</dt>
                  <dd className="text-indigo">
                    ₹{invoice.deductionAmount}
                    {invoice.deductionReason && ` (${invoice.deductionReason})`}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Approved Amount</dt>
                <dd className="font-semibold text-green-700">₹{invoice.approvedAmount ?? invoice.totalAmount}</dd>
              </div>
              {invoice.paymentTimelineDays && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Payment Within</dt>
                  <dd className="text-indigo">{invoice.paymentTimelineDays} days</dd>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Submitted</dt>
            <dd className="text-indigo">{format(invoice.submittedAt, "MMM d, yyyy")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Decided</dt>
            <dd className="text-indigo">{invoice.decidedAt ? format(invoice.decidedAt, "MMM d, yyyy") : "—"}</dd>
          </div>
          {invoice.notes && (
            <div>
              <dt className="mb-1 text-muted-foreground">Note</dt>
              <dd className="rounded-lg bg-cream p-3 text-indigo">{invoice.notes}</dd>
            </div>
          )}
        </dl>

        {invoice.status === "APPROVED" && (invoice.bankAccountName || invoice.bankAccountNumber) && (
          <div className="mt-4 rounded-lg bg-cream p-3 text-sm">
            <p className="mb-1 font-medium text-indigo">Credited To</p>
            {invoice.bankAccountName && <p className="text-muted-foreground">Account Holder: {invoice.bankAccountName}</p>}
            {invoice.bankName && <p className="text-muted-foreground">Bank: {invoice.bankName}</p>}
            {invoice.bankAccountNumber && <p className="text-muted-foreground">Account Number: {invoice.bankAccountNumber}</p>}
            {invoice.bankIfsc && <p className="text-muted-foreground">IFSC: {invoice.bankIfsc}</p>}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4">
          {invoice.pdfUrl && (
            <Link href={invoice.pdfUrl} target="_blank" className="inline-flex items-center gap-1 text-sm font-medium text-indigo underline underline-offset-2">
              <FileText className="size-4" /> Invoice PDF
            </Link>
          )}
          {invoice.approvalPdfUrl && (
            <Link href={invoice.approvalPdfUrl} target="_blank" className="inline-flex items-center gap-1 text-sm font-medium text-indigo underline underline-offset-2">
              <FileText className="size-4" /> Decision PDF
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Sessions Trained ({invoice.lineItems.length})</p>
        </div>
        <div className="divide-y divide-border">
          {invoice.lineItems.map((li) => (
            <div key={li.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <p className="text-indigo">
                {li.collegeName} — {li.batchName}
              </p>
              <p className="text-muted-foreground">
                {format(li.date, "MMM d, yyyy")} &middot; {li.hours} hrs
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
