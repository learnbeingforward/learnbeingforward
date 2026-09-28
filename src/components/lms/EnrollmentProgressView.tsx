import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { EnrollmentProgress } from "@/lib/enrollment-progress";

export function EnrollmentProgressView({ progress }: { progress: EnrollmentProgress }) {
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
        {progress.sessions.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No classes recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {progress.sessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <p className="font-medium text-indigo">{format(s.date, "MMM d, yyyy")}</p>
                  {s.topic && <p className="text-xs text-muted-foreground">{s.topic}</p>}
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
        )}
      </div>
    </div>
  );
}
