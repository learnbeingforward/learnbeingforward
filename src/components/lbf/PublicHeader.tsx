"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";

const LINKS = [
  { key: "home", label: "Home", href: "/" },
  { key: "courses", label: "Courses", href: "/courses" },
  { key: "technologies", label: "Technologies", href: "/technologies" },
  { key: "about", label: "About", href: "/about" },
  { key: "team", label: "Team", href: "/team" },
  { key: "contact", label: "Contact", href: "/contact" },
  { key: "buy", label: "Buy", href: "/buy" },
];

/** The navy band + nav + hero used at the top of every public page. `tall`
 * matches the design's `band tall` (more bottom padding) — only Home uses it.
 * On phones the desktop nav/actions hide and a hamburger opens a slide-in
 * drawer with every link plus Coding Patterns, matching assets/layout.js. */
export function PublicHeader({
  active,
  tall,
  bandStyle,
  eyebrow,
  title,
  description,
  actions,
  heroContent,
}: {
  active: string;
  tall?: boolean;
  /** Override the band's own padding/etc — the auth pages use a taller
   * 180px bottom padding that doesn't match the `tall` variant's 160px. */
  bandStyle?: React.CSSProperties;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  /** Replaces the default centred eyebrow/h1/p hero entirely (course detail's
   * back-link + title/pills row doesn't fit that shape). */
  heroContent?: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.layout = "public";
    document.body.dataset.active = active;
    return () => {
      delete document.body.dataset.layout;
      delete document.body.dataset.active;
    };
  }, [active]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("m-lock", drawerOpen);
    return () => document.body.classList.remove("m-lock");
  }, [drawerOpen]);

  return (
    <>
      <header className={`band${tall ? " tall" : ""}`} style={bandStyle}>
        <div className="container">
          <Link className="brand" href="/">
            <Icon name="cap" size={26} />
            <span className="wm">
              Learn Being <span>Forward</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Main">
            {LINKS.map((l) => (
              <Link key={l.key} href={l.href} className={l.key === active ? "active" : ""}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="btn btn-ghost-light btn-sm" href="/auth">
              Login
            </Link>
            <Link className="btn btn-gold btn-sm" href="/auth?mode=signup">
              Sign Up
            </Link>
          </div>

          <button
            className="m-burger"
            type="button"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
        {heroContent ?? (
          <div className="container band-hero">
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
            <p>{description}</p>
            {actions && <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>{actions}</div>}
          </div>
        )}
      </header>

      <div className="m-scrim" hidden={!drawerOpen} onClick={() => setDrawerOpen(false)} />
      <aside className="m-drawer" aria-label="Menu" hidden={!drawerOpen}>
        <div className="m-dhead">
          <Link className="brand" href="/" onClick={() => setDrawerOpen(false)}>
            <Icon name="cap" size={26} />
            <span className="wm">
              Learn Being <span>Forward</span>
            </span>
          </Link>
          <button className="m-x" type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <nav className="m-links">
          {LINKS.map((l) => (
            <Link key={l.key} href={l.href} className={l.key === active ? "active" : ""} onClick={() => setDrawerOpen(false)}>
              {l.label}
              <Icon name="chevR" size={16} />
            </Link>
          ))}
          <Link href="/coding-patterns" onClick={() => setDrawerOpen(false)}>
            Coding Patterns
            <Icon name="chevR" size={16} />
          </Link>
        </nav>
        <div className="m-dfoot">
          <Link className="btn btn-gold" href="/auth?mode=signup" onClick={() => setDrawerOpen(false)}>
            Sign Up
          </Link>
          <Link className="btn" href="/auth" onClick={() => setDrawerOpen(false)}>
            Login
          </Link>
          <p className="small muted" style={{ marginTop: 8 }}>
            +91 99729 34418 · support@learnbeingforward.in
          </p>
        </div>
      </aside>
    </>
  );
}
