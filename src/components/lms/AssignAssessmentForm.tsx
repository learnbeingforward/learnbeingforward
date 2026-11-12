"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assignAssessmentToStudents, type AssignAssessmentState } from "@/lib/actions/assessments";

export type AssignableStudent = { id: string; name: string; email: string; collegeName: string; alreadyAssigned: boolean };

export function AssignAssessmentForm({
  assessmentId,
  students,
}: {
  assessmentId: string;
  students: AssignableStudent[];
}) {
  const [state, formAction, isPending] = useActionState<AssignAssessmentState, FormData>(
    assignAssessmentToStudents.bind(null, assessmentId),
    null
  );
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const colleges = useMemo(() => {
    const names = new Set(students.map((s) => s.collegeName));
    return Array.from(names).sort();
  }, [students]);

  const studentsInCollege = useMemo(
    () => students.filter((s) => s.collegeName === selectedCollege),
    [students, selectedCollege]
  );

  function toggleStudent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!selectedCollege) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <p className="mb-4 text-sm font-semibold text-indigo">Choose a College</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {colleges.map((name) => {
            const count = students.filter((s) => s.collegeName === name).length;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedCollege(name)}
                className="rounded-lg border border-border p-4 text-left transition-colors hover:border-indigo/40"
              >
                <p className="font-medium text-indigo">{name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{count} student{count !== 1 ? "s" : ""}</p>
              </button>
            );
          })}
          {colleges.length === 0 && <p className="text-sm text-muted-foreground">No students found.</p>}
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-xl border border-border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-indigo">{selectedCollege} — Select Students</p>
        <button type="button" onClick={() => setSelectedCollege(null)} className="text-xs text-indigo underline">
          Change college
        </button>
      </div>
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {studentsInCollege.map((s) => (
          <label
            key={s.id}
            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
              s.alreadyAssigned ? "border-border bg-cream/60 text-muted-foreground" : "border-border hover:border-indigo/40"
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                name="studentIds"
                value={s.id}
                checked={selected.has(s.id) || s.alreadyAssigned}
                disabled={s.alreadyAssigned}
                onChange={() => toggleStudent(s.id)}
                className="accent-indigo"
              />
              {s.name} <span className="text-xs text-muted-foreground">({s.email})</span>
            </span>
            {s.alreadyAssigned && <span className="text-xs text-muted-foreground">Already sent</span>}
          </label>
        ))}
        {studentsInCollege.length === 0 && <p className="text-sm text-muted-foreground">No students in this college.</p>}
      </div>

      {state?.error && <p className="mt-3 text-sm text-destructive">{state.error}</p>}
      {state?.ok && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-green-700">
          <CheckCircle2 className="size-4" /> Sent to {state.assignedCount} new student
          {state.assignedCount !== 1 ? "s" : ""}.
          {!!state.updatedCount && (
            <> Updated the question set for {state.updatedCount} already-assigned student{state.updatedCount !== 1 ? "s" : ""} who hadn&apos;t started yet.</>
          )}
        </p>
      )}

      <Button type="submit" disabled={isPending || selected.size === 0} className="mt-4 bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Send Assessment ({selected.size})
      </Button>
    </form>
  );
}
