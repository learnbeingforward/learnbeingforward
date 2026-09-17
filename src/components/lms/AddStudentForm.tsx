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
import { createStudentAccount, type CreateAccountState } from "@/lib/actions/accounts";

type College = { id: string; name: string };

export function AddStudentForm({ colleges }: { colleges?: College[] }) {
  const [state, formAction, isPending] = useActionState<CreateAccountState, FormData>(
    createStudentAccount,
    null
  );

  if (state?.ok && state.roster) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="size-5" />
          <p className="font-semibold">Student added to roster</p>
        </div>
        <p className="text-sm text-green-800">
          <span className="font-mono font-semibold">{state.email}</span> can now sign up on the
          login page — their name, email, and college must match exactly what you entered here.
          Once they sign up, approve their registration under &ldquo;New Registrations&rdquo; in
          the Company dashboard before they can request courses.
        </p>
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

  if (state?.ok) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="size-5" />
          <p className="font-semibold">Student account created</p>
        </div>
        <p className="text-sm text-green-800">
          Share these credentials with the student — this password will not be shown again.
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
          <Label htmlFor="name">
            Full Name
            <RequiredMark />
          </Label>
          <Input id="name" name="name" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">
            Email
            <RequiredMark />
          </Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="usn">USN / Roll Number (optional)</Label>
          <Input id="usn" name="usn" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="fatherName">Father&apos;s Name (optional)</Label>
          <Input id="fatherName" name="fatherName" className="mt-1.5" />
        </div>

        {colleges && (
          <div className="sm:col-span-2">
            <Label htmlFor="collegeId">College (optional)</Label>
            <Select name="collegeId">
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Create Student Account
      </Button>
    </form>
  );
}
