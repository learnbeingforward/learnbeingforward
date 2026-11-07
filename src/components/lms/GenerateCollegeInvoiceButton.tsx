"use client";

import { useActionState, useEffect, useTransition } from "react";
import { Banknote, CheckCircle2, Clock, FileText, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateCollegeInvoice,
  markInvoicePaid,
  submitDraftCollegeInvoice,
  type GenerateInvoiceState,
  type SubmitDraftState,
} from "@/lib/actions/college-contracts";

export type LatestCollegeInvoice = {
  invoiceId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submitted: boolean;
  pdfUrl: string | null;
  rejectReason: string | null;
  paidAt?: Date | string | null;
  paidRequestedAt?: Date | string | null;
};

export function GenerateCollegeInvoiceButton({
  contractId,
  latestInvoice,
  canMarkPaid = true,
}: {
  contractId: string;
  latestInvoice?: LatestCollegeInvoice | null;
  /** Whether this viewer is allowed to mark an approved invoice as paid — gated the
   * same way the colleges.sent page itself is (super-admin / granted employees only). */
  canMarkPaid?: boolean;
}) {
  const isDraft = latestInvoice && latestInvoice.status === "PENDING" && !latestInvoice.submitted;
  const isAwaitingDecision = latestInvoice && latestInvoice.status === "PENDING" && latestInvoice.submitted;
  const isApproved = latestInvoice?.status === "APPROVED";
  const isPaid = isApproved && !!latestInvoice?.paidAt;
  const paidClaimed = isApproved && !isPaid && !!latestInvoice?.paidRequestedAt;
  const isRejected = latestInvoice?.status === "REJECTED";
  const [isMarkingPaid, startMarkPaid] = useTransition();

  const [state, formAction, isPending] = useActionState<GenerateInvoiceState, FormData>(
    generateCollegeInvoice.bind(null, contractId),
    isDraft ? { ok: true, invoiceId: latestInvoice.invoiceId, pdfUrl: latestInvoice.pdfUrl ?? undefined } : null
  );
  const [submitState, submitFormAction, isSubmitting] = useActionState<SubmitDraftState, FormData>(
    state?.invoiceId ? submitDraftCollegeInvoice.bind(null, state.invoiceId) : async () => null,
    null
  );

  useEffect(() => {
    if (state?.ok && state.pdfUrl && !isDraft) {
      window.open(state.pdfUrl, "_blank");
    }
    // Only auto-open the PDF right after a fresh generate, not when this
    // component mounts already pointed at a pre-existing draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (submitState?.ok) {
    return (
      <p className="flex items-center gap-1 text-xs font-medium text-green-700">
        <CheckCircle2 className="size-3.5" /> Invoice sent to the college.
      </p>
    );
  }

  // Read-only states: an invoice already exists and isn't a draft awaiting submission.
  if (!state?.ok && isAwaitingDecision) {
    return (
      <div className="flex flex-col items-end gap-1 rounded-lg bg-cream p-3">
        <p className="flex items-center gap-1 text-xs font-medium text-indigo">
          <Clock className="size-3.5" /> Awaiting the college&apos;s decision
        </p>
        {latestInvoice?.pdfUrl && (
          <a href={latestInvoice.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo underline">
            View Invoice PDF
          </a>
        )}
      </div>
    );
  }

  if (!state?.ok && isApproved) {
    return (
      <div className={`flex flex-col items-end gap-1 rounded-lg p-3 ${isPaid ? "bg-green-50" : paidClaimed ? "bg-amber-50" : "bg-cream"}`}>
        <p
          className={`flex items-center gap-1 text-xs font-medium ${
            isPaid ? "text-green-700" : paidClaimed ? "text-amber-700" : "text-indigo"
          }`}
        >
          {isPaid ? <Banknote className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
          {isPaid ? "Paid" : paidClaimed ? "College says this is paid — needs confirmation" : "Accepted by college — not yet paid"}
        </p>
        {latestInvoice?.pdfUrl && (
          <a href={latestInvoice.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo underline">
            View Invoice PDF
          </a>
        )}
        {!isPaid && canMarkPaid && latestInvoice && (
          <Button
            type="button"
            size="sm"
            disabled={isMarkingPaid}
            onClick={() => startMarkPaid(() => markInvoicePaid(latestInvoice.invoiceId))}
            className="bg-indigo text-white hover:bg-indigo/90"
          >
            {isMarkingPaid && <Loader2 className="size-3.5 animate-spin" />}
            {paidClaimed ? "Confirm Paid" : "Mark as Paid"}
          </Button>
        )}
      </div>
    );
  }

  if (state?.ok && state.invoiceId) {
    return (
      <div className="flex flex-col items-end gap-1.5 rounded-lg bg-cream p-3">
        <p className="flex items-center gap-1 text-xs text-indigo">
          <FileText className="size-3.5" /> Draft generated — review the PDF, then submit.
        </p>
        {state.pdfUrl && (
          <a href={state.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo underline">
            Reopen the PDF
          </a>
        )}
        {submitState?.error && <p className="max-w-56 text-right text-xs text-destructive">{submitState.error}</p>}
        <form action={submitFormAction}>
          <Button type="submit" size="sm" disabled={isSubmitting} className="bg-indigo text-white hover:bg-indigo/90">
            {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
            Submit Invoice
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      {isRejected && (
        <p className="flex max-w-56 items-start gap-1 text-right text-xs text-destructive">
          <XCircle className="mt-0.5 size-3.5 shrink-0" />
          Previous invoice rejected{latestInvoice?.rejectReason ? `: ${latestInvoice.rejectReason}` : "."}
        </p>
      )}
      <Button type="submit" size="sm" variant="outline" disabled={isPending} className="border-border text-indigo">
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        {isRejected ? "Generate New Invoice" : "Generate Invoice"}
      </Button>
      {state?.error && <p className="max-w-56 text-right text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
