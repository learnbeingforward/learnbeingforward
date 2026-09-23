"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { proposeTrainerInvoiceDecision, type ProposeInvoiceState } from "@/lib/actions/trainer-invoices";

export type ExistingProposal = {
  proposedApprove: boolean;
  proposedDeductionAmount: number | null;
  proposedDeductionReason: string | null;
  proposedPaymentTimelineDays: number | null;
  proposedNote: string | null;
} | null;

export function ProposeTrainerInvoiceForm({
  invoiceId,
  totalAmount,
  existingProposal,
}: {
  invoiceId: string;
  totalAmount: number;
  existingProposal: ExistingProposal;
}) {
  const [editing, setEditing] = useState(!existingProposal);
  const approveAction = proposeTrainerInvoiceDecision.bind(null, invoiceId, true);
  const rejectAction = proposeTrainerInvoiceDecision.bind(null, invoiceId, false);
  const [approveState, approveFormAction, approvePending] = useActionState<ProposeInvoiceState, FormData>(
    approveAction,
    null
  );
  const [rejectState, rejectFormAction, rejectPending] = useActionState<ProposeInvoiceState, FormData>(
    rejectAction,
    null
  );

  const [handled, setHandled] = useState({ approveState, rejectState });
  if (approveState !== handled.approveState || rejectState !== handled.rejectState) {
    setHandled({ approveState, rejectState });
    if (approveState?.ok || rejectState?.ok) setEditing(false);
  }

  if (!editing && existingProposal) {
    return (
      <div className="rounded-lg bg-cream p-3 text-xs">
        <p className="font-semibold text-indigo">
          You recommended: {existingProposal.proposedApprove ? "Approve" : "Reject"}
        </p>
        {existingProposal.proposedDeductionAmount ? (
          <p className="mt-1 text-muted-foreground">
            Deduction ₹{existingProposal.proposedDeductionAmount}
            {existingProposal.proposedDeductionReason ? ` — ${existingProposal.proposedDeductionReason}` : ""}
          </p>
        ) : null}
        {existingProposal.proposedPaymentTimelineDays && (
          <p className="mt-1 text-muted-foreground">
            Payment within {existingProposal.proposedPaymentTimelineDays} days
          </p>
        )}
        {existingProposal.proposedNote && (
          <p className="mt-1 text-muted-foreground">&ldquo;{existingProposal.proposedNote}&rdquo;</p>
        )}
        <p className="mt-2 font-medium text-indigo">Awaiting the main admin&apos;s final decision.</p>
        <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => setEditing(true)}>
          Change Recommendation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <p className="text-xs font-medium text-muted-foreground">
        You can&apos;t approve invoices directly — send a recommendation to the main admin instead.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`propose-deduction-${invoiceId}`} className="text-xs">
            Deduction Amount (optional)
          </Label>
          <Input
            id={`propose-deduction-${invoiceId}`}
            name="deductionAmount"
            type="number"
            min={0}
            max={totalAmount}
            form={`propose-approve-form-${invoiceId}`}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`propose-reason-${invoiceId}`} className="text-xs">
            Reason (required if deducting)
          </Label>
          <Input
            id={`propose-reason-${invoiceId}`}
            name="deductionReason"
            placeholder="e.g. late delivery penalty"
            form={`propose-approve-form-${invoiceId}`}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`propose-timeline-${invoiceId}`} className="text-xs">
            Payment Within (days, optional)
          </Label>
          <Input
            id={`propose-timeline-${invoiceId}`}
            name="paymentTimelineDays"
            type="number"
            min={1}
            form={`propose-approve-form-${invoiceId}`}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`propose-note-${invoiceId}`} className="text-xs">
          Note for the main admin (optional)
        </Label>
        <Textarea id={`propose-note-${invoiceId}`} name="note" form={`propose-approve-form-${invoiceId}`} rows={2} className="mt-1" />
      </div>

      {(approveState?.error || rejectState?.error) && (
        <p className="text-sm text-destructive">{approveState?.error ?? rejectState?.error}</p>
      )}

      <div className="flex gap-2">
        <form id={`propose-approve-form-${invoiceId}`} action={approveFormAction} />
        <Button
          form={`propose-approve-form-${invoiceId}`}
          type="submit"
          size="sm"
          disabled={approvePending || rejectPending}
          className="bg-indigo text-white hover:bg-indigo/90"
        >
          {approvePending && <Loader2 className="size-4 animate-spin" />}
          Recommend Approve
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
            Recommend Reject
          </Button>
        </form>
      </div>
    </div>
  );
}
