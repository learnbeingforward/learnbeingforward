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
import { resetStudentPassword, type QuickResetState } from "@/lib/actions/password-resets";

type Student = { id: string; name: string; email: string };

export function ResetStudentPasswordForm({ students }: { students: Student[] }) {
  const [state, formAction, isPending] = useActionState<QuickResetState, FormData>(
    resetStudentPassword,
    null
  );

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="studentId">
            Student
            <RequiredMark />
          </Label>
          <Select name="studentId" required>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select student">
                {(value: string | null) => {
                  const s = students.find((s) => s.id === value);
                  return s ? `${s.name} (${s.email})` : "Select student";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.email})
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
        Reset Student Password
      </Button>
    </form>
  );
}
