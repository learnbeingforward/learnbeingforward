"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SbIcon } from "../SbIcon";
import { BlockRenderer } from "../BlockRenderer";
import type { SbPortal } from "../types";
import type { Row, Block, BlockItem } from "@/lib/site-builder/types";
import { CATALOG, BASICS, FIELDS, BY_ID, LAYOUTS, LAYOUT_NAMES, type CatalogEntry } from "@/lib/site-builder/catalog";
import { newBlock, newRow, uid } from "@/lib/site-builder/blocks";
import { updatePageRows, updatePageMeta, publishPage, createPage } from "@/lib/actions/site-builder";

type Selection = { row?: string; block?: string } | null;
type LibTab = "sections" | "basics" | "layouts" | "outline";
type Device = "desktop" | "tablet" | "phone";

const PORTAL_ICON: Record<string, string> = { public: "globe", "super-admin": "shield", college: "building", trainer: "briefcase", student: "user" };

function cols(layout: string) {
  return (LAYOUTS[layout] ?? [1]).map((n) => `${n}fr`).join(" ");
}

function findBlock(rows: Row[], blockId: string) {
  for (const r of rows) for (const c of r.cols) {
    const i = c.blocks.findIndex((b) => b.id === blockId);
    if (i > -1) return { r, c, i, b: c.blocks[i] };
  }
  return null;
}

export function EditorView({
  portals,
  pageId,
  onBack,
  onOpenPage,
  onRefresh,
}: {
  portals: SbPortal[];
  pageId: string | null;
  onBack: () => void;
  onOpenPage: (id: string) => void;
  onRefresh: () => void;
}) {
  const page = portals.flatMap((p) => p.pages).find((p) => p.id === pageId) ?? null;
  const portal = portals.find((p) => p.id === page?.portalId) ?? null;

  const [rows, setRows] = useState<Row[]>(page?.rows ?? []);
  const [sel, setSel] = useState<Selection>(null);
  const [libTab, setLibTab] = useState<LibTab>("sections");
  const [libQuery, setLibQuery] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const [, forceRender] = useState(0);
  const dirty = useRef(false);

  useEffect(() => {
    setRows(page?.rows ?? []);
    setSel(null);
    undoStack.current = [];
    redoStack.current = [];
    dirty.current = false;
  }, [pageId]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!page || !dirty.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updatePageRows(page.id, rows).then(() => setSavedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })));
    }, 700);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  if (!page || !portal) {
    return (
      <main className="view">
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <span className="icon-box navy" style={{ width: 56, height: 56, margin: "0 auto" }}><SbIcon name="layers" size={26} /></span>
          <h2 style={{ marginTop: 14 }}>Choose a page to edit</h2>
          <p className="muted" style={{ marginTop: 6 }}>Open a page from the Pages list, or start a new one.</p>
          <div className="row" style={{ justifyContent: "center", marginTop: 18 }}>
            <button className="btn" type="button" onClick={onBack}>Go to pages</button>
          </div>
        </div>
      </main>
    );
  }

  function snap() {
    undoStack.current.push(JSON.stringify(rows));
    if (undoStack.current.length > 60) undoStack.current.shift();
    redoStack.current = [];
  }
  function mutate(fn: (draft: Row[]) => void) {
    snap();
    const draft = JSON.parse(JSON.stringify(rows)) as Row[];
    fn(draft);
    dirty.current = true;
    setRows(draft);
  }
  function undo() {
    const last = undoStack.current.pop();
    if (!last) return;
    redoStack.current.push(JSON.stringify(rows));
    dirty.current = true;
    setRows(JSON.parse(last));
  }
  function redo() {
    const last = redoStack.current.pop();
    if (!last) return;
    undoStack.current.push(JSON.stringify(rows));
    dirty.current = true;
    setRows(JSON.parse(last));
  }

  function addBlock(type: string, target?: { row: string; col: string; index: number }) {
    mutate((draft) => {
      const b = newBlock(type);
      if (target) {
        const r = draft.find((x) => x.id === target.row)!;
        const c = r.cols.find((x) => x.id === target.col)!;
        c.blocks.splice(target.index, 0, b);
      } else {
        draft.push(newRow("1"));
        draft[draft.length - 1].cols[0].blocks.push(b);
      }
      setSel({ block: b.id });
    });
  }
  function addRow(layout: string) {
    mutate((draft) => {
      const r = newRow(layout);
      draft.push(r);
      setSel({ row: r.id });
    });
  }
  function act(action: string, ids: { row?: string; block?: string }) {
    mutate((draft) => {
      if (ids.block) {
        const f = findBlock(draft, ids.block);
        if (!f) return;
        if (action === "blk-del") { f.c.blocks.splice(f.i, 1); setSel(null); }
        if (action === "blk-dup") { const nb = { ...JSON.parse(JSON.stringify(f.b)), id: uid("b") }; f.c.blocks.splice(f.i + 1, 0, nb); setSel({ block: nb.id }); }
        if (action === "blk-up" && f.i > 0) [f.c.blocks[f.i], f.c.blocks[f.i - 1]] = [f.c.blocks[f.i - 1], f.c.blocks[f.i]];
        if (action === "blk-down" && f.i < f.c.blocks.length - 1) [f.c.blocks[f.i], f.c.blocks[f.i + 1]] = [f.c.blocks[f.i + 1], f.c.blocks[f.i]];
      }
      if (ids.row) {
        const ri = draft.findIndex((r) => r.id === ids.row);
        if (ri < 0) return;
        if (action === "row-del") { draft.splice(ri, 1); setSel(null); }
        if (action === "row-dup") { const nr = JSON.parse(JSON.stringify(draft[ri])); nr.id = uid("r"); nr.cols.forEach((c: { id: string; blocks: Block[] }) => { c.id = uid("c"); c.blocks.forEach((b) => (b.id = uid("b"))); }); draft.splice(ri + 1, 0, nr); }
        if (action === "row-up" && ri > 0) [draft[ri], draft[ri - 1]] = [draft[ri - 1], draft[ri]];
        if (action === "row-down" && ri < draft.length - 1) [draft[ri], draft[ri + 1]] = [draft[ri + 1], draft[ri]];
      }
    });
  }
  function setLayout(rowId: string, layout: string) {
    mutate((draft) => {
      const r = draft.find((x) => x.id === rowId);
      if (!r) return;
      const n = LAYOUTS[layout].length;
      while (r.cols.length < n) r.cols.push({ id: uid("c"), blocks: [] });
      while (r.cols.length > n) {
        const extra = r.cols.pop()!;
        r.cols[r.cols.length - 1].blocks.push(...extra.blocks);
      }
      r.layout = layout;
    });
  }
  function updateBlockProp(blockId: string, key: string, value: unknown) {
    mutate((draft) => {
      const f = findBlock(draft, blockId);
      if (f) (f.b.props as Record<string, unknown>)[key] = value;
    });
  }
  function updateItem(blockId: string, index: number, patch: Partial<BlockItem>) {
    mutate((draft) => {
      const f = findBlock(draft, blockId);
      if (!f || !f.b.props.items) return;
      f.b.props.items[index] = { ...f.b.props.items[index], ...patch };
    });
  }
  function removeItem(blockId: string, index: number) {
    mutate((draft) => {
      const f = findBlock(draft, blockId);
      if (!f || !f.b.props.items) return;
      f.b.props.items.splice(index, 1);
    });
  }
  function addItem(blockId: string) {
    mutate((draft) => {
      const f = findBlock(draft, blockId);
      if (!f) return;
      const k = BY_ID[f.b.type].kind;
      (f.b.props.items ??= []).push({ id: uid("i"), label: k === "form" ? "New field" : k === "table" ? "New column" : "New item", value: "0", type: "Text" });
    });
  }

  const roleOf = portal.builtin ? portal.id : portal.basedOn ?? portal.id;
  const q = libQuery.toLowerCase();
  const sectionsByPortal = new Map<string, CatalogEntry[]>();
  for (const c of CATALOG) {
    if (q && !`${c.name}${c.page}${c.data}`.toLowerCase().includes(q)) continue;
    if (!sectionsByPortal.has(c.portal)) sectionsByPortal.set(c.portal, []);
    sectionsByPortal.get(c.portal)!.push(c);
  }
  const portalOrder = [roleOf, ...["student", "college", "trainer", "super-admin", "public"].filter((x) => x !== roleOf)];

  const selectedBlock = sel?.block ? findBlock(rows, sel.block) : null;
  const selectedRow = sel?.row ? rows.find((r) => r.id === sel.row) : null;
  const totalBlocks = rows.reduce((a, r) => a + r.cols.reduce((x, c) => x + c.blocks.length, 0), 0);
  const w = device === "phone" ? 390 : device === "tablet" ? 780 : 1080;

  return (
    <div className="editor">
      <div className="edbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn btn-sm" type="button" onClick={onBack}><SbIcon name="arrowL" size={13} /> Pages</button>
          <span className="pname">{page.name}</span>
          <span className={`pill ${portal.builtin ? "" : "gold"}`}>{portal.name}</span>
          <span className={`pill ${page.status === "Published" ? "success" : page.status === "Draft" ? "" : "warning"}`}>{page.status}</span>
          {savedAt && <span className="saved"><SbIcon name="check" size={13} /> Saved · {savedAt}</span>}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm btn-icon" type="button" aria-label="Undo" disabled={undoStack.current.length === 0} onClick={() => { undo(); forceRender((n) => n + 1); }}><SbIcon name="undo" size={14} /></button>
          <button className="btn btn-sm btn-icon" type="button" aria-label="Redo" disabled={redoStack.current.length === 0} onClick={() => { redo(); forceRender((n) => n + 1); }}><SbIcon name="redo" size={14} /></button>
          <div className="seg" role="group" aria-label="Device">
            {(["desktop", "tablet", "phone"] as Device[]).map((d) => (
              <button key={d} type="button" aria-pressed={device === d} aria-label={d} onClick={() => setDevice(d)}><SbIcon name={d === "desktop" ? "settings" : d === "tablet" ? "grid" : "phone"} size={14} /></button>
            ))}
          </div>
          <button className="btn btn-sm btn-gold" type="button" onClick={() => publishPage(page.id).then(onRefresh)}><SbIcon name="globe" size={13} /> {page.status === "Published" ? "Published" : "Publish"}</button>
        </div>
      </div>

      <aside className="lib" aria-label="Section library">
        <div className="lib-tabs" role="tablist">
          {(["sections", "basics", "layouts", "outline"] as LibTab[]).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={libTab === t} onClick={() => setLibTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
        {libTab !== "layouts" && libTab !== "outline" && (
          <div className="lib-search"><input className="input" placeholder="Search sections…" value={libQuery} onChange={(e) => setLibQuery(e.target.value)} aria-label="Search sections" /></div>
        )}
        {libTab === "sections" && portalOrder.map((pid) => {
          const list = sectionsByPortal.get(pid);
          if (!list || list.length === 0) return null;
          const pages = [...new Set(list.map((i) => i.page))];
          return (
            <details key={pid} className="lib-group" open={pid === roleOf || !!q}>
              <summary>
                <span className="icon-box" style={{ width: 28, height: 28 }}><SbIcon name={PORTAL_ICON[pid] ?? "grid"} size={14} /></span>
                {pid} pages<span className="pill" style={{ marginLeft: 6 }}>{list.length}</span>
                <span className="chev"><SbIcon name="chevR" size={14} /></span>
              </summary>
              <div className="lib-page">
                {pages.map((pg) => (
                  <div key={pg}>
                    <div className="pg">{pg}</div>
                    {list.filter((i) => i.page === pg).map((item) => {
                      const ok = item.roles.includes(roleOf as typeof item.roles[number]);
                      return (
                        <div key={item.id} className={`lib-item ${ok ? "" : "lock"}`} title={ok ? "Click + to add" : "Not available for this portal"}>
                          <span className="ic"><SbIcon name={item.icon} size={15} /></span>
                          <span className="nm">{item.name}{item.data ? <small>{item.data}</small> : null}</span>
                          <button className="add" type="button" aria-label={`Add ${item.name}`} onClick={() => addBlock(item.id, sel?.row ? { row: sel.row, col: rows.find((r) => r.id === sel.row)!.cols[0].id, index: rows.find((r) => r.id === sel.row)!.cols[0].blocks.length } : undefined)}>
                            <SbIcon name="plus" size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </details>
          );
        })}
        {libTab === "basics" && (
          <div className="lib-page">
            <div className="pg">Content &amp; data blocks</div>
            {BASICS.filter((c) => !q || c.name.toLowerCase().includes(q)).map((item) => (
              <div key={item.id} className="lib-item">
                <span className="ic"><SbIcon name={item.icon} size={15} /></span>
                <span className="nm">{item.name}</span>
                <button className="add" type="button" aria-label={`Add ${item.name}`} onClick={() => addBlock(item.id)}><SbIcon name="plus" size={13} /></button>
              </div>
            ))}
            <div className="pg">Form fields</div>
            {FIELDS.filter((c) => !q || c.name.toLowerCase().includes(q)).map((item) => (
              <div key={item.id} className="lib-item">
                <span className="ic"><SbIcon name={item.icon} size={15} /></span>
                <span className="nm">{item.name}</span>
                <button className="add" type="button" aria-label={`Add ${item.name}`} onClick={() => addBlock(item.id)}><SbIcon name="plus" size={13} /></button>
              </div>
            ))}
          </div>
        )}
        {libTab === "layouts" && (
          <div className="layouts">
            {Object.keys(LAYOUTS).map((k) => (
              <button key={k} type="button" className="layout-tile" onClick={() => addRow(k)}>
                <div className="lt" style={{ gridTemplateColumns: cols(k) }}>{LAYOUTS[k].map((_, i) => <span key={i} />)}</div>
                {LAYOUT_NAMES[k]}
              </button>
            ))}
          </div>
        )}
        {libTab === "outline" && (
          <div style={{ padding: 10 }}>
            {rows.length === 0 ? <p className="muted small">Nothing on the page yet.</p> : rows.map((r, i) => (
              <div key={r.id}>
                <div className={`outline-item ${sel?.row === r.id && !sel.block ? "on" : ""}`} onClick={() => setSel({ row: r.id })}><SbIcon name="grid" size={13} /><b>Row {i + 1}</b><span className="muted small">· {LAYOUT_NAMES[r.layout]}</span></div>
                {r.cols.flatMap((c) => c.blocks).map((b) => (
                  <div key={b.id} className={`outline-item ${sel?.block === b.id ? "on" : ""}`} style={{ paddingLeft: 28 }} onClick={() => setSel({ block: b.id })}><SbIcon name={BY_ID[b.type].icon} size={13} />{b.props.title || BY_ID[b.type].name}</div>
                ))}
              </div>
            ))}
          </div>
        )}
      </aside>

      <section className="stage" id="stage">
        <div className="frame" style={{ width: w, maxWidth: "100%" }}>
          <div className="cv-band">
            <div className="cv-top">
              <span className="brand" style={{ fontSize: 13 }}><SbIcon name="cap" size={18} />Learn Being <span className="f">Forward</span></span>
              <span className="row" style={{ gap: 8 }}><span className="role-pill">{portal.name}</span><span className="avatar" style={{ width: 24, height: 24, fontSize: 9, background: "var(--gold)", color: "var(--navy)" }}>AJ</span></span>
            </div>
            <div className="cv-menu">{portal.menu.map((m, i) => <span key={m.id} className={m.pageId === page.id || m.children.some((c) => c.pageId === page.id) ? "on" : i === 0 && !portal.menu.some((mm) => mm.pageId === page.id) ? "" : ""}>{m.label}</span>)}{!portal.menu.some((m) => m.pageId === page.id || m.children.some((c) => c.pageId === page.id)) && <span className="on">{page.name}</span>}</div>
            <div className="cv-title"><h2>{page.name}</h2><p>{page.subtitle || "Add a subtitle"}</p></div>
          </div>
          <div className="cv-body">
            {rows.length === 0 ? (
              <div className="page-empty" onClick={() => addRow("1")} style={{ cursor: "pointer" }}>
                <div style={{ fontSize: 34, color: "var(--gold)" }}><SbIcon name="layers" size={34} /></div>
                <h3 style={{ marginTop: 8, color: "var(--text)" }}>Click to add your first row</h3>
                <p style={{ marginTop: 4 }}>Or pick a section from the left and click its +.</p>
              </div>
            ) : (
              rows.map((r) => (
                <div key={r.id} className={`cv-row ${sel?.row === r.id && !sel.block ? "sel" : ""}`} onClick={() => setSel({ row: r.id })}>
                  <div className="row-tools">
                    <button type="button" title="Row settings" onClick={(e) => { e.stopPropagation(); setSel({ row: r.id }); }}><SbIcon name="grid" size={13} /> Row</button>
                    <button type="button" aria-label="Move row up" onClick={(e) => { e.stopPropagation(); act("row-up", { row: r.id }); }}><SbIcon name="arrowL" size={13} /></button>
                    <button type="button" aria-label="Move row down" onClick={(e) => { e.stopPropagation(); act("row-down", { row: r.id }); }}><SbIcon name="chevR" size={13} /></button>
                    <button type="button" aria-label="Duplicate row" onClick={(e) => { e.stopPropagation(); act("row-dup", { row: r.id }); }}><SbIcon name="plus" size={13} /></button>
                    <button type="button" aria-label="Delete row" onClick={(e) => { e.stopPropagation(); act("row-del", { row: r.id }); }}><SbIcon name="trash" size={13} /></button>
                  </div>
                  <div className="cv-cols" style={{ gridTemplateColumns: cols(r.layout) }}>
                    {r.cols.map((col) => (
                      <div key={col.id} className="cv-col">
                        {col.blocks.length === 0 ? (
                          <div className="col-empty" onClick={(e) => { e.stopPropagation(); setSel({ row: r.id }); }}><SbIcon name="plus" size={14} />&nbsp;Pick a section, then click its +</div>
                        ) : (
                          col.blocks.map((b) => {
                            const warn = !BY_ID[b.type].roles.includes(roleOf as never);
                            return (
                              <div key={b.id} className={`blk ${sel?.block === b.id ? "sel" : ""} ${warn ? "warn" : ""}`} onClick={(e) => { e.stopPropagation(); setSel({ block: b.id }); }} tabIndex={0} aria-label={BY_ID[b.type].name}>
                                <span className="blk-tag">{BY_ID[b.type].name}</span>
                                <div className="blk-tools">
                                  <button type="button" aria-label="Move up" onClick={(e) => { e.stopPropagation(); act("blk-up", { block: b.id }); }}><SbIcon name="arrowL" size={13} /></button>
                                  <button type="button" aria-label="Move down" onClick={(e) => { e.stopPropagation(); act("blk-down", { block: b.id }); }}><SbIcon name="chevR" size={13} /></button>
                                  <button type="button" aria-label="Duplicate" onClick={(e) => { e.stopPropagation(); act("blk-dup", { block: b.id }); }}><SbIcon name="plus" size={13} /></button>
                                  <button type="button" aria-label="Delete" onClick={(e) => { e.stopPropagation(); act("blk-del", { block: b.id }); }}><SbIcon name="trash" size={13} /></button>
                                </div>
                                {warn && <div className="warn-strip"><SbIcon name="bell" size={13} /> {portal.name} users won&apos;t see this section.</div>}
                                <BlockRenderer block={b} />
                              </div>
                            );
                          })
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            {rows.length > 0 && (
              <div className="col-empty" style={{ height: 40, marginTop: 8 }} onClick={() => addRow("1")}><SbIcon name="plus" size={13} />&nbsp;Add a row at the bottom</div>
            )}
          </div>
        </div>
      </section>

      <aside className="props" aria-label="Properties">
        {selectedBlock ? (
          <BlockProps
            block={selectedBlock.b}
            onProp={(k, v) => updateBlockProp(selectedBlock.b.id, k, v)}
            onItem={(i, patch) => updateItem(selectedBlock.b.id, i, patch)}
            onItemRemove={(i) => removeItem(selectedBlock.b.id, i)}
            onItemAdd={() => addItem(selectedBlock.b.id)}
            onDup={() => act("blk-dup", { block: selectedBlock.b.id })}
            onDel={() => act("blk-del", { block: selectedBlock.b.id })}
          />
        ) : selectedRow ? (
          <div>
            <div className="props-head"><div className="label">Selected row</div><div className="strong" style={{ marginTop: 4 }}>{LAYOUT_NAMES[selectedRow.layout]}</div></div>
            <div className="props-sec">
              <span className="label">Columns</span>
              <div className="grid" style={{ ["--min" as string]: "100px", gap: 8 }}>
                {Object.keys(LAYOUTS).map((k) => (
                  <button key={k} type="button" className="layout-tile" style={selectedRow.layout === k ? { borderColor: "var(--navy)", boxShadow: "inset 0 0 0 1px var(--navy)" } : undefined} onClick={() => setLayout(selectedRow.id, k)}>
                    <div className="lt" style={{ gridTemplateColumns: cols(k) }}>{LAYOUTS[k].map((_, i) => <span key={i} />)}</div>
                    {LAYOUT_NAMES[k]}
                  </button>
                ))}
              </div>
            </div>
            <div className="props-sec">
              <div className="row">
                <button className="btn btn-sm" type="button" onClick={() => act("row-dup", { row: selectedRow.id })}><SbIcon name="plus" size={13} /> Duplicate row</button>
                <button className="btn btn-sm btn-danger-o" type="button" onClick={() => act("row-del", { row: selectedRow.id })}><SbIcon name="trash" size={13} /> Delete row</button>
              </div>
            </div>
          </div>
        ) : (
          <PageSettings page={page} portal={portal} totalBlocks={totalBlocks} onSaved={onRefresh} onNewPage={() => createPage(portal.id).then((id) => onOpenPage(id))} />
        )}
      </aside>
    </div>
  );
}

function BlockProps({
  block,
  onProp,
  onItem,
  onItemRemove,
  onItemAdd,
  onDup,
  onDel,
}: {
  block: Block;
  onProp: (key: string, value: unknown) => void;
  onItem: (index: number, patch: Partial<BlockItem>) => void;
  onItemRemove: (index: number) => void;
  onItemAdd: () => void;
  onDup: () => void;
  onDel: () => void;
}) {
  const c = BY_ID[block.type];
  const p = block.props;
  const items = p.items ?? [];
  const showItems = ["tiles", "chart", "table", "list", "cards", "form"].includes(c.kind);

  return (
    <div>
      <div className="props-head">
        <div className="label">Selected section</div>
        <div className="row" style={{ marginTop: 6, flexWrap: "nowrap" }}>
          <span className="icon-box navy"><SbIcon name={c.icon} size={16} /></span>
          <div style={{ minWidth: 0 }}>
            <div className="strong">{c.name}</div>
            <div className="small muted">{c.portal === "basic" || c.portal === "field" ? "Basic block" : `From ${c.portal} › ${c.page}`}</div>
          </div>
        </div>
      </div>
      <div className="props-sec">
        <span className="label">Content</span>
        {c.kind !== "heading" && c.kind !== "divider" && c.kind !== "field" && (
          <>
            <label className="field">Section title<input className="input" value={p.title ?? ""} onChange={(e) => onProp("title", e.target.value)} /></label>
            <label className="toggle">Show title<input type="checkbox" checked={!!p.showTitle} onChange={(e) => onProp("showTitle", e.target.checked)} /></label>
          </>
        )}
        {c.kind === "heading" && <label className="field">Text<input className="input" value={p.text ?? ""} onChange={(e) => onProp("text", e.target.value)} /></label>}
        {c.kind === "text" && <label className="field">Text<textarea className="textarea" rows={4} value={p.text ?? ""} onChange={(e) => onProp("text", e.target.value)} /></label>}
        {c.kind === "button" && <label className="field">Label<input className="input" value={p.label ?? ""} onChange={(e) => onProp("label", e.target.value)} /></label>}
        {c.kind === "alert" && <label className="field">Message<textarea className="textarea" rows={3} value={p.text ?? ""} onChange={(e) => onProp("text", e.target.value)} /></label>}
        {c.kind === "form" && block.type === "b-form" && <label className="field">Button label<input className="input" value={p.submit ?? ""} onChange={(e) => onProp("submit", e.target.value)} /></label>}
        {c.kind === "field" && (
          <>
            <label className="field">Label<input className="input" value={p.label ?? ""} onChange={(e) => onProp("label", e.target.value)} /></label>
            <label className="toggle">Required<input type="checkbox" checked={!!p.required} onChange={(e) => onProp("required", e.target.checked)} /></label>
          </>
        )}
      </div>
      {showItems && (
        <div className="props-sec">
          <span className="label">Items ({items.length})</span>
          <p className="small muted" style={{ marginTop: -4 }}>Remove with ×, reorder with the arrows.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((x, i) => (
              <div key={x.id} className="item-row">
                <span className="muted">{i + 1}</span>
                <input className="input" value={x.label} onChange={(e) => onItem(i, { label: e.target.value })} aria-label={`Item ${i + 1} label`} />
                {(c.kind === "tiles" || c.kind === "chart") && <input className="input" style={{ width: 76 }} value={x.value ?? ""} onChange={(e) => onItem(i, { value: e.target.value })} aria-label={`Item ${i + 1} value`} />}
                <button className="btn btn-sm btn-icon btn-danger-o" type="button" aria-label={`Remove ${x.label}`} onClick={() => onItemRemove(i)}><SbIcon name="x" size={12} /></button>
              </div>
            ))}
          </div>
          <button className="btn btn-sm" type="button" onClick={onItemAdd}><SbIcon name="plus" size={12} /> Add item</button>
        </div>
      )}
      {c.data && c.portal !== "basic" && c.portal !== "field" && (
        <div className="props-sec">
          <span className="label">Data (automatic)</span>
          <div className="box" style={{ padding: 12, background: "var(--info-soft)", border: 0 }}>
            <div className="small" style={{ color: "var(--info-text)" }}><b>Reads:</b> {c.data}</div>
          </div>
        </div>
      )}
      <div className="props-sec">
        <span className="label">Visibility</span>
        <label className="toggle">View only<input type="checkbox" checked={!!p.readOnly} onChange={(e) => onProp("readOnly", e.target.checked)} /></label>
      </div>
      <div className="props-sec">
        <div className="row">
          <button className="btn btn-sm" type="button" onClick={onDup}><SbIcon name="plus" size={13} /> Duplicate</button>
          <button className="btn btn-sm btn-danger-o" type="button" onClick={onDel}><SbIcon name="trash" size={13} /> Delete section</button>
        </div>
      </div>
    </div>
  );
}

function PageSettings({
  page,
  portal,
  totalBlocks,
  onSaved,
  onNewPage,
}: {
  page: { id: string; name: string; subtitle: string | null; icon: string };
  portal: SbPortal;
  totalBlocks: number;
  onSaved: () => void;
  onNewPage: () => void;
}) {
  return (
    <div>
      <div className="props-head"><div className="label">Page settings</div><div className="strong" style={{ marginTop: 4 }}>{page.name}</div></div>
      <form
        className="props-sec"
        action={(fd) => updatePageMeta(page.id, fd).then(onSaved)}
      >
        <label className="field">Page name<input className="input" name="name" defaultValue={page.name} /></label>
        <label className="field">Subtitle<input className="input" name="subtitle" defaultValue={page.subtitle ?? ""} /></label>
        <input type="hidden" name="icon" value={page.icon} />
        <button className="btn btn-sm btn-primary" type="submit" style={{ alignSelf: "flex-start" }}>Save</button>
      </form>
      <div className="props-sec">
        <span className="label">Portal</span>
        <div className="box" style={{ padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <span className="icon-box navy"><SbIcon name={portal.icon} size={16} /></span>
          <div>
            <div className="strong">{portal.name}</div>
            <div className="small muted">Shows: {portal.scope}</div>
          </div>
        </div>
      </div>
      <div className="props-sec">
        <span className="label">This page</span>
        <p className="small muted">{totalBlocks} section{totalBlocks === 1 ? "" : "s"} on this page.</p>
        <button className="btn btn-sm" type="button" onClick={onNewPage}><SbIcon name="plus" size={13} /> Start another page</button>
      </div>
    </div>
  );
}
