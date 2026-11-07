"use client";

import { useState } from "react";
import { Images, ChevronDown, ChevronRight } from "lucide-react";

/** Read-only counterpart to AssessmentSnapshotGallery, for the student and college
 * portals — shows only whatever snapshots the admin explicitly shared with that
 * audience, hidden behind a click so it never dominates the page. */
export function SharedSnapshotGallery({
  snapshots,
}: {
  snapshots: { id: string; imageUrl: string; capturedAt: string }[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (snapshots.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-white">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-indigo">
          <Images className="size-4" /> Snapshot Images ({snapshots.length})
        </span>
        {expanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="grid grid-cols-2 gap-3 border-t border-border p-5 sm:grid-cols-4 lg:grid-cols-6">
          {snapshots.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.imageUrl} alt="Proctoring snapshot" className="aspect-video w-full object-cover" />
              <p className="bg-indigo/5 px-1.5 py-1 text-center text-[10px] text-muted-foreground">
                {new Date(s.capturedAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
