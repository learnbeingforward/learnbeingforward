"use client";

import { useActionState } from "react";
import { Icon } from "@/components/lbf/icons";
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
      <div className="stack" style={{ gap: 16 }}>
        <div className="alert success">
          <Icon name="check" size={18} />
          <span>
            {state.created?.length ?? 0} account{state.created?.length === 1 ? "" : "s"} created
            {state.skipped && state.skipped.length > 0 ? `, ${state.skipped.length} skipped` : ""}.
          </span>
        </div>

        {state.created && state.created.length > 0 && (
          <div className="box">
            <div className="split" style={{ marginBottom: 10 }}>
              <span className="strong">Created accounts</span>
              <button className="btn btn-sm" type="button" onClick={() => downloadCredentialsCsv(state.created)}>
                <Icon name="download" size={14} />
                Download credentials CSV
              </button>
            </div>
            <ul className="list">
              {state.created.map((c) => (
                <li key={c.email} className="list-row">
                  <span className="grow small">
                    {c.name} <span className="muted">({c.email})</span>
                  </span>
                  <span className="small mono muted">{c.password ? c.password : "self-claim via sign-up"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {state.skipped && state.skipped.length > 0 && (
          <div className="alert warning">
            <span>
              <strong>Skipped rows:</strong>{" "}
              {state.skipped.map((s, i) => (
                <span key={i}>
                  {i > 0 && "; "}Row {s.row} ({s.email}): {s.reason}
                </span>
              ))}
            </span>
          </div>
        )}

        <button className="btn btn-sm" type="button" onClick={() => window.location.reload()}>
          Upload another file
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="stack" style={{ gap: 16 }}>
      <div className="box" style={{ borderStyle: "dashed", textAlign: "center", padding: 28, background: "var(--surface)" }}>
        <span className="icon-box gold" style={{ margin: "0 auto" }}>
          <Icon name="upload" size={20} />
        </span>
        <div className="h3" style={{ marginTop: 10 }}>
          Drop an Excel file
        </div>
        <p className="small muted">Name, Email, USN, Father&apos;s name, Branch, Semester, Password (optional)</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
          <a className="btn btn-sm" href="/templates/student-bulk-upload-template.xlsx" download>
            <Icon name="download" size={16} />
            Template
          </a>
          <label className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>
            Browse
            <input name="file" type="file" accept=".xlsx,.xls" required style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {colleges && (
        <label className="field">
          <span>College</span>
          <select className="select" name="collegeId" defaultValue="" required>
            <option value="" disabled>
              Select college
            </option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="small muted">Every student in this file is added to this one college — there's no per-row college column.</span>
        </label>
      )}

      {state?.error && <span className="error-text">{state.error}</span>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Uploading…" : "Upload & create accounts"}
      </button>
    </form>
  );
}
