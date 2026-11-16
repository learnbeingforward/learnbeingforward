"use client";

import { useActionState, useState, useTransition } from "react";
import { SbIcon } from "../SbIcon";
import type { SbPortal, SbUser } from "../types";
import {
  createSiteBuilderUser,
  type CreateSiteBuilderUserState,
  resetSiteBuilderUserPassword,
  toggleSiteBuilderUser,
  deleteSiteBuilderUser,
  createPortal,
  deletePortal,
  createPage,
} from "@/lib/actions/site-builder";

export function AccountsView({
  portals,
  users,
  onRefresh,
  onEditPortalMenu,
  onNewPageFor,
}: {
  portals: SbPortal[];
  users: SbUser[];
  onRefresh: () => void;
  onEditPortalMenu: () => void;
  onNewPageFor: (pageId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [showNewUser, setShowNewUser] = useState(false);
  const [showNewPortal, setShowNewPortal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction, submitting] = useActionState<CreateSiteBuilderUserState, FormData>(createSiteBuilderUser, null);

  const q = query.toLowerCase();
  const list = users.filter((u) => !q || `${u.name}${u.email}`.toLowerCase().includes(q));
  const allPages = portals.flatMap((p) => p.pages.map((pg) => ({ ...pg, portalName: p.name })));

  return (
    <main className="view">
      <div className="view-head">
        <div>
          <div className="label">Site Builder</div>
          <h1>Accounts &amp; portals</h1>
          <p className="muted" style={{ marginTop: 4 }}>Portals are account types. Each has its own menu and pages — users log in to one portal.</p>
        </div>
        <div className="row">
          <button className="btn" type="button" onClick={() => setShowNewPortal(true)}><SbIcon name="plus" size={14} /> New account type</button>
          <button className="btn btn-primary" type="button" onClick={() => setShowNewUser(true)}><SbIcon name="plus" size={14} /> New user</button>
        </div>
      </div>

      <div className="grid" style={{ ["--min" as string]: "250px" }}>
        {portals.map((p) => {
          const pages = p.pages.length;
          const pUsers = p.id === "builtin-super-admin" ? 0 : users.filter((u) => u.pageIds.some((id) => p.pages.some((pg) => pg.id === id))).length;
          return (
            <div key={p.id} className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="split">
                <span className={`icon-box ${p.builtin ? "navy" : ""}`}><SbIcon name={p.icon} size={17} /></span>
                {p.builtin ? <span className="pill">Built-in</span> : <span className="pill gold">Custom · based on {p.basedOn}</span>}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                <div className="small muted">Sees: {p.scope}</div>
              </div>
              <div className="row small">
                <span><b>{pages}</b> built page{pages === 1 ? "" : "s"}</span>
                <span><b>{pUsers}</b> user{pUsers === 1 ? "" : "s"}</span>
              </div>
              <div className="row">
                <button
                  className="btn btn-sm"
                  type="button"
                  onClick={() => startTransition(async () => { const id = await createPage(p.id, "New page"); onRefresh(); onNewPageFor(id); })}
                  disabled={isPending}
                >
                  <SbIcon name="plus" size={12} /> Page
                </button>
                <button className="btn btn-sm" type="button" onClick={onEditPortalMenu}><SbIcon name="settings" size={12} /> Menu</button>
                {!p.builtin && (
                  <button
                    className="btn btn-sm btn-danger-o"
                    type="button"
                    onClick={() => {
                      if (!confirm(`Delete "${p.name}"? Its pages stay but lose their portal.`)) return;
                      startTransition(async () => { await deletePortal(p.id); onRefresh(); });
                    }}
                  >
                    <SbIcon name="trash" size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <section className="card" style={{ marginTop: 18, padding: 0, overflow: "hidden" }}>
        <div className="split" style={{ padding: "16px 20px" }}>
          <h2 style={{ fontSize: 17 }}>Users</h2>
          <input className="input" style={{ width: 220 }} placeholder="Search name or email" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search users" />
        </div>
        <div style={{ overflow: "auto" }}>
          <table className="t">
            <thead><tr><th>User</th><th>Access</th><th>Status</th><th /></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={4} className="muted" style={{ textAlign: "center", padding: 30 }}>No users match.</td></tr>
              ) : (
                list.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="row" style={{ flexWrap: "nowrap" }}>
                        <span className="avatar">{u.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                        <div>
                          <div className="strong">{u.name}</div>
                          <div className="small muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="small muted">{u.pageIds.length} page{u.pageIds.length === 1 ? "" : "s"}</td>
                    <td><span className={`pill ${u.status === "Active" ? "success" : "warning"}`}>{u.status}</span></td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        className="btn btn-sm"
                        type="button"
                        onClick={() => {
                          const pw = prompt(`New password for ${u.email} (min 8 characters):`);
                          if (!pw) return;
                          const fd = new FormData();
                          fd.set("password", pw);
                          startTransition(async () => { await resetSiteBuilderUserPassword(u.id, fd); onRefresh(); });
                        }}
                      >
                        <SbIcon name="key" size={12} /> Reset password
                      </button>{" "}
                      <button className="btn btn-sm" type="button" onClick={() => startTransition(async () => { await toggleSiteBuilderUser(u.id); onRefresh(); })}>
                        {u.status === "Active" ? "Disable" : "Enable"}
                      </button>{" "}
                      <button
                        className="btn btn-sm btn-icon btn-danger-o"
                        type="button"
                        aria-label={`Delete ${u.name}`}
                        onClick={() => {
                          if (!confirm(`Delete the account for ${u.email}?`)) return;
                          startTransition(async () => { await deleteSiteBuilderUser(u.id); onRefresh(); });
                        }}
                      >
                        <SbIcon name="trash" size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showNewPortal && (
        <div className="modal-wrap" style={{ position: "fixed", inset: 0, background: "rgba(20,28,46,.55)", zIndex: 60, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 16px", overflow: "auto" }} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowNewPortal(false); }}>
          <div className="modal" style={{ background: "#fff", borderRadius: 14, boxShadow: "var(--shadow)", width: "100%", maxWidth: 480, padding: 26 }}>
            <h2 style={{ fontSize: 20 }}>New account type</h2>
            <form
              className="field"
              style={{ marginTop: 16, gap: 14, display: "flex", flexDirection: "column" }}
              action={(fd) => startTransition(async () => { await createPortal(fd); setShowNewPortal(false); onRefresh(); })}
            >
              <label className="field">Name<input className="input" name="name" required placeholder="e.g. Placement Officer" /></label>
              <label className="field">Based on<select className="select" name="basedOn" required><option value="">Choose…</option>{portals.filter((p) => p.builtin).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              <label className="field">Who they see<input className="input" name="scope" placeholder="e.g. Students of their assigned colleges" /></label>
              <div className="row" style={{ justifyContent: "flex-end", marginTop: 10 }}>
                <button className="btn" type="button" onClick={() => setShowNewPortal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewUser && (
        <div className="modal-wrap" style={{ position: "fixed", inset: 0, background: "rgba(20,28,46,.55)", zIndex: 60, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 16px", overflow: "auto" }} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowNewUser(false); }}>
          <div className="modal" style={{ background: "#fff", borderRadius: 14, boxShadow: "var(--shadow)", width: "100%", maxWidth: 560, padding: 26 }}>
            <h2 style={{ fontSize: 20 }}>New user</h2>
            {state?.ok ? (
              <div className="alert success" style={{ marginTop: 14 }}><SbIcon name="check" />{state.email} can log in now.</div>
            ) : (
              <form action={formAction} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="grid" style={{ ["--min" as string]: "220px" }}>
                  <label className="field">Full name *<input className="input" name="name" required /></label>
                  <label className="field">Login email *<input className="input" name="email" type="email" required /></label>
                  <label className="field">Phone<input className="input" name="phone" type="tel" /></label>
                  <label className="field">Password *<input className="input" name="password" type="password" required minLength={8} /></label>
                </div>
                <div className="field">
                  Pages they can open
                  <div className="box" style={{ maxHeight: 180, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                    {allPages.length === 0 ? (
                      <p className="small muted">No pages built yet — build one from the Pages or AI Create tab first.</p>
                    ) : (
                      allPages.map((p) => (
                        <label key={p.id} className="check">
                          <input type="checkbox" name="pageIds" value={p.id} />
                          {p.name} <span className="small muted">· {p.portalName}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                {state?.error && <p className="small" style={{ color: "var(--danger)" }}>{state.error}</p>}
                <div className="row" style={{ justifyContent: "flex-end" }}>
                  <button className="btn" type="button" onClick={() => setShowNewUser(false)}>Cancel</button>
                  <button className="btn btn-primary" type="submit" disabled={submitting}>Create account</button>
                </div>
              </form>
            )}
            {state?.ok && (
              <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button className="btn btn-primary" type="button" onClick={() => { setShowNewUser(false); onRefresh(); }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
