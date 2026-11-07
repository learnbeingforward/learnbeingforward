"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getEligibleStudentsForBatch,
  requestBulkContentSend,
  type BulkContentSendState,
} from "@/lib/actions/content-access";
import { ATTENDANCE_THRESHOLD } from "@/lib/constants";

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
    return (
      <p className="rounded-xl border border-dashed border-border bg-white p-6 text-center text-sm text-muted-foreground">
        You don&apos;t have any batches yet.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-5">
      <div>
        <Label htmlFor="trainer-send-batch">Batch</Label>
        <Select value={batchId} onValueChange={(v) => setBatchId(v ?? "")}>
          <SelectTrigger id="trainer-send-batch" className="mt-1.5 w-full max-w-sm">
            <SelectValue placeholder="Select a batch">
              {(value: string | null) => {
                const b = batches.find((x) => x.id === value);
                return b ? `${b.courseName} — ${b.name}` : "Select a batch";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {batches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.courseName} — {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {data && !isLoading && (
        <form action={formAction} className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm text-indigo">
                <input
                  type="checkbox"
                  checked={data.students.length > 0 && selectedStudents.size === data.students.length}
                  onChange={() =>
                    setSelectedStudents((prev) =>
                      prev.size === data.students.length ? new Set() : new Set(data.students.map((s) => s.studentId))
                    )
                  }
                  className="accent-indigo"
                />
                Students with {ATTENDANCE_THRESHOLD}%+ attendance ({data.students.length})
              </Label>
            </div>
            {data.students.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students meet the attendance threshold yet.</p>
            ) : (
              <div className="grid max-h-40 gap-1 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-2">
                {data.students.map((s) => (
                  <label key={s.studentId} className="flex items-center gap-2 text-sm text-indigo">
                    <input
                      type="checkbox"
                      name="studentIds"
                      value={s.studentId}
                      checked={selectedStudents.has(s.studentId)}
                      onChange={() => toggleStudent(s.studentId)}
                      className="accent-indigo"
                    />
                    {s.name} <span className="text-xs text-muted-foreground">({s.pct}%)</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="flex items-center gap-2 text-sm text-indigo">
              <input
                type="checkbox"
                checked={data.modules.length > 0 && selectedModules.size === data.modules.length}
                onChange={() =>
                  setSelectedModules((prev) =>
                    prev.size === data.modules.length ? new Set() : new Set(data.modules.map((m) => m.id))
                  )
                }
                className="accent-indigo"
              />
              Modules to send ({data.modules.length})
            </Label>
            <div className="mt-2 grid max-h-40 gap-1 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-2">
              {data.modules.map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-sm text-indigo">
                  <input
                    type="checkbox"
                    name="moduleIds"
                    value={m.id}
                    checked={selectedModules.has(m.id)}
                    onChange={() => toggleModule(m.id)}
                    className="accent-indigo"
                  />
                  {m.title}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2.5 text-sm text-indigo">
            <input
              type="checkbox"
              name="includeBook"
              checked={includeBook}
              onChange={(e) => setIncludeBook(e.target.checked)}
              className="accent-indigo"
            />
            Also include the full course book (needs separate company admin approval)
          </label>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state?.ok && (
            <p className="flex items-center gap-1.5 text-sm text-green-700">
              <CheckCircle2 className="size-4" /> Sent to the company admin for approval.
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending || selectedStudents.size === 0 || selectedModules.size === 0}
            className="bg-indigo text-white hover:bg-indigo/90"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin" />}
            Request to Send Content to {selectedStudents.size} Student{selectedStudents.size !== 1 ? "s" : ""}
          </Button>
        </form>
      )}
    </div>
  );
}
