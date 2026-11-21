"use client";

import { useState } from "react";

type Tech = { id: string; slug: string; name: string; iconName: string };

export function TechCheckboxGrid({ technologies, name, defaultSlugs = [] }: { technologies: Tech[]; name: string; defaultSlugs?: string[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSlugs));

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {technologies.map((tech) => (
        <label key={tech.id} className="chip" style={{ gap: 6, cursor: "pointer" }}>
          <input
            type="checkbox"
            name={name}
            value={tech.slug}
            checked={selected.has(tech.slug)}
            onChange={() => toggle(tech.slug)}
            style={{ accentColor: "var(--navy)" }}
          />
          {tech.name}
        </label>
      ))}
    </div>
  );
}
