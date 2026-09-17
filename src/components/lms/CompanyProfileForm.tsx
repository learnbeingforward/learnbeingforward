"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { updateCompanyProfile, type UpdateProfileState } from "@/lib/actions/profile";

type Admin = { name: string; email: string; photoUrl: string | null };

export function CompanyProfileForm({ admin }: { admin: Admin }) {
  const [state, formAction, isPending] = useActionState<UpdateProfileState, FormData>(
    updateCompanyProfile,
    null
  );

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">
            Name
            <RequiredMark />
          </Label>
          <Input id="name" name="name" required defaultValue={admin.name} className="mt-1.5" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={admin.email} disabled className="mt-1.5 bg-cream" />
        </div>
      </div>

      <FileUploadField name="photoUrl" label="Photo (optional)" category="photo" defaultUrl={admin.photoUrl} />

      {state?.ok && (
        <p className="flex items-center gap-1.5 text-sm text-green-700">
          <CheckCircle2 className="size-4" /> Saved.
        </p>
      )}
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Save
      </Button>
    </form>
  );
}
