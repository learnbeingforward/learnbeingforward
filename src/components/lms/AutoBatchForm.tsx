"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { autoBatchCollegeCourse, type AutoBatchState } from "@/lib/actions/batches";

type College = { id: string; name: string };
type Course = { id: string; name: string };

export function AutoBatchForm({ colleges, courses }: { colleges: College[]; courses: Course[] }) {
  const [state, formAction, isPending] = useActionState<AutoBatchState, FormData>(autoBatchCollegeCourse, null);

  return (
    <form action={formAction} className="stack" style={{ gap: 10, marginTop: 14 }}>
      <Select name="collegeId" required>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select college" />
        </SelectTrigger>
        <SelectContent>
          {colleges.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select name="courseId" required>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select course" />
        </SelectTrigger>
        <SelectContent>
          {courses.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button className="btn btn-gold" type="submit" disabled={isPending} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        Auto-batch this college &amp; course
      </button>
      {state?.error && <p className="small" style={{ color: "var(--danger)" }}>{state.error}</p>}
      {state?.ok && <p className="small" style={{ color: "var(--success-text)" }}>Created batches for {state.count} student{state.count !== 1 ? "s" : ""}.</p>}
    </form>
  );
}
