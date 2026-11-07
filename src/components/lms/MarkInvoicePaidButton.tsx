"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collegeMarkInvoicePaid } from "@/lib/actions/college-contracts";

export function MarkInvoicePaidButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="flex items-center gap-1.5 text-sm font-medium text-green-700">
        <CheckCircle2 className="size-4" /> Marked as paid — waiting for Learn Being Forward to confirm.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(async () => {
          await collegeMarkInvoicePaid(invoiceId);
          setDone(true);
        })}
        className="bg-indigo text-white hover:bg-indigo/90"
      >
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        I Have Paid This Invoice
      </Button>
      <p className="text-xs text-muted-foreground">
        This notifies Learn Being Forward — it only shows as fully &quot;Paid&quot; once they confirm.
      </p>
    </div>
  );
}
