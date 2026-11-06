import { CheckCircle2, ChevronDown, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { EnrollmentProgress, SessionRecord } from "@/lib/enrollment-progress";

function groupByDate(sessions: SessionRecord[]) {
  const groups = new Map<string, SessionRecord[]>();
  for (const s of sessions) {
    const key = format(s.date, "yyyy-MM-dd");
    const existing = groups.get(key);
    if (existing) existing.push(s);
    else groups.set(key, [s]);
  }
  return Array.from(groups.entries())
    .map(([key, items]) => ({
      date: items[0].date,
      sessions: [...items].sort((a, b) => (a.slotNumber ?? 0) - (b.slotNumber ?? 0)),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function EnrollmentProgressView({ progress }: { progress: EnrollmentProgress }) {
  const dayGroups = groupByDate(progress.sessions);
  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-indigo">{progress.courseName}</h2>
            <p className="text-sm text-muted-foreground">
              {progress.studentName} &middot; Trainer: {progress.trainerName ?? "Not yet assigned"}
              {progress.batchName ? ` · Batch: ${progress.batchName}` : ""}
            </p>
          </div>
          <Badge
            className={
              progress.pct >= progress.threshold
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-amber-100 text-amber-700 hover:bg-amber-100"
            }
          >
            {progress.pct}% attendance
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-lg bg-cream p-3">
            <p className="text-lg font-semibold text-indigo">{progress.totalClasses}</p>
            <p className="text-xs text-muted-foreground">Total Classes</p>
          </div>
          <div className="rounded-lg bg-cream p-3">
            <p className="text-lg font-semibold text-indigo">{progress.held}</p>
            <p className="text-xs text-muted-foreground">Classes Held</p>
          </div>
          <div className="rounded-lg bg-cream p-3">
            <p className="text-lg font-semibold text-indigo">{progress.present}</p>
            <p className="text-xs text-muted-foreground">Attended</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border p-3">
          {progress.certificationStatus === "ISSUED" ? (
            <p className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 className="size-4" /> Certificate issued
            </p>
          ) : progress.pct >= progress.threshold || progress.overrideApproved ? (
            <p className="flex items-center gap-2 text-sm font-medium text-indigo">
              <Clock className="size-4" /> Eligible for a certificate — awaiting approval
              {progress.overrideApproved && " (attendance override approved)"}
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm font-medium text-amber-700">
              <XCircle className="size-4" /> Not yet eligible — attendance is {progress.pct}%, needs{" "}
              {progress.threshold}%
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-6">
          <p className="text-sm font-semibold text-indigo">Session-by-Session Attendance ({progress.sessions.length})</p>
        </div>
        {dayGroups.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No classes recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {dayGroups.map((group) => {
              const presentCount = group.sessions.filter((s) => s.present).length;
              return (
                <details key={group.date.toISOString()} className="group p-4">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                      <div>
                        <p className="font-medium text-indigo">{format(group.date, "MMM d, yyyy")}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.sessions.length} session{group.sessions.length !== 1 ? "s" : ""} &middot;{" "}
                          {presentCount}/{group.sessions.length} present
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        presentCount === group.sessions.length
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : presentCount === 0
                            ? "bg-red-100 text-red-700 hover:bg-red-100"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      }
                    >
                      {presentCount === group.sessions.length
                        ? "Present"
                        : presentCount === 0
                          ? "Absent"
                          : "Partial"}
                    </Badge>
                  </summary>
                  <div className="mt-3 space-y-2 pl-6">
                    {group.sessions.map((s, i) => (
                      <div
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-cream px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium text-indigo">
                            Session {s.slotNumber ?? i + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.topic ?? "Topic not recorded"}</p>
                        </div>
                        <Badge
                          className={
                            s.present
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {s.present ? "Present" : "Absent"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
