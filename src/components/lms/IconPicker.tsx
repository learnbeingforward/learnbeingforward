"use client";

import { useState } from "react";
import { Icon } from "@/components/lbf/icons";
import { ICON_CATALOG } from "@/lib/icon-catalog";

export function IconPicker({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(defaultValue ?? "");

  const filtered = query
    ? ICON_CATALOG.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : ICON_CATALOG;

  return (
    <div>
      <input type="hidden" name={name} value={selected} />
      <label className="input-group">
        <Icon name="search" size={16} />
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search technology name (e.g. React, MySQL, Docker)"
        />
      </label>

      <div className="grid" style={{ ["--min" as string]: "70px", gap: 8, marginTop: 12, maxHeight: 260, overflowY: "auto" }}>
        {filtered.slice(0, 60).map((item) => {
          const ItemIcon = item.Icon;
          const isSelected = selected === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setSelected(item.name)}
              title={item.label}
              className="box"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: 8,
                textAlign: "center",
                borderColor: isSelected ? "var(--gold)" : undefined,
                background: isSelected ? "var(--gold-soft)" : undefined,
              }}
            >
              <ItemIcon size={22} style={{ color: "var(--navy)" }} />
              <span className="small muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                {item.label}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="empty" style={{ gridColumn: "1 / -1" }}>No matching icon found.</p>}
      </div>

      {selected && (
        <p className="small muted" style={{ marginTop: 8 }}>
          Selected: <span className="strong">{ICON_CATALOG.find((i) => i.name === selected)?.label}</span>
        </p>
      )}
    </div>
  );
}
