"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestBulkEnrollment } from "@/lib/actions/enrollment-requests";

type Candidate = { id: string; name: string; usn: string | null; branch: string | null };

export function BulkEnrollStudentsForm({
  courses,
  candidatesByCourse,
}: {
  courses: { id: string; name: string }[];
  candidatesByCourse: Record<string, Candidate[]>;
}) {
  const [courseId, setCourseId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const candidates = candidatesByCourse[courseId] ?? [];
  const branches = useMemo(() => {
    const map = new Map<string, Candidate[]>();
    for (const c of candidates) {
      const key = c.branch?.trim() || "No Branch Set";
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [candidates]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleBranch(branchStudents: Candidate[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = branchStudents.every((s) => next.has(s.id));
      for (const s of branchStudents) {
        if (allSelected) next.delete(s.id);
        else next.add(s.id);
      }
      return next;
    });
  }

  function handleSubmit() {
    setResult(null);
    startTransition(async () => {
      const res = await requestBulkEnrollment(courseId, Array.from(selected));
      setSelected(new Set());
      setResult({
        ok: true,
        message:
          res.requested > 0
            ? `Requested enrollment for ${res.requested} student${res.requested !== 1 ? "s" : ""} — awaiting company approval.`
            : "Nothing to request — those students may already be enrolled or have a pending request.",
      });
    });
  }

  return (
    <div className="space-y-5 rounded-xl border border-border bg-white p-6">
      <div>
        <Label htmlFor="bulk-enroll-course">Course</Label>
        <Select
          value={courseId}
          onValueChange={(v) => {
            setCourseId(String(v));
            setSelected(new Set());
            setResult(null);
          }}
        >
          <SelectTrigger id="bulk-enroll-course" className="mt-1.5 w-full max-w-sm">
            <SelectValue placeholder="Select a course">
              {(value: string | null) => courses.find((c) => c.id === value)?.name ?? "Select a course"}
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

      {courseId && (
        <>
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every student is already enrolled in or has a pending request for this course.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-indigo">
                {selected.size} of {candidates.length} selected
              </p>
              <div className="max-h-96 space-y-4 overflow-y-auto rounded-lg border border-border p-4">
                {branches.map(([branch, branchStudents]) => {
                  const allSelected = branchStudents.every((s) => selected.has(s.id));
                  return (
                    <div key={branch}>
                      <label className="flex items-center gap-2 text-sm font-semibold text-indigo">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleBranch(branchStudents)}
                          className="size-4 accent-indigo"
                        />
                        {branch} ({branchStudents.length})
                      </label>
                      <div className="mt-2 grid gap-1.5 pl-6 sm:grid-cols-2">
                        {branchStudents.map((s) => (
                          <label key={s.id} className="flex items-center gap-2 text-sm text-indigo">
                            <input
                              type="checkbox"
                              checked={selected.has(s.id)}
                              onChange={() => toggle(s.id)}
                              className="size-4 accent-indigo"
                            />
                            {s.name}
                            {s.usn && <span className="text-xs text-muted-foreground">({s.usn})</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {result && (
                <p className="flex items-center gap-1.5 text-sm text-green-700">
                  <CheckCircle2 className="size-4" /> {result.message}
                </p>
              )}

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || selected.size === 0}
                className="bg-indigo text-white hover:bg-indigo/90"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Request Enrollment for {selected.size} Student{selected.size !== 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
