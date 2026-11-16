import type { SbActivity } from "../types";

export function ActivityView({ activity }: { activity: SbActivity[] }) {
  return (
    <main className="view">
      <div className="view-head">
        <div>
          <div className="label">Site Builder</div>
          <h1>Activity</h1>
          <p className="muted" style={{ marginTop: 4 }}>Every create, publish and delete is logged here.</p>
        </div>
      </div>
      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        {activity.length === 0 ? (
          <p className="muted" style={{ padding: 30, textAlign: "center" }}>Nothing yet.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {activity.map((a) => (
              <li key={a.id} className="split" style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
                <span className="small">{a.what}</span>
                <span className="small muted">{a.who} · {new Date(a.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
