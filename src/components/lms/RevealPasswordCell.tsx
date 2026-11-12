"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { resetAccountPassword, type ResetAccountResult } from "@/lib/actions/password-resets";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

/**
 * Passwords are bcrypt hashes — the real one can never be read back, here or
 * anywhere else. This button doesn't "view" a password; every click overwrites
 * whatever the login password currently is (including one set moments ago via
 * Manage Accounts or a self-service reset) with a brand-new random one and shows
 * only that. It's deliberately NOT an eye icon / toggle, and doesn't cache a
 * previous result across clicks, so there's no way to end up looking at a stale
 * password while believing it's still current.
 */
export function RevealPasswordCell({ email }: { email: string }) {
  const [justGenerated, setJustGenerated] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<ResetAccountResult, FormData>(
    async (prevState, formData) => {
      const result = await resetAccountPassword(prevState, formData);
      if (result?.ok) setJustGenerated(String(formData.get("newPassword")));
      return result;
    },
    null
  );

  function handleClick() {
    setJustGenerated(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("newPassword", generatePassword());
    formAction(fd);
  }

  if (justGenerated) {
    return (
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
          <CheckCircle2 className="size-3.5" /> New password set — share this now:
        </p>
        <span className="block font-mono text-xs font-semibold text-indigo">{justGenerated}</span>
        <p className="flex items-start gap-1 text-[10px] text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
          This replaced their old password (from here or anywhere else). It won&apos;t be shown again — write it
          down now.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-1 text-xs font-medium text-indigo hover:underline disabled:opacity-50"
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
        Generate New Password
      </button>
      {state?.error && <span className="text-[11px] text-destructive">{state.error}</span>}
    </div>
  );
}
