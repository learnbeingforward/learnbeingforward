"use client";

import { useActionState, useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RevealPasswordCell } from "@/components/lms/RevealPasswordCell";
import {
  updateAccountDetails,
  sendAccountDetailsEmail,
  type AccountKind,
  type UpdateAccountDetailsState,
  type SendDetailsEmailState,
} from "@/lib/actions/account-details";

export type AccountDetail = {
  id: string;
  kind: AccountKind;
  name: string;
  email: string;
  phone: string | null;
  // student-only
  branch?: string | null;
  semester?: number | null;
  usn?: string | null;
  // college-only
  collegeName?: string;
  contactEmail?: string | null;
  // trainer-only
  hourlyRate?: number;
};

export function AccountDetailView({ account }: { account: AccountDetail }) {
  const [state, formAction, isPending] = useActionState<UpdateAccountDetailsState, FormData>(
    updateAccountDetails.bind(null, account.kind, account.id),
    null
  );
  const [emailState, setEmailState] = useState<SendDetailsEmailState>(null);
  const [sending, setSending] = useState(false);

  async function handleSendEmail() {
    setSending(true);
    const result = await sendAccountDetailsEmail(account.kind, account.id);
    setEmailState(result);
    setSending(false);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-indigo">{account.name}</h2>
          <RevealPasswordCell email={account.email} />
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Login Email</dt>
            <dd className="text-indigo">{account.email}</dd>
          </div>
          {account.kind === "college" && (
            <div>
              <dt className="text-muted-foreground">College</dt>
              <dd className="text-indigo">{account.collegeName}</dd>
            </div>
          )}
        </dl>
      </div>

      <form action={formAction} className="space-y-4 rounded-xl border border-border bg-white p-6">
        <p className="text-sm font-semibold text-indigo">Edit Details</p>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={account.name} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={account.phone ?? ""} className="mt-1.5" />
        </div>

        {account.kind === "student" && (
          <>
            <div>
              <Label htmlFor="usn">USN</Label>
              <Input id="usn" name="usn" defaultValue={account.usn ?? ""} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" name="branch" defaultValue={account.branch ?? ""} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Input id="semester" name="semester" type="number" min="1" max="8" defaultValue={account.semester ?? ""} className="mt-1.5" />
              </div>
            </div>
          </>
        )}

        {account.kind === "college" && (
          <>
            <div>
              <Label htmlFor="collegeName">College Name</Label>
              <Input id="collegeName" name="collegeName" defaultValue={account.collegeName ?? ""} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="contactEmail">College Contact Email</Label>
              <Input id="contactEmail" name="contactEmail" defaultValue={account.contactEmail ?? ""} className="mt-1.5" />
            </div>
          </>
        )}

        {account.kind === "trainer" && (
          <div>
            <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
            <Input id="hourlyRate" name="hourlyRate" type="number" min="0" defaultValue={account.hourlyRate ?? 0} className="mt-1.5" />
          </div>
        )}

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.ok && (
          <p className="flex items-center gap-1.5 text-sm text-green-700">
            <CheckCircle2 className="size-4" /> Saved.
          </p>
        )}

        <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Save Changes
        </Button>
      </form>

      <div className="rounded-xl border border-border bg-white p-6">
        <p className="mb-2 text-sm font-semibold text-indigo">Email Account Details</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Sends a summary of this account&apos;s details to {account.email}. Note: no email provider is
          configured on this site yet, so this currently only logs the message server-side instead of
          actually delivering it — a real provider (e.g. Resend or SMTP) needs to be connected first.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleSendEmail}
          disabled={sending}
          className="border-border text-indigo"
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          Send Details to Email
        </Button>
        {emailState?.error && <p className="mt-2 text-sm text-destructive">{emailState.error}</p>}
        {emailState?.ok && (
          <div className="mt-3 rounded-lg bg-cream p-3 text-xs">
            <p className="mb-1 font-medium text-indigo">Logged (simulated send):</p>
            <pre className="whitespace-pre-wrap text-muted-foreground">{emailState.preview}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
