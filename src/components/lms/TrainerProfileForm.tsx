"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadField } from "@/components/lms/FileUploadField";
import { updateTrainerProfile, type UpdateTrainerProfileState } from "@/lib/actions/trainers";

type Trainer = {
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  cvUrl: string | null;
  hourlyRate: number;
};

export function TrainerProfileForm({ trainer }: { trainer: Trainer }) {
  const [state, formAction, isPending] = useActionState<UpdateTrainerProfileState, FormData>(
    updateTrainerProfile,
    null
  );

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input value={trainer.name} disabled className="mt-1.5 bg-cream" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={trainer.email ?? ""} disabled className="mt-1.5 bg-cream" />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" defaultValue={trainer.phone ?? ""} className="mt-1.5" />
        </div>
        <div>
          <Label>Hourly Rate</Label>
          <Input value={`₹${trainer.hourlyRate}/hr`} disabled className="mt-1.5 bg-cream" />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">About You (optional)</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={trainer.bio ?? ""} className="mt-1.5" />
      </div>

      <FileUploadField name="cvUrl" label="CV / Resume (optional)" category="cv" defaultUrl={trainer.cvUrl} />

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
