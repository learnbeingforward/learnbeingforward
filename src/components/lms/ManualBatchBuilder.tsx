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
import { Label } from "@/components/ui/label";
import { createManualBatch, type CreateManualBatchState } from "@/lib/actions/batches";
import { MANUAL_BATCH_CAP } from "@/lib/batching";

type UnbatchedEnrollment = {
  id: string;
  studentName: string;
  collegeId: string;
  collegeName: string;
  courseId: string;
  courseName: string;
  branch: string | null;
  semester: number | null;
};

type ContractRestriction = { branch: string | null; semester: number | null };

export function ManualBatchBuilder({
  enrollments,
  lockedCollegeId,
  contractRestrictions,
}: {
  enrollments: UnbatchedEnrollment[];
  lockedCollegeId?: string;
  contractRestrictions?: Record<string, ContractRestriction>;
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
  const [semesterFilter, setSemesterFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of enrollments) {
      if (e.collegeId === collegeId) map.set(e.courseId, e.courseName);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [enrollments, collegeId]);

  const restriction = collegeId && courseId ? contractRestrictions?.[`${collegeId}::${courseId}`] : undefined;

  const courseCandidates = enrollments.filter((e) => e.collegeId === collegeId && e.courseId === courseId);
  const candidates = courseCandidates.filter((e) => {
    if (restriction?.branch && e.branch !== restriction.branch) return false;
    if (semesterFilter && String(e.semester ?? "") !== semesterFilter) return false;
    return true;
  });

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
                setSemesterFilter("");
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
              const id = String(v);
              setCourseId(id);
              setSelected(new Set());
              const nextRestriction = collegeId ? contractRestrictions?.[`${collegeId}::${id}`] : undefined;
              setSemesterFilter(nextRestriction?.semester ? String(nextRestriction.semester) : "");
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

      <div>
        <Label htmlFor="batch-semester">Semester (optional — filters the list below too)</Label>
        <Select
          name="semester"
          value={semesterFilter}
          onValueChange={(v) => setSemesterFilter(String(v))}
          disabled={!!restriction?.semester}
        >
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

      {restriction && (restriction.branch || restriction.semester) && (
        <p className="rounded-lg bg-gold/10 px-3 py-2 text-xs text-indigo">
          This training was requested for
          {restriction.branch && ` ${restriction.branch}`}
          {restriction.branch && restriction.semester && " · "}
          {restriction.semester && ` Semester ${restriction.semester}`} only — showing eligible students only.
        </p>
      )}

      {candidates.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-indigo">
            Unbatched students ({selected.size} selected, max {MANUAL_BATCH_CAP})
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
                  disabled={!selected.has(c.id) && selected.size >= MANUAL_BATCH_CAP}
                  className="size-4"
                />
                {c.studentName}
                {(c.branch || c.semester) && (
                  <span className="text-xs text-muted-foreground">
                    ({[c.branch, c.semester ? `Sem ${c.semester}` : null].filter(Boolean).join(" · ")})
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ) : collegeId && courseId ? (
        <p className="text-sm text-muted-foreground">No unbatched students match this college/course/semester.</p>
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
