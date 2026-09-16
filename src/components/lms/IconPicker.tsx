"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search technology name (e.g. React, MySQL, Docker)"
          className="pl-9"
        />
      </div>

      <div className="mt-3 grid max-h-64 grid-cols-4 gap-2 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-6">
        {filtered.slice(0, 60).map((item) => {
          const Icon = item.Icon;
          const isSelected = selected === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setSelected(item.name)}
              title={item.label}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border border-transparent p-2 text-center transition-colors hover:bg-cream",
                isSelected && "border-gold bg-gold/10"
              )}
            >
              <Icon className="size-6 text-indigo" />
              <span className="line-clamp-1 text-[10px] text-muted-foreground">{item.label}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
            No matching icon found.
          </p>
        )}
      </div>

      {selected && (
        <p className="mt-2 text-xs text-muted-foreground">
          Selected: <span className="font-medium text-indigo">{ICON_CATALOG.find((i) => i.name === selected)?.label}</span>
        </p>
      )}
    </div>
  );
}
