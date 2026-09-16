"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type LmsNavLink = {
  href: string;
  label: string;
};

export function LmsNav({ links }: { links: LmsNavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-white">
      <div className="container-page flex gap-1 overflow-x-auto">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 border-b-2 border-transparent px-3.5 py-3 text-sm font-medium text-indigo/70 transition-colors hover:text-indigo",
                active && "border-gold font-semibold text-indigo"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
