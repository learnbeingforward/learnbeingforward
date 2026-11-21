"use client";

import { useActionState } from "react";
import { Icon } from "@/components/lbf/icons";
import { confirmOrderPaid, rejectOrder, resendOrderEmail, type OrderActionState } from "@/lib/actions/buy";

export function ConfirmOrderButton({ orderId }: { orderId: string }) {
  const [state, formAction, isPending] = useActionState<OrderActionState, FormData>(confirmOrderPaid.bind(null, orderId), null);

  return (
    <div>
      <form action={formAction}>
        <button className="btn btn-success btn-sm" type="submit" disabled={isPending}>
          <Icon name="check" size={16} />
          {isPending ? "Confirming…" : "Confirm"}
        </button>
      </form>
      {state?.error && (
        <div className="error-text" style={{ marginTop: 6, maxWidth: 260 }}>
          {state.error}
        </div>
      )}
    </div>
  );
}

export function ResendOrderEmailButton({ orderId }: { orderId: string }) {
  const [state, formAction, isPending] = useActionState<OrderActionState, FormData>(resendOrderEmail.bind(null, orderId), null);

  return (
    <div>
      <form action={formAction}>
        <button className="btn btn-sm" type="submit" disabled={isPending}>
          <Icon name="mail" size={16} />
          {isPending ? "Sending…" : state?.ok ? "Sent — Resend" : "Resend"}
        </button>
      </form>
      {state?.error && (
        <div className="error-text" style={{ marginTop: 6, maxWidth: 260 }}>
          {state.error}
        </div>
      )}
    </div>
  );
}

export function RejectOrderForm({ orderId, reasons }: { orderId: string; reasons: string[] }) {
  const [state, formAction, isPending] = useActionState<OrderActionState, FormData>(rejectOrder.bind(null, orderId), null);

  return (
    <details>
      <summary style={{ display: "inline-flex", cursor: "pointer", listStyle: "none" }}>
        <span className="btn btn-danger btn-sm">Reject</span>
      </summary>
      <form action={formAction} className="stack" style={{ gap: 8, marginTop: 8, maxWidth: 260 }}>
        <select className="select" name="reason" required defaultValue="">
          <option value="" disabled>
            Select a reason…
          </option>
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button className="btn btn-sm" type="submit" disabled={isPending}>
          {isPending ? "Rejecting…" : "Confirm reject"}
        </button>
        {state?.error && <span className="error-text">{state.error}</span>}
      </form>
    </details>
  );
}
