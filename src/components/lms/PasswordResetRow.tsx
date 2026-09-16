"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fulfillPasswordReset, rejectPasswordReset, type FulfillResult } from "@/lib/actions/password-resets";

type Request = {
  id: string;
  name: string;
  email: string;
  collegeName: string;
};

export function PasswordResetRow({ request }: { request: Request }) {
  const fulfillWithId = fulfillPasswordReset.bind(null, request.id);
  const [state, formAction, isPending] = useActionState<FulfillResult, FormData>(fulfillWithId, null);

  if (state?.ok) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-green-700">
        <CheckCircle2 className="size-4 shrink-0" />
        Password sent to {request.email}.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 p-6">
      <div>
        <p className="font-medium text-indigo">{request.name}</p>
        <p className="text-sm text-muted-foreground">
          {request.email} &middot; {request.collegeName}
        </p>
      </div>
      <form action={formAction} className="flex shrink-0 flex-wrap items-start gap-2">
        <Input
          name="newPassword"
          placeholder="New password"
          className="w-40"
          minLength={8}
          required
        />
        <Button type="submit" size="sm" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Send
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => rejectPasswordReset(request.id)}
          className="border-border text-muted-foreground"
        >
          Reject
        </Button>
      </form>
      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </div>
  );
}
