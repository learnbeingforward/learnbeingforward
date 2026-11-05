"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { resetAccountPassword, type ResetAccountResult } from "@/lib/actions/password-resets";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

/**
 * Passwords are bcrypt hashes — the original can never be read back. Clicking
 * the eye icon the first time sets a fresh password and reveals that; clicking
 * it again just toggles showing/hiding the password already set this session.
 */
export function RevealPasswordCell({ email }: { email: string }) {
  const [revealed, setRevealed] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<ResetAccountResult, FormData>(
    async (prevState, formData) => {
      const result = await resetAccountPassword(prevState, formData);
      if (result?.ok) {
        setCurrentPassword(String(formData.get("newPassword")));
        setRevealed(true);
      }
      return result;
    },
    null
  );

  function handleClick() {
    if (currentPassword) {
      setRevealed((r) => !r);
      return;
    }
    const fd = new FormData();
    fd.set("email", email);
    fd.set("newPassword", generatePassword());
    formAction(fd);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs">
        {revealed && currentPassword ? currentPassword : "••••••••••••"}
      </span>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-muted-foreground hover:text-indigo disabled:opacity-50"
        title={currentPassword ? (revealed ? "Hide" : "Show") : "Set a new password and reveal it"}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : revealed && currentPassword ? (
          <EyeOff className="size-3.5" />
        ) : (
          <Eye className="size-3.5" />
        )}
      </button>
      {state?.error && <span className="text-[11px] text-destructive">{state.error}</span>}
    </div>
  );
}
