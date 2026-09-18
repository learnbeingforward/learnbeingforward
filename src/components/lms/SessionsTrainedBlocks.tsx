import { format } from "date-fns";

export type SessionLineItem = {
  id: string;
  date: Date;
  hours: number;
  batchId: string;
  collegeName: string;
  batchName: string;
};

export type BatchRosterEntry = {
  id: string;
  name: string;
  branch: string | null;
  semester: number | null;
};

export function SessionsTrainedBlocks({
  lineItems,
  rosters,
}: {
  lineItems: SessionLineItem[];
  rosters: Record<string, BatchRosterEntry[]>;
}) {
  const blocks = new Map<string, { collegeName: string; batchName: string; sessions: SessionLineItem[] }>();
  for (const li of lineItems) {
    if (!blocks.has(li.batchId)) {
      blocks.set(li.batchId, { collegeName: li.collegeName, batchName: li.batchName, sessions: [] });
    }
    blocks.get(li.batchId)!.sessions.push(li);
  }

  return (
    <div className="divide-y divide-border">
      {[...blocks.entries()].map(([batchId, block]) => {
        const roster = rosters[batchId] ?? [];
        const dates = [...block.sessions].sort((a, b) => a.date.getTime() - b.date.getTime());
        const totalHours = block.sessions.reduce((sum, s) => sum + s.hours, 0);

        return (
          <details key={batchId} className="group p-4">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-indigo">
                {block.collegeName} — {block.batchName}
              </span>
              <span className="text-xs text-muted-foreground">
                {block.sessions.length} session{block.sessions.length !== 1 ? "s" : ""} &middot; {totalHours} hrs
                <span className="ml-2 text-indigo/60 group-open:hidden">▸ view details</span>
                <span className="ml-2 hidden text-indigo/60 group-open:inline">▾ hide details</span>
              </span>
            </summary>
            <div className="mt-3 space-y-3 border-t border-border pt-3 text-xs">
              <div>
                <p className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">Dates</p>
                <p className="text-indigo">{dates.map((s) => format(s.date, "MMM d, yyyy")).join(", ")}</p>
              </div>
              {roster.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">
                    Students ({roster.length})
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {roster.map((s) => (
                      <p key={s.id} className="text-indigo">
                        {s.name}
                        {(s.branch || s.semester) && (
                          <span className="text-muted-foreground">
                            {" "}
                            — {[s.branch, s.semester ? `Sem ${s.semester}` : null].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
