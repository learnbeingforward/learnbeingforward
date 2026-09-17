"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitDraftTrainerInvoice, type SubmitDraftInvoiceState } from "@/lib/actions/trainer-invoices";

export function SubmitDraftInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [state, formAction, isPending] = useActionState<SubmitDraftInvoiceState, FormData>(
    submitDraftTrainerInvoice.bind(null, invoiceId),
    null
  );

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
      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Submit Invoice
      </Button>
    </form>
  );
}
