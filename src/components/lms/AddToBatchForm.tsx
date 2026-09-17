"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addStudentsToBatch, type AddToBatchState } from "@/lib/actions/batches";

type Candidate = { id: string; studentName: string };

export function AddToBatchForm({ batchId, candidates }: { batchId: string; candidates: Candidate[] }) {
  const [state, formAction, isPending] = useActionState<AddToBatchState, FormData>(
    addStudentsToBatch.bind(null, batchId),
    null
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-white p-5">
      <p className="text-sm font-semibold text-indigo">Add Students to This Batch</p>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-3">
        {candidates.map((c) => (
          <label key={c.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-cream">
            <input
              type="checkbox"
              name="enrollmentIds"
              value={c.id}
              checked={selected.has(c.id)}
              onChange={() => toggle(c.id)}
              className="size-4"
            />
            {c.studentName}
          </label>
        ))}
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Added.</p>}
      <Button type="submit" size="sm" disabled={isPending || selected.size === 0} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Add Selected
      </Button>
    </form>
  );
}
