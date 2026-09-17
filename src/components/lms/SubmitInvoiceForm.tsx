"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitTrainerInvoice, type SubmitInvoiceState } from "@/lib/actions/trainer-invoices";

export function SubmitInvoiceForm({ disabled }: { disabled: boolean }) {
  const [state, formAction, isPending] = useActionState<SubmitInvoiceState, FormData>(
    submitTrainerInvoice,
    null
  );

  if (state?.ok) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-green-700">
        <CheckCircle2 className="size-4" /> Invoice submitted to the company.
      </p>
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
        Submit Invoice
      </Button>
    </form>
  );
}
