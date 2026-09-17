"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decideTrainerInvoice, type DecideInvoiceState } from "@/lib/actions/trainer-invoices";

export function DecideTrainerInvoiceForm({ invoiceId, totalAmount }: { invoiceId: string; totalAmount: number }) {
  const [showAdjust, setShowAdjust] = useState(false);
  const approveAction = decideTrainerInvoice.bind(null, invoiceId, true);
  const rejectAction = decideTrainerInvoice.bind(null, invoiceId, false);
  const [approveState, approveFormAction, approvePending] = useActionState<DecideInvoiceState, FormData>(
    approveAction,
    null
  );
  const [rejectState, rejectFormAction, rejectPending] = useActionState<DecideInvoiceState, FormData>(
    rejectAction,
    null
  );

  if (approveState?.ok || rejectState?.ok) {
    return <p className="text-sm font-medium text-green-700">Decision recorded and the trainer has been notified.</p>;
  }

  return (
    <div className="space-y-3">
      {!showAdjust ? (
        <button
          type="button"
          onClick={() => setShowAdjust(true)}
          className="text-xs font-medium text-indigo underline underline-offset-2"
        >
          Adjust amount before approving (optional)
        </button>
      ) : (
        <div className="grid gap-3 rounded-lg bg-cream p-3 sm:grid-cols-3">
          <div>
            <Label htmlFor={`deduction-${invoiceId}`} className="text-xs">
              Deduction Amount (optional)
            </Label>
            <Input
              id={`deduction-${invoiceId}`}
              name="deductionAmount"
              type="number"
              min={0}
              max={totalAmount}
              form={`approve-form-${invoiceId}`}
              className="mt-1 bg-white"
            />
          </div>
          <div>
            <Label htmlFor={`reason-${invoiceId}`} className="text-xs">
              Reason (required if deducting)
            </Label>
            <Input
              id={`reason-${invoiceId}`}
              name="deductionReason"
              placeholder="e.g. late delivery penalty"
              form={`approve-form-${invoiceId}`}
              className="mt-1 bg-white"
            />
          </div>
          <div>
            <Label htmlFor={`timeline-${invoiceId}`} className="text-xs">
              Payment Within (days, optional)
            </Label>
            <Input
              id={`timeline-${invoiceId}`}
              name="paymentTimelineDays"
              type="number"
              min={1}
              form={`approve-form-${invoiceId}`}
              className="mt-1 bg-white"
            />
          </div>
        </div>
      )}

      {(approveState?.error || rejectState?.error) && (
        <p className="text-sm text-destructive">{approveState?.error ?? rejectState?.error}</p>
      )}

      <div className="flex shrink-0 gap-2">
        <form id={`approve-form-${invoiceId}`} action={approveFormAction} />
        <Button
          form={`approve-form-${invoiceId}`}
          type="submit"
          size="sm"
          disabled={approvePending || rejectPending}
          className="bg-indigo text-white hover:bg-indigo/90"
        >
          {approvePending && <Loader2 className="size-4 animate-spin" />}
          Approve
        </Button>
        <form action={rejectFormAction}>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={approvePending || rejectPending}
            className="border-border text-muted-foreground"
          >
            {rejectPending && <Loader2 className="size-4 animate-spin" />}
            Reject
          </Button>
        </form>
      </div>
    </div>
  );
}
