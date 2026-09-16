"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  const action = requestAttendanceException.bind(null, enrollmentId);

  if (sent) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
        Request sent for {studentName} — {courseName}.
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setSent(true);
      }}
      className="rounded-xl border border-border bg-white p-4"
    >
      <p className="font-medium text-indigo">{studentName}</p>
      {studentUsn && <p className="text-xs text-muted-foreground">USN: {studentUsn}</p>}
      <p className="mt-1 text-sm text-muted-foreground">
        {courseName} &middot; {pct}% attendance
      </p>
      <Textarea
        name="reason"
        required
        rows={3}
        placeholder="Reason the student couldn't attend classes..."
        className="mt-3"
      />
      <Button type="submit" size="sm" className="mt-3 w-full bg-indigo text-white hover:bg-indigo/90">
        Send Request
      </Button>
    </form>
  );
}
