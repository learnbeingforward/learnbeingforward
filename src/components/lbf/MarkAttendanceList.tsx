"use client";

import { useState, useTransition } from "react";
import { Icon } from "./icons";

type Student = { enrollmentId: string; name: string; usn: string | null };

export function MarkAttendanceList({
  students,
  moduleTitle,
  action,
}: {
  students: Student[];
  moduleTitle: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [present, setPresent] = useState<Record<string, boolean>>(() => Object.fromEntries(students.map((s) => [s.enrollmentId, true])));
  const [isPending, startTransition] = useTransition();
  const presentCount = Object.values(present).filter(Boolean).length;

  function initials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    for (const s of students) {
      if (present[s.enrollmentId]) formData.set(`present_${s.enrollmentId}`, "on");
    }
    startTransition(() => action(formData));
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="split" style={{ marginBottom: 16, gap: 12 }}>
        <span className="h3">Students</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-sm" onClick={() => setPresent(Object.fromEntries(students.map((s) => [s.enrollmentId, true])))}>
            <Icon name="check" size={16} />
            Mark all present
          </button>
          <button type="button" className="btn btn-sm" onClick={() => setPresent(Object.fromEntries(students.map((s) => [s.enrollmentId, false])))}>
            Clear
          </button>
        </div>
      </div>
      <ul className="list">
        {students.map((s) => (
          <li key={s.enrollmentId} className="list-row">
            <div className="grow">
              <div className="stat-inline">
                <span className="avatar sm">{initials(s.name)}</span>
                <div>
                  <div className="strong">{s.name}</div>
                  {s.usn && <div className="small muted">USN: {s.usn}</div>}
                </div>
              </div>
            </div>
            <div className="segmented" role="group" aria-label={`Attendance for ${s.name}`}>
              <button type="button" aria-pressed={present[s.enrollmentId]} onClick={() => setPresent((p) => ({ ...p, [s.enrollmentId]: true }))}>
                Present
              </button>
              <button type="button" aria-pressed={!present[s.enrollmentId]} onClick={() => setPresent((p) => ({ ...p, [s.enrollmentId]: false }))}>
                Absent
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="split" style={{ marginTop: 18 }}>
        <span className="small muted">
          <strong style={{ color: "var(--text)" }}>{presentCount} present</strong> · {students.length - presentCount} absent · {students.length} students
        </span>
        <button className="btn btn-primary" type="submit" disabled={isPending}>
          <Icon name="check" size={16} />
          {isPending ? "Submitting…" : "Submit attendance"}
        </button>
      </div>
      <div className="alert info" style={{ marginTop: 14 }}>
        <Icon name="book" size={18} className="shrink-0" />
        <span>
          Submitting unlocks the <strong>{moduleTitle}</strong> module content for present students and adds this
          session to your invoice.
        </span>
      </div>
    </form>
  );
}
