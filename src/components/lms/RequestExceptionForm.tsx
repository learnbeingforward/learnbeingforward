"use client";

import { useState } from "react";
import { requestAttendanceException } from "@/lib/actions/attendance-exceptions";

export function RequestExceptionForm({
  enrollmentId,
  studentName,
  studentUsn,
  courseName,
  pct,
}: {
  enrollmentId: string;
  studentName: string;
  studentUsn: string | null;
  courseName: string;
  pct: number;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const action = requestAttendanceException.bind(null, enrollmentId);
  const initials = studentName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (sent) {
    return (
      <li className="box" style={{ padding: 16 }}>
        <div className="alert success">
          <span>Request sent for {studentName} — {courseName}.</span>
        </div>
      </li>
    );
  }

  return (
    <li className="box" style={{ padding: 16 }}>
      <div className="split" style={{ gap: 12 }}>
        <div className="stat-inline">
          <span className="avatar sm">{initials}</span>
          <div>
            <div className="strong">{studentName}</div>
            <div className="small muted">
              {studentUsn && `USN: ${studentUsn} · `}
              {courseName}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="progress gold" style={{ width: 100 }}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <strong>{pct}%</strong>
        </div>
      </div>
      <form
        action={async (formData) => {
          setError(null);
          try {
            await action(formData);
            setSent(true);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't send the request.");
          }
        }}
        className="row"
        style={{ marginTop: 12, gap: 10 }}
      >
        <div className="grow">
          <textarea
            className="textarea"
            name="reason"
            required
            minLength={20}
            rows={2}
            placeholder="Reason the student couldn't attend classes (at least 20 characters)…"
          />
          {error && <span className="error-text">{error}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn btn-primary btn-sm" type="submit">
            Send request
          </button>
        </div>
      </form>
    </li>
  );
}
