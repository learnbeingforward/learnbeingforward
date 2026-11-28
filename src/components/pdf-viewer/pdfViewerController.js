/* Learn Being Forward — full-page PDF viewer controller.
   Used by the design page (assets/pdfviewer.js) and by the React component (PdfViewer.jsx).
   createPdfViewer(root, opt) → { destroy() }

   opt.count        number of pages
   opt.sizes        optional [{w,h}] per page at 100% in CSS px (default 820 × 1160, A4)
   opt.render(el, n, zoom)  draws page n (1-based) into el (the .in box, size w × h at 100%).
                    Called when the page comes near the screen, and again after zooming stops.
   opt.watermark    text repeated diagonally on every page
   opt.footer       (sample pages only)
*/
export function createPdfViewer(root, opt) {
  const STEPS = [0.33, 0.4, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];
  const MIN = 0.3, MAX = 3, DEF = { w: 820, h: 1160 };
  const $ = s => root.querySelector(s);
  const ac = new AbortController(), on = (t, ev, fn, o) => t.addEventListener(ev, fn, { signal: ac.signal, ...(o || {}) });
  const pv = $('.pv'), sc = $('.pv-scroll'), wrap = $('.pv-pages');
  const pgIn = $('#pvPg'), tot = $('#pvTot'), up = $('#pvUp'), dn = $('#pvDn');
  const zIn = $('#pvZin'), zOut = $('#pvZout'), fitB = $('#pvFit'), badge = $('.pv-zoom'), fsB = $('#pvFs');
  const N = opt.count, size0 = i => (opt.sizes && opt.sizes[i]) || DEF, maxW = Math.max(...Array.from({ length: N }, (_, i) => size0(i).w));
  let z = 1, fit = 1, userZoomed = false, cur = 1, badgeT, redrawT;
  tot.textContent = N;
  document.documentElement.classList.add('pv-mode');

  // ---- pages: skeleton first, drawn when near the screen ----
  const wm = '<div class="pv-wm" aria-hidden="true">' + Array(30).fill('<span>' + esc(opt.watermark || '') + '</span>').join('') + '</div>';
  wrap.innerHTML = '';
  const els = Array.from({ length: N }, (_, i) => {
    const d = document.createElement('div');
    d.className = 'pv-page'; d.dataset.p = i + 1; d.setAttribute('role', 'img'); d.setAttribute('aria-label', 'Page ' + (i + 1) + ' of ' + N);
    d.innerHTML = '<div class="pv-skel"></div>';
    wrap.appendChild(d); size(d); return d;
  });
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
  function draw(el) {
    if (el.dataset.drawn) return; el.dataset.drawn = 1; el.dataset.z = z;
    const i = +el.dataset.p - 1, s = size0(i);
    el.innerHTML = '<div class="in" style="width:' + s.w + 'px;height:' + s.h + 'px"><div class="pv-draw"></div>' + wm + '</div>';
    size(el);
    Promise.resolve(opt.render(el.querySelector('.pv-draw'), i + 1, z)).catch(() => { el.querySelector('.pv-draw').innerHTML = '<p class="pv-err">This page could not be loaded. Scroll away and back to try again.</p>'; delete el.dataset.drawn; });
  }
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && draw(e.target)), { root: sc, rootMargin: '900px 0px' });
  els.forEach(e => io.observe(e));

  function size(el) {
    const s = size0(+el.dataset.p - 1);
    el.style.width = s.w * z + 'px'; el.style.height = s.h * z + 'px';
    const i = el.querySelector('.in'); if (i) i.style.transform = 'scale(' + z + ')';
  }
  // After zooming stops, re-draw visible pages at the new zoom so text stays sharp (PDF canvas).
  function redrawSoon() {
    clearTimeout(redrawT);
    redrawT = setTimeout(() => {
      const top = sc.scrollTop - 900, bot = sc.scrollTop + sc.clientHeight + 900;
      els.forEach((el, i) => { if (el.dataset.drawn && +el.dataset.z !== z && el.offsetTop < bot && el.offsetTop + el.offsetHeight > top) { el.dataset.z = z; Promise.resolve(opt.render(el.querySelector('.pv-draw'), i + 1, z)).catch(() => {}); } });
    }, 180);
  }
  function calcFit() { const pad = innerWidth <= 900 ? 20 : 48; return Math.max(MIN, Math.min(1.1, (sc.clientWidth - pad) / maxW)); }

  // ---- zoom, keeping the point under the pointer (or the centre) still ----
  function setZoom(nz, ax, ay, quiet) {
    nz = Math.max(MIN, Math.min(MAX, Math.round(nz * 100) / 100));
    if (ax == null) { ax = sc.clientWidth / 2; ay = sc.clientHeight / 2; }
    const at = pageAt(sc.scrollTop + ay) || els[0];
    const fy = (sc.scrollTop + ay - at.offsetTop) / at.offsetHeight;
    const fx = (sc.scrollLeft + ax - at.offsetLeft) / at.offsetWidth;
    z = nz; els.forEach(size);
    sc.scrollTop = at.offsetTop + fy * at.offsetHeight - ay;
    sc.scrollLeft = at.offsetLeft + fx * at.offsetWidth - ax;
    sc.classList.toggle('can-pan', wrap.scrollWidth > sc.clientWidth + 2);
    zIn.disabled = z >= MAX; zOut.disabled = z <= MIN;
    fitB.setAttribute('aria-pressed', String(Math.abs(z - fit) < 0.01));
    if (!quiet) { badge.textContent = Math.round(z * 100) + '%' + (Math.abs(z - fit) < 0.01 ? ' · Fit to width' : ''); badge.classList.add('on'); clearTimeout(badgeT); badgeT = setTimeout(() => badge.classList.remove('on'), 900); }
    redrawSoon();
  }
  const step = dir => { const n = dir > 0 ? STEPS.find(s => s > z + 0.001) : [...STEPS].reverse().find(s => s < z - 0.001); userZoomed = true; setZoom(n ?? (dir > 0 ? MAX : MIN)); };
  const toFit = () => { userZoomed = false; fit = calcFit(); setZoom(fit); };
  on(zIn, 'click', () => step(1)); on(zOut, 'click', () => step(-1)); on(fitB, 'click', toFit);

  // Ctrl/⌘ + wheel, or trackpad pinch
  on(sc, 'wheel', e => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); userZoomed = true; const r = sc.getBoundingClientRect(); setZoom(z * Math.exp(-e.deltaY * 0.0022), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  // two-finger pinch on phones
  let pinch = null;
  on(sc, 'touchstart', e => { if (e.touches.length === 2) { const [a, b] = e.touches; pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z }; } }, { passive: true });
  on(sc, 'touchmove', e => { if (pinch && e.touches.length === 2) { e.preventDefault(); const [a, b] = e.touches, r = sc.getBoundingClientRect(); userZoomed = true;
    setZoom(pinch.z * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinch.d, (a.clientX + b.clientX) / 2 - r.left, (a.clientY + b.clientY) / 2 - r.top, true); } }, { passive: false });
  on(sc, 'touchend', () => { pinch = null; });
  // double-click / double-tap: fit ↔ 175 %
  on(sc, 'dblclick', e => { if (!e.target.closest('.pv-page')) return; const r = sc.getBoundingClientRect(); const atFit = Math.abs(z - fit) < 0.01; userZoomed = atFit; setZoom(atFit ? Math.max(1.75, fit * 1.6) : fit, e.clientX - r.left, e.clientY - r.top); });

  // drag to pan when the page is wider than the screen (no scrollbars are shown)
  let drag = null;
  on(sc, 'mousedown', e => { if (e.button || !sc.classList.contains('can-pan')) return; drag = { x: e.clientX, y: e.clientY, l: sc.scrollLeft, t: sc.scrollTop }; sc.classList.add('panning'); e.preventDefault(); });
  on(window, 'mousemove', e => { if (!drag) return; sc.scrollLeft = drag.l - (e.clientX - drag.x); sc.scrollTop = drag.t - (e.clientY - drag.y); });
  on(window, 'mouseup', () => { drag = null; sc.classList.remove('panning'); });

  // ---- current page + rail ----
  function pageAt(y) { return els.find(el => el.offsetTop + el.offsetHeight + 8 > y); }
  function track() {
    const top = sc.scrollTop, h = sc.clientHeight; let best = 1, vis = -1;
    els.forEach((el, i) => { const v = Math.min(top + h, el.offsetTop + el.offsetHeight) - Math.max(top, el.offsetTop); if (v > vis) { vis = v; best = i + 1; } });
    cur = best; if (document.activeElement !== pgIn) pgIn.value = cur;
    up.disabled = cur <= 1; dn.disabled = cur >= N;
  }
  let raf; on(sc, 'scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(track); });
  const go = n => { n = Math.max(1, Math.min(N, n)); const el = els[n - 1]; draw(el); sc.scrollTo({ top: el.offsetTop - (innerWidth <= 900 ? 10 : 16), behavior: 'smooth' }); };
  on(up, 'click', () => go(cur - 1)); on(dn, 'click', () => go(cur + 1));
  on(pgIn, 'keydown', e => { if (e.key === 'Enter') { go(parseInt(pgIn.value, 10) || cur); pgIn.blur(); } });
  on(pgIn, 'focus', () => pgIn.select());
  on(pgIn, 'blur', () => { pgIn.value = cur; });

  // ---- full screen (Fullscreen API; falls back to covering the window) ----
  const ICON_FS = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  const ICON_EXIT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  const setFull = f => {
    pv.classList.toggle('full', f); document.documentElement.classList.toggle('is-full', f);
    fsB.setAttribute('aria-pressed', String(f)); fsB.setAttribute('aria-label', f ? 'Exit full screen' : 'Full screen'); fsB.title = f ? 'Exit full screen (Esc)' : 'Full screen (F)'; fsB.innerHTML = f ? ICON_EXIT : ICON_FS;
    setTimeout(() => { if (!userZoomed) toFit(); else setZoom(z, null, null, true); track(); }, 60);
  };
  on(fsB, 'click', async () => {
    const f = !pv.classList.contains('full');
    try { if (f && pv.requestFullscreen) await pv.requestFullscreen(); else if (!f && document.fullscreenElement) await document.exitFullscreen(); } catch (_) { /* blocked: cover the window instead */ }
    setFull(f);
  });
  on(document, 'fullscreenchange', () => { if (!document.fullscreenElement && pv.classList.contains('full')) setFull(false); });
  fsB.innerHTML = ICON_FS;

  // ---- contents panel ----
  const panel = $('.pv-panel'), scrim = $('.pv-scrim'), tB = $('#pvToc');
  const setPanel = o => { panel.classList.toggle('open', o); scrim.classList.toggle('on', o); tB.setAttribute('aria-expanded', String(o)); panel.inert = !o; if (o) { const f = panel.querySelector('button,a'); f && f.focus(); } };
  on(tB, 'click', () => setPanel(!panel.classList.contains('open')));
  on(scrim, 'click', () => setPanel(false)); on($('#pvTocX'), 'click', () => setPanel(false)); panel.inert = true;

  // ---- keyboard ----
  on(window, 'keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && ['s', 'p', 'c'].includes(k)) { e.preventDefault(); return; }
    if (mod && (k === '=' || k === '+')) { e.preventDefault(); step(1); return; }
    if (mod && k === '-') { e.preventDefault(); step(-1); return; }
    if (mod && k === '0') { e.preventDefault(); toFit(); return; }
    if (typing) return;
    if (k === 'escape') { if (panel.classList.contains('open')) setPanel(false); else if (pv.classList.contains('full') && !document.fullscreenElement) setFull(false); }
    if (k === 'f') fsB.click();
    if (k === 'home') go(1);
    if (k === 'end') go(N);
  });
  // protection: no right-click, no drag, no copy
  on(pv, 'contextmenu', e => e.preventDefault());
  on(pv, 'dragstart', e => e.preventDefault());
  on(pv, 'copy', e => e.preventDefault());

  // ---- first open: page 1, fit to width ----
  on(window, 'resize', () => { if (!userZoomed) { fit = calcFit(); setZoom(fit, null, null, true); } track(); });
  fit = calcFit(); setZoom(fit, null, null, true); track();
  sc.focus({ preventScroll: true });

  return {
    destroy() {
      ac.abort(); io.disconnect(); clearTimeout(badgeT); clearTimeout(redrawT); cancelAnimationFrame(raf);
      document.documentElement.classList.remove('pv-mode', 'is-full');
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    },
    goTo: go,
  };
}
