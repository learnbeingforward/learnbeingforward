"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/lbf/icons";
import { RequestExceptionForm } from "@/components/lms/RequestExceptionForm";

export type IneligibleRow = {
  enrollmentId: string;
  studentName: string;
  studentEmail: string;
  studentUsn: string | null;
  courseName: string;
  pct: number;
};

export function ExceptionRequestList({ rows }: { rows: IneligibleRow[] }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");

  const courses = useMemo(() => Array.from(new Set(rows.map((r) => r.courseName))).sort(), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.studentName.toLowerCase().includes(q) && !r.studentEmail.toLowerCase().includes(q)) return false;
      if (course !== "all" && r.courseName !== course) return false;
      return true;
    });
  }, [rows, query, course]);

  return (
    <>
      <div className="toolbar">
        <div className="filters">
          <label className="search">
            <Icon name="search" size={16} />
            <input
              className="input"
              type="search"
              placeholder="Search by student name or email"
              aria-label="Search by student name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select className="select" value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="all">All courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="empty">No students match your search.</p>
      ) : (
        <ul className="list">
          {filtered.map((row) => (
            <RequestExceptionForm
              key={row.enrollmentId}
              enrollmentId={row.enrollmentId}
              studentName={row.studentName}
              studentUsn={row.studentUsn}
              courseName={row.courseName}
              pct={row.pct}
            />
          ))}
        </ul>
      )}
    </>
  );
}
