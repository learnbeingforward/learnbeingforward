"use client";

import { useState } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { Icon } from "@/components/lbf/icons";
import type { EnrollmentProgress } from "@/lib/enrollment-progress";

const SHOWN_LIMIT = 10;

export function StudentCourseProgressView({ progress }: { progress: EnrollmentProgress }) {
  const [filter, setFilter] = useState<"all" | "missed">("all");
  const sessions = [...progress.sessions].sort((a, b) => a.date.getTime() - b.date.getTime() || (a.slotNumber ?? 0) - (b.slotNumber ?? 0));

  const byDate: { date: Date; sessions: typeof sessions }[] = [];
  for (const s of sessions) {
    const group = byDate.find((g) => isSameDay(g.date, s.date));
    if (group) group.sessions.push(s);
    else byDate.push({ date: s.date, sessions: [s] });
  }

  const filteredGroups = filter === "missed" ? byDate.filter((g) => g.sessions.some((s) => !s.present)) : byDate;
  const shown = filteredGroups.slice(0, SHOWN_LIMIT);
  const eligible = progress.pct >= progress.threshold || progress.overrideApproved;

  return (
    <>
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "170px" }}>
          <div className="tile">
            <div className="label">Total classes</div>
            <div className="value">{progress.totalClasses}</div>
          </div>
          <div className="tile">
            <div className="label">Classes held</div>
            <div className="value">{progress.held}</div>
          </div>
          <div className="tile success">
            <div className="label">Attended</div>
            <div className="value">{progress.present}</div>
          </div>
          <div className="tile gold">
            <div className="label">Attendance</div>
            <div className="value">{progress.pct}%</div>
          </div>
        </div>

        {progress.certificationStatus === "ISSUED" ? (
          <div className="alert success" style={{ marginTop: 16 }}>
            <Icon name="award" size={18} className="shrink-0" />
            <span>{progress.overrideApproved ? "Certificate issued through an attendance exception your college requested and Learn Being Forward approved." : "Certificate issued."}</span>
            <Link className="btn btn-success btn-sm" href={`/lms/student/certificate/${progress.enrollmentId}`}>
              <Icon name="download" size={16} />
              Download certificate
            </Link>
          </div>
        ) : eligible ? (
          <div className="alert gold" style={{ marginTop: 16 }}>
            <Icon name="award" size={18} className="shrink-0" />
            <span>You&apos;ve met the attendance requirement — waiting on your trainer&apos;s final approval before the certificate is issued.</span>
          </div>
        ) : (
          <div className="alert warning" style={{ marginTop: 16 }}>
            <Icon name="award" size={18} className="shrink-0" />
            <span>Not yet eligible — keep your attendance above {progress.threshold}% to qualify.</span>
          </div>
        )}
      </section>

      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <div>
            <h2 className="h2">Session-by-session attendance</h2>
          </div>
        </div>
        <div className="segmented" style={{ marginBottom: 14 }}>
          <button aria-pressed={filter === "all"} type="button" onClick={() => setFilter("all")}>
            All ({byDate.length})
          </button>
          <button aria-pressed={filter === "missed"} type="button" onClick={() => setFilter("missed")}>
            Missed ({byDate.filter((g) => g.sessions.some((s) => !s.present)).length})
          </button>
        </div>
        {shown.length === 0 ? (
          <p className="muted">No classes recorded yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table m-cards" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sessions</th>
                  <th>Module</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((group) => {
                  const presentCount = group.sessions.filter((s) => s.present).length;
                  const allPresent = presentCount === group.sessions.length;
                  const moduleTitle = group.sessions[0].topic ?? "—";
                  return (
                    <tr key={group.date.toISOString()}>
                      <td data-label="Date">
                        <strong>{format(group.date, "MMM d, yyyy")}</strong>
                      </td>
                      <td data-label="Sessions">
                        {group.sessions.length} session{group.sessions.length !== 1 ? "s" : ""} · {presentCount}/{group.sessions.length} present
                      </td>
                      <td data-label="Module">{moduleTitle}</td>
                      <td data-label="Status">
                        <span className={`pill ${allPresent ? "success" : "danger"}`}>{allPresent ? "Present" : "Absent"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {shown.length > 0 && (
          <p className="small muted" style={{ marginTop: 10 }}>
            Showing {shown.length} of {filteredGroups.length} session{filteredGroups.length !== 1 ? "s" : ""}
          </p>
        )}
      </section>
    </>
  );
}
