"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assignAssessmentToStudents, type AssignAssessmentState } from "@/lib/actions/assessments";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

export type AssignableStudent = {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  collegeName: string;
  batchId: string | null;
  batchName: string | null;
  courseName: string | null;
  attendancePct: number;
  alreadyAssigned: boolean;
};

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
  const [collegeId, setCollegeId] = useState("ALL");
  const [batchId, setBatchId] = useState("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState(true);

  const colleges = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of students) map.set(s.collegeId, s.collegeName);
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const batches = useMemo(() => {
    const map = new Map<string, { id: string; label: string; collegeId: string }>();
    for (const s of students) {
      if (!s.batchId) continue;
      if (collegeId !== "ALL" && s.collegeId !== collegeId) continue;
      map.set(s.batchId, { id: s.batchId, label: `${s.batchName}${s.courseName ? ` (${s.courseName})` : ""}`, collegeId: s.collegeId });
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [students, collegeId]);

  const matching = useMemo(
    () =>
      students.filter((s) => {
        if (s.alreadyAssigned) return false;
        if (collegeId !== "ALL" && s.collegeId !== collegeId) return false;
        if (batchId !== "ALL" && s.batchId !== batchId) return false;
        if (attendanceFilter && s.attendancePct < ATTENDANCE_THRESHOLD) return false;
        return true;
      }),
    [students, collegeId, batchId, attendanceFilter]
  );

  const alreadySentCount = students.filter((s) => s.alreadyAssigned).length;

  return (
    <form action={formAction} className="stack" style={{ gap: 14, maxWidth: 480 }}>
      {matching.map((s) => (
        <input key={s.id} type="hidden" name="studentIds" value={s.id} />
      ))}

      <label className="field">
        <span>College</span>
        <select className="select" value={collegeId} onChange={(e) => { setCollegeId(e.target.value); setBatchId("ALL"); }}>
          <option value="ALL">All colleges</option>
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Course / batch</span>
        <select className="select" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
          <option value="ALL">All</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </label>

      <label className="check">
        <input type="checkbox" checked={attendanceFilter} onChange={(e) => setAttendanceFilter(e.target.checked)} />
        Only students with &ge; {ATTENDANCE_THRESHOLD}% attendance
      </label>

      <div className="alert info small">
        <Users className="size-4 shrink-0" />
        <span>
          {matching.length} student{matching.length !== 1 ? "s" : ""} will receive this.
          {alreadySentCount > 0 && ` ${alreadySentCount} already sent.`}
        </span>
      </div>

      {state?.error && <p className="small" style={{ color: "var(--danger)" }}>{state.error}</p>}
      {state?.ok && (
        <p className="small" style={{ color: "var(--success-text)", display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircle2 className="size-4" /> Sent to {state.assignedCount} new student{state.assignedCount !== 1 ? "s" : ""}.
          {!!state.updatedCount && <> Updated {state.updatedCount} already-assigned student{state.updatedCount !== 1 ? "s" : ""} who hadn&apos;t started yet.</>}
        </p>
      )}

      <div className="split">
        <span />
        <Button type="submit" disabled={isPending || matching.length === 0} className="btn btn-primary">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Send to {matching.length} student{matching.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </form>
  );
}
