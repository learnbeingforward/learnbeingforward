"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.studentName.toLowerCase().includes(q) || r.studentEmail.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by student name or email..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
          No students match &quot;{query}&quot;.
        </div>
      ) : (
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
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
        </div>
      )}
    </div>
  );
}
