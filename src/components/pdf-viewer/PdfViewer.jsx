'use client';
/**
 * Learn Being Forward — full-page PDF viewer (student content, trainer content, admin preview).
 * Markup and class names are copied 1:1 from design/student/content-view.html — do not change them.
 * Behaviour lives in pdfViewerController.js (same file the design page uses).
 *
 * Needs:  npm i pdfjs-dist
 * Styles: import './pdf-viewer.css' (below) — and the site's styles.css must already be loaded.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createPdfViewer } from './pdfViewerController';
import './pdf-viewer.css';

/* ---------- icons (same SVGs as the design) ---------- */
const S = ({ size = 20, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const IBack = () => <S><path d="M19 12H5M12 19l-7-7 7-7" /></S>;
const IToc = () => <S><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></S>;
const IUp = () => <S><path d="M18 15l-6-6-6 6" /></S>;
const IDown = () => <S><path d="M6 9l6 6 6-6" /></S>;
const IZoomIn = () => <S><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M11 8v6M8 11h6" /></S>;
const IZoomOut = () => <S><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M8 11h6" /></S>;
const IFit = () => <S><path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" /></S>;
const IPrev = () => <S size={16}><path d="M15 18l-6-6 6-6" /></S>;
const INext = () => <S size={16}><path d="M9 18l6-6-6-6" /></S>;
const IEye = () => <S size={15}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></S>;
const ILink = () => <S size={16}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></S>;
const IClose = () => <S><path d="M6 6l12 12M18 6L6 18" /></S>;
const ILock = () => <S size={14}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></S>;

/**
 * @param {object}  p
 * @param {string}  p.pdfUrl       authenticated URL that streams the PDF (see README, "Secure file URL")
 * @param {string}  p.title        e.g. "HTML/CSS fundamentals"
 * @param {string}  p.subtitle     e.g. "Full-Stack Development · Frontend Module" (page count is added automatically)
 * @param {string}  p.backHref     e.g. "/lms/student/content"
 * @param {string}  p.watermark    e.g. "Aadhya Joshi · aadhya.joshi6@extradata.in · 28 Nov 2026"
 * @param {{title:string, href:string}|null} p.prev   previous item in the module (null = disabled)
 * @param {{title:string, href:string}|null} p.next   next item in the module (null = hidden)
 * @param {string}  p.moduleTitle  e.g. "Frontend Module"
 * @param {string}  p.moduleSub    e.g. "Full-Stack Development · 4 items"
 * @param {{title:string, sub:string, href?:string, state:'current'|'open'|'locked'}[]} p.items
 * @param {{title:string, href:string}[]} p.links  "Learn more" links
 */
export default function PdfViewer({ pdfUrl, title, subtitle, backHref, watermark, prev, next, moduleTitle, moduleSub, items = [], links = [] }) {
  const rootRef = useRef(null);
  const [pages, setPages] = useState(null);   // null = loading
  const [error, setError] = useState('');

  useEffect(() => {
    let viewer, doc, cancelled = false;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        doc = await pdfjs.getDocument({ url: pdfUrl, withCredentials: true, disableAutoFetch: true, rangeChunkSize: 262144 }).promise;
        if (cancelled) return;
        // page sizes at 100 % in CSS px (PDF points × 96/72)
        const sizes = [];
        for (let n = 1; n <= doc.numPages; n++) {
          const vp = (await doc.getPage(n)).getViewport({ scale: 96 / 72 });
          sizes.push({ w: Math.round(vp.width), h: Math.round(vp.height) });
        }
        if (cancelled) return;
        setPages(doc.numPages);
        // pdfViewerController.js's own $() does root.querySelector(...), which can
        // never match root itself — only a descendant. The design page (which this
        // controller is also shared with, byte-for-byte) calls createPdfViewer with
        // `document` as root for exactly that reason; rootRef.current here IS the
        // .pv element the controller looks for, so passing it directly left every
        // $('.pv')-style lookup returning null and the viewer dead on arrival.
        viewer = createPdfViewer(document, {
          count: doc.numPages,
          sizes,
          watermark,
          // Draw page n into box at the current zoom. No text layer on purpose (students can't copy).
          render: async (box, n, zoom) => {
            const page = await doc.getPage(n);
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const vp = page.getViewport({ scale: (96 / 72) * zoom * dpr });
            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height);
            if (box._task) box._task.cancel();
            box._task = page.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
            try { await box._task.promise; } catch (e) { if (e?.name === 'RenderingCancelledException') return; throw e; }
            box.replaceChildren(canvas);
          },
        });
      } catch (e) {
        if (!cancelled) setError('This document could not be opened. Check your connection and try again.');
      }
    })();
    return () => { cancelled = true; viewer?.destroy(); doc?.destroy(); };
  }, [pdfUrl, watermark]);

  return (
    <main className="pv" aria-label="Document viewer" ref={rootRef}>
      <div className="pv-bar">
        <Link className="pv-ib" href={backHref} aria-label="Back to content" title="Back to content"><IBack /></Link>
        <button className="pv-ib" id="pvToc" type="button" aria-label="Module contents" aria-expanded="false" aria-controls="pvPanel" title="Module contents"><IToc /></button>
        <div className="ttl"><b>{title}</b><small>{subtitle}{pages ? ` · ${pages} pages` : ''}</small></div>
        <span className="pv-lock hide-m"><IEye /> View only</span>
        {prev
          ? <Link className="pv-pill hide-m" href={prev.href} title={`Previous: ${prev.title}`}><IPrev />Previous</Link>
          : <button className="pv-pill hide-m" type="button" disabled><IPrev />Previous</button>}
        {next && (
          <Link className="pv-pill" href={next.href} title={`Next: ${next.title}`}>
            <span className="hide-m">Next: {next.title}</span><span style={{ display: 'none' }} className="show-m">Next</span><INext />
          </Link>
        )}
        <span className="pv-sep hide-m"></span>
        <button className="pv-ib" id="pvFs" type="button" aria-pressed="false" aria-label="Full screen" title="Full screen (F)"></button>
      </div>

      <div className="pv-scroll" tabIndex={0} aria-label="Pages">
        {/* Pages are created by the controller — React must not render children here. */}
        <div className="pv-pages"></div>
        {!pages && !error && <div className="pv-loading" role="status">Opening document…</div>}
        {error && <div className="pv-loading pv-failed" role="alert">{error}</div>}
      </div>
      <div className="pv-zoom" role="status" aria-live="polite"></div>

      <nav className="pv-rail" aria-label="Page and zoom">
        <input className="pg" id="pvPg" inputMode="numeric" aria-label="Current page — type a number and press Enter" defaultValue="1" />
        <span className="tot" id="pvTot" aria-label="Total pages">{pages ?? '–'}</span>
        <span className="rs"></span>
        <button className="pv-ib" id="pvUp" type="button" aria-label="Previous page" title="Previous page"><IUp /></button>
        <button className="pv-ib" id="pvDn" type="button" aria-label="Next page" title="Next page"><IDown /></button>
        <span className="rs"></span>
        <button className="pv-ib" id="pvZin" type="button" aria-label="Zoom in" title="Zoom in (Ctrl +)"><IZoomIn /></button>
        <button className="pv-ib" id="pvZout" type="button" aria-label="Zoom out" title="Zoom out (Ctrl −)"><IZoomOut /></button>
        <button className="pv-ib fitb" id="pvFit" type="button" aria-pressed="true" aria-label="Fit to width" title="Fit to width (Ctrl 0)"><IFit /></button>
      </nav>

      <div className="pv-scrim"></div>
      <aside className="pv-panel" id="pvPanel" aria-label="Module contents">
        <div className="ph">
          <div><b>{moduleTitle}</b><small>{moduleSub}</small></div>
          <button className="pv-ib" id="pvTocX" type="button" aria-label="Close contents"><IClose /></button>
        </div>
        <div className="pb">
          <h4>In this module</h4>
          {items.map((it, i) => (
            <a key={i} className={`pv-it ${it.state === 'current' ? 'on' : it.state === 'locked' ? 'locked' : ''}`}
               href={it.state === 'locked' ? undefined : it.href} aria-current={it.state === 'current' ? 'page' : undefined} aria-disabled={it.state === 'locked' || undefined}>
              <span className="n">{it.state === 'locked' ? <ILock /> : i + 1}</span>
              <span className="grow">{it.title}<small>{it.sub}</small></span>
            </a>
          ))}
          {links.length > 0 && <h4>Learn more</h4>}
          {links.map((l, i) => (
            <a key={i} className="pv-it" href={l.href} rel="noopener"><span className="n"><ILink /></span><span className="grow">{l.title}</span></a>
          ))}
        </div>
      </aside>
    </main>
  );
}
