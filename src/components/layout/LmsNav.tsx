"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type LmsNavLink = {
  href: string;
  label: string;
  /** Shows a small red dot next to this link (and on its parent group's toggle,
   * if nested) — used for unread notifications. */
  badge?: boolean;
};

export type LmsNavEntry = LmsNavLink | { label: string; children: LmsNavLink[] };

function isGroup(entry: LmsNavEntry): entry is { label: string; children: LmsNavLink[] } {
  return "children" in entry;
}

function NavGroup({
  label,
  items,
  active,
  badge,
}: {
  label: string;
  items: LmsNavLink[];
  active: boolean;
  badge?: boolean;
}) {
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
          "relative flex items-center gap-1 border-b-2 border-transparent px-3.5 py-3 text-sm font-medium text-indigo/70 transition-colors hover:text-indigo",
          active && "border-gold font-semibold text-indigo"
        )}
      >
        {label}
        <ChevronDown className="size-3.5" />
        {badge && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />}
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
                className="relative flex items-center gap-1.5 px-4 py-2 text-sm text-indigo/80 hover:bg-cream hover:text-indigo"
              >
                {link.label}
                {link.badge && <span className="size-1.5 rounded-full bg-red-500" />}
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, links]);

  function scrollByArrow(direction: "left" | "right") {
    scrollRef.current?.scrollBy({ left: direction === "left" ? -220 : 220, behavior: "smooth" });
  }

  return (
    <nav className="relative border-b border-border bg-white">
      <div className="container-page relative flex items-center">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByArrow("left")}
            aria-label="Scroll menu left"
            className="absolute left-0 z-10 hidden h-full items-center bg-gradient-to-r from-white via-white to-transparent pr-4 pl-1 text-indigo/70 hover:text-indigo sm:flex"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-1 overflow-x-auto scroll-smooth"
        >
          {links.map((entry) => {
            if (isGroup(entry)) {
              const active = entry.children.some((c) => c.href === pathname);
              const badge = entry.children.some((c) => c.badge);
              return <NavGroup key={entry.label} label={entry.label} items={entry.children} active={active} badge={badge} />;
            }
            const active = pathname === entry.href;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={cn(
                  "relative shrink-0 border-b-2 border-transparent px-3.5 py-3 text-sm font-medium text-indigo/70 transition-colors hover:text-indigo",
                  active && "border-gold font-semibold text-indigo"
                )}
              >
                {entry.label}
                {entry.badge && <span className="absolute right-1 top-1.5 size-2 rounded-full bg-red-500" />}
              </Link>
            );
          })}
        </div>
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByArrow("right")}
            aria-label="Scroll menu right"
            className="absolute right-0 z-10 hidden h-full items-center bg-gradient-to-l from-white via-white to-transparent pr-1 pl-4 text-indigo/70 hover:text-indigo sm:flex"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>
    </nav>
  );
}
