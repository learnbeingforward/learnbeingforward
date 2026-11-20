"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { EnrollmentProgress } from "@/lib/enrollment-progress";

const FILTERS = ["all", "Present", "Absent"] as const;

export function EnrollmentProgressView({ progress }: { progress: EnrollmentProgress }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const sessions = [...progress.sessions].sort((a, b) => a.date.getTime() - b.date.getTime() || (a.slotNumber ?? 0) - (b.slotNumber ?? 0));
  const presentCount = sessions.filter((s) => s.present).length;
  const absentCount = sessions.length - presentCount;
  const noTopicCount = sessions.filter((s) => !s.topic).length;
  const filtered = filter === "all" ? sessions : sessions.filter((s) => (filter === "Present") === s.present);
  const classProgressPct = progress.totalClasses > 0 ? Math.round((progress.held / progress.totalClasses) * 100) : 0;

  return (
    <>
      <section className="card">
        <div className="grid" style={{ ["--min" as string]: "160px" }}>
          <div className={progress.pct >= progress.threshold ? "tile success" : "tile"}>
            <div className="label">Attendance</div>
            <div className="value">{progress.pct}%</div>
          </div>
          <div className="tile">
            <div className="label">Total classes</div>
            <div className="value">{progress.totalClasses}</div>
          </div>
          <div className="tile">
            <div className="label">Classes held</div>
            <div className="value">{progress.held}</div>
          </div>
          <div className="tile gold">
            <div className="label">Attended</div>
            <div className="value">{progress.present}</div>
          </div>
          <div className={progress.certificationStatus === "ISSUED" ? "tile success" : "tile"}>
            <div className="label">Certificate</div>
            <div className="value">
              {progress.certificationStatus === "ISSUED" ? "Issued" : progress.pct >= progress.threshold || progress.overrideApproved ? "Eligible" : "Not yet"}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <div className="split small">
            <span className="muted">
              Course progress — {progress.held} of {progress.totalClasses} classes held
            </span>
            <span className="strong">{classProgressPct}%</span>
          </div>
          <div className="progress" style={{ marginTop: 6, height: 10 }}>
            <span style={{ width: `${classProgressPct}%` }} />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="split" style={{ marginBottom: 18 }}>
          <div>
            <h2 className="h2">Session-by-session attendance</h2>
            {noTopicCount > 0 && (
              <p className="subtitle">
                {noTopicCount} session{noTopicCount !== 1 ? "s" : ""} have no topic recorded — trainers can add it when marking attendance.
              </p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          <button className={`chip${filter === "all" ? " active" : ""}`} type="button" onClick={() => setFilter("all")}>
            All ({sessions.length})
          </button>
          <button className={`chip${filter === "Present" ? " active" : ""}`} type="button" onClick={() => setFilter("Present")}>
            Present ({presentCount})
          </button>
          <button className={`chip${filter === "Absent" ? " active" : ""}`} type="button" onClick={() => setFilter("Absent")}>
            Absent ({absentCount})
          </button>
        </div>
        {filtered.length === 0 ? (
          <p className="muted">No classes recorded yet.</p>
        ) : (
          <ol className="ses-list">
            {filtered.map((s, i) => (
              <li key={s.id} className={`ses ${s.present ? "" : "abs"}`}>
                <span className="ses-dot" />
                <div className="grow">
                  <div className="split" style={{ flexWrap: "wrap", gap: 6 }}>
                    <div>
                      <b>{format(s.date, "MMM d, yyyy")}</b>
                      <span className="small muted"> · Session {s.slotNumber ?? i + 1} </span>
                    </div>
                    <span className={`pill ${s.present ? "success" : "danger"}`}>{s.present ? "Present" : "Absent"}</span>
                  </div>
                  <div className="small" style={{ marginTop: 4 }}>
                    {s.topic ?? <span className="pill warning">Topic not recorded</span>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
