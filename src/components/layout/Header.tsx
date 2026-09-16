"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/technologies", label: "Technologies" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Employees" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <div className="container-page flex h-16 items-center justify-between md:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md border-b-2 border-transparent px-3.5 py-2 text-sm font-medium text-indigo/80 transition-colors hover:text-indigo",
                  active && "border-gold font-semibold text-indigo"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            render={<Link href="/auth" />}
            nativeButton={false}
            variant="outline"
            className="border-gold text-indigo hover:bg-gold"
          >
            Login
          </Button>
          <Button
            render={<Link href="/auth?mode=signup" />}
            nativeButton={false}
            className="bg-indigo text-white hover:bg-indigo/90"
          >
            Sign Up
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-indigo md:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-cream md:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-base font-medium text-indigo hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-md border border-gold px-3 py-2.5 text-center text-base font-semibold text-indigo"
            >
              Login
            </Link>
            <Link
              href="/auth?mode=signup"
              onClick={() => setOpen(false)}
              className="rounded-md bg-indigo px-3 py-2.5 text-center text-base font-semibold text-white"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
