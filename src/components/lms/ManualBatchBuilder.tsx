"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createManualBatch, type CreateManualBatchState } from "@/lib/actions/batches";

type UnbatchedEnrollment = {
  id: string;
  studentName: string;
  collegeId: string;
  collegeName: string;
  courseId: string;
  courseName: string;
};

export function ManualBatchBuilder({
  enrollments,
  lockedCollegeId,
}: {
  enrollments: UnbatchedEnrollment[];
  lockedCollegeId?: string;
}) {
  const [state, formAction, isPending] = useActionState<CreateManualBatchState, FormData>(
    createManualBatch,
    null
  );

  const colleges = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of enrollments) map.set(e.collegeId, e.collegeName);
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [enrollments]);

  const [collegeId, setCollegeId] = useState(lockedCollegeId ?? "");
  const [courseId, setCourseId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of enrollments) {
      if (e.collegeId === collegeId) map.set(e.courseId, e.courseName);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [enrollments, collegeId]);

  const candidates = enrollments.filter((e) => e.collegeId === collegeId && e.courseId === courseId);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-border bg-white p-6"
      onSubmit={() => setSelected(new Set())}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {!lockedCollegeId && (
          <div>
            <label className="text-sm font-medium text-indigo">
              College
              <RequiredMark />
            </label>
            <Select
              name="collegeId"
              value={collegeId}
              onValueChange={(v) => {
                setCollegeId(String(v));
                setCourseId("");
                setSelected(new Set());
              }}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select college">
                  {(value: string | null) => colleges.find((c) => c.id === value)?.name ?? "Select college"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {colleges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {lockedCollegeId && <input type="hidden" name="collegeId" value={lockedCollegeId} />}

        <div>
          <label className="text-sm font-medium text-indigo">
            Course
            <RequiredMark />
          </label>
          <Select
            name="courseId"
            value={courseId}
            onValueChange={(v) => {
              setCourseId(String(v));
              setSelected(new Set());
            }}
          >
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select course">
                {(value: string | null) => courses.find((c) => c.id === value)?.name ?? "Select course"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {candidates.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-indigo">
            Unbatched students ({selected.size} selected, max 30)
          </p>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-3">
            {candidates.map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-cream">
                <input
                  type="checkbox"
                  name="enrollmentIds"
                  value={c.id}
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                  disabled={!selected.has(c.id) && selected.size >= 30}
                  className="size-4"
                />
                {c.studentName}
              </label>
            ))}
          </div>
        </div>
      ) : collegeId && courseId ? (
        <p className="text-sm text-muted-foreground">No unbatched students for this college/course.</p>
      ) : null}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Batch created.</p>}

      <Button
        type="submit"
        disabled={isPending || selected.size === 0}
        className="bg-indigo text-white hover:bg-indigo/90"
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Create Batch
      </Button>
    </form>
  );
}
