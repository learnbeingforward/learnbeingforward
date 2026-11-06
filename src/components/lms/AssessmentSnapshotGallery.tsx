"use client";

import { useState } from "react";
import { Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteAssessmentSnapshots,
  sendResultToCollege,
  sendResultToStudent,
} from "@/lib/actions/assessments";

export function AssessmentSnapshotGallery({
  assignmentId,
  snapshots,
}: {
  assignmentId: string;
  snapshots: { id: string; imageUrl: string; capturedAt: string }[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === snapshots.length ? new Set() : new Set(snapshots.map((s) => s.id))));
  }

  if (snapshots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-6 text-center text-sm text-muted-foreground">
        No proctoring snapshots were captured for this attempt.
      </div>
    );
  }

  return (
    <form className="rounded-xl border border-border bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-indigo">
          <input
            type="checkbox"
            checked={selected.size === snapshots.length}
            onChange={toggleAll}
            className="accent-indigo"
          />
          Select all ({snapshots.length})
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            formAction={deleteAssessmentSnapshots.bind(null, assignmentId)}
            disabled={selected.size === 0}
            size="sm"
            variant="outline"
            className="border-red-300 text-red-600"
          >
            <Trash2 className="size-3.5" /> Delete Selected
          </Button>
          <Button
            type="submit"
            formAction={sendResultToStudent.bind(null, assignmentId)}
            disabled={selected.size === 0}
            size="sm"
            variant="outline"
            className="border-border text-indigo"
          >
            <Send className="size-3.5" /> Send Selected to Student
          </Button>
          <Button
            type="submit"
            formAction={sendResultToCollege.bind(null, assignmentId)}
            disabled={selected.size === 0}
            size="sm"
            variant="outline"
            className="border-border text-indigo"
          >
            <Send className="size-3.5" /> Send Selected to College
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {snapshots.map((s) => (
          <label key={s.id} className="group relative block cursor-pointer overflow-hidden rounded-lg border border-border">
            <input
              type="checkbox"
              name="snapshotIds"
              value={s.id}
              checked={selected.has(s.id)}
              onChange={() => toggle(s.id)}
              className="absolute left-1.5 top-1.5 z-10 size-4 accent-indigo"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.imageUrl} alt="Proctoring snapshot" className="aspect-video w-full object-cover" />
            <p className="bg-indigo/5 px-1.5 py-1 text-center text-[10px] text-muted-foreground">
              {new Date(s.capturedAt).toLocaleTimeString()}
            </p>
          </label>
        ))}
      </div>
    </form>
  );
}
