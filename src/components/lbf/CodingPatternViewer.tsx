"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { PublicHeader } from "./PublicHeader";

export function CodingPatternViewer({ level, name }: { level: string; name: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

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
          src={`/coding-patterns/${level}.html`}
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
