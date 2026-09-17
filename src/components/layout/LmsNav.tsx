"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type LmsNavLink = {
  href: string;
  label: string;
};

export type LmsNavEntry = LmsNavLink | { label: string; children: LmsNavLink[] };

function isGroup(entry: LmsNavEntry): entry is { label: string; children: LmsNavLink[] } {
  return "children" in entry;
}

function NavGroup({ label, items, active }: { label: string; items: LmsNavLink[]; active: boolean }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom, left: rect.left });
    }
    setOpen((v) => !v);
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className={cn(
          "flex items-center gap-1 border-b-2 border-transparent px-3.5 py-3 text-sm font-medium text-indigo/70 transition-colors hover:text-indigo",
          active && "border-gold font-semibold text-indigo"
        )}
      >
        {label}
        <ChevronDown className="size-3.5" />
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: coords.top, left: coords.left }}
            className="z-50 min-w-44 rounded-lg border border-border bg-white py-1.5 shadow-lg"
          >
            {items.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-indigo/80 hover:bg-cream hover:text-indigo"
              >
                {link.label}
              </Link>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

export function LmsNav({ links }: { links: LmsNavEntry[] }) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-white">
      <div className="container-page flex gap-1 overflow-x-auto">
        {links.map((entry) => {
          if (isGroup(entry)) {
            const active = entry.children.some((c) => c.href === pathname);
            return <NavGroup key={entry.label} label={entry.label} items={entry.children} active={active} />;
          }
          const active = pathname === entry.href;
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={cn(
                "shrink-0 border-b-2 border-transparent px-3.5 py-3 text-sm font-medium text-indigo/70 transition-colors hover:text-indigo",
                active && "border-gold font-semibold text-indigo"
              )}
            >
              {entry.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
