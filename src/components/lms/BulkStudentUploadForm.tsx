"use client";

import { useActionState } from "react";
import { CheckCircle2, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bulkCreateStudents, type BulkCreateStudentsState } from "@/lib/actions/accounts";

type College = { id: string; name: string };

function downloadCredentialsCsv(created: NonNullable<BulkCreateStudentsState>["created"]) {
  if (!created) return;
  const rows = [["Name", "Email", "Password", "Status"]];
  for (const c of created) {
    rows.push([
      c.name,
      c.email,
      c.password ?? "",
      c.status === "roster" ? "Roster (student signs up)" : "Active",
    ]);
  }
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student-account-credentials.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function BulkStudentUploadForm({ colleges }: { colleges?: College[] }) {
  const [state, formAction, isPending] = useActionState<BulkCreateStudentsState, FormData>(
    bulkCreateStudents,
    null
  );

  if (state?.ok) {
    return (
      <div className="space-y-4 rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="size-5" />
          <p className="font-semibold">
            {state.created?.length ?? 0} account{state.created?.length === 1 ? "" : "s"} created
            {state.skipped && state.skipped.length > 0 ? `, ${state.skipped.length} skipped` : ""}
          </p>
        </div>

        {state.created && state.created.length > 0 && (
          <div className="rounded-lg bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-indigo">Created accounts</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadCredentialsCsv(state.created)}
                className="border-border text-indigo"
              >
                <Download className="size-3.5" /> Download credentials CSV
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto text-sm">
              {state.created.map((c) => (
                <div key={c.email} className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-2 first:border-t-0">
                  <span className="text-indigo">
                    {c.name} <span className="text-muted-foreground">({c.email})</span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {c.password ? c.password : "self-claim via sign-up"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.skipped && state.skipped.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 text-sm font-medium text-amber-800">Skipped rows</p>
            <div className="space-y-1 text-sm text-amber-800">
              {state.skipped.map((s, i) => (
                <p key={i}>
                  Row {s.row} ({s.email}): {s.reason}
                </p>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="border-green-300 text-green-700"
        >
          Upload another file
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-white p-6">
      <a
        href="/templates/student-bulk-upload-template.xlsx"
        download
        className="flex items-center gap-2 text-sm text-indigo underline underline-offset-2"
      >
        <FileSpreadsheet className="size-4" /> Download sample Excel template
      </a>

      <div>
        <Label htmlFor="bulk-file">Excel file (.xlsx)</Label>
        <input
          id="bulk-file"
          name="file"
          type="file"
          accept=".xlsx,.xls"
          required
          className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo file:px-3 file:py-1.5 file:text-white"
        />
      </div>

      {colleges && (
        <div>
          <Label htmlFor="bulk-collegeId">College (optional)</Label>
          <Select name="collegeId">
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select college" />
            </SelectTrigger>
            <SelectContent>
              {colleges.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="bg-indigo text-white hover:bg-indigo/90">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Upload &amp; Create Accounts
      </Button>
    </form>
  );
}
