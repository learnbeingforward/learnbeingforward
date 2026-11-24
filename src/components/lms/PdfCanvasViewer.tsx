"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/lbf/icons";
import type { PDFDocumentProxy } from "pdfjs-dist";

// Canvas-rendered PDF viewer, not an <iframe src="...pdf">. An iframe pointed
// at a PDF falls back — on a lot of mobile browsers especially — to the
// browser's own full-screen PDF app, which has its own download button we
// can't remove. Rendering pages to a <canvas> ourselves means there is never
// a native PDF toolbar to fall back to, on any device.
//
// Pages scroll continuously (like a normal PDF reader) instead of one page
// at a time with prev/next arrows — each page lazily renders itself once it
// scrolls near the viewport, and re-renders at its real pixel size whenever
// the zoom level changes, so zooming actually makes the page bigger instead
// of being squeezed back down by CSS.
export function PdfCanvasViewer({ src, title }: { src: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<import("pdfjs-dist").PDFDocumentLoadingTask | null>(null);

  const [numPages, setNumPages] = useState(0);
  // Every page's unscaled (scale=1) size, read once from page 1 — almost
  // every real document uses one page size throughout, so this is enough to
  // size every page's placeholder instantly and synchronously. Without this,
  // each of the (possibly hundreds of) pages would size itself asynchronously
  // on mount, so most of them would briefly collapse to zero height at once —
  // which both tanks performance and makes the "page N of M" tracker land on
  // whichever page's lookup happened to resolve last, essentially at random.
  const [baseSize, setBaseSize] = useState<{ width: number; height: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.25);
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

        const firstPage = await doc.getPage(1);
        if (cancelled) return;
        const unscaled = firstPage.getViewport({ scale: 1 });

        pdfDocRef.current = doc;
        setBaseSize({ width: unscaled.width, height: unscaled.height });
        setNumPages(doc.numPages);
        setCurrentPage(1);
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

  const handlePageVisible = useCallback((pageNum: number) => setCurrentPage(pageNum), []);

  return (
    <div
      ref={containerRef}
      style={{
        background: isFullscreen ? "var(--navy)" : undefined,
        display: "flex",
        flexDirection: "column",
        height: isFullscreen ? "100vh" : undefined,
      }}
    >
      <div className="cv-tool">
        <span className="small">
          Page <b>{status === "ready" ? currentPage : "—"}</b> / {numPages || "—"}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button className="btn btn-sm" type="button" onClick={() => setScale((s) => Math.max(0.5, Math.round((s - 0.25) * 100) / 100))} aria-label="Zoom out">
            −
          </button>
          <span className="small">{Math.round(scale * 100)}%</span>
          <button className="btn btn-sm" type="button" onClick={() => setScale((s) => Math.min(3, Math.round((s + 0.25) * 100) / 100))} aria-label="Zoom in">
            +
          </button>
          <button className="btn btn-sm" type="button" onClick={toggleFullscreen}>
            <Icon name={isFullscreen ? "x" : "eye"} size={16} />
            {isFullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>
      </div>
      <div
        className="cv-stage"
        style={{
          flex: isFullscreen ? 1 : undefined,
          height: isFullscreen ? undefined : "80vh",
          maxHeight: "none",
          overflow: "auto",
          background: "var(--surface, #EDE7D8)",
          padding: "16px 0",
          // .cv-stage is a flex row by default (built for a single centered
          // page) — this view scrolls through every page stacked instead, so
          // override to a column; each page's own width still centers it.
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {status === "loading" && <p className="muted" style={{ padding: 24, textAlign: "center" }}>Loading…</p>}
        {status === "error" && (
          <p className="error-text" style={{ padding: 24, textAlign: "center" }}>
            Couldn&apos;t load this document. Try again in a moment.
          </p>
        )}
        {status === "ready" &&
          pdfDocRef.current &&
          baseSize &&
          Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <PdfPage
              key={pageNum}
              doc={pdfDocRef.current!}
              pageNum={pageNum}
              scale={scale}
              estimatedWidth={baseSize.width * scale}
              estimatedHeight={baseSize.height * scale}
              title={title}
              onVisible={handlePageVisible}
            />
          ))}
      </div>
    </div>
  );
}

function PdfPage({
  doc,
  pageNum,
  scale,
  estimatedWidth,
  estimatedHeight,
  title,
  onVisible,
}: {
  doc: PDFDocumentProxy;
  pageNum: number;
  scale: number;
  estimatedWidth: number;
  estimatedHeight: number;
  title: string;
  onVisible: (pageNum: number) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<ReturnType<import("pdfjs-dist").PDFPageProxy["render"]> | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setHasEnteredView(true);
          if (entry.intersectionRatio >= 0.5) onVisible(pageNum);
        }
      },
      { rootMargin: "500px 0px", threshold: [0, 0.5] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNum, onVisible]);

  useEffect(() => {
    if (!hasEnteredView) return;
    let cancelled = false;

    (async () => {
      const page = await doc.getPage(pageNum);
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      renderTaskRef.current?.cancel();
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
    })();

    return () => {
      cancelled = true;
    };
  }, [hasEnteredView, doc, pageNum, scale]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: estimatedWidth,
        height: estimatedHeight,
        margin: "0 auto 16px",
        background: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,.15)",
        flex: "none",
      }}
    >
      {hasEnteredView && (
        <canvas
          ref={canvasRef}
          title={`${title} — page ${pageNum}`}
          onContextMenu={(e) => e.preventDefault()}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}
