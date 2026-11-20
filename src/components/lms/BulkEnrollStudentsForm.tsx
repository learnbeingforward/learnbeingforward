"use client";

import { useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/lbf/icons";
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
      const key = c.branch?.trim() || "No branch set";
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
    <div className="stack" style={{ gap: 14 }}>
      <label className="field">
        <span>Course</span>
        <select
          className="select"
          value={courseId}
          onChange={(e) => {
            setCourseId(e.target.value);
            setSelected(new Set());
            setResult(null);
          }}
        >
          <option value="">Select a course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {courseId && (
        <>
          {candidates.length === 0 ? (
            <p className="muted">Every student is already enrolled in or has a pending request for this course.</p>
          ) : (
            <>
              {branches.map(([branch, branchStudents]) => {
                const allSelected = branchStudents.every((s) => selected.has(s.id));
                return (
                  <div key={branch} className="box" style={{ padding: 14 }}>
                    <div className="split">
                      <label className="check" style={{ fontWeight: 700 }}>
                        <input type="checkbox" checked={allSelected} onChange={() => toggleBranch(branchStudents)} />
                        {branch}
                      </label>
                      <span className="small muted">select all · {branchStudents.length}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                      {branchStudents.map((s) => (
                        <label key={s.id} className="chip" style={{ gap: 6 }}>
                          <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} style={{ accentColor: "var(--navy)" }} />
                          {s.name}
                          {s.usn && ` (${s.usn})`}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              {result && (
                <div className="alert success">
                  <Icon name="check" size={18} />
                  <span>{result.message}</span>
                </div>
              )}

              <div className="split">
                <span className="small muted">
                  <strong style={{ color: "var(--text)" }}>{selected.size} student{selected.size !== 1 ? "s" : ""}</strong> selected
                </span>
                <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={isPending || selected.size === 0}>
                  <Icon name="arrowR" size={16} />
                  {isPending ? "Requesting…" : "Request enrollment"}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
