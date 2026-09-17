"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { changeOwnPassword, type ChangePasswordState } from "@/lib/actions/profile";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<ChangePasswordState, FormData>(
    changeOwnPassword,
    null
  );

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="currentPassword">
            Current Password
            <RequiredMark />
          </Label>
          <Input id="currentPassword" name="currentPassword" type="password" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="newPassword">
            New Password
            <RequiredMark />
          </Label>
          <Input id="newPassword" name="newPassword" type="password" minLength={8} required className="mt-1.5" />
        </div>
      </div>

      {state?.ok && (
        <p className="flex items-center gap-1.5 text-sm text-green-700">
          <CheckCircle2 className="size-4" /> Password changed.
        </p>
      )}
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Change Password
      </Button>
    </form>
  );
}
