"use client";

import { useMemo, useState, useTransition } from "react";
import { SbIcon } from "../SbIcon";
import type { SbPortal } from "../types";
import { CAPABILITIES, matchCapabilities } from "@/lib/site-builder/catalog";
import { aiCreateBuild, aiPublishAll } from "@/lib/actions/site-builder";

const STEPS = ["Who is it for", "What they need", "Access", "Outline", "Done"];

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type AiState = {
  step: number;
  name: string;
  email: string;
  phone: string;
  pw: string;
  role: string;
  org: string;
  text: string;
  caps: Record<string, boolean>;
  access: Record<string, "view" | "edit">;
  scope: string;
  why: Record<string, string>;
};

function defaultState(): AiState {
  return { step: 1, name: "", email: "", phone: "", pw: genPassword(), role: "", org: "Learn Being Forward", text: "", caps: {}, access: {}, scope: "All colleges", why: {} };
}

export function AiCreateView({ portals, onOpenPage, onRefresh }: { portals: SbPortal[]; onOpenPage: (id: string) => void; onRefresh: () => void }) {
  const [A, setA] = useState<AiState>(defaultState());
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; pw: string; pageIds: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedCaps = useMemo(() => CAPABILITIES.filter((c) => A.caps[c.id]), [A.caps]);

  function patch(p: Partial<AiState>) {
    setA((s) => ({ ...s, ...p }));
  }
  function toggleCap(id: string) {
    setA((s) => ({ ...s, caps: { ...s.caps, [id]: !s.caps[id] } }));
  }
  function suggest() {
    const r = matchCapabilities(A.text);
    setA((s) => ({ ...s, caps: { ...s.caps, ...r.caps }, why: r.why, scope: r.scope ?? s.scope, access: r.viewOnly ? Object.fromEntries(CAPABILITIES.map((c) => [c.id, "view" as const])) : s.access }));
  }
  function next() {
    setError(null);
    if (A.step === 1) {
      if (!A.name.trim() || !/.+@.+\..+/.test(A.email)) return setError("Enter a name and a valid email.");
      if (A.pw.length < 8) return setError("Password needs at least 8 characters.");
    }
    if (A.step === 2 && !Object.values(A.caps).some(Boolean)) return setError("Pick at least one part, or describe what they need.");
    if (A.step === 4) {
      startTransition(async () => {
        try {
          const built = await aiCreateBuild({ name: A.name, email: A.email, phone: A.phone, password: A.pw, role: A.role, org: A.org, scope: A.scope, capabilityIds: Object.keys(A.caps).filter((k) => A.caps[k]), access: A.access });
          setResult({ email: A.email, pw: A.pw, pageIds: built.pageIds });
          setA((s) => ({ ...s, step: 5 }));
          onRefresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't build this account.");
        }
      });
      return;
    }
    setA((s) => ({ ...s, step: s.step + 1 }));
  }

  if (A.step === 5 && result) {
    return (
      <main className="view">
        <Head step={5} />
        <section className="card" style={{ marginTop: 16, textAlign: "center", padding: "30px 10px" }}>
          <span className="icon-box" style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)", margin: "0 auto" }}><SbIcon name="check" size={26} /></span>
          <h2 style={{ marginTop: 12 }}>{A.name}&apos;s account and {result.pageIds.length} pages are ready</h2>
          <p className="muted" style={{ marginTop: 6 }}>Everything is a draft. Open any page to adjust it, then publish.</p>
          <div className="box" style={{ maxWidth: 420, margin: "16px auto", textAlign: "left" }}>
            <div className="label">Login details — shown once</div>
            <div style={{ marginTop: 6, fontFamily: "monospace" }}>{result.email}</div>
            <div style={{ marginTop: 6, fontFamily: "monospace" }}>{result.pw}</div>
          </div>
          <div className="row" style={{ justifyContent: "center", marginTop: 20 }}>
            <button className="btn" type="button" onClick={() => { setA(defaultState()); setResult(null); }}><SbIcon name="plus" size={13} /> Create another</button>
            <button className="btn btn-gold" type="button" disabled={isPending} onClick={() => startTransition(async () => { await aiPublishAll(result.pageIds); onRefresh(); })}><SbIcon name="refresh" size={13} /> Publish all</button>
          </div>
          <div className="row" style={{ justifyContent: "center", marginTop: 10 }}>
            {result.pageIds.map((id) => (
              <button key={id} className="btn btn-sm" type="button" onClick={() => onOpenPage(id)}>Edit a page</button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="view">
      <div className="view-head">
        <div>
          <div className="label">Site Builder</div>
          <h1><SbIcon name="star" size={22} /> AI Create</h1>
          <p className="muted" style={{ marginTop: 4 }}>Answer a few questions — a new account, its menu and its pages are built from the site&apos;s existing sections.</p>
        </div>
      </div>
      <Head step={A.step} />
      <section className="card" style={{ marginTop: 16 }}>
        {A.step === 1 && (
          <>
            <h2>Who is this account for?</h2>
            <p className="muted" style={{ marginTop: 4 }}>These details create their login.</p>
            <div className="grid" style={{ ["--min" as string]: "240px", marginTop: 18 }}>
              <label className="field">Full name *<input className="input" value={A.name} onChange={(e) => patch({ name: e.target.value })} placeholder="e.g. Rahul Sharma" /></label>
              <label className="field">Login email *<input className="input" type="email" value={A.email} onChange={(e) => patch({ email: e.target.value })} placeholder="name@learnbeingforward.in" /></label>
              <label className="field">Phone<input className="input" type="tel" value={A.phone} onChange={(e) => patch({ phone: e.target.value })} /></label>
              <label className="field">
                Password *
                <span className="row" style={{ flexWrap: "nowrap", gap: 6 }}>
                  <input className="input" style={{ fontFamily: "monospace" }} type="password" value={A.pw} onChange={(e) => patch({ pw: e.target.value })} />
                  <button className="btn btn-sm" type="button" onClick={() => patch({ pw: genPassword() })}><SbIcon name="key" size={12} /> New</button>
                </span>
              </label>
              <label className="field">Job title<input className="input" value={A.role} onChange={(e) => patch({ role: e.target.value })} placeholder="e.g. Placement Coordinator" /></label>
              <label className="field">Works for
                <select className="select" value={A.org} onChange={(e) => patch({ org: e.target.value })}>
                  {["Learn Being Forward", "Crestview College of Engineering", "Pinnacle Institute of Technology", "Global Institute of Technology"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            </div>
          </>
        )}
        {A.step === 2 && (
          <>
            <h2>What should {A.name.split(" ")[0] || "they"} be able to do?</h2>
            <p className="muted" style={{ marginTop: 4 }}>Describe it in plain words — matching parts of the site get picked below. You can change anything.</p>
            <textarea className="textarea" rows={4} style={{ marginTop: 14 }} placeholder="e.g. Rahul handles placements for Crestview and Pinnacle. He should see students and their attendance, check assessment results, and see notifications. View only — he shouldn't edit anything." value={A.text} onChange={(e) => patch({ text: e.target.value })} />
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn btn-gold" type="button" onClick={suggest}><SbIcon name="star" size={14} /> Suggest from my description</button>
              <span className="small muted">Runs inside the page — no paid AI service.</span>
            </div>
            {Object.keys(A.why).length > 0 && (
              <div className="alert info" style={{ marginTop: 12 }}>
                <SbIcon name="star" size={15} />
                <span>Understood: {Object.keys(A.why).map((k) => `"${CAPABILITIES.find((c) => c.id === k)?.name}"`).join(", ")}.</span>
              </div>
            )}
            <div className="label" style={{ margin: "18px 0 8px" }}>Parts of the site (click to add or remove)</div>
            <div className="cap-grid">
              {CAPABILITIES.map((c) => (
                <button key={c.id} type="button" className={`cap ${A.caps[c.id] ? "on" : ""}`} aria-pressed={!!A.caps[c.id]} onClick={() => toggleCap(c.id)}>
                  <SbIcon name={c.icon} size={16} /><span>{c.name}</span>{A.caps[c.id] ? <SbIcon name="check" size={14} /> : <SbIcon name="plus" size={14} />}
                </button>
              ))}
            </div>
          </>
        )}
        {A.step === 3 && (
          <>
            <h2>How much access?</h2>
            <p className="muted" style={{ marginTop: 4 }}>For each part: can they change things, or only look?</p>
            <div className="t-wrap" style={{ marginTop: 14 }}>
              <table className="t">
                <thead><tr><th>Part</th><th>View only</th><th>Can edit &amp; approve</th></tr></thead>
                <tbody>
                  {selectedCaps.length === 0 ? (
                    <tr><td colSpan={3} className="muted">Nothing selected — go back a step.</td></tr>
                  ) : (
                    selectedCaps.map((c) => (
                      <tr key={c.id}>
                        <td><div className="row" style={{ flexWrap: "nowrap" }}><SbIcon name={c.icon} size={15} /><b>{c.name}</b></div></td>
                        {(["view", "edit"] as const).map((a) => (
                          <td key={a}>
                            <label className="check">
                              <input type="radio" name={`acc-${c.id}`} checked={(A.access[c.id] ?? "edit") === a} onChange={() => patch({ access: { ...A.access, [c.id]: a } })} />
                              {a === "view" ? "Only look" : "Change"}
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <label className="field" style={{ marginTop: 16, maxWidth: 420 }}>
              Which data can they see?
              <select className="select" value={A.scope} onChange={(e) => patch({ scope: e.target.value })}>
                {["All colleges", "Only Crestview", "Only Pinnacle", "Only Crestview, Pinnacle", "Only their own college", "Only their own batches"].concat(!["All colleges", "Only Crestview", "Only Pinnacle", "Only Crestview, Pinnacle", "Only their own college", "Only their own batches"].includes(A.scope) ? [A.scope] : []).map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          </>
        )}
        {A.step === 4 && (
          <>
            <h2>Here&apos;s the outline</h2>
            <p className="muted" style={{ marginTop: 4 }}>{A.name} · {A.role || "Custom account"} · sees: {A.scope}.</p>
            <div className="cv-band" style={{ borderRadius: 12, marginTop: 14, padding: "12px 18px" }}>
              <div className="label" style={{ color: "var(--gold)" }}>Their menu</div>
              <div className="cv-menu" style={{ border: 0, padding: 0 }}>
                <span className="on">Home</span>
                {selectedCaps.map((c) => <span key={c.id}>{c.page}</span>)}
                <span>Profile</span>
              </div>
            </div>
            <div className="grid" style={{ ["--min" as string]: "220px", marginTop: 14 }}>
              <div className="box"><div className="row"><SbIcon name="home" size={16} /><b>Home</b></div></div>
              {selectedCaps.map((c) => (
                <div key={c.id} className="box">
                  <div className="split">
                    <div className="row"><SbIcon name={c.icon} size={16} /><b>{c.name}</b></div>
                    <span className={`pill ${(A.access[c.id] ?? "edit") === "view" ? "" : "success"}`}>{(A.access[c.id] ?? "edit") === "view" ? "View only" : "Can edit"}</span>
                  </div>
                </div>
              ))}
              <div className="box"><div className="row"><SbIcon name="user" size={16} /><b>Profile</b></div></div>
            </div>
          </>
        )}
        {error && <p className="small" style={{ color: "var(--danger)", marginTop: 14 }}>{error}</p>}
        <div className="split" style={{ marginTop: 24 }}>
          {A.step > 1 ? <button className="btn" type="button" onClick={() => patch({ step: A.step - 1 })}><SbIcon name="arrowL" size={13} /> Back</button> : <span />}
          <button className="btn btn-primary" type="button" disabled={isPending} onClick={next}>
            {A.step === 4 ? <><SbIcon name="star" size={14} /> Build account &amp; pages</> : <>Next <SbIcon name="chevR" size={14} /></>}
          </button>
        </div>
      </section>
    </main>
  );
}

function Head({ step }: { step: number }) {
  return (
    <div className="ai-steps">
      {STEPS.map((s, i) => (
        <div key={s} className={`ai-step ${i + 1 === step ? "on" : i + 1 < step ? "done" : ""}`}>
          <span>{i + 1 < step ? <SbIcon name="check" size={13} /> : i + 1}</span>
          {s}
        </div>
      ))}
    </div>
  );
}
