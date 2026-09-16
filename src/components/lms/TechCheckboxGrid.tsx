"use client";

import { useState } from "react";
import { getIconByName } from "@/lib/icon-catalog";
import { cn } from "@/lib/utils";

type Tech = { id: string; slug: string; name: string; iconName: string };

export function TechCheckboxGrid({ technologies, name }: { technologies: Tech[]; name: string }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className="grid max-h-52 grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-4">
      {Array.from(selected).map((slug) => (
        <input key={slug} type="hidden" name={name} value={slug} />
      ))}
      {technologies.map((tech) => {
        const Icon = getIconByName(tech.iconName);
        const isSelected = selected.has(tech.slug);
        return (
          <button
            key={tech.id}
            type="button"
            onClick={() => toggle(tech.slug)}
            title={tech.name}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border border-transparent p-2 text-center transition-colors hover:bg-cream",
              isSelected && "border-gold bg-gold/10"
            )}
          >
            {Icon && <Icon className="size-5 text-indigo" />}
            <span className="line-clamp-1 text-[10px] text-muted-foreground">{tech.name}</span>
          </button>
        );
      })}
    </div>
  );
}
