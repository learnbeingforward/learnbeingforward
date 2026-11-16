"use client";

import { useState } from "react";
import { SbIcon } from "../SbIcon";
import { CATALOG, BASICS, FIELDS } from "@/lib/site-builder/catalog";

const PORTAL_NAMES: Record<string, string> = { public: "Public website", "super-admin": "Super Admin", college: "College", trainer: "Trainer", student: "Student" };

export function LibraryView() {
  const [q, setQ] = useState("");
  const all = [...CATALOG, ...BASICS, ...FIELDS].filter((c) => !q || `${c.name}${c.page}${c.data}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <main className="view">
      <div className="view-head">
        <div>
          <div className="label">Site Builder</div>
          <h1>Section library</h1>
          <p className="muted" style={{ marginTop: 4 }}>Every section from the live site, rebuilt as a smart block. Each knows which portals may use it.</p>
        </div>
        <input className="input" style={{ width: 260 }} placeholder="Search sections" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search library" />
      </div>
      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflow: "auto" }}>
          <table className="t">
            <thead><tr><th>Section</th><th>Comes from</th><th>Reads data</th><th>Available for</th></tr></thead>
            <tbody>
              {all.map((c) => (
                <tr key={c.id}>
                  <td><div className="row" style={{ flexWrap: "nowrap" }}><span className="icon-box"><SbIcon name={c.icon} size={14} /></span><span className="strong">{c.name}</span></div></td>
                  <td className="small">{c.portal === "basic" || c.portal === "field" ? "Basic block" : `${PORTAL_NAMES[c.portal] ?? c.portal} › ${c.page}`}</td>
                  <td className="small muted">{c.data || "Nothing (static)"}</td>
                  <td>{c.roles.length === 5 ? <span className="pill success">All portals</span> : c.roles.map((r) => <span key={r} className="pill" style={{ margin: 2 }}>{PORTAL_NAMES[r]}</span>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
