"use client";

import { useId, useMemo, useState } from "react";
import { Icon } from "@/components/lbf/icons";
import { CreateTrainerLoginButton } from "@/components/lms/CreateTrainerLoginButton";

type Trainer = {
  id: string;
  name: string;
  email: string | null;
  batchCount: number;
  hasLogin: boolean;
  hourlyRate: number;
  rateAction: ((formData: FormData) => Promise<void>) | null;
};

export function TrainersTable({ trainers, canManage }: { trainers: Trainer[]; canManage: boolean }) {
  const [query, setQuery] = useState("");
  const [loginFilter, setLoginFilter] = useState<"all" | "has" | "none">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trainers.filter((t) => {
      if (loginFilter === "has" && !t.hasLogin) return false;
      if (loginFilter === "none" && t.hasLogin) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || (t.email ?? "").toLowerCase().includes(q);
    });
  }, [trainers, query, loginFilter]);

  return (
    <>
      <div className="toolbar">
        <div className="filters">
          <label className="search">
            <Icon name="search" size={16} />
            <input className="input" type="search" placeholder="Search trainers" aria-label="Search trainers" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select className="select" value={loginFilter} onChange={(e) => setLoginFilter(e.target.value as "all" | "has" | "none")}>
            <option value="all">All</option>
            <option value="has">Has login</option>
            <option value="none">No login yet</option>
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table m-cards" style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>Trainer</th>
              <th>Batches</th>
              <th>Login</th>
              <th>Hourly rate</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trainer) => (
              <TrainerRow key={trainer.id} trainer={trainer} canManage={canManage} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <p className="empty">No trainers match that search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TrainerRow({ trainer, canManage }: { trainer: Trainer; canManage: boolean }) {
  const formId = useId();
  const initials = trainer.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <tr>
      <td data-label="Trainer">
        <div className="stat-inline">
          <span className="avatar sm">{initials}</span>
          <div>
            <span className="strong">{trainer.name}</span>
            <div className="small muted">{trainer.email ?? "—"}</div>
          </div>
        </div>
      </td>
      <td data-label="Batches">
        {trainer.batchCount} batch{trainer.batchCount !== 1 ? "es" : ""}
      </td>
      <td data-label="Login">{trainer.hasLogin ? <span className="pill success">Active</span> : <span className="pill warning">No login yet</span>}</td>
      <td data-label="Hourly rate">
        {canManage && trainer.rateAction ? (
          <form id={formId} action={trainer.rateAction}>
            <span className="input-group" style={{ width: 150, display: "inline-block" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>₹</span>
              <input className="input" type="number" min={0} name="hourlyRate" defaultValue={trainer.hourlyRate} />
            </span>
          </form>
        ) : (
          <>₹{trainer.hourlyRate}/hr</>
        )}
      </td>
      <td data-label="" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!trainer.hasLogin && <CreateTrainerLoginButton trainerId={trainer.id} hasEmail={!!trainer.email} hasLogin={trainer.hasLogin} />}
        {canManage && trainer.rateAction && (
          <button className="btn btn-primary btn-sm" type="submit" form={formId}>
            Save
          </button>
        )}
      </td>
    </tr>
  );
}
