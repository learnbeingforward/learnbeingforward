"use client";

import { useState } from "react";
import { cn } from "cn";
import { AddStudentForm } from "@/components/lms/AddStudentForm";
import { BulkStudentUploadForm } from "@/components/lms/BulkStudentUploadForm";

type College = { id: string; name: string };

export function AddStudentSection({ colleges }: { colleges?: College[] }) {
  const [mode, setMode] = useState<"single" | "bulk">("single");

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-border bg-white p-1">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "single" ? "bg-indigo text-white" : "text-muted-foreground hover:text-indigo"
          )}
        >
          Single Student
        </button>
        <button
          type="button"
          onClick={() => setMode("bulk")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "bulk" ? "bg-indigo text-white" : "text-muted-foreground hover:text-indigo"
          )}
        >
          Bulk Upload (Excel)
        </button>
      </div>

      {mode === "single" ? <AddStudentForm colleges={colleges} /> : <BulkStudentUploadForm colleges={colleges} />}
    </div>
  );
}
