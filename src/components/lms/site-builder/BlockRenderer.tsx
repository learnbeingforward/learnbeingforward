import { BY_ID } from "@/lib/site-builder/catalog";
import type { Block } from "@/lib/site-builder/types";
import { SbIcon } from "./SbIcon";

/** Renders what one block looks like — the same illustrative preview in the
 * canvas editor and on a published page. Several kinds show sample figures
 * (e.g. a table's row values) rather than wiring every one of ~40 block
 * kinds to a live query; the structure, your own entered items, and the
 * real figures that already have an obvious source (tiles, charts) are
 * real. This mirrors the original design prototype's own renderer, which
 * does the same for the same reason. */
export function BlockRenderer({ block, preview = false }: { block: Block; preview?: boolean }) {
  const c = BY_ID[block.type];
  if (!c) return null;
  const p = block.props;
  const items = p.items ?? [];

  const title = p.showTitle && p.title ? (
    <div className="m-title">
      <span>
        {p.title}
        {p.readOnly ? <span className="pill" style={{ marginLeft: 6 }}>View only</span> : null}
      </span>
    </div>
  ) : null;

  let body: React.ReactNode = null;

  switch (c.kind) {
    case "heading":
      body = <h3 style={{ fontSize: p.size === "Small" ? 16 : p.size === "Large" ? 26 : 20, textAlign: (p.align ?? "Left").toLowerCase() as React.CSSProperties["textAlign"] }}>{p.text}</h3>;
      break;
    case "text":
      body = <p className="muted" style={{ fontSize: 13.5 }}>{p.text}</p>;
      break;
    case "button":
      body = <span className={`btn ${p.style === "Gold" ? "btn-gold" : p.style === "Outline" ? "" : "btn-primary"}`}>{p.label}</span>;
      break;
    case "image":
      body = <div className="m-img"><SbIcon name="file" size={18} />&nbsp;{String(p.alt || "Image")}</div>;
      break;
    case "divider":
      body = <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "4px 0" }} />;
      break;
    case "alert":
      body = (
        <div className={`alert ${p.tone ?? "gold"}`}>
          <SbIcon name={c.icon} size={16} />
          <span>{p.text || "Notice text"}</span>
        </div>
      );
      break;
    case "hero":
      body = (
        <div style={{ background: "var(--navy)", borderRadius: 10, padding: 26, textAlign: "center", color: "#fff" }}>
          <div className="label" style={{ color: "var(--gold)" }}>Placement-focused training</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>Learn Being <span style={{ color: "var(--gold)" }}>Future-Ready</span></div>
        </div>
      );
      break;
    case "tiles":
      body = (
        <div className="m-tiles">
          {items.map((x, i) => (
            <div key={x.id} className={`m-tile ${i === 1 ? "s" : i === 2 ? "g" : ""}`}>
              <span className="label">{x.label}</span>
              <b>{x.value || "—"}</b>
            </div>
          ))}
        </div>
      );
      break;
    case "chart":
      body = (
        <div className="m-bars">
          {items.map((x) => (
            <div key={x.id} className="bar">
              <i className={Number(x.value) >= 75 ? "g" : ""} style={{ height: `${Math.max(4, Math.min(100, Number(x.value) || 0))}%` }} />
              {x.label}
            </div>
          ))}
        </div>
      );
      break;
    case "ring":
      body = (
        <div className="row" style={{ gap: 16, flexWrap: "nowrap" }}>
          <div className="m-ring" style={{ background: "conic-gradient(var(--success) 324deg,#E8E3D7 0)" }}><span>90%</span></div>
          <div>
            <div className="label">Enrolled course</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{p.course && p.course !== "All courses" ? p.course : "Java & DSA"}</div>
            <span className="pill success" style={{ marginTop: 6 }}>Certification: Eligible</span>
          </div>
        </div>
      );
      break;
    case "table":
      body = (
        <>
          {p.search ? <div className="m-input" style={{ marginBottom: 8, maxWidth: 240 }}><SbIcon name="search" size={13} />&nbsp;Search…</div> : null}
          {items.length > 0 && (
            <div className="t-wrap">
              <table className="m-table">
                <thead><tr>{items.map((x) => <th key={x.id}>{x.label}</th>)}</tr></thead>
                <tbody>
                  {[0, 1, 2].map((r) => (
                    <tr key={r}>
                      {items.map((x, j) => (
                        <td key={x.id}>{j === items.length - 1 ? (r === 2 ? <span className="pill warning">Pending</span> : <span className="pill success">Done</span>) : j === 0 ? ["Aadhya Joshi", "Varun Kumar", "Riya Patel"][r] : "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      );
      break;
    case "list":
      body = (
        <div className="m-list">
          {items.map((x) => (
            <div key={x.id} className="m-li">
              <span className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{x.label[0] ?? "?"}</span>
              <span className="grow"><b>{x.label}</b><br /><span className="muted">Updated today</span></span>
              <span className="pill">View</span>
            </div>
          ))}
        </div>
      );
      break;
    case "cards":
      body = (
        <div className="m-cards">
          {items.map((x) => (
            <div key={x.id} className="m-card">
              <span className="icon-box navy" style={{ width: 28, height: 28 }}><SbIcon name={c.icon} size={14} /></span>
              <div style={{ fontWeight: 700, marginTop: 8 }}>{x.label}</div>
              <div className="muted small">Short description</div>
            </div>
          ))}
        </div>
      );
      break;
    case "form":
      body = (
        <>
          <div className="m-form">
            {items.map((x) => (
              <label key={x.id} className="m-field">
                {x.label}
                <span className="m-input">
                  {x.type === "Dropdown" ? "Select…" : x.type === "Date" ? "dd / mm / yyyy" : x.type === "File" ? <><SbIcon name="upload" size={12} />&nbsp;Choose file</> : x.type === "Number" ? "0" : x.type === "Checkbox" ? "☐ Yes" : ""}
                </span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {block.type === "b-form" && !preview && p.saveTo ? <span className="data-chip"><SbIcon name="grid" size={11} />Saves to: {p.saveTo.replace("New data set: ", "")}</span> : <span />}
            <span className="btn btn-primary btn-sm">{p.submit ?? "Save"}</span>
          </div>
        </>
      );
      break;
    case "field":
      body = (
        <label className="m-field">
          {p.label}{p.required ? <span style={{ color: "var(--danger)" }}> *</span> : null}
          <span className="m-input">
            {p.ftype === "Dropdown" ? (p.options ?? "").split(",")[0] || "Select" : p.ftype === "Checkbox" ? `☐ ${p.label}` : p.ftype === "File" ? "Choose file" : p.ftype === "Date" ? "dd / mm / yyyy" : ""}
          </span>
        </label>
      );
      break;
    case "upload":
      body = <div className="m-upload"><SbIcon name="upload" size={20} /><div style={{ marginTop: 6 }}>Drop a file or <b>browse</b></div></div>;
      break;
    case "calendar":
      body = <div className="m-cal">{Array.from({ length: 14 }, (_, i) => <div key={i}>{i + 2}</div>)}</div>;
      break;
    case "tabs":
      body = (
        <>
          <div className="m-tabs"><span className="on">Tab one</span><span>Tab two</span><span>Tab three</span></div>
          <p className="muted small">Drop sections inside each tab in the full build.</p>
        </>
      );
      break;
  }

  return (
    <>
      {title}
      {body}
    </>
  );
}
