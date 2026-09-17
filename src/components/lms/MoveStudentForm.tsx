"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { moveStudentToCourse, type MoveStudentState } from "@/lib/actions/batches";

type Course = { id: string; name: string };

export function MoveStudentForm({ enrollmentId, courses }: { enrollmentId: string; courses: Course[] }) {
  const [state, formAction, isPending] = useActionState<MoveStudentState, FormData>(
    moveStudentToCourse.bind(null, enrollmentId),
    null
  );

  if (state?.ok) {
    return <p className="text-xs font-medium text-green-700">Moved to the new course.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <Select name="newCourseId" required>
          <SelectTrigger className="h-8 w-48 text-sm">
            <SelectValue placeholder="Move to course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" variant="outline" disabled={isPending} className="border-border text-indigo">
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          Move
        </Button>
      </div>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
