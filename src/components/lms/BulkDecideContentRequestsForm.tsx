"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { decideContentAccessRequests } from "@/lib/actions/content-access";

type Request = { id: string; label: string; requestedAt: string };

export function BulkDecideContentRequestsForm({ requests }: { requests: Request[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(requests.map((r) => r.id)));
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function decide(approve: boolean) {
    startTransition(async () => {
      await decideContentAccessRequests(Array.from(selected), approve);
      setDone(approve ? "approved" : "rejected");
    });
  }

  if (done) {
    return (
      <p className="flex items-center gap-1.5 rounded-lg bg-cream p-4 text-sm font-medium text-green-700">
        <CheckCircle2 className="size-4" /> {selected.size} request{selected.size !== 1 ? "s" : ""} {done}.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-indigo">
        <input
          type="checkbox"
          checked={selected.size === requests.length}
          onChange={() => setSelected((prev) => (prev.size === requests.length ? new Set() : new Set(requests.map((r) => r.id))))}
          className="accent-indigo"
        />
        Select all ({requests.length})
      </label>

      <div className="divide-y divide-border rounded-xl border border-border bg-white">
        {requests.map((r) => (
          <label key={r.id} className="flex items-center gap-3 p-4 text-sm">
            <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="accent-indigo" />
            <span className="text-indigo">{r.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="button" disabled={isPending || selected.size === 0} onClick={() => decide(true)} className="bg-indigo text-white hover:bg-indigo/90">
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          Approve Selected ({selected.size})
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending || selected.size === 0}
          onClick={() => decide(false)}
          className="border-border text-muted-foreground"
        >
          Reject Selected ({selected.size})
        </Button>
      </div>
    </div>
  );
}
