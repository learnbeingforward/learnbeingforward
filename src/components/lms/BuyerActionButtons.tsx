"use client";

import { useActionState } from "react";
import { Icon } from "@/components/lbf/icons";
import { resendOrderEmail, type OrderActionState } from "@/lib/actions/buy";
import { sendBuyerPasswordReset, type BuyerActionState } from "@/lib/actions/buyers";

export function ResendBooksButton({ orderId }: { orderId: string }) {
  const [state, formAction, isPending] = useActionState<OrderActionState, FormData>(resendOrderEmail.bind(null, orderId), null);

  return (
    <div>
      <form action={formAction}>
        <button className="btn btn-sm" type="submit" disabled={isPending}>
          <Icon name="mail" size={16} />
          {isPending ? "Sending…" : state?.ok ? "Sent — Resend books" : "Resend books"}
        </button>
      </form>
      {state?.error && (
        <div className="error-text" style={{ marginTop: 6, maxWidth: 220 }}>
          {state.error}
        </div>
      )}
    </div>
  );
}

export function ResetBuyerPasswordButton({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState<BuyerActionState, FormData>(sendBuyerPasswordReset.bind(null, userId), null);

  return (
    <div>
      <form action={formAction}>
        <button className="btn btn-sm" type="submit" disabled={isPending}>
          <Icon name="key" size={16} />
          {isPending ? "Sending…" : state?.ok ? "Reset link sent" : "Reset password"}
        </button>
      </form>
      {state?.error && (
        <div className="error-text" style={{ marginTop: 6, maxWidth: 220 }}>
          {state.error}
        </div>
      )}
    </div>
  );
}
