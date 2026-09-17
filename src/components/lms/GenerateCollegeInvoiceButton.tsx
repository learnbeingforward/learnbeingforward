"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCollegeInvoice, type GenerateInvoiceState } from "@/lib/actions/college-contracts";

export function GenerateCollegeInvoiceButton({ contractId }: { contractId: string }) {
  const [state, formAction, isPending] = useActionState<GenerateInvoiceState, FormData>(
    generateCollegeInvoice.bind(null, contractId),
    null
  );

  if (state?.ok) {
    return <p className="text-xs font-medium text-green-700">Invoice generated.</p>;
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
