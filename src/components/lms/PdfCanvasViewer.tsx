"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/lbf/icons";
import type { PDFDocumentProxy } from "pdfjs-dist";

const PAGE_GAP = 16;

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<import("pdfjs-dist").PDFDocumentLoadingTask | null>(null);

  const [numPages, setNumPages] = useState(0);
  // Every page's unscaled (scale=1) size, read once from page 1 — almost
  // every real document uses one page size throughout, so this is enough to
  // size every page's placeholder instantly and synchronously, and to work
  // out which page number is on screen from scroll position alone.
  const [baseSize, setBaseSize] = useState<{ width: number; height: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.25);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadPercent, setLoadPercent] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setLoadPercent(null);
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

        // pdf.js can fetch the URL itself for streaming, but that relies on
        // the server supporting HTTP range requests — ours doesn't, and
        // pdf.js silently mis-reads page offsets against a server that just
        // returns the whole file for every "ranged" request instead of a
        // real 206 response, showing the wrong page entirely. So: fetch the
        // whole file ourselves (same as before), just with a manual reader
        // loop instead of res.arrayBuffer() so we can show real progress
        // instead of nothing happening until every byte has arrived.
        const res = await fetch(src, { credentials: "same-origin" });
        if (!res.ok) throw new Error("Couldn't load the document.");
        const total = Number(res.headers.get("content-length")) || 0;
        const reader = res.body?.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        if (reader) {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              received += value.length;
              if (total) setLoadPercent(Math.min(99, Math.round((received / total) * 100)));
            }
          }
        }
        if (cancelled) return;
        const data = reader ? new Uint8Array(received) : new Uint8Array(await res.arrayBuffer());
        if (reader) {
          let offset = 0;
          for (const chunk of chunks) {
            data.set(chunk, offset);
            offset += chunk.length;
          }
        }

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
        // Defensive: start at the very top regardless of any scroll position
        // a browser might otherwise try to restore for this URL.
        scrollRef.current?.scrollTo(0, 0);
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

  // The page counter comes straight from scroll position, not from a pile of
  // independent per-page observers racing each other — those could fire out
  // of order as each page's canvas finished rendering and nudged the layout,
  // so the number shown could land on the wrong page even when the right one
  // was what was actually on screen.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !baseSize) return;
    const pageHeight = baseSize.height * scale + PAGE_GAP;
    function onScroll() {
      if (!el) return;
      const page = Math.min(numPages, Math.max(1, Math.round(el.scrollTop / pageHeight) + 1));
      setCurrentPage(page);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [baseSize, scale, numPages]);

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
        ref={scrollRef}
        className="cv-stage"
        style={{
          flex: isFullscreen ? 1 : undefined,
          height: isFullscreen ? undefined : "80vh",
          maxHeight: "none",
          overflow: "auto",
          background: "var(--surface, #EDE7D8)",
          padding: "16px 0",
          // .cv-stage is a flex row with justify-content:center by default
          // (built for a single centered page). For a long stack of pages,
          // centering an element taller than the container centers the
          // whole overflowing stack — pushing roughly the first half of the
          // pages into negative scroll space above the visible area, so
          // scrollTop 0 opens somewhere in the middle of the document
          // instead of page 1. Override both to a plain top-aligned column;
          // each page's own width still centers it horizontally.
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {status === "loading" && (
          <p className="muted" style={{ padding: 24, textAlign: "center" }}>
            Loading{loadPercent !== null ? ` — ${loadPercent}%` : "…"}
          </p>
        )}
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
}: {
  doc: PDFDocumentProxy;
  pageNum: number;
  scale: number;
  estimatedWidth: number;
  estimatedHeight: number;
  title: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<ReturnType<import("pdfjs-dist").PDFPageProxy["render"]> | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setHasEnteredView(true);
      }
    }, { rootMargin: "400px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNum]);

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

      // Render at the screen's real pixel density, not just PDF "CSS" pixels
      // — on a phone (devicePixelRatio 2–3) a canvas sized only to
      // viewport.width looks visibly soft once the browser stretches it to
      // fill the same on-screen space.
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      renderTaskRef.current?.cancel();
      const task = page.render({
        canvas,
        canvasContext: context,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      });
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
        margin: `0 auto ${PAGE_GAP}px`,
        background: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,.15)",
        flex: "none",
      }}
    >
      {hasEnteredView && <canvas ref={canvasRef} title={`${title} — page ${pageNum}`} onContextMenu={(e) => e.preventDefault()} style={{ display: "block" }} />}
    </div>
  );
}
