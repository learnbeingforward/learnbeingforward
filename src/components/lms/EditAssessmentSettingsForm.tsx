"use client";

import { useActionState, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequiredMark } from "@/components/ui/required-mark";
import { updateAssessmentSettings, type UpdateAssessmentSettingsState } from "@/lib/actions/assessments";

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EditAssessmentSettingsForm({
  assessmentId,
  title,
  description,
  durationMinutes,
  proctoringEnabled,
  availableFrom,
  availableUntil,
}: {
  assessmentId: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  proctoringEnabled: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
}) {
  const action = updateAssessmentSettings.bind(null, assessmentId);
  const [state, formAction, isPending] = useActionState<UpdateAssessmentSettingsState, FormData>(action, null);
  const availableFromIsoRef = useRef<HTMLInputElement>(null);
  const availableUntilIsoRef = useRef<HTMLInputElement>(null);

  // See CreateAssessmentForm — a bare datetime-local string has no timezone, so the
  // server re-parsing it with new Date(...) would use the server's own local
  // timezone instead of the admin's, silently shifting the window. Convert to an
  // absolute ISO timestamp here, in the admin's browser, before it's submitted.
  function toIso(value: string) {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
  }

  return (
    <details className="mb-6 rounded-xl border border-dashed border-border bg-white">
      <summary className="cursor-pointer list-none p-4 text-sm font-semibold text-indigo">
        Edit Assessment Settings (title, duration, window, proctoring)
      </summary>
      <form action={formAction} className="space-y-3 border-t border-border p-4">
        <div>
          <Label htmlFor="edit-title">
            Assessment Title
            <RequiredMark />
          </Label>
          <Input id="edit-title" name="title" required defaultValue={title} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="edit-description">Description (optional)</Label>
          <Textarea id="edit-description" name="description" rows={2} defaultValue={description ?? ""} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="edit-duration">
            Duration (minutes)
            <RequiredMark />
          </Label>
          <Input
            id="edit-duration"
            name="durationMinutes"
            type="number"
            min={1}
            required
            defaultValue={durationMinutes}
            className="mt-1.5 max-w-[140px]"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="edit-available-from">
              Opens
              <RequiredMark />
            </Label>
            <Input
              id="edit-available-from"
              type="datetime-local"
              required
              defaultValue={availableFrom ? toLocalInputValue(new Date(availableFrom)) : ""}
              className="mt-1.5"
              onChange={(e) => {
                if (availableFromIsoRef.current) availableFromIsoRef.current.value = toIso(e.target.value);
              }}
            />
            <input
              type="hidden"
              name="availableFrom"
              ref={availableFromIsoRef}
              defaultValue={availableFrom ? new Date(availableFrom).toISOString() : ""}
            />
          </div>
          <div>
            <Label htmlFor="edit-available-until">
              Closes
              <RequiredMark />
            </Label>
            <Input
              id="edit-available-until"
              type="datetime-local"
              required
              defaultValue={availableUntil ? toLocalInputValue(new Date(availableUntil)) : ""}
              className="mt-1.5"
              onChange={(e) => {
                if (availableUntilIsoRef.current) availableUntilIsoRef.current.value = toIso(e.target.value);
              }}
            />
            <input
              type="hidden"
              name="availableUntil"
              ref={availableUntilIsoRef}
              defaultValue={availableUntil ? new Date(availableUntil).toISOString() : ""}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2.5 text-sm text-indigo">
          <input type="checkbox" name="proctoringEnabled" defaultChecked={proctoringEnabled} className="accent-indigo" />
          Require webcam &amp; microphone proctoring (periodic snapshots + audio monitoring)
        </label>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state?.ok && (
          <p className="flex items-center gap-1.5 text-sm text-green-700">
            <CheckCircle2 className="size-4" /> Settings saved.
          </p>
        )}

        <Button type="submit" disabled={isPending} size="sm" className="bg-indigo text-white hover:bg-indigo/90">
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </details>
  );
}
