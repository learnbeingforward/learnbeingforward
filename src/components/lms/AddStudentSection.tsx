"use client";

import { useState } from "react";
import { AddStudentForm } from "@/components/lms/AddStudentForm";
import { BulkStudentUploadForm } from "@/components/lms/BulkStudentUploadForm";

type College = { id: string; name: string };

export function AddStudentSection({ colleges }: { colleges?: College[] }) {
  const [mode, setMode] = useState<"single" | "bulk">("single");

  return (
    <>
      <div className="segmented" role="group" style={{ marginBottom: 18 }}>
        <button type="button" aria-pressed={mode === "single"} onClick={() => setMode("single")}>
          Single student
        </button>
        <button type="button" aria-pressed={mode === "bulk"} onClick={() => setMode("bulk")}>
          Bulk upload (Excel)
        </button>
      </div>

      {mode === "single" ? <AddStudentForm colleges={colleges} /> : <BulkStudentUploadForm colleges={colleges} />}
    </>
  );
}
