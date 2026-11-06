"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { EMPLOYEE_PAGE_CATALOG } from "@/lib/employee-access";
import { createEmployeeAccount, type CreateEmployeeState } from "@/lib/actions/employee-access";

export function EmployeeAccessForm() {
  const [state, formAction, isPending] = useActionState<CreateEmployeeState, FormData>(
    createEmployeeAccount,
    null
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="size-5" />
          <p className="font-semibold">Employee account created</p>
        </div>
        <p className="text-sm text-green-800">
          Give <span className="font-mono font-semibold">{state.email}</span> the email and password you set —
          they&apos;ll only see the sections you granted below, plus their Profile.
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

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-border bg-white p-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-indigo">Account Type</p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-indigo">
            <input type="radio" name="employeeKind" value="EMPLOYEE" defaultChecked className="accent-indigo" />
            Employee
          </label>
          <label className="flex items-center gap-2 text-sm text-indigo">
            <input type="radio" name="employeeKind" value="ADMIN" className="accent-indigo" />
            Admin
          </label>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Just a label shown in the account list — access is governed entirely by what you check below either
          way, so an "Admin" created here only gets the sections you grant them, not full access automatically.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="employee-name">
            Full Name
            <RequiredMark />
          </Label>
          <Input id="employee-name" name="name" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="employee-email">
            Login Email
            <RequiredMark />
          </Label>
          <Input id="employee-email" name="email" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="employee-password">
            Password
            <RequiredMark />
          </Label>
          <Input id="employee-password" name="password" type="text" required minLength={8} className="mt-1.5" />
          <p className="mt-1 text-xs text-muted-foreground">At least 8 characters — set this yourself and hand it to them.</p>
        </div>
        <div>
          <Label htmlFor="employee-phone">Phone (optional)</Label>
          <Input id="employee-phone" name="phone" className="mt-1.5" />
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-indigo">What can this employee access?</p>
        <p className="mb-4 text-xs text-muted-foreground">
          They&apos;ll see only the sections checked here, plus their own Profile. Everything else stays hidden.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {EMPLOYEE_PAGE_CATALOG.map((group) => (
            <div key={group.group} className="rounded-lg border border-border p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.group}
              </p>
              <div className="space-y-3">
                {group.pages.map((page) => (
                  <div key={page.href}>
                    <p className="text-xs font-semibold text-indigo">{page.cluster ?? page.navLabel}</p>
                    <div className="mt-1 space-y-1.5 pl-2">
                      {page.permissions.map((perm) => (
                        <label key={perm.key} className="flex items-center gap-2 text-sm text-indigo">
                          <input type="checkbox" name="pageKeys" value={perm.key} className="accent-indigo" />
                          {page.permissions.length > 1 ? perm.label : page.navLabel}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Create Employee Account
      </Button>
    </form>
  );
}
