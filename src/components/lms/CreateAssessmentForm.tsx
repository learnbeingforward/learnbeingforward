"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequiredMark } from "@/components/ui/required-mark";
import { createAssessment, type CreateAssessmentState } from "@/lib/actions/assessments";

export function CreateAssessmentForm({ type }: { type: "APTITUDE" | "TECHNICAL_APTITUDE" | "CODING" }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<CreateAssessmentState, FormData>(createAssessment, null);

  useEffect(() => {
    if (state?.ok && state.assessmentId) {
      router.push(`/lms/company/assessments?assessmentId=${state.assessmentId}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-dashed border-border p-4">
      <input type="hidden" name="type" value={type} />
      <div>
        <Label htmlFor={`title-${type}`}>
          Assessment Title
          <RequiredMark />
        </Label>
        <Input id={`title-${type}`} name="title" required className="mt-1.5" placeholder="e.g. Placement Round 1" />
      </div>
      <div>
        <Label htmlFor={`description-${type}`}>Description (optional)</Label>
        <Textarea id={`description-${type}`} name="description" rows={2} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor={`duration-${type}`}>
          Duration (minutes)
          <RequiredMark />
        </Label>
        <Input
          id={`duration-${type}`}
          name="durationMinutes"
          type="number"
          min={1}
          required
          defaultValue={30}
          className="mt-1.5 max-w-[140px]"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Shown to students before they start, and the exam auto-submits once this much time passes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`available-from-${type}`}>
            Opens
            <RequiredMark />
          </Label>
          <Input id={`available-from-${type}`} name="availableFrom" type="datetime-local" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor={`available-until-${type}`}>
            Closes
            <RequiredMark />
          </Label>
          <Input id={`available-until-${type}`} name="availableUntil" type="datetime-local" required className="mt-1.5" />
        </div>
      </div>
      <p className="-mt-1 text-xs text-muted-foreground">
        Students can only start the assessment between these two times, and must finish within the window —
        outside it, it can&apos;t be taken at all.
      </p>

      <label className="flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2.5 text-sm text-indigo">
        <input type="checkbox" name="proctoringEnabled" className="accent-indigo" />
        Require webcam &amp; microphone proctoring (periodic snapshots + audio monitoring)
      </label>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} size="sm" className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        Create &amp; Start Adding Questions
      </Button>
    </form>
  );
}
