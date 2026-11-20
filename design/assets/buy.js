/* Buy — admin manager (Edit Site → Buy) and the public Buy pages.
   Listings sell a course's books; every book has its own free-preview page count;
   who can see each listing is set per listing; UPI orders are verified by an admin,
   then the books are emailed. Prototype state: localStorage 'lbf-buy'. */
(function () {
  const KEY = 'lbf-buy';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const I = (n, z = 16) => `<svg width="${z}" height="${z}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const inr = n => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
  const slug = s => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const CP = ['Programming Basics', 'Arrays and Strings', 'Searching and Sorting', 'Hashing', 'Linked Lists', 'Stacks and Queues', 'Recursion and Backtracking', 'Trees', 'Heaps', 'Graphs', 'Greedy', 'Dynamic Programming', 'Bit Manipulation', 'Advanced Patterns'];
  const book = (t, pages, preview) => ({ title: t + ' — Complete Course Notes', pages, preview, locked: false });
  function seed() {
    const L = (name, price, headline, books, o = {}) => Object.assign({ id: slug(name), courseId: 'c-' + slug(name), name, price: String(price), mrp: '', headline, status: 'live', audience: 'public', colleges: [], featured: false, books }, o);
    return {
      tab: 'listings', sel: 'coding-patterns',
      pay: { upi: 'learnbeingforward@upi', payee: 'Learn Being Forward', email: 'support@learnbeingforward.in', qr: '' },
      listings: [
        L('Coding Patterns', 499, '100 data-structure & algorithm patterns, worked through step by step.', CP.map((t, i) => book(t, 40 + i * 3, 3)), { mrp: '999', featured: true }),
        L('Frontend Development', 399, 'A complete frontend development curriculum, from fundamentals to projects.', ['HTML & CSS', 'JavaScript', 'React'].map(t => book(t, 120, 5))),
        L('Robotics', 399, 'Hands-on robotics curriculum covering hardware and control systems.', ['Electronics basics', 'Arduino'].map(t => book(t, 80, 4)), { audience: 'students' }),
        L('Programming', 399, 'Core programming fundamentals across multiple languages.', ['C', 'C++', 'Python', 'Java'].map(t => book(t, 150, 5)))
      ],
      orders: [
        { id: 'ORD-1042', name: 'Aadhya Singh', email: 'aadhya.singh@gmail.com', phone: '98xxxxxx21', listing: 'coding-patterns', amount: 499, utr: '432198765012', at: '2026-11-19T04:10:00Z', status: 'pending' },
        { id: 'ORD-1041', name: 'Rahul Verma', email: 'rahul.v@outlook.com', phone: '97xxxxxx08', listing: 'programming', amount: 399, utr: '432177001245', at: '2026-11-18T13:40:00Z', status: 'pending' },
        { id: 'ORD-1039', name: 'Sneha Rao', email: 'sneha.rao@gmail.com', phone: '99xxxxxx44', listing: 'coding-patterns', amount: 499, utr: '431902233188', at: '2026-11-16T09:05:00Z', status: 'confirmed' },
        { id: 'ORD-1036', name: 'Karthik N', email: 'karthik.n@gmail.com', phone: '96xxxxxx90', listing: 'frontend-development', amount: 399, utr: '431500000111', at: '2026-11-12T17:22:00Z', status: 'rejected', reason: 'No payment with this UTR' }
      ]
    };
  }
  let S; try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
  if (!S || !S.listings) S = seed();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  const studio = () => { try { return (JSON.parse(localStorage.getItem('lbf-studio')) || {}).courses || []; } catch (e) { return []; } };
  const L = id => S.listings.find(x => x.id === id);
  const fdt = iso => { const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }); };
  function toast(t) { document.querySelectorAll('.toast').forEach(x => x.remove()); const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = I('check') + esc(t); document.body.appendChild(el); setTimeout(() => el.remove(), 2800); }
  function modal(html, ready) { const ov = document.createElement('div'); ov.className = 'ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.innerHTML = `<div class="ov-card">${html}</div>`; document.body.appendChild(ov); ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-x]')) ov.remove(); }); const f = ov.querySelector('input,select,textarea'); if (f) f.focus(); ready && ready(ov); return ov; }
  const AUD = { public: 'Everyone on the website', students: 'Logged-in students only', colleges: 'Students of chosen colleges' };
  const COLLEGES = ['Crestview College of Engineering', 'Sunrise Engineering College', 'Pinnacle Institute of Technology', 'Global Institute of Technology'];
  /* deterministic QR-like pattern from the UPI string (visual stand-in for the real generated QR) */
  function qr(text, size = 168) {
    let h = 2166136261; const bits = []; for (let i = 0; i < 625; i++) { h ^= text.charCodeAt(i % text.length) + i; h = Math.imul(h, 16777619); bits.push((h >>> 7) & 1); }
    const n = 25, c = size / n; let r = '';
    const finder = (x, y) => `<rect x="${x * c}" y="${y * c}" width="${7 * c}" height="${7 * c}" fill="#1C2B4A"/><rect x="${(x + 1) * c}" y="${(y + 1) * c}" width="${5 * c}" height="${5 * c}" fill="#fff"/><rect x="${(x + 2) * c}" y="${(y + 2) * c}" width="${3 * c}" height="${3 * c}" fill="#1C2B4A"/>`;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const inF = (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16); if (!inF && bits[y * n + x]) r += `<rect x="${x * c}" y="${y * c}" width="${c}" height="${c}" fill="#1C2B4A"/>`; }
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="UPI QR code"><rect width="${size}" height="${size}" fill="#fff"/>${r}${finder(0, 0)}${finder(18, 0)}${finder(0, 18)}</svg>`;
  }

  /* =================== ADMIN =================== */
  function admin(root) {
    const pend = S.orders.filter(o => o.status === 'pending').length;
    root.innerHTML = `<div class="card" style="padding-bottom:0"><div class="tabs" role="tablist" style="margin-bottom:0;border-bottom:0">${[['listings', `Listings (${S.listings.length})`], ['orders', `Orders${pend ? ` <span class="pill warning" style="margin-left:6px">${pend} to verify</span>` : ''}`], ['payment', 'Payment settings']].map(([k, l]) => `<button type="button" role="tab" aria-selected="${S.tab === k}" class="${S.tab === k ? 'active' : ''}" data-tab="${k}">${l}</button>`).join('')}</div></div>
<div style="margin-top:20px">${S.tab === 'listings' ? listings() : S.tab === 'orders' ? orders() : payment()}</div>`;
  }
  function listings() {
    const l = L(S.sel) || S.listings[0];
    const free = studio().filter(c => !S.listings.some(x => x.courseId === c.id || x.name === c.name));
    return `<div class="by-wrap"><aside class="card" style="padding:18px"><div class="split" style="margin-bottom:12px"><h3 class="h3">Listings</h3><button class="btn btn-gold btn-sm" type="button" data-act="add">${I('plus')}Add</button></div>
<ul class="st-clist">${S.listings.map(x => `<li><button type="button" class="${l && x.id === l.id ? 'on' : ''}" data-sel="${x.id}"><span class="dot ${x.status === 'live' ? 'live' : 'draft'}"></span><span class="grow"><b>${esc(x.name)}</b><small>${inr(x.price)} · ${x.books.length} books · ${x.status === 'live' ? AUD[x.audience] : 'Hidden'}</small></span></button></li>`).join('')}</ul>
${free.length ? `<p class="small muted" style="margin-top:12px">${free.length} course(s) from Course Studio aren’t listed yet.</p>` : ''}</aside>
${l ? editor(l) : '<div class="card"><div class="empty">No listings yet.</div></div>'}</div>`;
  }
  function editor(l) {
    const off = Number(l.mrp) > Number(l.price) ? Math.round((1 - l.price / l.mrp) * 100) : 0;
    return `<div class="stack" style="gap:20px;min-width:0"><section class="card"><div class="split" style="flex-wrap:wrap;gap:10px;margin-bottom:16px"><div><div class="label">Listing</div><h2 class="h2" style="margin-top:4px">${esc(l.name)}</h2></div>
<div style="display:flex;gap:10px;align-items:center"><span class="small ${l.status === 'live' ? '' : 'muted'}" style="font-weight:600">${l.status === 'live' ? 'Live on the Buy page' : 'Hidden'}</span><label class="tgl"><input type="checkbox" data-f="status" ${l.status === 'live' ? 'checked' : ''} aria-label="Live"><span></span></label></div></div>
<div class="by-ed"><div class="stack" style="gap:14px">
<div class="grid" style="--min:150px"><label class="field"><span>Price (₹) <span class="req">*</span></span><input class="input" type="number" min="0" data-f="price" value="${esc(l.price)}"></label><label class="field"><span>Original price (₹)</span><input class="input" type="number" min="0" data-f="mrp" value="${esc(l.mrp)}" placeholder="optional"><span class="hint">${off ? `Shows “${off}% off”` : 'Leave blank for no discount'}</span></label></div>
<label class="field"><span>Headline</span><input class="input" data-f="headline" value="${esc(l.headline)}" maxlength="110"><span class="hint">One line under the course name on the Buy page.</span></label>
<fieldset class="field" style="border:0;padding:0;margin:0"><span>Who can see and buy it</span><div class="by-aud">${Object.entries(AUD).map(([k, v]) => `<label><input type="radio" name="aud" value="${k}" data-f="audience" ${l.audience === k ? 'checked' : ''}><span>${I(k === 'public' ? 'globe' : k === 'students' ? 'user' : 'building')}<b>${v}</b></span></label>`).join('')}</div></fieldset>
${l.audience === 'colleges' ? `<div class="field"><span>Colleges</span><div style="display:flex;gap:6px;flex-wrap:wrap">${COLLEGES.map(c => `<label class="chip ${l.colleges.includes(c) ? 'active' : ''}" style="cursor:pointer"><input type="checkbox" data-col="${esc(c)}" ${l.colleges.includes(c) ? 'checked' : ''} hidden>${esc(c)}</label>`).join('')}</div></div>` : ''}
<div class="st-toggle"><div><b>${I('home')} Feature on the Home page</b><p class="small muted">Shows this book set in the “Own the course” strip on the home page.</p></div><label class="tgl"><input type="checkbox" data-f="featured" ${l.featured ? 'checked' : ''}><span></span></label></div>
</div>
<div><div class="label" style="margin-bottom:8px">Preview on the Buy page</div>${card(l, true)}</div></div></section>
<section class="card"><div class="split" style="flex-wrap:wrap;gap:10px;margin-bottom:12px"><div><h3 class="h3">What’s included (${l.books.length} books)</h3><p class="small muted">Free preview pages are what anyone can read before buying. Lock a book to show only its title.</p></div>
<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="small muted">First</span><input class="input" type="number" min="0" value="${S.bulkn || 3}" style="width:70px" id="bulkn" aria-label="Preview pages for all"><span class="small muted">pages free for all</span><button class="btn btn-sm" type="button" data-act="bulk">Apply</button></div></div>
<div class="table-wrap"><table class="table" style="min-width:620px"><thead><tr><th>Book</th><th>Pages</th><th>Free preview</th><th>Locked</th><th></th></tr></thead><tbody>
${l.books.map((b, i) => `<tr><td class="strong">${esc(b.title)}</td><td>${b.pages}</td><td><div style="display:flex;gap:6px;align-items:center"><input class="input" type="number" min="0" max="${b.pages}" value="${b.preview}" data-prev="${i}" style="width:80px" ${b.locked ? 'disabled' : ''} aria-label="Preview pages"><span class="small muted">of ${b.pages}</span></div></td><td><label class="tgl"><input type="checkbox" data-lock="${i}" ${b.locked ? 'checked' : ''} aria-label="Lock preview"><span></span></label></td><td><button class="btn-icon danger" type="button" data-rmbook="${i}" title="Remove from listing">${I('trash')}</button></td></tr>`).join('')}
</tbody></table></div>
<div class="split" style="margin-top:16px;flex-wrap:wrap;gap:10px"><button class="btn btn-danger btn-sm" type="button" data-act="del">${I('trash')}Delete listing</button><div style="display:flex;gap:8px"><a class="btn" href="../public/buy-detail.html?id=${l.id}">${I('eye')}View as a buyer</a><button class="btn btn-gold" type="button" data-act="save">${I('check')}Save changes</button></div></div></section></div>`;
  }
  function card(l, small) {
    const off = Number(l.mrp) > Number(l.price) ? Math.round((1 - l.price / l.mrp) * 100) : 0;
    return `<article class="by-card${small ? ' sm' : ''}"><div class="by-cover"><span>${I('book', 28)}</span><b>${esc(l.name)}</b><small>${l.books.length} course books</small>${off ? `<em>${off}% off</em>` : ''}</div>
<div class="by-cbody"><h3>${esc(l.name)}</h3><p>${esc(l.headline)}</p><div class="by-price"><b>${inr(l.price)}</b>${off ? `<s>${inr(l.mrp)}</s>` : ''}</div><span class="by-link">View &amp; preview →</span></div></article>`;
  }
  function orders() {
    const f = S.ofilter || 'all';
    const list = S.orders.filter(o => f === 'all' || o.status === f);
    const conf = S.orders.filter(o => o.status === 'confirmed');
    const P = { pending: ['Awaiting verification', 'warning'], confirmed: ['Paid · books emailed', 'success'], rejected: ['Rejected', 'danger'] };
    return `<section class="card"><div class="grid" style="--min:170px;margin-bottom:18px">
<div class="tile warning"><div class="label">To verify</div><div class="value">${S.orders.filter(o => o.status === 'pending').length}</div></div>
<div class="tile success"><div class="label">Paid orders</div><div class="value">${conf.length}</div></div>
<div class="tile gold"><div class="label">Revenue</div><div class="value">${inr(conf.reduce((a, o) => a + o.amount, 0))}</div></div></div>
<div class="split" style="margin-bottom:12px;flex-wrap:wrap;gap:10px"><h3 class="h3">Orders</h3><div style="display:flex;gap:6px;flex-wrap:wrap">${[['all', 'All'], ['pending', 'To verify'], ['confirmed', 'Paid'], ['rejected', 'Rejected']].map(([k, v]) => `<button type="button" class="chip ${f === k ? 'active' : ''}" data-of="${k}">${v}</button>`).join('')}</div></div>
<div class="alert info" style="margin-bottom:14px">${I('shield', 18)}<span>Check the UTR in your bank or UPI app before confirming. Confirming emails the books to the buyer straight away.</span></div>
<div class="table-wrap"><table class="table" style="min-width:860px"><thead><tr><th>Order</th><th>Buyer</th><th>Listing</th><th>Amount</th><th>UTR</th><th>Status</th><th></th></tr></thead><tbody>
${list.map(o => `<tr><td class="strong">${o.id}<div class="small muted">${fdt(o.at)}</div></td><td>${esc(o.name)}<div class="small muted">${esc(o.email)}</div></td><td>${esc((L(o.listing) || {}).name || o.listing)}</td><td>${inr(o.amount)}</td><td><code>${esc(o.utr)}</code></td><td><span class="pill ${P[o.status][1]}">${P[o.status][0]}</span>${o.reason ? `<div class="small muted">${esc(o.reason)}</div>` : ''}</td>
<td><div style="display:flex;gap:6px;justify-content:flex-end">${o.status === 'pending' ? `<button class="btn btn-sm btn-danger" type="button" data-rej="${o.id}">Reject</button><button class="btn btn-sm btn-success" type="button" data-ok="${o.id}">${I('check')}Confirm</button>` : o.status === 'confirmed' ? `<button class="btn btn-sm" type="button" data-resend="${o.id}">${I('mail')}Resend books</button>` : ''}</div></td></tr>`).join('') || '<tr><td colspan="7" class="muted">No orders here.</td></tr>'}
</tbody></table></div></section>`;
  }
  function payment() {
    const p = S.pay;
    return `<div class="by-wrap" style="grid-template-columns:1fr 360px"><section class="card"><h3 class="h3">Payment settings</h3><p class="small muted" style="margin:4px 0 16px">Shared by every listing — change it here and every payment page updates.</p><div class="stack" style="gap:14px">
<div class="grid" style="--min:220px"><label class="field"><span>UPI ID <span class="req">*</span></span><input class="input" data-p="upi" value="${esc(p.upi)}" placeholder="yourname@upi"></label><label class="field"><span>Payee name</span><input class="input" data-p="payee" value="${esc(p.payee)}"></label></div>
<label class="field"><span>Send books and receipts from</span><input class="input" type="email" data-p="email" value="${esc(p.email)}"></label>
<div class="field"><span>QR code image <span class="muted" style="font-weight:400">(optional — overrides the one made from the UPI ID)</span></span>${p.qr ? `<div class="st-file">${I('file')}<span class="grow">${esc(p.qr)}</span><button class="btn btn-sm btn-danger" type="button" data-act="rmqr">Remove</button></div>` : `<label class="st-drop">${I('upload')}<span>Upload QR image</span><input type="file" accept="image/*" data-qr hidden></label>`}</div>
<div style="display:flex;justify-content:flex-end"><button class="btn btn-gold" type="button" data-act="savepay">${I('check')}Save</button></div></div></section>
<aside class="card" style="text-align:center"><div class="label" style="margin-bottom:10px">Buyer’s payment screen</div><div class="by-qr">${qr(p.upi)}</div><div class="strong" style="margin-top:10px">${esc(p.payee)}</div><div class="small muted">${esc(p.upi)}</div><p class="small muted" style="margin-top:10px">${p.qr ? 'Using your uploaded QR image.' : 'Generated from the UPI ID.'}</p></aside></div>`;
  }
  function adminEvents(root) {
    root.addEventListener('click', e => {
      const t = e.target.closest('button,[data-sel],[data-tab]'); if (!t) return; const d = t.dataset; const l = L(S.sel) || S.listings[0];
      if (d.tab) { S.tab = d.tab; save(); admin(root); }
      else if (d.sel) { S.sel = d.sel; save(); admin(root); }
      else if (d.of) { S.ofilter = d.of; save(); admin(root); }
      else if (d.rmbook) { l.books.splice(+d.rmbook, 1); save(); admin(root); }
      else if (d.act === 'save') toast('Saved — the Buy page is updated');
      else if (d.act === 'savepay') toast('Payment settings saved for every listing');
      else if (d.act === 'rmqr') { S.pay.qr = ''; save(); admin(root); }
      else if (d.act === 'bulk') { const n = Number($('#bulkn').value) || 0; S.bulkn = n; l.books.forEach(b => { b.preview = Math.min(n, b.pages); b.locked = false; }); save(); admin(root); toast(`First ${n} pages free on every book`); }
      else if (d.act === 'del') modal(`<h2 class="h2">Delete the ${esc(l.name)} listing?</h2><p class="muted" style="margin-top:6px">It comes off the Buy page. Past orders and buyers’ access are kept.</p><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-danger" type="button" id="go">${I('trash')}Delete</button></div>`, ov => { $('#go', ov).onclick = () => { S.listings = S.listings.filter(x => x !== l); S.sel = (S.listings[0] || {}).id; save(); ov.remove(); admin(root); toast('Listing deleted'); }; });
      else if (d.act === 'add') {
        const courses = studio(); const free = courses.filter(c => !S.listings.some(x => x.courseId === c.id || x.name === c.name));
        modal(`<h2 class="h2">Add a course to Buy</h2><p class="muted" style="margin-top:6px">The course books come from the course’s modules in Course Studio.</p><div class="stack" style="gap:12px;margin-top:14px">
<label class="field"><span>Course <span class="req">*</span></span><select class="select" id="ac"><option value="">Select a course…</option>${(free.length ? free : [{ id: 'c-java-and-dsa', name: 'Java & DSA', nodes: [] }]).map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>
<div class="grid" style="--min:150px"><label class="field"><span>Price (₹) <span class="req">*</span></span><input class="input" type="number" id="ap" placeholder="399"></label><label class="field"><span>Free preview pages per book</span><input class="input" type="number" id="av" value="3"></label></div>
<label class="field"><span>Headline</span><input class="input" id="ah" placeholder="optional"></label><span class="error-text" id="ae" hidden>Pick a course and enter a price.</span></div>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-gold" type="button" id="go">${I('plus')}Add listing</button></div>`, ov => {
          $('#go', ov).onclick = () => {
            const cid = $('#ac', ov).value, price = $('#ap', ov).value; if (!cid || !price) { $('#ae', ov).hidden = false; return; }
            const c = courses.find(x => x.id === cid) || { name: 'Java & DSA', nodes: [], desc: '' };
            const books = (c.nodes || []).map(m => ({ title: m.book ? m.book.replace(/\.pdf$/i, '') : m.title + ' — Complete Course Notes', pages: 60, preview: Number($('#av', ov).value) || 0, locked: false }));
            const nl = { id: slug(c.name), courseId: cid, name: c.name, price, mrp: '', headline: $('#ah', ov).value || c.desc || '', status: 'hidden', audience: 'public', colleges: [], featured: false, books: books.length ? books : [{ title: c.name + ' — Complete Course Notes', pages: 60, preview: 3, locked: false }] };
            S.listings.push(nl); S.sel = nl.id; save(); ov.remove(); admin(root); toast(`${c.name} added — hidden until you switch it live`);
          };
        });
      }
      else if (d.ok) { const o = S.orders.find(x => x.id === d.ok); modal(`<h2 class="h2">Confirm payment ${o.id}?</h2><p class="muted" style="margin-top:6px">${esc(o.name)} paid <b style="color:var(--text)">${inr(o.amount)}</b> for ${esc((L(o.listing) || {}).name)} with UTR <code>${esc(o.utr)}</code>. The books are emailed to ${esc(o.email)} as soon as you confirm.</p><label class="check" style="margin-top:12px"><input type="checkbox" id="ck"> I found this payment in our account</label><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-success" type="button" id="go" disabled>${I('check')}Confirm &amp; email books</button></div>`, ov => { $('#ck', ov).onchange = e => $('#go', ov).disabled = !e.target.checked; $('#go', ov).onclick = () => { o.status = 'confirmed'; save(); ov.remove(); admin(root); toast(`Books emailed to ${o.email}`); }; }); }
      else if (d.rej) { const o = S.orders.find(x => x.id === d.rej); modal(`<h2 class="h2">Reject ${o.id}?</h2><label class="field" style="margin-top:12px"><span>Reason sent to the buyer <span class="req">*</span></span><select class="select" id="rs"><option>No payment with this UTR</option><option>Amount does not match</option><option>Duplicate order</option></select></label><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-danger" type="button" id="go">Reject order</button></div>`, ov => { $('#go', ov).onclick = () => { o.status = 'rejected'; o.reason = $('#rs', ov).value; save(); ov.remove(); admin(root); toast('Order rejected — buyer informed'); }; }); }
      else if (d.resend) toast('Books sent again');
    });
    root.addEventListener('input', e => {
      const t = e.target; const l = L(S.sel) || S.listings[0];
      if (t.dataset.f) { const k = t.dataset.f; l[k] = k === 'status' ? (t.checked ? 'live' : 'hidden') : t.type === 'radio' ? t.value : t.type === 'checkbox' ? t.checked : t.value; save(); if (t.type === 'checkbox' || t.type === 'radio') admin(root); else { const pv = root.querySelector('.by-card'); if (pv) pv.outerHTML = card(l, true); } }
      else if (t.dataset.prev) { const b = l.books[+t.dataset.prev]; b.preview = Math.max(0, Math.min(Number(t.value) || 0, b.pages)); save(); }
      else if (t.dataset.lock) { l.books[+t.dataset.lock].locked = t.checked; save(); admin(root); }
      else if (t.dataset.col) { const c = t.dataset.col; l.colleges = t.checked ? l.colleges.concat(c) : l.colleges.filter(x => x !== c); save(); admin(root); }
      else if (t.dataset.p) { S.pay[t.dataset.p] = t.value; save(); if (t.dataset.p === 'upi' || t.dataset.p === 'payee') { const a = root.querySelector('.by-qr'); if (a) a.innerHTML = qr(S.pay.upi); } }
    });
    root.addEventListener('change', e => { if (e.target.dataset.qr !== undefined && e.target.files[0]) { S.pay.qr = e.target.files[0].name; save(); admin(root); } });
  }

  /* =================== PUBLIC =================== */
  function pubList(root) {
    const list = S.listings.filter(l => l.status === 'live' && l.audience === 'public').sort((a, b) => (b.featured - a.featured));
    root.innerHTML = list.length ? `<div class="by-grid">${list.map(l => `<a href="buy-detail.html?id=${l.id}" class="by-a">${card(l)}</a>`).join('')}</div>` : '<div class="empty">New course books are on their way.</div>';
  }
  function pubDetail(root) {
    const id = new URLSearchParams(location.search).get('id') || 'coding-patterns'; const l = L(id);
    if (!l || l.status !== 'live') { root.innerHTML = '<div class="card"><div class="empty"><div class="h3" style="color:var(--text)">This book set isn’t available right now.</div><p style="margin-top:10px"><a class="btn" href="buy.html">See all books</a></p></div></div>'; return; }
    const off = Number(l.mrp) > Number(l.price) ? Math.round((1 - l.price / l.mrp) * 100) : 0;
    const h1 = document.querySelector('.band-hero h1'); if (h1) { h1.textContent = l.name; document.title = l.name + ' | Learn Being Forward'; }
    const hp = document.querySelector('.band-hero p'); if (hp) hp.textContent = l.headline;
    root.innerHTML = `<div class="row"><section class="card grow"><div class="label">Course books</div><h2 class="h2" style="margin:4px 0 6px">${esc(l.name)}</h2><p class="muted">${esc(l.headline)}</p>
<ul class="list" style="margin-top:18px">${l.books.map((b, i) => `<li class="list-row"><span class="icon-box ${b.locked ? '' : 'gold'}">${I(b.locked ? 'lock' : 'book')}</span><div class="grow"><a class="strong" style="color:inherit" href="buy-module.html?id=${l.id}&b=${i}">${esc(b.title)}</a><div class="small muted">${b.pages} pages · ${b.locked ? 'Preview not available' : `${b.preview} free preview page${b.preview === 1 ? '' : 's'}`}</div></div>${b.locked || !b.preview ? '' : `<button class="btn btn-sm" type="button" data-pv="${i}">${I('eye')}Preview</button>`}</li>`).join('')}</ul></section>
<aside class="card side" style="position:sticky;top:16px"><div class="label">Get this course</div><div class="by-price big"><b>${inr(l.price)}</b>${off ? `<s>${inr(l.mrp)}</s><span class="pill success">${off}% off</span>` : ''}</div>
<ul class="by-inc"><li>${I('check')}All ${l.books.length} course books (PDF)</li><li>${I('check')}Emailed to you once payment is confirmed</li><li>${I('check')}One-time payment, yours to keep</li></ul>
<a class="btn btn-gold" style="width:100%" href="buy-checkout.html?id=${l.id}">${I('cart')}Buy now</a><p class="small muted" style="margin-top:10px;text-align:center">Pay by any UPI app.</p></aside></div>`;
    root.onclick = e => {
      const pv = e.target.closest('[data-pv]'); const bb = e.target.closest('[data-buy]');
      if (pv) { const b = l.books[+pv.dataset.pv]; modal(`<div class="split"><h2 class="h2">${esc(b.title)}</h2><button class="btn-icon" type="button" data-x aria-label="Close">${I('x')}</button></div><p class="small muted" style="margin:6px 0 14px">Free preview · pages 1–${b.preview} of ${b.pages}</p><div class="by-pages">${Array.from({ length: b.preview }, (_, k) => `<div class="by-page"><b>${esc(l.name)}</b><span>Page ${k + 1}</span><i></i><i></i><i style="width:70%"></i><i></i><i style="width:55%"></i></div>`).join('')}<div class="by-page lock">${I('lock', 22)}<span>Buy to read the remaining ${b.pages - b.preview} pages</span></div></div>`); }
      if (bb) {
        modal(`<div class="split"><h2 class="h2">Pay ${inr(l.price)}</h2><button class="btn-icon" type="button" data-x aria-label="Close">${I('x')}</button></div><div class="by-pay"><div style="text-align:center"><div class="by-qr">${qr(S.pay.upi)}</div><div class="strong" style="margin-top:8px">${esc(S.pay.payee)}</div><div class="small muted">${esc(S.pay.upi)}</div><p class="small muted" style="margin-top:8px">Scan with any UPI app and pay exactly ${inr(l.price)}.</p></div>
<div class="stack" style="gap:12px"><label class="field"><span>Full name <span class="req">*</span></span><input class="input" id="bn" autocomplete="name"></label><label class="field"><span>Email for the books <span class="req">*</span></span><input class="input" type="email" id="be" autocomplete="email"></label><label class="field"><span>Phone</span><input class="input" type="tel" id="bp" autocomplete="tel"></label><label class="field"><span>UPI transaction ID (UTR) <span class="req">*</span></span><input class="input" id="bu" inputmode="numeric" placeholder="12-digit number from your UPI app"></label><span class="error-text" id="berr" hidden>Fill in your name, a valid email and the 12-digit UTR.</span><button class="btn btn-gold" type="button" id="bgo">I have paid — submit</button></div></div>`, ov => {
          $('#bgo', ov).onclick = () => {
            const n = $('#bn', ov).value.trim(), em = $('#be', ov).value.trim(), u = $('#bu', ov).value.replace(/\s/g, '');
            if (!n || !/^\S+@\S+\.\S+$/.test(em) || !/^\d{12}$/.test(u)) { $('#berr', ov).hidden = false; return; }
            const o = { id: 'ORD-' + (1043 + S.orders.length), name: n, email: em, phone: $('#bp', ov).value, listing: l.id, amount: Number(l.price), utr: u, at: new Date().toISOString(), status: 'pending' }; S.orders.unshift(o); save();
            ov.querySelector('.ov-card').innerHTML = `<div style="text-align:center;padding:10px"><span class="icon-box gold" style="margin:0 auto 12px">${I('check')}</span><h2 class="h2">Thank you, ${esc(n.split(' ')[0])}!</h2><p class="muted" style="margin-top:8px">Order <b style="color:var(--text)">${o.id}</b> is received. We’ll check your payment and email the books to <b style="color:var(--text)">${esc(em)}</b> — usually within a few hours.</p><button class="btn" type="button" data-x style="margin-top:16px">Done</button></div>`;
          };
        });
      }
    };
  }

  const SUBS = { 'Programming Basics': ['Accumulator', 'Counter', 'Digit Extraction', 'Early Exit / Guard Clause', 'Flag / Sentinel', 'Interactive pattern visualiser', 'Linear Search', 'Min / Max Tracking', 'Nested Loops', 'Parity / Toggle', 'Swap'] };
  function previewModal(l, b) { modal(`<div class="split"><h2 class="h2">${esc(b.title)}</h2><button class="btn-icon" type="button" data-x aria-label="Close">${I('x')}</button></div><p class="small muted" style="margin:6px 0 14px">Free preview · pages 1–${b.preview} of ${b.pages}</p><div class="by-pages">${Array.from({ length: b.preview }, (_, k) => `<div class="by-page"><b>${esc(l.name)}</b><span>Page ${k + 1}</span><i></i><i></i><i style="width:70%"></i><i></i><i style="width:55%"></i></div>`).join('')}<div class="by-page lock">${I('lock', 22)}<span>Buy to read the remaining ${b.pages - b.preview} pages</span></div></div>`); }
  function pubModule(root) {
    const q = new URLSearchParams(location.search); const l = L(q.get('id') || 'coding-patterns'); const bi = Number(q.get('b') || 0);
    if (!l || !l.books[bi]) { root.innerHTML = '<div class="card"><div class="empty">This book isn’t available.</div></div>'; return; }
    const b = l.books[bi]; const mod = b.title.replace(/ — Complete Course Notes$/, '');
    const subs = SUBS[mod] || ['Concept notes', 'Worked examples', 'Practice problems', 'Interactive pattern visualiser'];
    const h1 = document.querySelector('.band-hero h1'); if (h1) h1.textContent = b.title;
    const ey = document.querySelector('.band-hero .eyebrow'); if (ey) ey.innerHTML = `<a href="buy.html" style="color:inherit">Buy</a> › <a href="buy-detail.html?id=${l.id}" style="color:inherit">${esc(l.name)}</a>`;
    const hp = document.querySelector('.band-hero p'); if (hp) hp.textContent = `Book ${bi + 1} of ${l.books.length} in ${l.name} · ${b.pages} pages`;
    const prev = bi > 0 ? `<a class="btn btn-sm" href="buy-module.html?id=${l.id}&b=${bi - 1}">${I('arrowL')}Previous book</a>` : '<span></span>';
    const next = bi < l.books.length - 1 ? `<a class="btn btn-sm" href="buy-module.html?id=${l.id}&b=${bi + 1}">Next book${I('arrowR')}</a>` : '<span></span>';
    root.innerHTML = `<div class="row"><div class="stack grow" style="gap:20px;min-width:0">
<section class="card"><div class="split" style="flex-wrap:wrap;gap:12px"><div class="stat-inline"><span class="icon-box gold">${I('book')}</span><div><div class="strong">Full course book</div><div class="small muted">${b.pages} pages · PDF · emailed after purchase</div></div></div>${b.locked || !b.preview ? `<span class="pill">${I('lock', 12)} Preview not available</span>` : `<button class="btn" type="button" data-pv="1">${I('eye')}Read ${b.preview} free pages</button>`}</div></section>
<section class="card"><h2 class="h3" style="margin-bottom:12px">Sub-modules in this book (${subs.length})</h2><ul class="list">${subs.map(s2 => `<li class="list-row"><span class="icon-box">${I(/visualiser/i.test(s2) ? 'play' : 'file')}</span><div class="grow"><div class="strong">${esc(s2)}</div><div class="small muted">${/visualiser/i.test(s2) ? 'Step-by-step animation of the pattern' : 'Notes, code and practice'}</div></div><span class="pill">${I('lock', 12)} Full access after purchase</span></li>`).join('')}</ul></section>
<div class="split">${prev}${next}</div></div>
<aside class="card side" style="position:sticky;top:16px"><div class="label">Get this course</div><div class="by-price big"><b>${inr(l.price)}</b>${Number(l.mrp) > Number(l.price) ? `<s>${inr(l.mrp)}</s>` : ''}</div><p class="small muted" style="margin:8px 0 14px">This book comes with all ${l.books.length} books of ${esc(l.name)}.</p><a class="btn btn-gold" style="width:100%" href="buy-checkout.html?id=${l.id}">${I('cart')}Buy now</a><a class="btn" style="width:100%;margin-top:8px" href="buy-detail.html?id=${l.id}">See all books</a></aside></div>`;
    root.onclick = e => { if (e.target.closest('[data-pv]')) previewModal(l, b); };
  }
  function pubCheckout(root) {
    const l = L(new URLSearchParams(location.search).get('id') || 'coding-patterns');
    if (!l) { root.innerHTML = '<div class="card"><div class="empty">Nothing to check out.</div></div>'; return; }
    const ey = document.querySelector('.band-hero .eyebrow'); if (ey) ey.innerHTML = `<a href="buy.html" style="color:inherit">Buy</a> › <a href="buy-detail.html?id=${l.id}" style="color:inherit">${esc(l.name)}</a> › Checkout`;
    let step = 1; const f = { n: '', e: '', p: '' };
    const steps = ['Your details', 'Pay by UPI', 'Done'];
    const summary = `<aside class="card side" style="position:sticky;top:16px"><div class="label" style="margin-bottom:10px">Order summary</div><div class="split"><div><div class="strong">${esc(l.name)}</div><div class="small muted">${l.books.length} course books · PDF</div></div><b>${inr(l.price)}</b></div>${Number(l.mrp) > Number(l.price) ? `<div class="split small muted" style="margin-top:8px"><span>You save</span><span>${inr(l.mrp - l.price)}</span></div>` : ''}<div class="split" style="border-top:1px solid var(--border);margin-top:14px;padding-top:14px"><b>Total</b><b style="font-size:20px;color:var(--navy)">${inr(l.price)}</b></div><ul class="by-inc" style="margin-bottom:0"><li>${I('check')}Books emailed after payment is verified</li><li>${I('check')}One-time payment</li></ul></aside>`;
    function draw() {
      const bar = `<ol class="ed-steps" style="margin:0 0 20px">${steps.map((t, k) => `<li class="${k + 1 < step ? 'done' : k + 1 === step ? 'now' : ''}"><span>${k + 1 < step ? I('check') : k + 1}</span>${t}</li>`).join('')}</ol>`;
      let body;
      if (step === 1) body = `<h2 class="h3" style="margin-bottom:14px">Where should we send your books?</h2><div class="stack" style="gap:14px"><label class="field"><span>Your name <span class="req">*</span></span><input class="input" id="cn" autocomplete="name" value="${esc(f.n)}"></label><label class="field"><span>Email — your books are sent here <span class="req">*</span></span><input class="input" type="email" id="ce" autocomplete="email" value="${esc(f.e)}"></label><label class="field"><span>Phone <span class="muted" style="font-weight:400">(optional)</span></span><input class="input" type="tel" id="cp" autocomplete="tel" value="${esc(f.p)}"></label><span class="error-text" id="cerr" hidden>Enter your name and a valid email.</span><button class="btn btn-gold" type="button" id="c1">Continue to payment${I('arrowR')}</button></div>`;
      else if (step === 2) body = `<h2 class="h3" style="margin-bottom:14px">Pay ${inr(l.price)} by UPI</h2><div class="by-pay" style="margin-top:0"><div style="text-align:center"><div class="by-qr">${qr(S.pay.upi)}</div><div class="strong" style="margin-top:8px">${esc(S.pay.payee)}</div><div class="small muted">${esc(S.pay.upi)}</div></div>
<div class="stack" style="gap:12px"><ol class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px"><li>Open any UPI app and scan the QR, or pay to <b>${esc(S.pay.upi)}</b>.</li><li>Pay exactly <b>${inr(l.price)}</b>.</li><li>Copy the 12-digit UTR / transaction ID from the app and enter it below.</li></ol><label class="field"><span>UPI transaction ID (UTR) <span class="req">*</span></span><input class="input" id="cu" inputmode="numeric" placeholder="12-digit number"></label><span class="error-text" id="uerr" hidden>Enter the 12-digit UTR from your UPI app.</span><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="button" id="cb">${I('arrowL')}Back</button><button class="btn btn-gold" type="button" id="c2">I have paid — submit</button></div></div></div>`;
      else body = `<div style="text-align:center;padding:12px"><span class="icon-box gold" style="margin:0 auto 12px">${I('check')}</span><h2 class="h2">Thank you, ${esc(f.n.split(' ')[0])}!</h2><p class="muted" style="margin-top:8px">Order <b style="color:var(--text)">${esc(f.id)}</b> is received. We’ll verify your payment and email all ${l.books.length} books to <b style="color:var(--text)">${esc(f.e)}</b> — usually within a few hours.</p><a class="btn" href="buy.html" style="margin-top:16px">Back to Buy</a></div>`;
      root.innerHTML = `<div class="row"><section class="card grow">${bar}${body}</section>${summary}</div>`;
      const g = id => root.querySelector('#' + id);
      if (step === 1) g('c1').onclick = () => { f.n = g('cn').value.trim(); f.e = g('ce').value.trim(); f.p = g('cp').value.trim(); if (!f.n || !/^\S+@\S+\.\S+$/.test(f.e)) { g('cerr').hidden = false; return; } step = 2; draw(); };
      if (step === 2) { g('cb').onclick = () => { step = 1; draw(); }; g('c2').onclick = () => { const u = g('cu').value.replace(/\s/g, ''); if (!/^\d{12}$/.test(u)) { g('uerr').hidden = false; return; } f.id = 'ORD-' + (1043 + S.orders.length); S.orders.unshift({ id: f.id, name: f.n, email: f.e, phone: f.p, listing: l.id, amount: Number(l.price), utr: u, at: new Date().toISOString(), status: 'pending' }); save(); step = 3; draw(); }; }
    }
    draw();
  }
  function mount() {
    const a = $('#buy-admin'), p = $('#buy-public'), d = $('#buy-detail');
    if (a) { if (location.hash === '#orders') S.tab = 'orders'; adminEvents(a); admin(a); }
    if (p) pubList(p);
    if (d) pubDetail(d);
    const bm = $('#buy-module'), bc = $('#buy-checkout'); if (bm) pubModule(bm); if (bc) pubCheckout(bc);
    save();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
