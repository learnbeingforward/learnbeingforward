/* Shared header / footer / icon sprite for every design page.
   Public pages:  <body data-layout="public" data-active="courses">  + <div id="topbar"></div> inside .band
   Portal pages:  <body data-layout="app" data-role="super-admin" data-active="colleges"> + <div id="topbar"></div> inside .app-band
   In the real build this becomes a React <PublicHeader/>, <AppShell role=... /> etc. */
(function () {
  const ICONS = {
    grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20z"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    wand: '<path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2L19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2L11 5"/>',
    cap: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.5.7 4 2.8 4 6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    building: '<path d="M3 21h18M5 21V5l7-3 7 3v16M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4"/>',
    book: '<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
    layers: '<path d="M12 2l10 5-10 5L2 7z"/><path d="M2 12l10 5 10-5M2 17l10 5 10-5"/>',
    clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 11h6M9 15h6"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 15H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 5V5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 .3 1.8"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    chevR: '<path d="M9 6l6 6-6 6"/>',
    chevD: '<path d="M6 9l6 6 6-6"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    logout: '<path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H3"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    message: '<path d="M4 5h16v11H8l-4 4z"/>',
    money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
    star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/>',
    mapPin: '<path d="M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>'
  };
  const sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' +
    Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join('') + '</svg>';
  document.body.insertAdjacentHTML('afterbegin', sprite);
  window.icon = (n, s = 18) => `<svg width="${s}" height="${s}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  const base = document.body.dataset.base || '../';
  const brand = `<a class="brand" href="${base}public/home.html">${icon('cap', 26)}<span class="wm">Learn Being <span>Forward</span></span></a>`;
  const active = document.body.dataset.active || '';
  const topbar = document.getElementById('topbar');

  if (document.body.dataset.layout === 'public' && topbar) {
    const links = [['home', 'Home'], ['courses', 'Courses'], ['technologies', 'Technologies'], ['about', 'About'], ['team', 'Team'], ['contact', 'Contact'], ['buy', 'Buy']];
    topbar.outerHTML = brand +
      `<nav class="nav" aria-label="Main">${links.map(([k, l]) => `<a href="${base}public/${k}.html" class="${k === active ? 'active' : ''}">${l}</a>`).join('')}</nav>` +
      `<div class="nav-actions"><a class="btn btn-ghost-light btn-sm" href="${base}auth/login.html">Login</a><a class="btn btn-gold btn-sm" href="${base}auth/signup.html">Sign Up</a></div>` +
      `<button class="m-burger" type="button" aria-label="Open menu" aria-expanded="false" data-mopen>${icon('menu', 22)}</button>`;
    document.body.insertAdjacentHTML('beforeend', `<div class="m-scrim" data-mclose hidden></div><aside class="m-drawer" aria-label="Menu" hidden>
      <div class="m-dhead">${brand}<button class="m-x" type="button" aria-label="Close menu" data-mclose>${icon('x', 20)}</button></div>
      <nav class="m-links">${links.map(([k, l]) => `<a href="${base}public/${k}.html" class="${k === active ? 'active' : ''}">${l}${icon('chevR', 16)}</a>`).join('')}<a href="${base}public/coding-patterns.html">Coding Patterns${icon('chevR', 16)}</a></nav>
      <div class="m-dfoot"><a class="btn btn-gold" href="${base}auth/signup.html">Sign Up</a><a class="btn" href="${base}auth/login.html">Login</a><p class="small muted" style="margin-top:8px">+91 99729 34418 · support@learnbeingforward.in</p></div></aside>`);
    document.body.insertAdjacentHTML('beforeend', `
      <footer class="site-footer"><div class="container">
        <div class="cols">
          <div>${brand}<p style="margin-top:12px;max-width:280px">Placement-focused technical training for schools, colleges and corporate freshers.</p></div>
          <div><h4>Explore</h4><ul><li><a href="${base}public/courses.html">Courses</a></li><li><a href="${base}public/technologies.html">Technologies</a></li><li><a href="${base}public/team.html">Trainers</a></li><li><a href="${base}public/coding-patterns.html">Coding Patterns</a></li><li><a href="${base}public/buy.html">Buy books</a></li></ul></div>
          <div><h4>Company</h4><ul><li><a href="${base}public/about.html">About</a></li><li><a href="${base}public/contact.html">Partner with us</a></li><li><a href="${base}auth/login.html">Login</a></li></ul></div>
          <div><h4>Contact</h4><ul><li><a href="tel:+919972934418">+91 99729 34418</a></li><li><a href="mailto:support@learnbeingforward.in">support@learnbeingforward.in</a></li></ul></div>
        </div>
        <div class="bottom"><span>© 2026 Learn Being Forward</span><span>Privacy · Terms</span></div>
      </div></footer>`);
  }

  if (document.body.dataset.layout === 'app' && topbar) {
    const role = document.body.dataset.role;
    const NAV = window.LBF_NAV || {};
    const cfg = NAV[role] || { label: role, user: ['User', ''], groups: [] };
    const pageKey = (window.LBF_PARENT || {})[active] || active;
    const grp = cfg.groups.find(g => g.pages.some(p => p[0] === pageKey)) || cfg.groups[0] || { pages: [] };
    cfg.items = cfg.groups.map(g => [g.key, g.label, g.icon, g.pages[0][2]]);
    const activeGroup = grp.key;
    topbar.outerHTML =
      `<div class="app-top">${brand}
        <div style="display:flex;align-items:center;gap:10px">
          <span class="role-pill">${cfg.label}</span>
          <button class="icon-btn-light" type="button" aria-label="Notifications">${icon('bell')}<span class="badge"></span></button>
          <div class="user-chip"><span class="avatar">${cfg.user[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span><span class="who">${cfg.user[0]}<small>${cfg.user[1]}</small></span></div>
          <a class="icon-btn-light" href="${base}auth/login.html" aria-label="Log out">${icon('logout')}</a>
        </div></div>
      <nav class="app-nav" aria-label="${cfg.label} menu">${cfg.items.map(([k, l, ic, href]) => `<a href="${href}" class="${k === activeGroup ? 'active' : ''}">${icon(ic, 16)}${l}</a>`).join('')}</nav>` +
      (grp.pages.length > 1 ? `<nav class="sub-nav" aria-label="${grp.label} pages">${grp.pages.map(([k, l, href]) => `<a href="${href}" class="${k === pageKey ? 'active' : ''}">${l}</a>`).join('')}</nav>` : '');
    document.body.insertAdjacentHTML('beforeend', `<p class="app-footer">Powered by Learn Being Forward</p>`);
    /* phone layout: compact top bar, bottom tabs (first 4 sections + More), drawer with every page */
    const top = document.querySelector('.app-top');
    if (top) top.insertAdjacentHTML('afterbegin', `<button class="m-burger" type="button" aria-label="Open menu" aria-expanded="false" data-mopen>${icon('menu', 22)}</button>`);
    let tabs = cfg.groups.slice(0, 4);
    if (!tabs.some(g => g.key === activeGroup) && grp.key) tabs = tabs.slice(0, 3).concat([grp]);
    const inTabs = tabs.some(g => g.key === activeGroup);
    document.body.insertAdjacentHTML('beforeend', `<nav class="m-tabs" aria-label="${cfg.label} quick menu">${tabs.map(g => `<a href="${g.pages[0][2]}" class="${g.key === activeGroup ? 'active' : ''}">${icon(g.icon, 20)}<span>${g.label.replace('Registrations & Approvals', 'Approvals').replace('Personal Details', 'Details').replace('Query from Student', 'Queries')}</span></a>`).join('')}<button type="button" class="${inTabs ? '' : 'active'}" data-mopen>${icon('grid', 20)}<span>More</span></button></nav>
      <div class="m-scrim" data-mclose hidden></div><aside class="m-drawer" aria-label="${cfg.label} menu" hidden>
      <div class="m-dhead"><div class="user-chip"><span class="avatar">${cfg.user[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span><span class="who">${cfg.user[0]}<small>${cfg.user[1]}</small></span></div><button class="m-x" type="button" aria-label="Close menu" data-mclose>${icon('x', 20)}</button></div>
      <span class="role-pill" style="align-self:flex-start;margin:0 0 6px">${cfg.label}</span>
      <nav class="m-groups">${cfg.groups.map(g => `<details ${g.key === activeGroup ? 'open' : ''}><summary class="${g.key === activeGroup ? 'active' : ''}">${icon(g.icon, 18)}<span>${g.label}</span>${g.pages.length > 1 ? icon('chevD', 16) : ''}</summary>${g.pages.length > 1 ? `<div>${g.pages.map(([k, l, href]) => `<a href="${href}" class="${k === pageKey ? 'active' : ''}">${l}</a>`).join('')}</div>` : ''}</details>`).join('')}</nav>
      <div class="m-dfoot"><a class="btn" href="${base}auth/login.html">${icon('logout')}Log out</a></div></aside>`);
    document.querySelectorAll('.m-groups details').forEach(d => { const g = cfg.groups.find(x => x.label === d.querySelector('summary span').textContent); if (g && g.pages.length === 1) d.querySelector('summary').addEventListener('click', e => { e.preventDefault(); location.href = g.pages[0][2]; }); });
  }
  /* phones: every table becomes stacked cards, so nothing scrolls sideways */
  window.cardTables = (root) => (root || document).querySelectorAll('table').forEach(t => {
    const hs = [...t.querySelectorAll('thead th')].map(th => th.textContent.trim());
    if (!hs.length) return; t.classList.add('m-cards');
    t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td, i) => { if (!td.hasAttribute('data-label')) td.setAttribute('data-label', hs[i] || ''); }));
  });
  window.cardTables();
  new MutationObserver(() => window.cardTables()).observe(document.body, { childList: true, subtree: true });
  /* drawer open / close (both layouts) */
  const drawer = () => document.querySelector('.m-drawer'), scrim = () => document.querySelector('.m-scrim');
  function setDrawer(open) { const d = drawer(), sc = scrim(); if (!d) return; d.hidden = sc.hidden = !open; document.body.classList.toggle('m-lock', open); document.querySelectorAll('[data-mopen]').forEach(b => b.setAttribute('aria-expanded', String(open))); if (open) { const f = d.querySelector('a,button'); f && f.focus(); } }
  document.addEventListener('click', e => { if (e.target.closest('[data-mopen]')) setDrawer(true); else if (e.target.closest('[data-mclose]')) setDrawer(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });

  /* Eye button on every password field: press to show, press again to hide */
  const EYE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7c2 0 3.8.7 5.3 1.7M22 12s-4 7-10 7c-2 0-3.8-.7-5.3-1.7"/><path d="M3 3l18 18"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
  window.enhancePasswords = (root) => (root || document).querySelectorAll('input[type=password]:not([data-pw])').forEach(inp => {
    inp.dataset.pw = '1';
    const wrap = document.createElement('span'); wrap.className = 'pw-wrap';
    inp.parentNode.insertBefore(wrap, inp); wrap.appendChild(inp);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pw-eye';
    b.setAttribute('aria-label', 'Show password'); b.setAttribute('aria-pressed', 'false'); b.innerHTML = EYE;
    b.addEventListener('click', () => { const show = inp.type === 'password'; inp.type = show ? 'text' : 'password';
      b.setAttribute('aria-pressed', String(show)); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); b.innerHTML = show ? EYE_OFF : EYE; });
    wrap.appendChild(b);
  });
  window.enhancePasswords();
})();
