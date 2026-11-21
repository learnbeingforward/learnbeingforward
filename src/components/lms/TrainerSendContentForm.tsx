"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/lbf/icons";
import {
  getEligibleStudentsForBatch,
  requestBulkContentSend,
  type BulkContentSendState,
} from "@/lib/actions/content-access";

type Eligible = Awaited<ReturnType<typeof getEligibleStudentsForBatch>>;

export function TrainerSendContentForm({ batches }: { batches: { id: string; name: string; courseName: string }[] }) {
  const [batchId, setBatchId] = useState("");
  const [data, setData] = useState<Eligible | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [includeBook, setIncludeBook] = useState(false);

  const action = batchId ? requestBulkContentSend.bind(null, batchId) : async () => null;
  const [state, formAction, isPending] = useActionState<BulkContentSendState, FormData>(action, null);

  useEffect(() => {
    if (!batchId) {
      setData(null);
      return;
    }
    setSelectedStudents(new Set());
    setSelectedModules(new Set());
    setIncludeBook(false);
    startLoading(async () => {
      const result = await getEligibleStudentsForBatch(batchId);
      setData(result);
    });
  }, [batchId]);

  function toggleStudent(id: string) {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleModule(id: string) {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (batches.length === 0) {
    return <p className="empty">You don&apos;t have any batches yet.</p>;
  }

  return (
    <>
      <div className="grid" style={{ ["--min" as string]: "280px" }}>
        <label className="field">
          <span>Batch</span>
          <select className="select" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
            <option value="">Select a batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.courseName} — {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && <p className="small muted" style={{ marginTop: 12 }}>Loading…</p>}

      {data && !isLoading && (
        <form action={formAction}>
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table className="table m-cards" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th></th>
                  <th>Student</th>
                  <th>Attendance</th>
                  <th>Eligible</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((s) => (
                  <tr key={s.studentId}>
                    <td data-label="">
                      <input
                        type="checkbox"
                        name="studentIds"
                        value={s.studentId}
                        checked={selectedStudents.has(s.studentId)}
                        onChange={() => toggleStudent(s.studentId)}
                        aria-label={`Select ${s.name}`}
                      />
                    </td>
                    <td data-label="Student">{s.name}</td>
                    <td data-label="Attendance">{s.pct}%</td>
                    <td data-label="Eligible">
                      <span className={`pill ${s.eligible ? "success" : "warning"}`}>
                        {s.eligible ? "Yes" : "Below threshold"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="split" style={{ marginTop: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {data.modules.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="chip"
                  aria-pressed={selectedModules.has(m.id)}
                  onClick={() => toggleModule(m.id)}
                >
                  {m.title} {selectedModules.has(m.id) && "✓"}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" type="submit" disabled={isPending || selectedStudents.size === 0 || selectedModules.size === 0}>
              <Icon name="arrowR" size={16} />
              {isPending ? "Sending…" : "Send for approval"}
            </button>
          </div>

          <label className="field" style={{ marginTop: 14, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="includeBook" checked={includeBook} onChange={(e) => setIncludeBook(e.target.checked)} />
            <span>Also include the full course book (needs separate company admin approval)</span>
          </label>

          {state?.error && <p className="error-text" style={{ marginTop: 10 }}>{state.error}</p>}
          {state?.ok && <p className="small" style={{ marginTop: 10, color: "var(--success-text)" }}>Sent to the company admin for approval.</p>}
        </form>
      )}
    </>
  );
}
