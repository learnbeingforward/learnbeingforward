"use client";

import { useState, useTransition } from "react";
import { SbIcon } from "../SbIcon";
import type { SbPortal } from "../types";
import { updatePortalMenu } from "@/lib/actions/site-builder";

function menuPosOf(portal: SbPortal, pageId: string): string {
  for (const m of portal.menu) {
    if (m.pageId === pageId) return "top";
    if (m.children.some((c) => c.pageId === pageId)) return m.id;
  }
  return "";
}

export function MenusView({ portals, onRefresh }: { portals: SbPortal[]; onRefresh: () => void }) {
  const [portalId, setPortalId] = useState(portals[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const portal = portals.find((p) => p.id === portalId) ?? portals[0];
  if (!portal) return <main className="view"><p className="muted">No portals yet.</p></main>;

  const freePages = portal.pages.filter((p) => !menuPosOf(portal, p.id));

  function save(menu: SbPortal["menu"]) {
    startTransition(async () => { await updatePortalMenu(portal.id, menu); onRefresh(); });
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= portal.menu.length) return;
    const copy = [...portal.menu];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    save(copy);
  }

  function rename(i: number, label: string) {
    const copy = portal.menu.map((m, idx) => (idx === i ? { ...m, label } : m));
    save(copy);
  }

  function remove(i: number) {
    save(portal.menu.filter((_, idx) => idx !== i));
  }

  function place(pageId: string, pos: string) {
    if (!pos) return;
    const page = portal.pages.find((p) => p.id === pageId);
    if (!page) return;
    const copy = portal.menu.map((m) => ({ ...m, children: m.children.filter((c) => c.pageId !== pageId) })).filter((m) => m.pageId !== pageId);
    if (pos === "top") {
      copy.push({ id: `m${Date.now()}`, label: page.name, icon: page.icon, pageId: page.id, children: [] });
    } else {
      const target = copy.find((m) => m.id === pos);
      target?.children.push({ id: `m${Date.now()}`, label: page.name, pageId: page.id });
    }
    save(copy);
  }

  return (
    <main className="view">
      <div className="view-head">
        <div>
          <div className="label">Site Builder</div>
          <h1>Menus</h1>
          <p className="muted" style={{ marginTop: 4 }}>Reorder, rename, or place a page in the top menu or inside a group.</p>
        </div>
        <select className="select" style={{ width: "auto" }} value={portal.id} onChange={(e) => setPortalId(e.target.value)} aria-label="Choose portal">
          {portals.map((p) => <option key={p.id} value={p.id}>{p.name} menu</option>)}
        </select>
      </div>

      <section className="card" style={{ background: "var(--navy)", color: "#fff", padding: "16px 20px" }}>
        <div className="label" style={{ color: "var(--gold)" }}>Live preview</div>
        <div className="cv-menu" style={{ border: 0, padding: 0 }}>
          {portal.menu.length === 0 ? <span>Empty menu — add pages below</span> : portal.menu.map((m, i) => <span key={m.id} className={i === 0 ? "on" : ""}>{m.label}{m.children.length ? " ▾" : ""}</span>)}
        </div>
      </section>

      <div className="row" style={{ alignItems: "flex-start", marginTop: 18, gap: 18 }}>
        <section className="card menu-tree" style={{ flex: "999 1 520px" }}>
          {portal.menu.length === 0 ? (
            <p className="muted">No menu items yet.</p>
          ) : (
            portal.menu.map((m, i) => (
              <div key={m.id}>
                <div className="mi">
                  <span className="icon-box" style={{ width: 28, height: 28 }}><SbIcon name={m.icon ?? "file"} size={14} /></span>
                  <input value={m.label} onChange={(e) => rename(i, e.target.value)} aria-label="Menu label" disabled={isPending} />
                  {m.sys ? <span className="pill">System</span> : <span className="pill gold">Built page</span>}
                  <button className="btn btn-sm btn-icon" type="button" aria-label="Move up" onClick={() => move(i, -1)}><SbIcon name="arrowL" size={13} /></button>
                  <button className="btn btn-sm btn-icon" type="button" aria-label="Move down" onClick={() => move(i, 1)}><SbIcon name="chevR" size={13} /></button>
                  {!m.sys && <button className="btn btn-sm btn-icon btn-danger-o" type="button" aria-label="Remove from menu" onClick={() => remove(i)}><SbIcon name="x" size={13} /></button>}
                </div>
                {m.children.map((c) => (
                  <div key={c.id} className="mi child"><span className="muted"><SbIcon name="chevR" size={13} /></span><span className="strong small" style={{ flex: 1 }}>{c.label}</span></div>
                ))}
              </div>
            ))
          )}
        </section>
        <aside className="card" style={{ flex: "1 1 280px" }}>
          <div className="label">Pages not in the menu</div>
          {freePages.length === 0 ? (
            <p className="small muted" style={{ marginTop: 8 }}>Every built page for this portal is already in the menu.</p>
          ) : (
            freePages.map((p) => (
              <div key={p.id} className="box row" style={{ marginTop: 10, padding: 10, flexWrap: "nowrap" }}>
                <span className="icon-box"><SbIcon name={p.icon} size={14} /></span>
                <span className="strong small" style={{ flex: 1 }}>{p.name}</span>
                <select className="select" style={{ width: "auto", height: 32 }} onChange={(e) => place(p.id, e.target.value)} defaultValue="" aria-label={`Place ${p.name}`}>
                  <option value="">Place…</option>
                  <option value="top">Top menu</option>
                  {portal.menu.map((m) => <option key={m.id} value={m.id}>In {m.label}</option>)}
                </select>
              </div>
            ))
          )}
        </aside>
      </div>
    </main>
  );
}
