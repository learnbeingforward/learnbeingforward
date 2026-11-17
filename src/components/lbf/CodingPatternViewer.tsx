"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { PublicHeader } from "./PublicHeader";

export function CodingPatternViewer({ level, name }: { level: string; name: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Deep-links (e.g. from a QR code in the book: /coding-patterns/level-05#fast-slow)
  // land on this page with the anchor still in the URL — forward it into the
  // iframe so it opens straight to that pattern instead of the top of the level.
  const [iframeSrc, setIframeSrc] = useState(`/coding-patterns/${level}.html`);

  useEffect(() => {
    setIframeSrc(`/coding-patterns/${level}.html${window.location.hash}`);
  }, [level]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsFullscreen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="lbf-scope">
      {!isFullscreen && <PublicHeader active="courses" heroContent={<></>} bandStyle={{ paddingBottom: 22 }} />}
      <div style={isFullscreen ? { position: "fixed", inset: 0, zIndex: 999, background: "#fff" } : undefined}>
        <iframe
          src={iframeSrc}
          title={`${name} visualiser`}
          style={{ width: "100%", height: isFullscreen ? "100vh" : "85vh", border: 0, display: "block" }}
        />
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setIsFullscreen((v) => !v)}
          style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </div>
    </div>
  );
}
