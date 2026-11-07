"use client";

import { useActionState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  submitDraftTrainerInvoice,
  deleteTrainerInvoiceDraft,
  type SubmitDraftInvoiceState,
} from "@/lib/actions/trainer-invoices";

export function SubmitDraftInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [state, formAction, isPending] = useActionState<SubmitDraftInvoiceState, FormData>(
    submitDraftTrainerInvoice.bind(null, invoiceId),
    null
  );
  const [isDeleting, startDelete] = useTransition();

  if (state?.ok) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-green-700">
        <CheckCircle2 className="size-4" /> Invoice sent to the company.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Submit Invoice
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isDeleting}
          onClick={() => startDelete(() => deleteTrainerInvoiceDraft(invoiceId))}
          className="border-red-300 text-red-600"
        >
          {isDeleting && <Loader2 className="size-4 animate-spin" />}
          Discard Draft
        </Button>
      </div>
    </form>
  );
}
