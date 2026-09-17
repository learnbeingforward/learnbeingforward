"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  submitTrainerInvoice,
  submitDraftTrainerInvoice,
  type SubmitInvoiceState,
  type SubmitDraftInvoiceState,
} from "@/lib/actions/trainer-invoices";

export function SubmitInvoiceForm({ disabled }: { disabled: boolean }) {
  const [state, formAction, isPending] = useActionState<SubmitInvoiceState, FormData>(
    submitTrainerInvoice,
    null
  );
  const [submitState, submitFormAction, isSubmitting] = useActionState<SubmitDraftInvoiceState, FormData>(
    state?.invoiceId ? submitDraftTrainerInvoice.bind(null, state.invoiceId) : async () => null,
    null
  );

  useEffect(() => {
    if (state?.ok && state.pdfUrl) {
      window.open(state.pdfUrl, "_blank");
    }
  }, [state]);

  if (submitState?.ok) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-green-700">
        <CheckCircle2 className="size-4" /> Invoice sent to the company.
      </p>
    );
  }

  if (state?.ok && state.invoiceId) {
    return (
      <div className="space-y-3 rounded-lg bg-cream p-4">
        <p className="flex items-center gap-1.5 text-sm text-indigo">
          <FileText className="size-4" /> Draft generated — review the PDF that just opened, then send it to
          the company.
        </p>
        {state.pdfUrl && (
          <a href={state.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo underline">
            Reopen the PDF
          </a>
        )}
        {submitState?.error && <p className="text-sm text-destructive">{submitState.error}</p>}
        <form action={submitFormAction}>
          <Button type="submit" disabled={isSubmitting} className="bg-indigo text-white hover:bg-indigo/90">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Submit Invoice
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="notes">Note (optional)</Label>
        <Textarea id="notes" name="notes" rows={2} className="mt-1.5" placeholder="Anything the company should know" />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={disabled || isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Generate Invoice
      </Button>
    </form>
  );
}
