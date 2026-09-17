"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { updateCollegeProfile, type UpdateProfileState } from "@/lib/actions/profile";

type College = {
  name: string;
  contactEmail: string | null;
  photoUrl: string | null;
};

export function CollegeProfileForm({ college }: { college: College }) {
  const [state, formAction, isPending] = useActionState<UpdateProfileState, FormData>(
    updateCollegeProfile,
    null
  );

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">
            College Name
            <RequiredMark />
          </Label>
          <Input id="name" name="name" required defaultValue={college.name} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="contactEmail">Contact Email (optional)</Label>
          <Input id="contactEmail" name="contactEmail" type="email" defaultValue={college.contactEmail ?? ""} className="mt-1.5" />
        </div>
      </div>

      <FileUploadField name="photoUrl" label="College Logo / Photo (optional)" category="photo" defaultUrl={college.photoUrl} />

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
