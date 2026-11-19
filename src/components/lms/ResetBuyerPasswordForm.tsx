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
import { resetBuyerPassword } from "@/lib/actions/password-resets";
import type { QuickResetState } from "@/lib/actions/password-resets";

type Buyer = { id: string; name: string; email: string };

export function ResetBuyerPasswordForm({ buyers }: { buyers: Buyer[] }) {
  const [state, formAction, isPending] = useActionState<QuickResetState, FormData>(
    resetBuyerPassword,
    null
  );

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="buyerId">
            Buyer
            <RequiredMark />
          </Label>
          <Select name="buyerId" required>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select buyer">
                {(value: string | null) => {
                  const b = buyers.find((b) => b.id === value);
                  return b ? `${b.name} (${b.email})` : "Select buyer";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {buyers.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name} ({b.email})
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
        Reset Buyer Password
      </Button>
    </form>
  );
}
