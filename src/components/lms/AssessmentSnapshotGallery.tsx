"use client";

import { useState, useTransition } from "react";
import { Trash2, Send, Images, ChevronDown, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteAssessmentSnapshots,
  sendResultToCollege,
  sendResultToStudent,
} from "@/lib/actions/assessments";

type Snapshot = {
  id: string;
  imageUrl: string;
  capturedAt: string;
  sharedWithStudent?: boolean;
  sharedWithCollege?: boolean;
};

export function AssessmentSnapshotGallery({
  assignmentId,
  snapshots,
}: {
  assignmentId: string;
  snapshots: Snapshot[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"student" | "college" | "delete" | null>(null);

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

  function buildFormData() {
    const fd = new FormData();
    for (const id of selected) fd.append("snapshotIds", id);
    return fd;
  }

  function handleSend(target: "student" | "college") {
    setStatusMessage(null);
    setPendingAction(target);
    const count = selected.size;
    startTransition(async () => {
      const action = target === "student" ? sendResultToStudent : sendResultToCollege;
      const result = await action(assignmentId, buildFormData());
      if (!result?.ok) {
        setStatusMessage(result?.error ?? "Something went wrong — please try again.");
      } else {
        const { newlyShared = 0, alreadyShared = 0 } = result;
        const who = target === "student" ? "the student" : "the college";
        const parts: string[] = [];
        if (newlyShared > 0) parts.push(`${newlyShared} snapshot${newlyShared !== 1 ? "s" : ""} shared with ${who}`);
        if (alreadyShared > 0) parts.push(`${alreadyShared} ${alreadyShared !== 1 ? "were" : "was"} already shared with ${who}`);
        setStatusMessage(parts.length > 0 ? parts.join(" — ") + "." : `No snapshots were selected to send to ${who}.`);
        if (count > 0) setSelected(new Set());
      }
      setPendingAction(null);
    });
  }

  function handleDelete() {
    setStatusMessage(null);
    setPendingAction("delete");
    const count = selected.size;
    startTransition(async () => {
      await deleteAssessmentSnapshots(assignmentId, buildFormData());
      setStatusMessage(`${count} snapshot${count !== 1 ? "s" : ""} deleted.`);
      setSelected(new Set());
      setPendingAction(null);
    });
  }

  // Hidden behind a click instead of shown inline — with many snapshots this would
  // otherwise dominate the page before the admin even asks to see them.
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
        snapshots.length === 0 ? (
          <div className="border-t border-border p-6 text-center text-sm text-muted-foreground">
            No proctoring snapshots were captured for this attempt.
          </div>
        ) : (
          <div className="border-t border-border p-5">
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
                  type="button"
                  onClick={handleDelete}
                  disabled={selected.size === 0 || isPending}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600"
                >
                  {pendingAction === "delete" ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  Delete Selected
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSend("student")}
                  disabled={selected.size === 0 || isPending}
                  size="sm"
                  variant="outline"
                  className="border-border text-indigo"
                >
                  {pendingAction === "student" ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  Send Selected to Student
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSend("college")}
                  disabled={selected.size === 0 || isPending}
                  size="sm"
                  variant="outline"
                  className="border-border text-indigo"
                >
                  {pendingAction === "college" ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  Send Selected to College
                </Button>
              </div>
            </div>

            {statusMessage && (
              <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-cream px-3 py-2 text-xs font-medium text-indigo">
                <CheckCircle2 className="size-3.5 shrink-0" /> {statusMessage}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {snapshots.map((s) => (
                <label key={s.id} className="group relative block cursor-pointer overflow-hidden rounded-lg border border-border">
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                    className="absolute left-1.5 top-1.5 z-10 size-4 accent-indigo"
                  />
                  {(s.sharedWithStudent || s.sharedWithCollege) && (
                    <span className="absolute right-1.5 top-1.5 z-10 rounded bg-green-600/90 px-1 py-0.5 text-[9px] font-medium text-white">
                      {s.sharedWithStudent && s.sharedWithCollege
                        ? "Shared"
                        : s.sharedWithStudent
                        ? "Shared: Student"
                        : "Shared: College"}
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.imageUrl} alt="Proctoring snapshot" className="aspect-video w-full object-cover" />
                  <p className="bg-indigo/5 px-1.5 py-1 text-center text-[10px] text-muted-foreground">
                    {new Date(s.capturedAt).toLocaleTimeString()}
                  </p>
                </label>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
