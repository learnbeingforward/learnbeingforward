"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetAccountPassword, type ResetAccountResult } from "@/lib/actions/password-resets";

export function ResetAccountForm() {
  const [state, formAction, isPending] = useActionState<ResetAccountResult, FormData>(
    resetAccountPassword,
    null
  );

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="reset-email">Account email</Label>
          <Input id="reset-email" name="email" type="email" required className="mt-1.5" />
          <p className="mt-1 text-xs text-muted-foreground">
            Works for any account — student, college admin, or company.
          </p>
        </div>
        <div>
          <Label htmlFor="reset-password">New password</Label>
          <Input id="reset-password" name="newPassword" minLength={8} required className="mt-1.5" />
        </div>
      </div>

      {state?.ok && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="size-4 shrink-0" />
          Password reset for {state.foundName} ({state.foundRole?.toLowerCase().replace("_", " ")}).
        </div>
      )}
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Reset Password
      </Button>
    </form>
  );
}
