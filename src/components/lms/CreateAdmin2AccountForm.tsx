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
import { createAdmin2Account, type CreateAccountState } from "@/lib/actions/accounts";

export function CreateAdmin2AccountForm() {
  const [state, formAction, isPending] = useActionState<CreateAccountState, FormData>(
    createAdmin2Account,
    null
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="size-5" />
          <p className="font-semibold">Second admin account created</p>
        </div>
        <p className="text-sm text-green-800">
          Share these credentials — this password will not be shown again.
        </p>
        <div className="rounded-lg bg-white px-4 py-3 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="font-mono font-semibold text-indigo">{state.email}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Password:</span>{" "}
            <span className="font-mono font-semibold text-indigo">{state.password}</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="border-green-300 text-green-700"
        >
          Add another
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="admin2-name">
            Full Name
            <RequiredMark />
          </Label>
          <Input id="admin2-name" name="name" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="admin2-email">
            Login Email
            <RequiredMark />
          </Label>
          <Input id="admin2-email" name="email" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="admin2-phone">Phone (optional)</Label>
          <Input id="admin2-phone" name="phone" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="admin2-gender">Gender (optional)</Label>
          <Select name="gender">
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Create Second Admin Account
      </Button>
    </form>
  );
}
