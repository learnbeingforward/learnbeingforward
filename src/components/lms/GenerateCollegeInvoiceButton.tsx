"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, Clock, FileText, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateCollegeInvoice,
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
};

export function GenerateCollegeInvoiceButton({
  contractId,
  latestInvoice,
}: {
  contractId: string;
  latestInvoice?: LatestCollegeInvoice | null;
}) {
  const isDraft = latestInvoice && latestInvoice.status === "PENDING" && !latestInvoice.submitted;
  const isAwaitingDecision = latestInvoice && latestInvoice.status === "PENDING" && latestInvoice.submitted;
  const isApproved = latestInvoice?.status === "APPROVED";
  const isRejected = latestInvoice?.status === "REJECTED";

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
      <div className="flex flex-col items-end gap-1 rounded-lg bg-green-50 p-3">
        <p className="flex items-center gap-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="size-3.5" /> Invoice approved
        </p>
        {latestInvoice?.pdfUrl && (
          <a href={latestInvoice.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo underline">
            View Invoice PDF
          </a>
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
