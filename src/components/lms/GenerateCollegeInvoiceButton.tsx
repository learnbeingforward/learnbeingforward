"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateCollegeInvoice,
  submitDraftCollegeInvoice,
  type GenerateInvoiceState,
  type SubmitDraftState,
} from "@/lib/actions/college-contracts";

export function GenerateCollegeInvoiceButton({
  contractId,
  existingDraft,
}: {
  contractId: string;
  existingDraft?: { invoiceId: string; pdfUrl: string | null } | null;
}) {
  const [state, formAction, isPending] = useActionState<GenerateInvoiceState, FormData>(
    generateCollegeInvoice.bind(null, contractId),
    existingDraft ? { ok: true, invoiceId: existingDraft.invoiceId, pdfUrl: existingDraft.pdfUrl ?? undefined } : null
  );
  const [submitState, submitFormAction, isSubmitting] = useActionState<SubmitDraftState, FormData>(
    state?.invoiceId ? submitDraftCollegeInvoice.bind(null, state.invoiceId) : async () => null,
    null
  );

  useEffect(() => {
    if (state?.ok && state.pdfUrl && !existingDraft) {
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
      <Button type="submit" size="sm" variant="outline" disabled={isPending} className="border-border text-indigo">
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        Generate Invoice
      </Button>
      {state?.error && <p className="max-w-56 text-right text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
