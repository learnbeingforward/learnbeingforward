"use client";

import { useActionState, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveMouAndGenerate, type SaveMouState } from "@/lib/actions/mou";
import { format } from "date-fns";

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CSR: "CSR (Free)",
  PER_STUDENT_HOURLY: "Per Student, Per Hour",
  PER_DAY_FLAT: "Flat Rate Per Day",
};

export type MouContract = {
  id: string;
  collegeName: string;
  courseName: string;
  contractType: string;
  ratePerStudentHour: number | null;
  flatRatePerDay: number | null;
  minStudents: number;
  totalDays: number;
  startDate: Date;
  endDate: Date;
  targetBranch: string | null;
  targetSemester: number | null;
  mouNotes: string | null;
  mouPdfUrl: string | null;
  mouGeneratedAt: Date | null;
};

export function MouCard({ contract }: { contract: MouContract }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState<SaveMouState, FormData>(
    saveMouAndGenerate.bind(null, contract.id),
    null
  );

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) setEditing(false);
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo">
            {contract.collegeName} — {contract.courseName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {CONTRACT_TYPE_LABELS[contract.contractType]}
            {contract.ratePerStudentHour && ` · ₹${contract.ratePerStudentHour}/student/hr`}
            {contract.flatRatePerDay && ` · ₹${contract.flatRatePerDay}/day`} &middot; Min {contract.minStudents} students
            &middot; {contract.totalDays} days ({format(contract.startDate, "MMM d")}–{format(contract.endDate, "MMM d, yyyy")})
            {(contract.targetBranch || contract.targetSemester) && (
              <>
                {" "}
                &middot;{" "}
                <span className="font-medium text-indigo">
                  {[contract.targetBranch, contract.targetSemester ? `Sem ${contract.targetSemester}` : null]
                    .filter(Boolean)
                    .join(" · ")}{" "}
                  only
                </span>
              </>
            )}
          </p>
        </div>
        {contract.mouPdfUrl && !editing && (
          <a
            href={contract.mouPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-indigo underline underline-offset-2"
          >
            <FileText className="size-3.5" /> View MOU PDF
          </a>
        )}
      </div>

      {contract.mouGeneratedAt && (
        <p className="mt-2 text-xs text-muted-foreground">
          MOU generated {format(contract.mouGeneratedAt, "MMM d, yyyy")}
        </p>
      )}

      {editing ? (
        <form action={formAction} className="mt-3 space-y-2 border-t border-border pt-3">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`mou-notes-${contract.id}`}>
            Special Terms / Notes (optional — appended to the MOU as Clause 7)
          </label>
          <Textarea
            id={`mou-notes-${contract.id}`}
            name="notes"
            rows={3}
            defaultValue={contract.mouNotes ?? ""}
            placeholder="Any special terms specific to this engagement..."
          />
          {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {contract.mouPdfUrl ? "Save & Regenerate MOU" : "Generate MOU"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-3 border-t border-border pt-3">
          {contract.mouNotes && (
            <p className="mb-2 rounded-lg bg-cream p-2.5 text-xs text-indigo">{contract.mouNotes}</p>
          )}
          <Button type="button" size="sm" variant="outline" className="border-border text-indigo" onClick={() => setEditing(true)}>
            {contract.mouPdfUrl ? "Edit MOU" : "Generate MOU"}
          </Button>
        </div>
      )}
    </div>
  );
}
