"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
  accentClassName = "border-border bg-white",
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** Border/background classes for the outer card — lets callers keep a distinct
   * color (e.g. gold for something awaiting action) without hardcoding it here. */
  accentClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`mb-8 rounded-xl border ${accentClassName}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
      >
        <p className="text-sm font-semibold text-indigo">
          {title} ({count})
        </p>
        {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t border-border/60">{children}</div>}
    </div>
  );
}
