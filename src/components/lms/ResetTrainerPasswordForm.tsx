"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resetTrainerPassword, type ResetTrainerPasswordState } from "@/lib/actions/trainers";

type Trainer = { id: string; name: string };

export function ResetTrainerPasswordForm({ trainers }: { trainers: Trainer[] }) {
  const [state, formAction, isPending] = useActionState<ResetTrainerPasswordState, FormData>(
    resetTrainerPassword,
    null
  );

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="trainerId">
            Trainer
            <RequiredMark />
          </Label>
          <Select name="trainerId" required>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select trainer">
                {(value: string | null) => trainers.find((t) => t.id === value)?.name ?? "Select trainer"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {trainers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="newPassword">
            New Password
            <RequiredMark />
          </Label>
          <Input id="newPassword" name="newPassword" minLength={8} required className="mt-1.5" />
        </div>
      </div>

      {state?.ok && (
        <p className="flex items-center gap-1.5 text-sm text-green-700">
          <CheckCircle2 className="size-4" /> Password reset.
        </p>
      )}
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Reset Trainer Password
      </Button>
    </form>
  );
}
