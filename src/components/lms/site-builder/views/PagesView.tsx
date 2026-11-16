"use client";

import { useState, useTransition } from "react";
import { SbIcon } from "../SbIcon";
import type { SbPortal } from "../types";
import { createPage, duplicatePage, deletePage } from "@/lib/actions/site-builder";

function menuLabelOf(portal: SbPortal, pageId: string) {
  const top = portal.menu.find((m) => m.pageId === pageId);
  if (top) return "Top menu";
  for (const m of portal.menu) {
    if (m.children.some((c) => c.pageId === pageId)) return `Under "${m.label}"`;
  }
  return "Hidden";
}

export function PagesView({ portals, onEdit, onRefresh }: { portals: SbPortal[]; onEdit: (id: string) => void; onRefresh: () => void }) {
  const [filter, setFilter] = useState("");
  const [isPending, startTransition] = useTransition();
  const allPages = portals.flatMap((p) => p.pages.map((pg) => ({ ...pg, portal: p })));
  const visible = allPages.filter((p) => !filter || p.portalId === filter);
  const published = allPages.filter((p) => p.status === "Published").length;

  function handleNewPage() {
    const portalId = portals.find((p) => p.name === "Super Admin")?.id ?? portals[0]?.id;
    if (!portalId) return;
    startTransition(async () => {
      const id = await createPage(portalId, "New page");
      onRefresh();
      onEdit(id);
    });
  }

  return (
    <main className="view">
      <div className="view-head">
        <div>
          <div className="label">Site Builder</div>
          <h1>Pages you&apos;ve built</h1>
          <p className="muted" style={{ marginTop: 4 }}>Create, edit, publish or delete pages for any portal.</p>
        </div>
        <div className="row">
          <button className="btn btn-primary" type="button" onClick={handleNewPage} disabled={isPending}>
            <SbIcon name="plus" size={14} /> New page
          </button>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><span className="label">Built pages</span><b>{allPages.length}</b></div>
        <div className="kpi"><span className="label">Published</span><b>{published}</b></div>
        <div className="kpi"><span className="label">Drafts / changes</span><b>{allPages.length - published}</b></div>
        <div className="kpi"><span className="label">Custom portals</span><b>{portals.filter((p) => !p.builtin).length}</b></div>
      </div>

      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="split" style={{ padding: "16px 20px" }}>
          <h2 style={{ fontSize: 17 }}>Built pages</h2>
          <select className="select" style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by portal">
            <option value="">All portals</option>
            {portals.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {visible.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }} className="muted">
            No pages yet.{" "}
            <button className="btn btn-sm btn-primary" type="button" onClick={handleNewPage}><SbIcon name="plus" size={13} /> New page</button>
          </div>
        ) : (
          <div style={{ overflow: "auto" }}>
            <table className="t">
              <thead>
                <tr><th>Page</th><th>Portal</th><th>In menu</th><th>Sections</th><th>Status</th><th>Updated</th><th /></tr>
              </thead>
              <tbody>
                {visible.map((p) => {
                  const n = p.rows.reduce((a, r) => a + r.cols.reduce((x, c) => x + c.blocks.length, 0), 0);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="row" style={{ flexWrap: "nowrap" }}>
                          <span className="icon-box"><SbIcon name={p.icon} size={16} /></span>
                          <div>
                            <div className="strong">{p.name}</div>
                            <div className="small muted">{p.subtitle}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`pill ${p.portal.builtin ? "" : "gold"}`}>{p.portal.name}</span></td>
                      <td className="small">{menuLabelOf(p.portal, p.id)}</td>
                      <td>{n}</td>
                      <td><span className={`pill ${p.status === "Published" ? "success" : p.status === "Draft" ? "" : "warning"}`}>{p.status}</span></td>
                      <td className="small muted">{new Date(p.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                        <button className="btn btn-sm btn-primary" type="button" onClick={() => onEdit(p.id)}><SbIcon name="edit" size={13} /> Edit</button>{" "}
                        <button
                          className="btn btn-sm btn-icon"
                          type="button"
                          aria-label={`Duplicate ${p.name}`}
                          onClick={() => startTransition(async () => { await duplicatePage(p.id); onRefresh(); })}
                        >
                          <SbIcon name="plus" size={14} />
                        </button>{" "}
                        <button
                          className="btn btn-sm btn-icon btn-danger-o"
                          type="button"
                          aria-label={`Delete ${p.name}`}
                          onClick={() => {
                            if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
                            startTransition(async () => { await deletePage(p.id); onRefresh(); });
                          }}
                        >
                          <SbIcon name="trash" size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
