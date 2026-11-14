"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icons";

export type ExplorerMember = {
  id: string;
  name: string;
  role: string;
  experienceYears: number;
  isFreelancer: boolean;
  specialties: string[];
  colleges: string[];
  photoUrl: string | null;
  initials: string;
};

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "EMPLOYEE", label: "Employees" },
  { key: "FREELANCE", label: "Freelance" },
] as const;

export function TeamExplorer({ members }: { members: ExplorerMember[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("ALL");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      ALL: members.length,
      EMPLOYEE: members.filter((m) => !m.isFreelancer).length,
      FREELANCE: members.filter((m) => m.isFreelancer).length,
    }),
    [members]
  );

  const filtered = members.filter((m) => {
    if (filter === "EMPLOYEE" && m.isFreelancer) return false;
    if (filter === "FREELANCE" && !m.isFreelancer) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || m.specialties.some((s) => s.toLowerCase().includes(q));
  });

  return (
    <>
      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Filter">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>
        <label className="search">
          <Icon name="search" size={16} />
          <input
            className="input"
            type="search"
            placeholder="Search by name or skill"
            aria-label="Search trainers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="grid" style={{ ["--min" as string]: "280px" }}>
        {filtered.map((m) => (
          <article key={m.id} className="box stack" style={{ gap: 12 }}>
            <div className="stat-inline">
              {m.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photoUrl} alt={m.name} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", flex: "none" }} />
              ) : (
                <span className="avatar lg">{m.initials}</span>
              )}
              <div>
                <h3 className="h3">{m.name}</h3>
                <div className="muted small">{m.role}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <span className="pill gold">{m.experienceYears}+ yrs</span>
                  {m.isFreelancer && <span className="pill info">Freelance</span>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {m.specialties.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
            {m.colleges.length > 0 && (
              <p className="small muted">
                <strong style={{ color: "var(--text)" }}>Trained at:</strong> {m.colleges.join(", ")}
              </p>
            )}
          </article>
        ))}
      </div>
      {filtered.length === 0 && <p className="empty">No one matches your search.</p>}
    </>
  );
}
