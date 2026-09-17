"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800">
        <p className="flex items-center gap-1 font-semibold text-green-700">
          <CheckCircle2 className="size-3.5" /> Login created
        </p>
        <p className="mt-1">
          Email: <span className="font-mono">{state.email}</span>
        </p>
        <p>
          Password: <span className="font-mono">{state.password}</span>
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-gold text-indigo"
        onClick={() => setOpen(true)}
      >
        Create Login
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      {!hasEmail && (
        <Input name="email" type="email" placeholder="Login email" required className="h-8 w-48 text-sm" />
      )}
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        Confirm
      </Button>
    </form>
  );
}
