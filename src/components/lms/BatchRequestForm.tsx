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
import { requestBatch, type RequestBatchState } from "@/lib/actions/batches";

type CourseOption = { id: string; name: string };
type StudentOption = { id: string; name: string; branch: string | null; semester: number | null };

export function BatchRequestForm({ courses, students }: { courses: CourseOption[]; students: StudentOption[] }) {
  const [state, formAction, isPending] = useActionState<RequestBatchState, FormData>(requestBatch, null);

  const [courseId, setCourseId] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => (semesterFilter ? students.filter((s) => String(s.semester ?? "") === semesterFilter) : students),
    [students, semesterFilter]
  );

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
      <p className="text-sm text-muted-foreground">
        Pick any course and any of your students — they don&apos;t need to already be enrolled in that course. This
        goes to the company admin for approval before the batch becomes active.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>
            Course
            <RequiredMark />
          </Label>
          <Select name="courseId" value={courseId} onValueChange={(v) => setCourseId(String(v))}>
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

        <div>
          <Label htmlFor="batch-request-name">Batch name (optional)</Label>
          <Input id="batch-request-name" name="name" className="mt-1.5" placeholder="Defaults to the course name" />
        </div>
      </div>

      <div>
        <Label htmlFor="batch-request-semester">Semester (optional — filters the student list below too)</Label>
        <Select name="semester" value={semesterFilter} onValueChange={(v) => setSemesterFilter(String(v))}>
          <SelectTrigger className="mt-1.5 max-w-40">
            <SelectValue placeholder="All semesters">
              {(value: string | null) => (value ? `Semester ${value}` : "All semesters")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <SelectItem key={n} value={String(n)}>
                Semester {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-indigo">{selected.size} selected</p>
            <button
              type="button"
              className="text-xs font-medium text-indigo underline"
              onClick={() =>
                setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((s) => s.id))))
              }
            >
              {selected.size === filtered.length ? "Clear all" : "Select all"}
            </button>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-3">
            {filtered.map((s) => (
              <label key={s.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-cream">
                <input
                  type="checkbox"
                  name="studentIds"
                  value={s.id}
                  checked={selected.has(s.id)}
                  onChange={() => toggle(s.id)}
                  className="size-4"
                />
                {s.name}
                {(s.branch || s.semester) && (
                  <span className="text-xs text-muted-foreground">
                    ({[s.branch, s.semester ? `Sem ${s.semester}` : null].filter(Boolean).join(" · ")})
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No students match this semester filter.</p>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Batch request sent — awaiting company admin approval.</p>}

      <Button type="submit" disabled={isPending || !courseId || selected.size === 0} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Request Batch
      </Button>
    </form>
  );
}
