"use client";

import { useActionState } from "react";
import { Icon } from "@/components/lbf/icons";
import { PasswordField } from "@/components/auth/PasswordField";
import { changeOwnPassword, type ChangePasswordState } from "@/lib/actions/profile";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<ChangePasswordState, FormData>(
    changeOwnPassword,
    null
  );

  return (
    <form action={formAction} className="grid" style={{ ["--min" as string]: "220px", alignItems: "end" }}>
      <label className="field">
        <span>
          Current password <span className="req" aria-hidden="true">*</span>
        </span>
        <PasswordField name="currentPassword" required />
      </label>
      <label className="field">
        <span>
          New password <span className="req" aria-hidden="true">*</span>
        </span>
        <PasswordField name="newPassword" minLength={8} required />
      </label>

      {state?.ok && <span className="small" style={{ color: "var(--success-text)" }}>Password changed.</span>}
      {state?.error && <span className="error-text">{state.error}</span>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        <Icon name="lock" size={16} />
        {isPending ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
