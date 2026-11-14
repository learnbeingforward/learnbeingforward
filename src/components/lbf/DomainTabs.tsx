"use client";

import { useState } from "react";

export function DomainTabs({
  tabs,
  panels,
}: {
  tabs: { key: string; label: string }[];
  panels: Record<string, React.ReactNode>;
}) {
  const [active, setActive] = useState(tabs[0]?.key ?? "");
  return (
    <>
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={active === t.key} onClick={() => setActive(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {panels[active]}
    </>
  );
}
