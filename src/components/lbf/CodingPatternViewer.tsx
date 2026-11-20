"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicShell } from "./PublicShell";
import { Icon } from "./icons";

export function CodingPatternViewer({ level, name, unlocked }: { level: string; name: string; unlocked?: boolean }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Unlocked access is served from a protected route that re-checks purchase
  // status on every request and injects the unlock flag itself — a plain
  // query param on the public static file would be just as shareable as the
  // link itself, which defeats the whole point.
  const base = unlocked ? `/api/coding-patterns/${level}` : `/coding-patterns/${level}.html`;
  // Deep-links (e.g. from a QR code in the book: /coding-patterns/level-05#fast-slow)
  // land on this page with the anchor still in the URL — forward it into the
  // iframe so it opens straight to that pattern instead of the top of the level.
  const [iframeSrc, setIframeSrc] = useState(base);

  useEffect(() => {
    setIframeSrc(`${base}${window.location.hash}`);
  }, [base]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsFullscreen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const levelNum = Number(level.replace("level-", ""));
  const prevHref = levelNum > 1 ? `/coding-patterns/level-${String(levelNum - 1).padStart(2, "0")}` : null;
  const nextHref = levelNum < 14 ? `/coding-patterns/level-${String(levelNum + 1).padStart(2, "0")}` : null;

  const toolbar = (
    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {prevHref && (
          <Link className="btn btn-sm" href={prevHref}>
            <Icon name="arrowL" size={14} />
            Level {String(levelNum - 1).padStart(2, "0")}
          </Link>
        )}
        {nextHref && (
          <Link className="btn btn-sm" href={nextHref}>
            Level {String(levelNum + 1).padStart(2, "0")}
            <Icon name="arrowR" size={14} />
          </Link>
        )}
      </div>
      <button type="button" className="btn btn-sm" onClick={() => setIsFullscreen(true)}>
        <Icon name="grid" size={14} />
        Full screen
      </button>
    </div>
  );

  if (isFullscreen) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#fff" }}>
        <iframe src={iframeSrc} title={`${name} visualiser`} style={{ width: "100%", height: "100vh", border: 0, display: "block" }} />
        <button type="button" className="btn btn-sm" onClick={() => setIsFullscreen(false)} style={{ position: "fixed", top: 12, right: 12, zIndex: 1000 }}>
          <Icon name="x" size={14} />
          Exit full screen
        </button>
      </div>
    );
  }

  return (
    <PublicShell
      header={{
        active: "courses",
        heroContent: (
          <div className="container band-hero">
            <div className="eyebrow">
              <Link href="/coding-patterns" style={{ color: "inherit" }}>
                Coding Patterns
              </Link>{" "}
              › Visualiser
            </div>
            <h1>Pattern visualiser</h1>
            <p>Pick a pattern, then play it or step through one line at a time.</p>
          </div>
        ),
      }}
    >
      <div className="lift">
        {toolbar}
        <iframe src={iframeSrc} title={`${name} visualiser`} style={{ width: "100%", height: "80vh", border: 0, display: "block", borderRadius: 16 }} />
      </div>
    </PublicShell>
  );
}
