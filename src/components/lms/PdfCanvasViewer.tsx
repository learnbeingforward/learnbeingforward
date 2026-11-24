"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/lbf/icons";

// Canvas-rendered PDF viewer, not an <iframe src="...pdf">. An iframe pointed
// at a PDF falls back — on a lot of mobile browsers especially — to the
// browser's own full-screen PDF app, which has its own download button we
// can't remove. Rendering pages to a <canvas> ourselves means there is never
// a native PDF toolbar to fall back to, on any device.
export function PdfCanvasViewer({ src, title }: { src: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<import("pdfjs-dist").PDFDocumentLoadingTask | null>(null);
  const renderTaskRef = useRef<ReturnType<import("pdfjs-dist").PDFPageProxy["render"]> | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

        const res = await fetch(src, { credentials: "same-origin" });
        if (!res.ok) throw new Error("Couldn't load the document.");
        const data = await res.arrayBuffer();
        if (cancelled) return;

        const loadingTask = pdfjsLib.getDocument({ data });
        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;
        if (cancelled) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setPageNum(1);
        setStatus("ready");
      } catch (err) {
        console.error("[PdfCanvasViewer] Failed to load document:", err);
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
      loadingTaskRef.current?.destroy();
      loadingTaskRef.current = null;
      pdfDocRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (status !== "ready" || !pdfDocRef.current || !canvasRef.current) return;
    let cancelled = false;

    async function renderPage() {
      const doc = pdfDocRef.current;
      const canvas = canvasRef.current;
      if (!doc || !canvas) return;

      renderTaskRef.current?.cancel();

      const page = await doc.getPage(pageNum);
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const task = page.render({ canvas, canvasContext: context, viewport });
      renderTaskRef.current = task;
      try {
        await task.promise;
      } catch (err) {
        if (!(err instanceof Error && err.name === "RenderingCancelledException")) {
          console.error("[PdfCanvasViewer] Render failed:", err);
        }
      }
    }

    renderPage();
    return () => {
      cancelled = true;
    };
  }, [status, pageNum, scale]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      (el.requestFullscreen ?? (el as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen)?.call(el);
    }
  }

  return (
    <div ref={containerRef} style={{ background: isFullscreen ? "var(--navy)" : undefined, display: "flex", flexDirection: "column", height: isFullscreen ? "100vh" : undefined }}>
      <div className="cv-tool">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button className="btn btn-sm" type="button" disabled={pageNum <= 1} onClick={() => setPageNum((p) => Math.max(1, p - 1))} aria-label="Previous page">
            <Icon name="arrowL" size={16} />
          </button>
          <span className="small">
            <b>{status === "ready" ? pageNum : "—"}</b> / {numPages || "—"}
          </span>
          <button className="btn btn-sm" type="button" disabled={pageNum >= numPages} onClick={() => setPageNum((p) => Math.min(numPages, p + 1))} aria-label="Next page">
            <Icon name="arrowR" size={16} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button className="btn btn-sm" type="button" onClick={() => setScale((s) => Math.max(0.5, s - 0.15))} aria-label="Zoom out">
            −
          </button>
          <span className="small">{Math.round(scale * 100)}%</span>
          <button className="btn btn-sm" type="button" onClick={() => setScale((s) => Math.min(3, s + 0.15))} aria-label="Zoom in">
            +
          </button>
          <button className="btn btn-sm" type="button" onClick={toggleFullscreen}>
            <Icon name={isFullscreen ? "x" : "eye"} size={16} />
            {isFullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>
      </div>
      <div className="cv-stage" style={{ flex: isFullscreen ? 1 : undefined, overflow: "auto", display: "flex", justifyContent: "center" }}>
        {status === "loading" && <p className="muted" style={{ padding: 24 }}>Loading…</p>}
        {status === "error" && <p className="error-text" style={{ padding: 24 }}>Couldn&apos;t load this document. Try again in a moment.</p>}
        <canvas
          ref={canvasRef}
          title={title}
          onContextMenu={(e) => e.preventDefault()}
          style={{ display: status === "ready" ? "block" : "none", maxWidth: "100%", height: "auto", boxShadow: "0 2px 12px rgba(0,0,0,.15)" }}
        />
      </div>
    </div>
  );
}
