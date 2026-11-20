/* Course Studio — create courses, modules, sub-modules and deeper topics,
   attach PDFs and learn-more links, decide when each module reaches each batch,
   and switch a course onto the public website or the Buy page.
   Prototype state lives in localStorage ('lbf-studio'); the Buy manager reads it. */
(function () {
  const KEY = 'lbf-studio';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const I = (n, z = 16) => `<svg width="${z}" height="${z}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  let uid = Date.now() % 1e6;
  const nid = () => 'n' + (uid++).toString(36);
  const slug = s => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const LEVEL = ['Module', 'Sub-module', 'Topic', 'Sub-topic', 'Item'];

  /* ---------- seed (mirrors what is live today) ---------- */
  function node(title, kids = [], o = {}) { return Object.assign({ id: nid(), title, pdf: '', links: [], children: kids }, o); }
  function sub(module, t, links) { return node(t, [], { pdf: `${slug(module)}-${slug(t)}.pdf`, links: links || [] }); }
  function seed() {
    const L = (a, b) => ({ t: a, u: b });
    const jf = 'Java Fundamentals', ji = 'Java Intermediate', ja = 'Java Advanced', df = 'DSA Fundamentals', da = 'DSA Advanced';
    const java = [
      node(jf, [sub(jf, 'Syntax & data types', [L('Oracle Java Tutorials — Primitive data types', 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html'), L('GeeksforGeeks — Java string pool', 'https://www.geeksforgeeks.org/')]),
        sub(jf, 'Control flow', [L('Oracle Java Tutorials — Control flow statements', 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html')]),
        sub(jf, 'Arrays & strings', [L('Oracle Java Tutorials — Arrays', 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html'), L('Java SE docs — StringBuilder', 'https://docs.oracle.com/')]),
        sub(jf, 'OOP basics', [L('Oracle Java Tutorials — Classes and objects', 'https://docs.oracle.com/javase/tutorial/java/javaOO/')]),
        sub(jf, 'Exception handling', [L('Oracle Java Tutorials — Exceptions', 'https://docs.oracle.com/javase/tutorial/essential/exceptions/')])], { book: 'Java Fundamentals — Complete Course Notes.pdf', bookGated: true }),
      node(ji, ['Collections framework', 'Generics', 'File I/O', 'Streams & lambdas', 'Multithreading basics'].map(t => sub(ji, t)), { book: '', bookGated: true }),
      node(ja, ['JVM internals', 'Concurrency utilities', 'Design patterns', 'JDBC'].map(t => sub(ja, t)), { bookGated: true }),
      node(df, ['Complexity analysis', 'Arrays & two pointers', 'Linked lists', 'Stacks & queues', 'Recursion'].map(t => sub(df, t)), { bookGated: true }),
      node(da, [sub(da, 'Trees & BST'), node('Graphs', [node('BFS', [], { pdf: 'graphs-bfs.pdf' }), node('DFS', [], { pdf: 'graphs-dfs.pdf' }), node('Shortest paths', [node('Dijkstra'), node('Bellman-Ford')])], { pdf: 'dsa-advanced-graphs.pdf' }), sub(da, 'Dynamic programming'), sub(da, 'Greedy'), sub(da, 'Tries & segment trees')], { bookGated: true })
    ];
    const generic = (name, mods) => mods.map(m => node(m, [node('Introduction'), node('Practice set')], { bookGated: true }));
    const C = (name, domain, items, mods, o = {}) => Object.assign({ id: 'c-' + slug(name), name, domain, desc: '', status: 'live', onSite: true, onBuy: false, price: '', itemsLive: items, nodes: mods, release: {} }, o);
    const cp = ['Programming Basics', 'Arrays and Strings', 'Searching and Sorting', 'Hashing', 'Linked Lists', 'Stacks and Queues', 'Recursion and Backtracking', 'Trees', 'Heaps', 'Graphs', 'Greedy', 'Dynamic Programming', 'Bit Manipulation', 'Advanced Patterns'];
    return {
      sel: 'c-java-and-dsa', view: 'structure', open: {}, cur: null,
      courses: [
        C('Backend Development', 'Technical', 14, generic('', ['Server frameworks', 'REST APIs', 'Databases', 'Authentication'])),
        C('Coding Patterns', 'Technical', 114, cp.map(m => node(m, [node('Pattern notes'), node('Interactive pattern visualiser')], { book: m + ' — Complete Course Notes.pdf', bookGated: true })), { onBuy: true, price: '499', desc: '100 data-structure & algorithm patterns, worked through step by step.' }),
        C('Data Science / AI Fundamentals', 'Technical', 14, generic('', ['Python for data', 'Statistics', 'Machine learning basics'])),
        C('Frontend Development', 'Technical', 15, generic('', ['HTML & CSS', 'JavaScript', 'React']), { onBuy: true, price: '399' }),
        C('Full-Stack Development', 'Technical', 18, generic('', ['Frontend', 'Backend', 'Deployment'])),
        C('Java & DSA', 'Technical', 24, java, { desc: 'Core Java to advanced data structures and algorithms, with placement coding practice.' }),
        C('Logical Reasoning', 'Aptitude', 15, generic('', ['Series', 'Coding–decoding', 'Blood relations'])),
        C('Non-Verbal Reasoning', 'Aptitude', 15, generic('', ['Figure series', 'Mirror images', 'Paper folding'])),
        C('Programming', 'Technical', 35, generic('', ['C', 'C++', 'Python', 'Java']), { onBuy: true, price: '399' }),
        C('Quantitative Aptitude', 'Aptitude', 15, generic('', ['Number system', 'Percentages', 'Time & work'])),
        C('Robotics', 'Technical', 3, generic('', ['Electronics basics', 'Arduino']), { onBuy: true, price: '399' }),
        C('Soft Skills', 'Soft Skills', 15, generic('', ['Communication', 'Interview skills', 'Group discussion'])),
        C('Verbal Reasoning', 'Aptitude', 15, generic('', ['Reading comprehension', 'Grammar', 'Vocabulary']))
      ]
    };
  }
  const BATCHES = {
    'c-java-and-dsa': [{ id: 'b1', name: 'CCE · JAVA-SEM5-B1', info: 'Crestview College of Engineering · 42 students · session 6 of 10 · ends 12 Dec 2026', sessions: 10, done: 6, end: '2026-12-12' },
      { id: 'b2', name: 'CCE · JAVA-SEM7-B1', info: 'Crestview College of Engineering · 120 students · starts 01 Dec 2026', sessions: 10, done: 0, end: '2026-12-12' }],
    'c-backend-development': [{ id: 'b3', name: 'Sunrise · BE-SEM5-B1', info: 'Sunrise Engineering College · 38 students · session 4 of 8', sessions: 8, done: 4, end: '2026-11-28' }]
  };
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
  if (!S || !S.courses) S = seed();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };

  /* ---------- tree helpers ---------- */
  const course = () => S.courses.find(c => c.id === S.sel) || S.courses[0];
  function walk(list, fn, depth = 0, parent = null) { list.forEach((n, i) => { fn(n, depth, parent, i, list); walk(n.children, fn, depth + 1, n); }); }
  function find(id, list = course().nodes) { let r = null; walk(list, (n, d, p, i, arr) => { if (n.id === id) r = { n, d, p, i, arr }; }); return r; }
  function count(list) { let c = 0, pdf = 0; walk(list, n => { c++; if (n.pdf) pdf++; }); return { c, pdf }; }
  function toast(t) { document.querySelectorAll('.toast').forEach(x => x.remove()); const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = I('check') + esc(t); document.body.appendChild(el); setTimeout(() => el.remove(), 2600); }
  function modal(html, ready) {
    const ov = document.createElement('div'); ov.className = 'ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = `<div class="ov-card" style="max-width:680px">${html}</div>`; document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-x]')) ov.remove(); });
    const f = ov.querySelector('input,textarea,select'); if (f) f.focus(); ready && ready(ov); return ov;
  }

  /* ---------- render ---------- */
  const root = () => $('#studio');
  function render() {
    const c = course();
    const q = (S.q || '').toLowerCase();
    const list = S.courses.filter(x => !q || x.name.toLowerCase().includes(q));
    root().innerHTML = `<div class="st-wrap">
<aside class="card st-courses" aria-label="Courses">
<div class="split" style="margin-bottom:12px"><h2 class="h3">Courses <span class="muted" style="font-weight:500">(${S.courses.length})</span></h2><button class="btn btn-gold btn-sm" type="button" data-act="new-course">${I('plus')}New</button></div>
<label class="input-group" style="margin-bottom:10px">${I('search')}<input class="input" placeholder="Search courses" data-q value="${esc(S.q || '')}" aria-label="Search courses"></label>
<ul class="st-clist">${list.map(x => { const k = count(x.nodes); return `<li><button type="button" class="${x.id === c.id ? 'on' : ''}" data-course="${x.id}"><span class="dot ${x.status}"></span><span class="grow"><b>${esc(x.name)}</b><small>${x.nodes.length} modules · ${k.c} items${x.onBuy ? ' · on Buy' : ''}</small></span></button></li>`; }).join('')}</ul>
</aside>
<section class="st-main">
<div class="card st-head"><div class="split" style="flex-wrap:wrap;gap:12px"><div><div class="label">${esc(c.domain)} · ${c.status === 'live' ? 'Live' : 'Draft'}</div><h2 class="h2" style="margin-top:4px">${esc(c.name)}</h2>
<div class="st-badges">${c.onSite ? `<span class="pill success">${I('globe', 12)} On website</span>` : '<span class="pill">Not on website</span>'}${c.onBuy ? `<span class="pill gold">${I('cart', 12)} On Buy · ₹${esc(c.price)}</span>` : ''}<span class="pill">${count(c.nodes).pdf} PDFs</span></div></div>
<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-sm" type="button" data-act="outline">${I('wand')}Build from outline</button><button class="btn btn-sm" type="button" data-act="bulk">${I('upload')}Bulk upload PDFs</button><a class="btn btn-sm" href="../student/content.html">${I('eye')}Student view</a></div></div>
<div class="tabs" role="tablist" style="margin-top:16px">${[['structure', 'Structure'], ['release', 'Share with batches'], ['settings', 'Course settings']].map(([k, l]) => `<button class="tab ${S.view === k ? 'active' : ''}" role="tab" aria-selected="${S.view === k}" type="button" data-view="${k}">${l}</button>`).join('')}</div></div>
${S.view === 'structure' ? structure(c) : S.view === 'release' ? release(c) : settings(c)}
</section></div>`;
    bindDrag();
  }

  function structure(c) {
    const rows = [];
    function row(n, d) {
      const open = S.open[n.id] !== false, kids = n.children.length;
      rows.push(`<li class="st-node${S.cur === n.id ? ' cur' : ''}" style="--d:${d}" draggable="true" data-node="${n.id}">
<span class="st-grip" title="Drag to reorder">${I('grip')}</span>
<button class="st-tog" type="button" data-tog="${n.id}" aria-label="${open ? 'Collapse' : 'Expand'}" ${kids ? '' : 'style="visibility:hidden"'}>${I(open ? 'chevD' : 'chevR', 14)}</button>
<span class="st-lvl l${Math.min(d, 3)}">${LEVEL[Math.min(d, 4)]}</span>
<input class="st-title" value="${esc(n.title)}" data-title="${n.id}" aria-label="${LEVEL[Math.min(d, 4)]} name">
${n.pdf ? `<span class="st-chip ok" title="${esc(n.pdf)}">${I('file', 12)}PDF</span>` : `<label class="st-chip add">${I('upload', 12)}PDF<input type="file" accept="application/pdf" data-pdf="${n.id}" hidden></label>`}
${n.links.length ? `<span class="st-chip">${I('link', 12)}${n.links.length}</span>` : ''}
${d === 0 && n.book ? `<span class="st-chip gold" title="${esc(n.book)}">${I('book', 12)}Book</span>` : ''}
${kids ? `<span class="small muted">${kids}</span>` : ''}
<span class="st-acts"><button class="btn-icon" type="button" data-add="${n.id}" title="Add ${LEVEL[Math.min(d + 1, 4)].toLowerCase()} inside">${I('plus')}</button><button class="btn-icon" type="button" data-pick="${n.id}" title="Details">${I('edit')}</button><button class="btn-icon danger" type="button" data-del="${n.id}" title="Delete">${I('trash')}</button></span></li>`);
      if (open) n.children.forEach(k => row(k, d + 1));
    }
    c.nodes.forEach(n => row(n, 0));
    const cur = S.cur && find(S.cur);
    return `<div class="st-body"><div class="card"><div class="split" style="margin-bottom:12px"><div><h3 class="h3">Structure</h3><p class="small muted">Course → Module → Sub-module → Topic, as deep as you need. Drag to reorder, click a name to rename.</p></div>
<div style="display:flex;gap:6px"><button class="btn btn-sm" type="button" data-act="expand">Expand all</button><button class="btn btn-sm" type="button" data-act="collapse">Collapse all</button></div></div>
${c.nodes.length ? `<ul class="st-tree">${rows.join('')}</ul>` : `<div class="empty"><div class="h3" style="color:var(--text)">No modules yet</div><p class="small muted" style="margin-top:6px">Add a module, or paste your syllabus with “Build from outline”.</p></div>`}
<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn btn-primary" type="button" data-act="add-module">${I('plus')}Add module</button><button class="btn" type="button" data-act="outline">${I('wand')}Paste a syllabus outline</button></div></div>
<aside class="card st-detail">${cur ? detail(cur) : `<div class="empty" style="border:0"><span class="icon-box gold" style="margin:0 auto 10px">${I('edit')}</span><div class="h3" style="color:var(--text)">Select an item</div><p class="small muted" style="margin-top:6px">Press ${I('edit', 12)} on any row to attach its PDF, learn-more links and the module’s course book.</p></div>`}</aside></div>`;
  }
  function detail({ n, d }) {
    return `<div class="label">${LEVEL[Math.min(d, 4)]}</div><h3 class="h3" style="margin:4px 0 14px">${esc(n.title)}</h3>
<div class="stack" style="gap:14px">
<div class="field"><span>Content PDF</span>${n.pdf ? `<div class="st-file">${I('file')}<span class="grow">${esc(n.pdf)}</span><label class="btn btn-sm">Replace<input type="file" accept="application/pdf" data-pdf="${n.id}" hidden></label><button class="btn btn-sm btn-danger" type="button" data-rmpdf="${n.id}">Remove</button></div>` : `<label class="st-drop">${I('upload')}<span>Upload a PDF</span><input type="file" accept="application/pdf" data-pdf="${n.id}" hidden></label>`}</div>
<div class="field"><span>Learn-more links <span class="muted" style="font-weight:400">(optional)</span></span>
${n.links.map((l, i) => `<div class="st-link">${I('link', 14)}<span class="grow"><b>${esc(l.t)}</b><small>${esc(l.u)}</small></span><button class="btn-icon danger" type="button" data-rmlink="${n.id}:${i}" aria-label="Remove link">${I('x', 14)}</button></div>`).join('')}
<div class="st-linkadd"><input class="input" placeholder="Title, e.g. Oracle Java Tutorials — Arrays" data-lt><input class="input" placeholder="https://…" data-lu><button class="btn btn-sm" type="button" data-addlink="${n.id}">${I('plus')}Add</button></div></div>
${d === 0 ? `<div class="field"><span>Course book PDF <span class="muted" style="font-weight:400">(whole-module book)</span></span>${n.book ? `<div class="st-file">${I('book')}<span class="grow">${esc(n.book)}</span><button class="btn btn-sm btn-danger" type="button" data-rmbook="${n.id}">Remove</button></div>` : `<label class="st-drop">${I('book')}<span>Attach the course book</span><input type="file" accept="application/pdf" data-book="${n.id}" hidden></label>`}
<label class="check" style="margin-top:8px"><input type="checkbox" data-gate="${n.id}" ${n.bookGated ? 'checked' : ''}> Students must request access to the book</label></div>` : ''}
<div class="split" style="border-top:1px solid var(--border);padding-top:12px;flex-wrap:wrap;gap:8px"><div style="display:flex;gap:6px"><button class="btn btn-sm" type="button" data-move="${n.id}:-1">${I('arrowL', 14)}Move up</button><button class="btn btn-sm" type="button" data-move="${n.id}:1">Move down${I('arrowR', 14)}</button></div><button class="btn btn-sm" type="button" data-add="${n.id}">${I('plus')}Add inside</button></div></div>`;
  }

  /* ---------- release ---------- */
  const WHEN = [['completion', 'After the training is completed'], ['now', 'Available now'], ['session', 'After a session number'], ['date', 'On a date'], ['request', 'Only when a student requests'], ['hidden', 'Hidden from this batch']];
  function rule(c, b, mid, isBook) { const r = ((c.release[b] || {})[mid]); return r || { when: isBook ? 'completion' : 'session', n: '', date: '' }; }
  function release(c) {
    const bs = BATCHES[c.id] || [];
    if (!bs.length) return `<div class="card"><div class="empty"><div class="h3" style="color:var(--text)">No batch is using ${esc(c.name)} yet</div><p class="small muted" style="margin-top:6px">When a batch is created for this course, you can choose here what its students see and when.</p></div></div>`;
    const bsel = S.batch && bs.find(b => b.id === S.batch) ? S.batch : bs[0].id; const b = bs.find(x => x.id === bsel);
    const rowsM = c.nodes.map((m, i) => {
      const r = rule(c, bsel, m.id), rb = rule(c, bsel, m.id + ':book', true);
      const sel = (key, r) => `<select class="select" data-rule="${key}" aria-label="When">${WHEN.map(([v, l]) => `<option value="${v}"${r.when === v ? ' selected' : ''}>${l}</option>`).join('')}</select>${r.when === 'session' ? `<input class="input st-n" type="number" min="1" max="${b.sessions}" placeholder="#" value="${esc(r.n || (i + 1) * 2)}" data-rn="${key}" aria-label="Session number">` : ''}${r.when === 'date' ? `<input class="input st-n" style="width:150px" type="date" value="${esc(r.date)}" data-rd="${key}" aria-label="Date">` : ''}`;
      return `<tr><td><b>${esc(m.title)}</b><div class="small muted">${m.children.length} sub-modules</div></td><td><div class="st-rule">${sel(m.id, r)}</div></td><td>${m.book ? `<div class="st-rule">${sel(m.id + ':book', rb)}</div>` : '<span class="small muted">No course book</span>'}</td></tr>`;
    }).join('');
    const summary = c.nodes.map((m, i) => { const r = rule(c, bsel, m.id); return `<li><b>${esc(m.title)}</b> — ${say(r, b, i)}</li>`; }).join('');
    return `<div class="card"><div class="split" style="flex-wrap:wrap;gap:10px;margin-bottom:14px"><div><h3 class="h3">Share with batches</h3><p class="small muted">Choose, per module, when this batch’s students can open it — mid-training or after the training is completed.</p></div>
<div style="display:flex;gap:6px;flex-wrap:wrap">${bs.map(x => `<button type="button" class="chip ${x.id === bsel ? 'active' : ''}" data-batch="${x.id}">${esc(x.name)}</button>`).join('')}</div></div>
<div class="alert info" style="margin-bottom:14px">${I('users', 18)}<span><b>${esc(b.name)}</b> · ${esc(b.info)}</span></div>
<div class="split" style="margin-bottom:10px;flex-wrap:wrap;gap:8px"><span class="small muted">Quick set for every module:</span><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-sm" type="button" data-all="progress">Release module by module</button><button class="btn btn-sm" type="button" data-all="completion">Everything after completion</button><button class="btn btn-sm" type="button" data-all="now">Everything now</button></div></div>
<div class="table-wrap"><table class="table" style="min-width:760px"><thead><tr><th>Module</th><th>Module content (sub-module PDFs + links)</th><th>Course book</th></tr></thead><tbody>${rowsM}</tbody></table></div>
<div class="box" style="margin-top:16px"><div class="label" style="margin-bottom:8px">What students of ${esc(b.name)} will see</div><ul class="st-say">${summary}</ul></div>
<div class="split" style="margin-top:16px"><span class="small muted">Students get a notification each time a module opens for them.</span><button class="btn btn-gold" type="button" data-act="save-release">${I('check')}Save sharing for ${esc(b.name)}</button></div></div>`;
  }
  function say(r, b, i) {
    const open = '<span class="pill success" style="margin-left:4px">Open now</span>';
    if (r.when === 'now') return 'visible now' + open;
    if (r.when === 'hidden') return 'hidden';
    if (r.when === 'request') return 'opens when a student requests it and you approve';
    if (r.when === 'date') return r.date ? `opens on ${r.date}` : 'opens on the date you choose';
    if (r.when === 'completion') return `opens when the training is completed (${b.end})`;
    const n = Number(r.n || (i + 1) * 2); return `opens after session ${n}` + (b.done >= n ? open : ` <span class="small muted">(${b.done} of ${b.sessions} done)</span>`);
  }

  /* ---------- settings ---------- */
  function settings(c) {
    return `<div class="card"><h3 class="h3" style="margin-bottom:14px">Course settings</h3><div class="stack" style="gap:16px">
<div class="grid" style="--min:220px"><label class="field"><span>Course name <span class="req">*</span></span><input class="input" data-set="name" value="${esc(c.name)}"></label>
<label class="field"><span>Domain</span><select class="select" data-set="domain">${['Technical', 'Aptitude', 'Soft Skills'].map(o => `<option${o === c.domain ? ' selected' : ''}>${o}</option>`).join('')}</select></label>
<label class="field"><span>Status</span><select class="select" data-set="status"><option value="live"${c.status === 'live' ? ' selected' : ''}>Live — trainers and batches can use it</option><option value="draft"${c.status === 'draft' ? ' selected' : ''}>Draft — only admins see it</option></select></label></div>
<label class="field"><span>Short description</span><textarea class="textarea" rows="2" data-set="desc">${esc(c.desc)}</textarea><span class="hint">Shown on the public Courses page and the Buy page.</span></label>
<div class="st-toggle"><div><b>${I('globe')} Show on the public website</b><p class="small muted">Adds this course to the Courses page with its modules. Edit the card in Edit Site → Courses.</p></div><label class="tgl"><input type="checkbox" data-set="onSite" ${c.onSite ? 'checked' : ''}><span></span></label></div>
<div class="st-toggle"><div><b>${I('cart')} Sell the course books on the Buy page</b><p class="small muted">Lists every module’s course book as one product. Prices and preview pages are managed in Edit Site → Buy.</p></div><label class="tgl"><input type="checkbox" data-set="onBuy" ${c.onBuy ? 'checked' : ''}><span></span></label></div>
${c.onBuy ? `<div class="grid" style="--min:200px"><label class="field"><span>Price (₹)</span><input class="input" type="number" data-set="price" value="${esc(c.price)}"></label><div class="field"><span>&nbsp;</span><a class="btn" href="edit-site-buy.html">${I('cart')}Open in Buy manager</a></div></div>` : ''}
<div class="box" style="border-color:var(--danger-soft)"><div class="split" style="flex-wrap:wrap;gap:10px"><div><b style="color:var(--danger)">Delete course</b><p class="small muted">Removes the course, all modules and PDFs, and takes it off the website and Buy page. Batches already using it keep their history.</p></div><button class="btn btn-danger" type="button" data-act="del-course">${I('trash')}Delete ${esc(c.name)}</button></div></div>
</div></div>`;
  }

  /* ---------- outline → tree ---------- */
  function parseOutline(txt) {
    const out = [], stack = [{ d: -1, children: out }];
    txt.split('\n').forEach(line => {
      if (!line.trim()) return;
      const lead = line.match(/^[\t ]*/)[0].replace(/\t/g, '    ').length;
      let t = line.trim().replace(/^([-*•]|\d+(\.\d+)*[.)]?)\s+/, '');
      const d = Math.floor(lead / 2);
      const n = node(t);
      while (stack.length > 1 && stack[stack.length - 1].d >= d) stack.pop();
      stack[stack.length - 1].children.push(n); stack.push({ d, children: n.children });
    });
    return out;
  }
  function outlineModal() {
    modal(`<h2 class="h2">Build from a syllabus outline</h2><p class="muted" style="margin-top:6px">Paste your syllabus. Each indent (2 spaces or a tab) goes one level deeper: module → sub-module → topic. Bullets and numbers are ignored.</p>
<textarea class="textarea" rows="10" id="ol" style="margin-top:14px;font-family:ui-monospace,monospace" placeholder="Java Fundamentals&#10;  Syntax &amp; data types&#10;  Control flow&#10;    if / else&#10;    switch&#10;Java Intermediate&#10;  Collections"></textarea>
<div class="small muted" id="olc" style="margin-top:8px">Nothing to add yet.</div>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap"><button class="btn" type="button" data-x>Cancel</button><button class="btn" type="button" id="olr">Replace the structure</button><button class="btn btn-gold" type="button" id="ola">${I('plus')}Add to this course</button></div>`, ov => {
      const ta = $('#ol', ov), lab = $('#olc', ov);
      ta.oninput = () => { const t = parseOutline(ta.value); const k = count(t); lab.textContent = k.c ? `${t.length} module(s), ${k.c} items in total will be created.` : 'Nothing to add yet.'; };
      const go = rep => { const t = parseOutline(ta.value); if (!t.length) { lab.textContent = 'Paste at least one line.'; return; } const c = course(); c.nodes = rep ? t : c.nodes.concat(t); save(); ov.remove(); render(); toast(`${count(t).c} items created from the outline`); };
      $('#ola', ov).onclick = () => go(false); $('#olr', ov).onclick = () => go(true);
    });
  }
  function bulkModal() {
    modal(`<h2 class="h2">Bulk upload PDFs</h2><p class="muted" style="margin-top:6px">Pick many PDFs at once. Each file is matched to the item whose name is in the file name — for example <code>java-fundamentals-arrays-strings.pdf</code> → Arrays &amp; strings.</p>
<label class="st-drop" style="margin-top:14px">${I('upload')}<span>Choose PDFs</span><input type="file" accept="application/pdf" multiple id="bf" hidden></label><div id="bm" style="margin-top:12px"></div>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-gold" type="button" id="bgo" disabled>Attach matched PDFs</button></div>`, ov => {
      let pairs = [];
      $('#bf', ov).onchange = e => {
        const files = [...e.target.files]; const items = []; walk(course().nodes, n => items.push(n));
        pairs = files.map(f => { const s = slug(f.name.replace(/\.pdf$/i, '')); const m = items.filter(n => s.includes(slug(n.title))).sort((a, b) => b.title.length - a.title.length)[0]; return { f: f.name, n: m }; });
        $('#bm', ov).innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>File</th><th>Goes to</th></tr></thead><tbody>${pairs.map(p => `<tr><td>${esc(p.f)}</td><td>${p.n ? `<span class="pill success">${esc(p.n.title)}</span>` : '<span class="pill warning">No match — attach it by hand</span>'}</td></tr>`).join('')}</tbody></table></div>`;
        $('#bgo', ov).disabled = !pairs.some(p => p.n);
      };
      $('#bgo', ov).onclick = () => { let k = 0; pairs.forEach(p => { if (p.n) { p.n.pdf = p.f; k++; } }); save(); ov.remove(); render(); toast(`${k} PDF${k > 1 ? 's' : ''} attached`); };
    });
  }
  function newCourseModal() {
    modal(`<h2 class="h2">New course</h2><div class="stack" style="gap:14px;margin-top:14px">
<div class="grid" style="--min:200px"><label class="field"><span>Course name <span class="req">*</span></span><input class="input" id="cn" placeholder="e.g. Python Full Stack"></label><label class="field"><span>Domain</span><select class="select" id="cd"><option>Technical</option><option>Aptitude</option><option>Soft Skills</option></select></label></div>
<fieldset class="field" style="border:0;padding:0;margin:0"><span>Start from</span><div class="st-start">
<label><input type="radio" name="st" value="blank" checked><b>Blank</b><small>Add modules one by one</small></label>
<label><input type="radio" name="st" value="outline"><b>Syllabus outline</b><small>Paste it next</small></label>
<label><input type="radio" name="st" value="copy"><b>Copy a course</b><small><select class="select" id="cc" style="margin-top:6px">${S.courses.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></small></label></div></fieldset>
<span class="error-text" id="ce" hidden>Enter a course name that isn’t already used.</span></div>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-gold" type="button" id="cgo">${I('plus')}Create course</button></div>`, ov => {
      $('#cgo', ov).onclick = () => {
        const name = $('#cn', ov).value.trim(); if (!name || S.courses.some(x => x.name.toLowerCase() === name.toLowerCase())) { $('#ce', ov).hidden = false; return; }
        const st = ov.querySelector('[name=st]:checked').value;
        let nodes = [];
        if (st === 'copy') { const src = S.courses.find(x => x.id === $('#cc', ov).value); const cl = list => list.map(n => Object.assign({}, n, { id: nid(), links: n.links.slice(), children: cl(n.children) })); nodes = cl(src.nodes); }
        const c = { id: 'c-' + slug(name) + '-' + nid(), name, domain: $('#cd', ov).value, desc: '', status: 'draft', onSite: false, onBuy: false, price: '', nodes, release: {} };
        S.courses.push(c); S.sel = c.id; S.view = st === 'copy' ? 'structure' : 'structure'; S.cur = null; save(); ov.remove(); render(); toast(`${name} created as a draft`);
        if (st === 'outline') outlineModal();
      };
    });
  }

  /* ---------- events ---------- */
  function bindDrag() {
    let dragId = null;
    root().querySelectorAll('.st-node').forEach(li => {
      li.addEventListener('dragstart', e => { dragId = li.dataset.node; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (x) { } });
      li.addEventListener('dragend', () => { li.classList.remove('dragging'); root().querySelectorAll('.drop-a,.drop-b').forEach(x => x.classList.remove('drop-a', 'drop-b')); });
      li.addEventListener('dragover', e => { if (!dragId || dragId === li.dataset.node) return; const a = find(dragId), b = find(li.dataset.node); if (!a || !b || a.arr !== b.arr) return; e.preventDefault(); const r = li.getBoundingClientRect(); const after = e.clientY > r.top + r.height / 2; li.classList.toggle('drop-b', after); li.classList.toggle('drop-a', !after); });
      li.addEventListener('dragleave', () => li.classList.remove('drop-a', 'drop-b'));
      li.addEventListener('drop', e => { e.preventDefault(); const a = find(dragId), b = find(li.dataset.node); if (!a || !b || a.arr !== b.arr) return; const after = li.classList.contains('drop-b'); const arr = a.arr; arr.splice(a.i, 1); const j = arr.indexOf(b.n) + (after ? 1 : 0); arr.splice(j, 0, a.n); save(); render(); toast('Order updated'); });
    });
  }
  function act(e) {
    const t = e.target.closest('[data-course],[data-view],[data-act],[data-tog],[data-add],[data-del],[data-pick],[data-rmpdf],[data-rmbook],[data-addlink],[data-rmlink],[data-move],[data-batch],[data-all]');
    if (!t) return; const c = course(); const d = t.dataset;
    if (d.course) { S.sel = d.course; S.cur = null; save(); render(); }
    else if (d.view) { S.view = d.view; save(); render(); }
    else if (d.tog) { S.open[d.tog] = S.open[d.tog] === false; save(); render(); }
    else if (d.pick) { S.cur = d.pick; save(); render(); }
    else if (d.add) { const f = find(d.add); const n = node(`New ${LEVEL[Math.min(f.d + 1, 4)].toLowerCase()}`); f.n.children.push(n); S.open[f.n.id] = true; S.cur = n.id; save(); render(); const inp = root().querySelector(`[data-title="${n.id}"]`); if (inp) { inp.focus(); inp.select(); } }
    else if (d.del) {
      const f = find(d.del); const k = count([f.n]).c;
      modal(`<h2 class="h2">Delete “${esc(f.n.title)}”?</h2><p class="muted" style="margin-top:6px">${k > 1 ? `This also deletes the ${k - 1} item(s) inside it, with their PDFs and links.` : 'Its PDF and links are deleted too.'} Students lose access straight away.</p><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-danger" type="button" id="go">${I('trash')}Delete</button></div>`, ov => { $('#go', ov).onclick = () => { f.arr.splice(f.i, 1); if (S.cur === d.del) S.cur = null; save(); ov.remove(); render(); toast('Deleted'); }; });
    }
    else if (d.rmpdf) { find(d.rmpdf).n.pdf = ''; save(); render(); }
    else if (d.rmbook) { find(d.rmbook).n.book = ''; save(); render(); }
    else if (d.addlink) { const tt = $('[data-lt]').value.trim(), uu = $('[data-lu]').value.trim(); if (!tt || !/^https?:\/\//.test(uu)) { toast('Add a title and a link starting with https://'); return; } find(d.addlink).n.links.push({ t: tt, u: uu }); save(); render(); }
    else if (d.rmlink) { const [id, i] = d.rmlink.split(':'); find(id).n.links.splice(+i, 1); save(); render(); }
    else if (d.move) { const [id, dir] = d.move.split(':'); const f = find(id); const j = f.i + Number(dir); if (j < 0 || j >= f.arr.length) return; f.arr.splice(f.i, 1); f.arr.splice(j, 0, f.n); save(); render(); }
    else if (d.batch) { S.batch = d.batch; save(); render(); }
    else if (d.all) { const bs = BATCHES[c.id] || []; const b = S.batch && bs.find(x => x.id === S.batch) ? S.batch : bs[0].id; c.release[b] = c.release[b] || {}; c.nodes.forEach((m, i) => { c.release[b][m.id] = d.all === 'progress' ? { when: 'session', n: String(Math.min((i + 1) * 2, bs.find(x => x.id === b).sessions)) } : { when: d.all }; c.release[b][m.id + ':book'] = { when: d.all === 'now' ? 'now' : 'completion' }; }); save(); render(); }
    else if (d.act === 'new-course') newCourseModal();
    else if (d.act === 'outline') outlineModal();
    else if (d.act === 'bulk') bulkModal();
    else if (d.act === 'add-module') { const n = node('New module', [], { bookGated: true }); c.nodes.push(n); S.cur = n.id; save(); render(); const inp = root().querySelector(`[data-title="${n.id}"]`); if (inp) { inp.focus(); inp.select(); } }
    else if (d.act === 'expand' || d.act === 'collapse') { walk(c.nodes, n => S.open[n.id] = d.act === 'expand'); save(); render(); }
    else if (d.act === 'save-release') toast('Sharing saved — students will be notified as modules open');
    else if (d.act === 'del-course') {
      modal(`<h2 class="h2">Delete ${esc(c.name)}?</h2><p class="muted" style="margin-top:6px">All ${count(c.nodes).c} items and PDFs are removed and it comes off the website and Buy page. This can’t be undone.</p><label class="field" style="margin-top:12px"><span>Type the course name to confirm</span><input class="input" id="cf"></label><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-danger" type="button" id="go" disabled>${I('trash')}Delete course</button></div>`, ov => { $('#cf', ov).oninput = e => $('#go', ov).disabled = e.target.value.trim() !== c.name; $('#go', ov).onclick = () => { S.courses = S.courses.filter(x => x !== c); S.sel = S.courses[0].id; S.view = 'structure'; save(); ov.remove(); render(); toast('Course deleted'); }; });
    }
  }
  function input(e) {
    const t = e.target, c = course();
    if (t.matches('[data-q]')) { S.q = t.value; const pos = t.selectionStart; render(); const q = root().querySelector('[data-q]'); q.focus(); q.setSelectionRange(pos, pos); return; }
    if (t.dataset.title) { find(t.dataset.title).n.title = t.value; save(); return; }
    if (t.dataset.set) { const k = t.dataset.set; c[k] = t.type === 'checkbox' ? t.checked : t.value; save(); if (t.type === 'checkbox' || t.tagName === 'SELECT') { render(); toast(k === 'onSite' ? (t.checked ? 'Added to the public Courses page' : 'Removed from the public website') : k === 'onBuy' ? (t.checked ? 'Listed on the Buy page' : 'Removed from the Buy page') : 'Saved'); } return; }
    const bs = BATCHES[c.id] || []; const b = S.batch && bs.find(x => x.id === S.batch) ? S.batch : (bs[0] || {}).id;
    if (t.dataset.rule) { c.release[b] = c.release[b] || {}; c.release[b][t.dataset.rule] = Object.assign({}, c.release[b][t.dataset.rule], { when: t.value }); save(); render(); return; }
    if (t.dataset.rn) { c.release[b] = c.release[b] || {}; c.release[b][t.dataset.rn] = Object.assign({ when: 'session' }, c.release[b][t.dataset.rn], { n: t.value }); save(); return; }
    if (t.dataset.rd) { c.release[b] = c.release[b] || {}; c.release[b][t.dataset.rd] = Object.assign({ when: 'date' }, c.release[b][t.dataset.rd], { date: t.value }); save(); render(); return; }
    if (t.dataset.gate) { find(t.dataset.gate).n.bookGated = t.checked; save(); return; }
  }
  function change(e) {
    const t = e.target; if (!t.files || !t.files[0]) return;
    if (t.dataset.pdf) { find(t.dataset.pdf).n.pdf = t.files[0].name; save(); render(); toast('PDF attached'); }
    if (t.dataset.book) { find(t.dataset.book).n.book = t.files[0].name; save(); render(); toast('Course book attached'); }
  }
  function mount() {
    const r = root(); if (!r) return;
    r.addEventListener('click', act); r.addEventListener('input', e => { if (!e.target.matches('select,[type=checkbox],[type=date]')) input(e); }); r.addEventListener('change', e => { if (e.target.matches('select,[type=checkbox],[type=date]')) input(e); else change(e); });
    r.addEventListener('blur', e => { if (e.target.dataset && e.target.dataset.rn) render(); }, true);
    save(); render();
  }
  window.LBFStudio = { get: () => S };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
