"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { scheduleTrainingSession, type ScheduleSessionState } from "@/lib/actions/training-sessions";
import { slotPresetsFor } from "@/lib/session-slots";

type BatchOption = { id: string; name: string; collegeName: string; courseId: string };
type TrainerOption = { id: string; name: string };
type ModuleOption = { id: string; title: string; courseId: string };

export function ScheduleSessionForm({
  batches,
  trainers,
  modules,
}: {
  batches: BatchOption[];
  trainers: TrainerOption[];
  modules: ModuleOption[];
}) {
  const [state, formAction, isPending] = useActionState<ScheduleSessionState, FormData>(
    scheduleTrainingSession,
    null
  );

  const [batchId, setBatchId] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [slotOn, setSlotOn] = useState({ 1: true, 2: false, 3: false });

  const selectedBatch = batches.find((b) => b.id === batchId);
  const courseModules = useMemo(
    () => modules.filter((m) => m.courseId === selectedBatch?.courseId),
    [modules, selectedBatch]
  );

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-border bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>
            Batch
            <RequiredMark />
          </Label>
          <Select name="batchId" value={batchId} onValueChange={(v) => setBatchId(String(v))}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select batch">
                {(value: string | null) => {
                  const b = batches.find((x) => x.id === value);
                  return b ? `${b.collegeName} — ${b.name}` : "Select batch";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {batches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.collegeName} — {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>
            Trainer
            <RequiredMark />
          </Label>
          <Select name="trainerId" value={trainerId} onValueChange={(v) => setTrainerId(String(v))}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select trainer">
                {(value: string | null) => trainers.find((t) => t.id === value)?.name ?? "Select trainer"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {trainers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sessionDate">
            Date
            <RequiredMark />
          </Label>
          <Input id="sessionDate" name="sessionDate" type="date" required className="mt-1.5" />
        </div>
      </div>

      <div className="space-y-4">
        {([1, 2, 3] as const).map((n) => (
          <div key={n} className="rounded-lg border border-border p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-indigo">
              <input
                type="checkbox"
                name={`slot${n}_include`}
                checked={slotOn[n]}
                onChange={(e) => setSlotOn((prev) => ({ ...prev, [n]: e.target.checked }))}
                className="size-4"
              />
              Session {n}
            </label>
            {slotOn[n] && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>
                    Time
                    <RequiredMark />
                  </Label>
                  <Select name={`slot${n}_time`}>
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {slotPresetsFor(n).map((p) => (
                        <SelectItem key={p.label} value={`${p.startTime}|${p.endTime}`}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Module / Subject (optional)</Label>
                  <Select name={`slot${n}_moduleId`}>
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue placeholder="Select module">
                        {(value: string | null) =>
                          courseModules.find((m) => m.id === value)?.title ?? "Select module"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {courseModules.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`slot${n}_topic`}>Topic (if no module fits)</Label>
                  <Input id={`slot${n}_topic`} name={`slot${n}_topic`} className="mt-1.5" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Session scheduled and pushed to the trainer&apos;s schedule.</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Schedule Session
      </Button>
    </form>
  );
}
