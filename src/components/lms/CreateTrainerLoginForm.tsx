"use client";

import { useActionState } from "react";
import { createTrainerAccount, type CreateTrainerState } from "@/lib/actions/trainers";

export function CreateTrainerLoginForm() {
  const [state, formAction, isPending] = useActionState<CreateTrainerState, FormData>(
    createTrainerAccount,
    null
  );

  if (state?.ok) {
    return (
      <div className="alert success">
        <div>
          <p className="strong">Trainer login created</p>
          <p className="small" style={{ marginTop: 4 }}>
            Share these credentials with the trainer — this password will not be shown again.
          </p>
          <p className="small" style={{ marginTop: 8 }}>
            Email: <span className="strong">{state.email}</span>
            <br />
            Password: <span className="strong">{state.password}</span>
          </p>
          <button className="btn btn-sm" type="button" style={{ marginTop: 10 }} onClick={() => window.location.reload()}>
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="stack" style={{ gap: 16 }}>
      <div className="grid" style={{ ["--min" as string]: "200px" }}>
        <label className="field">
          <span>
            Full name <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="text" name="name" required />
        </label>
        <label className="field">
          <span>
            Login email <span className="req" aria-hidden="true">*</span>
          </span>
          <input className="input" type="email" name="email" required />
        </label>
        <label className="field">
          <span>Phone (optional)</span>
          <input className="input" type="text" name="phone" />
        </label>
        <label className="field">
          <span>Hourly rate (₹, optional)</span>
          <input className="input" type="number" min={0} name="hourlyRate" placeholder="e.g. 500" />
        </label>
      </div>

      {state?.error && <span className="error-text">{state.error}</span>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create trainer login"}
      </button>
    </form>
  );
}
