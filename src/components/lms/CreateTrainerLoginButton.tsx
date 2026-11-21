"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/lbf/icons";
import {
  createLoginForExistingTrainer,
  type CreateLoginForTrainerState,
} from "@/lib/actions/trainers";

export function CreateTrainerLoginButton({
  trainerId,
  hasEmail,
  hasLogin,
}: {
  trainerId: string;
  hasEmail: boolean;
  hasLogin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<CreateLoginForTrainerState, FormData>(
    createLoginForExistingTrainer.bind(null, trainerId),
    null
  );

  if (!state?.ok && hasLogin) return null;

  if (state?.ok) {
    return (
      <span className="small" style={{ color: "var(--success-text)" }}>
        Login created — {state.email} / {state.password}
      </span>
    );
  }

  if (!open) {
    return (
      <button className="btn btn-sm" type="button" onClick={() => setOpen(true)}>
        <Icon name="key" size={16} />
        Create login
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {!hasEmail && <input className="input" style={{ width: 190 }} name="email" type="email" placeholder="Login email" required />}
      {state?.error && <span className="error-text">{state.error}</span>}
      <button className="btn btn-primary btn-sm" type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Confirm"}
      </button>
    </form>
  );
}
