/* Prototype flows for MOUs, invoices and payment advice.
   State lives in localStorage so the admin, college and trainer pages of this
   design see each other's actions (share → sign → confirm, mark paid → invoice).
   On the real server these are API calls + notifications; the rules are in README. */
(function () {
  const D = window.LBFDocs;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const I = n => `<svg width="16" height="16" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const pill = (t, k = '') => `<span class="pill ${k}">${t}</span>`;
  const VIEW = (type, id) => `../docs/view.html?type=${type}&id=${encodeURIComponent(id)}`;
  const EDIT = (type, id) => `../super-admin/mou-editor.html?type=${type}&id=${encodeURIComponent(id)}`;
  const today = () => new Date().toISOString().slice(0, 10);
  const ago = iso => { if (!iso) return ''; const s = (Date.now() - new Date(iso)) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + ' min ago' : s < 86400 ? Math.floor(s / 3600) + ' h ago' : D.fdate(iso.slice(0, 10)); };

  /* ---------- events (notifications) ---------- */
  const EK = 'lbf-events';
  const events = () => { try { return JSON.parse(localStorage.getItem(EK)) || []; } catch (e) { return []; } };
  function notify(to, text, sub, link, icon) { const all = events(); all.unshift({ to, text, sub, link, icon, at: new Date().toISOString() }); try { localStorage.setItem(EK, JSON.stringify(all.slice(0, 60))); } catch (e) { } }

  /* ---------- seed data (once) ---------- */
  const SEED_KEY = 'lbf-docs-seeded-v1';
  function seed() {
    let done; try { done = localStorage.getItem(SEED_KEY); } catch (e) { }
    if (done) return;
    const C = 'college-mou', T = 'trainer-mou';
    D.put('cl-crestview-java', null, { type: C, status: 'accepted', title: 'Crestview College of Engineering — Java & DSA', accepted: '2026-11-18T09:12:00Z' });
    D.put('cl-crestview-robotics', { course: 'Robotics', domain: 'Technical', students: '40', batches: '1', days: '10', hoursPerDay: '4', startDate: '2026-10-01', endDate: '2026-10-10', feeType: 'student_hour', rate: '100', mouNo: 'LBF/MOU/2026-27/003', sections: 'Basics of electronics and sensors\nArduino programming\nMotors and control\nMini project' },
      { type: C, status: 'confirmed', title: 'Crestview College of Engineering — Robotics', signedFile: 'MOU-Robotics-signed.pdf', sharedAt: '2026-09-20T10:00:00Z', signedAt: '2026-09-24T08:30:00Z' });
    D.put('cl-pinnacle-fsd', { clName: 'Pinnacle Institute of Technology', clEmail: 'tpo@pinnacle.edu.in', course: 'Full-Stack Development', students: '96', batches: '2', mouNo: 'LBF/MOU/2026-27/005', startDate: '2026-12-07', endDate: '2026-12-22', days: '12' },
      { type: C, status: 'signed', title: 'Pinnacle Institute of Technology — Full-Stack Development', signedFile: 'Pinnacle-FSD-MOU-signed.pdf', sharedAt: '2026-11-12T10:00:00Z', signedAt: '2026-11-17T12:10:00Z' });
    D.put('cl-global-apt', { clName: 'Global Institute of Technology', clEmail: 'placement@git.edu.in', course: 'Quantitative Aptitude', domain: 'Aptitude', students: '180', batches: '4', mouNo: 'LBF/MOU/2026-27/006', feeType: 'student_hour', rate: '60', hoursPerDay: '3' },
      { type: C, status: 'shared', title: 'Global Institute of Technology — Quantitative Aptitude', sharedAt: '2026-11-16T07:00:00Z' });
    D.put('tr-anil-sunrise', { trName: 'Anil Deshmukh', trEmail: 'anil.deshmukh@learnbeingforward.in', college: 'Sunrise Engineering College', course: 'Backend Development', batch: 'BE-SEM5-B1', agNo: 'LBF/TR/2026-27/011', perDay: '4000' },
      { type: T, status: 'signed', title: 'Anil Deshmukh — Sunrise Engineering College', signedFile: 'Anil-agreement-signed.pdf', sharedAt: '2026-10-28T10:00:00Z', signedAt: '2026-10-29T10:00:00Z' });
    D.put('inv-crestview-java', { invNo: 'LBF/INV/2026-27/011', course: 'Java & DSA', students: '120', batches: '1', days: '10', hoursPerDay: '6', feeType: 'batch_day', rate: '10000', startDate: '2026-09-01', endDate: '2026-09-10', amountReceived: '118000', paidOn: '2026-10-06', payRef: 'N2799XXXXXXX', mouNo: 'LBF/MOU/2026-27/002' },
      { type: 'college-invoice', status: 'paid', contract: 'k2', title: 'Crestview — Java & DSA', paidAt: '2026-10-06T10:00:00Z' });
    D.put('adv-demo-oct', { advNo: 'LBF/PA/2026-27/006', period: 'Oct 2026', trName: 'Demo Trainer', trEmail: 'demo.trainer@learnbeingforward.in', college: 'Crestview College of Engineering', course: 'Java & DSA', batch: 'JAVA-SEM5-B1', days: '2', perDay: '4000', travel: '', sessions: '', paidOn: '2026-11-02', agNo: 'LBF/TR/2026-27/008' },
      { type: 'trainer-advice', status: 'paid', pay: 'p0', title: 'Demo Trainer — Oct 2026', paidAt: '2026-11-02T10:00:00Z' });
    notify('admin', 'Crestview College of Engineering accepted the Java & DSA requirement', 'College · prepare and share the MOU', '../super-admin/colleges-mous.html', 'building');
    notify('admin', 'Pinnacle Institute of Technology shared the signed MOU', 'College · Full-Stack Development · confirm the training', '../super-admin/colleges-mous.html', 'file');
    try { localStorage.setItem(SEED_KEY, '1'); } catch (e) { }
  }

  const SEED2 = 'lbf-docs-seeded-v2';
  function seed2() {
    let done; try { done = localStorage.getItem(SEED2); } catch (e) { }
    if (done) return;
    D.put('tr-demo-pit-fsd', { trName: 'Demo Trainer', trEmail: 'demo.trainer@learnbeingforward.in', college: 'Pinnacle Institute of Technology', course: 'Full-Stack Development', batch: 'PIT · FSD-SEM5-B1', agNo: 'LBF/TR/2026-27/015', startDate: '2026-12-07', endDate: '2026-12-22', days: '12', perDay: '4500', travel: '600', travelNote: 'Bus fare actuals, up to ₹600 for the programme' },
      { type: 'trainer-mou', status: 'shared', title: 'Demo Trainer — Pinnacle Institute of Technology', sharedAt: '2026-11-18T11:00:00Z' });
    D.put('tr-demo-cce-java5', { trName: 'Demo Trainer', trEmail: 'demo.trainer@learnbeingforward.in', college: 'Crestview College of Engineering', course: 'Java & DSA', batch: 'CCE · JAVA-SEM5-B1', agNo: 'LBF/TR/2026-27/008', startDate: '2026-08-28', endDate: '2026-09-30', days: '20', perDay: '4000' },
      { type: 'trainer-mou', status: 'signed', title: 'Demo Trainer — Crestview College of Engineering', signedFile: 'Demo-Trainer-CCE-Java-MOU-signed.pdf', sharedAt: '2026-08-20T10:00:00Z', signedAt: '2026-08-22T09:30:00Z' });
    notify('trainer', 'Trainer MOU from Learn Being Forward — Pinnacle Institute of Technology', 'Download, sign and share it back before your first session', '../trainer/mou.html', 'file');
    try { localStorage.setItem(SEED2, '1'); } catch (e) { }
  }
  function toast(t) { document.querySelectorAll('.toast').forEach(x => x.remove()); const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = I('check') + esc(t); document.body.appendChild(el); setTimeout(() => el.remove(), 3200); }
  function modal(html, onReady) {
    const ov = document.createElement('div'); ov.className = 'ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = `<div class="ov-card">${html}</div>`; document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-x]')) ov.remove(); });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { ov.remove(); document.removeEventListener('keydown', k); } });
    const f = ov.querySelector('input,select,button:not([data-x])'); if (f) f.focus();
    onReady && onReady(ov); return ov;
  }
  const allOf = type => Object.entries(D.load()).filter(([, v]) => (v.meta || {}).type === type).map(([id, v]) => ({ id, m: v.meta, d: D.get(id, type) }));

  const CSTAT = { accepted: ['Accepted · MOU needed', 'warning'], draft: ['MOU drafted', 'info'], shared: ['Shared · waiting for signature', 'gold'], signed: ['Signed copy received', 'success'], confirmed: ['Training confirmed', 'success'] };

  /* ===== super-admin: college MOUs ===== */
  function wAdminMous(el) {
    const list = allOf('college-mou');
    const order = { signed: 0, accepted: 1, draft: 2, shared: 3, confirmed: 4 };
    list.sort((a, b) => (order[a.m.status] ?? 9) - (order[b.m.status] ?? 9));
    const count = s => list.filter(x => x.m.status === s).length;
    el.innerHTML = `<section class="card"><div class="grid" style="--min:170px">
<div class="tile warning"><div class="label">MOU needed</div><div class="value">${count('accepted') + count('draft')}</div></div>
<div class="tile gold"><div class="label">Waiting for college</div><div class="value">${count('shared')}</div></div>
<div class="tile success"><div class="label">Signed · to confirm</div><div class="value">${count('signed')}</div></div>
<div class="tile"><div class="label">Confirmed</div><div class="value">${count('confirmed')}</div></div></div></section>
<section class="card"><div class="split" style="margin-bottom:16px"><div><h2 class="h2">College MOUs</h2><p class="subtitle">An MOU is needed as soon as a college accepts a requirement. Nothing is sent until you press Share.</p></div></div><ul class="list">` +
      list.map(({ id, m, d }) => {
        const [lab, k] = CSTAT[m.status] || ['—', ''];
        let act = '';
        if (m.status === 'accepted' || m.status === 'draft') act = `<a class="btn btn-gold btn-sm" href="${EDIT('college-mou', id)}">${I('edit')}${m.status === 'draft' ? 'Continue MOU' : 'Prepare MOU'}</a>`;
        else if (m.status === 'shared') act = `<a class="btn btn-sm" href="${VIEW('college-mou', id)}">${I('eye')}View shared</a><a class="btn btn-sm" href="${EDIT('college-mou', id)}">Edit &amp; reshare</a>`;
        else if (m.status === 'signed') act = `<a class="btn btn-sm" href="${VIEW('college-mou', id)}&signed=1">${I('file')}View signed copy</a><button class="btn btn-success btn-sm" type="button" data-confirm="${id}">${I('check')}Confirm training</button>`;
        else act = `<a class="btn btn-sm" href="${VIEW('college-mou', id)}&signed=1">${I('download')}Signed MOU</a>`;
        const when = m.status === 'signed' ? `Signed copy received ${ago(m.signedAt)} · ${esc(m.signedFile || '')}` : m.status === 'shared' ? `Shared ${ago(m.sharedAt)}` : m.status === 'confirmed' ? `Confirmed · ${esc(m.signedFile || '')}` : `Requirement accepted ${ago(m.accepted)}`;
        return `<li class="list-row" style="flex-wrap:wrap"><span class="icon-box ${m.status === 'signed' ? 'gold' : ''}">${I('file')}</span><div class="grow"><div class="strong">${esc(d.clName)} — ${esc(d.course)}</div>
<div class="small muted">${esc(d.mouNo)} · ${esc(d.students)} students · ${esc(d.batches)} batch(es) · ${esc(d.days)} days × ${esc(d.hoursPerDay)} hrs · from ${D.fdate(d.startDate)}</div><div class="small muted">${when}</div></div>${pill(lab, k)}<div style="display:flex;gap:8px;flex-wrap:wrap">${act}</div></li>`;
      }).join('') + '</ul></section>';
    el.onclick = e => {
      const b = e.target.closest('[data-confirm]'); if (!b) return;
      const id = b.dataset.confirm, d = D.get(id, 'college-mou');
      modal(`<h2 class="h2">Confirm the training?</h2><p class="muted" style="margin-top:6px">${esc(d.clName)} has signed the MOU for ${esc(d.course)}. Confirming locks the dates (${D.fdate(d.startDate)} – ${D.fdate(d.endDate)}) and notifies the college.</p>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-success" type="button" id="go">${I('check')}Confirm training</button></div>`, ov => {
        $('#go', ov).onclick = () => { D.put(id, null, { status: 'confirmed', confirmedAt: new Date().toISOString() }); notify('college', `Training confirmed — ${d.course}`, `Learn Being Forward confirmed the dates ${D.fdate(d.startDate)} – ${D.fdate(d.endDate)}`, '../college/contracts.html', 'check'); ov.remove(); wAdminMous(el); toast('Training confirmed and the college notified'); };
      });
    };
  }

  /* ===== college: MOUs to sign ===== */
  function wCollegeMous(el) {
    const me = el.dataset.college || 'Crestview College of Engineering';
    const list = allOf('college-mou').filter(x => x.d.clName === me && ['shared', 'signed', 'confirmed'].includes(x.m.status));
    el.innerHTML = `<section class="card"><div class="split" style="margin-bottom:16px"><div><h2 class="h2">MOUs from Learn Being Forward</h2><p class="subtitle">Download the MOU, sign it, then upload the signed copy and share it back. The training is confirmed after that.</p></div></div>` +
      (list.length ? '<ul class="list">' + list.map(({ id, m, d }) => {
        const pend = m.status === 'shared';
        return `<li class="box" style="list-style:none;margin-bottom:12px"><div class="split" style="flex-wrap:wrap;gap:10px"><div><b style="color:var(--navy)">${esc(d.course)} — ${esc(d.mouNo)}</b><div class="small muted">${esc(d.students)} students · ${esc(d.batches)} batch(es) · ${esc(d.days)} days · ${D.fdate(d.startDate)} – ${D.fdate(d.endDate)} · ${esc(d.hoursPerDay)} hrs/day</div></div>
${pend ? pill('Needs your signature', 'warning') : m.status === 'signed' ? pill('Signed · waiting for confirmation', 'info') : pill('Training confirmed', 'success')}</div>
${pend ? `<ol class="mini-steps"><li>${I('download')} Download and read the MOU</li><li>${I('edit')} Sign and stamp it</li><li>${I('upload')} Upload the signed copy and share it</li></ol>
<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px"><a class="btn btn-sm" href="${VIEW('college-mou', id)}">${I('download')}Download MOU</a>
<label class="btn btn-sm" style="cursor:pointer">${I('upload')}<span data-fname="${id}">Upload signed copy</span><input type="file" accept="application/pdf,image/*" data-up="${id}" style="display:none"></label>
<button class="btn btn-gold btn-sm" type="button" data-share="${id}" disabled>${I('mail')}Share signed MOU</button></div>` :
            `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="btn btn-sm" href="${VIEW('college-mou', id)}&signed=1">${I('download')}Download MOU</a><span class="small muted" style="align-self:center">Signed copy: ${esc(m.signedFile || '')}</span></div>`}</li>`;
      }).join('') + '</ul>' : `<div class="empty"><div class="h3" style="color:var(--text)">No MOU waiting for you.</div><p class="small muted" style="margin-top:6px">When a requirement you accepted is ready, the MOU appears here and in your notifications.</p></div>`) + '</section>';
    el.onchange = e => { const id = e.target.dataset.up; if (!id || !e.target.files[0]) return; el.querySelector(`[data-fname="${id}"]`).textContent = e.target.files[0].name; const b = el.querySelector(`[data-share="${id}"]`); b.disabled = false; b.dataset.file = e.target.files[0].name; };
    el.onclick = e => {
      const b = e.target.closest('[data-share]'); if (!b || b.disabled) return;
      const id = b.dataset.share, d = D.get(id, 'college-mou');
      modal(`<h2 class="h2">Share the signed MOU?</h2><p class="muted" style="margin-top:6px">${esc(b.dataset.file)} will be sent to Learn Being Forward for ${esc(d.course)}.</p><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-gold" type="button" id="go">${I('mail')}Share signed MOU</button></div>`, ov => {
        $('#go', ov).onclick = () => { D.put(id, null, { status: 'signed', signedFile: b.dataset.file, signedAt: new Date().toISOString() }); notify('admin', `${d.clName} shared the signed MOU`, `College · ${d.course} · confirm the training`, '../super-admin/colleges-mous.html', 'file'); ov.remove(); wCollegeMous(el); toast('Signed MOU shared with Learn Being Forward'); };
      });
    };
  }

  /* ===== super-admin: contracts → mark as paid → invoice ===== */
  const CONTRACTS = [
    { k: 'k1', inv: 'inv-crestview-ds', title: 'Crestview College of Engineering — Data Science / AI Fundamentals', sub: 'Per student, per hour · ₹500/student/hr · 9 students · 1 day × 6 hrs (Sep 16)', state: 'accepted', data: {} },
    { k: 'k2', inv: 'inv-crestview-java', title: 'Crestview College of Engineering — Java &amp; DSA', sub: 'Flat rate per day · ₹10,000/day · 1 batch · 10 days (Sep 1–Sep 10)', state: 'paid' },
    { k: 'k3', title: 'Crestview College of Engineering — Robotics', sub: 'Per student, per hour · ₹100/student/hr · 40 students · 10 days (Oct 1–Oct 10)', state: 'running' },
    { k: 'k4', title: 'Crestview College of Engineering — Frontend Development', sub: 'Per student, per hour · ₹100/student/hr · Min 100 · 20 days (Aug 10–Aug 29)', state: 'sent' }];
  function wAdminSent(el) {
    el.innerHTML = '<ul class="list">' + CONTRACTS.map(c => {
      const meta = c.inv ? D.meta(c.inv) : {};
      const paid = meta.status === 'paid';
      let right;
      if (paid) { const d = D.get(c.inv, 'college-invoice'); right = `${pill('Paid', 'success')}<a class="btn btn-sm" href="${VIEW('college-invoice', c.inv)}">${I('file')}${esc(d.invNo)}</a>`; }
      else if (c.state === 'accepted') right = `${pill('Invoice accepted · not paid', 'warning')}<button class="btn btn-success btn-sm" type="button" data-paid="${c.k}">${I('check')}Mark as paid</button>`;
      else if (c.state === 'running') right = `${pill('Training running')}<button class="btn btn-primary btn-sm" type="button" disabled title="Available after the last training day">Generate invoice</button>`;
      else right = `${pill('Invoice sent · awaiting college', 'info')}`;
      const att = paid ? `<div class="attach">${I('file')}<span><b>Invoice attached</b> · ${esc(D.get(c.inv, 'college-invoice').invNo)} · ${D.inr(D.get(c.inv, 'college-invoice').amountReceived)} received ${D.fdate(D.get(c.inv, 'college-invoice').paidOn)} · shared with the college</span></div>` : '';
      return `<li class="list-row" style="align-items:flex-start;flex-wrap:wrap"><span class="icon-box">${I('briefcase')}</span><div class="grow"><a class="strong" style="color:inherit" href="college-contract.html">${c.title}</a><div class="small muted">${c.sub}</div>${att}</div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${right}</div></li>`;
    }).join('') + '</ul>';
    el.onclick = e => {
      const b = e.target.closest('[data-paid]'); if (!b) return;
      const c = CONTRACTS.find(x => x.k === b.dataset.paid); const d = D.get(c.inv, 'college-invoice'); const f = D.collegeFee(d);
      modal(`<h2 class="h2">Mark as paid</h2><p class="muted" style="margin-top:6px">${c.title}. Saving creates the paid tax invoice, attaches it here and sends it to the college.</p>
<div class="stack" style="gap:12px;margin-top:16px"><div class="grid" style="--min:160px">
<label class="field"><span>Amount received (₹) <span class="req">*</span></span><input class="input" type="number" id="amt" value="${f.total}"></label>
<label class="field"><span>Received on <span class="req">*</span></span><input class="input" type="date" id="dt" value="${today()}"></label>
<label class="field"><span>Mode</span><select class="select" id="mode"><option>NEFT</option><option>RTGS</option><option>IMPS</option><option>UPI</option><option>Cheque</option></select></label>
<label class="field"><span>UTR / reference <span class="req">*</span></span><input class="input" id="ref" placeholder="e.g. N3221…"></label>
<label class="field"><span>TDS deducted by college (₹)</span><input class="input" type="number" id="tds" placeholder="0"></label>
<label class="field"><span>Funding</span><select class="select" id="fund"><option>College</option><option>CSR sponsor</option></select></label></div>
<div class="small muted">Invoice total ${D.inr(f.total)} (fee ${D.inr(f.sub)} + GST ${D.inr(f.tax)})</div><span class="error-text" id="err" hidden>Enter the amount, date and UTR / reference.</span></div>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-success" type="button" id="go">${I('check')}Mark paid &amp; generate invoice</button></div>`, ov => {
        $('#go', ov).onclick = () => {
          const amt = $('#amt', ov).value, dt = $('#dt', ov).value, ref = $('#ref', ov).value.trim();
          if (!amt || !dt || !ref) { $('#err', ov).hidden = false; return; }
          const n = 12 + allOf('college-invoice').length;
          D.put(c.inv, Object.assign({}, d, { invNo: `LBF/INV/2026-27/${String(n).padStart(3, '0')}`, invDate: dt, amountReceived: amt, paidOn: dt, payMode: $('#mode', ov).value, payRef: ref, tdsDeducted: $('#tds', ov).value, funding: $('#fund', ov).value }), { type: 'college-invoice', status: 'paid', contract: c.k, paidAt: new Date().toISOString(), title: c.title });
          const nd = D.get(c.inv, 'college-invoice');
          notify('college', `Payment received — invoice ${nd.invNo}`, `${D.inr(amt)} for ${nd.course}. Download the paid invoice.`, '../college/contracts.html', 'money');
          ov.remove(); wAdminSent(el); toast(`Invoice ${nd.invNo} generated and sent to the college`);
        };
      });
    };
  }
  /* ===== college: invoices received ===== */
  function wCollegeInvoices(el) {
    const list = allOf('college-invoice').filter(x => x.m.status === 'paid');
    el.innerHTML = `<section class="card"><div class="split" style="margin-bottom:14px"><div><h2 class="h2">Paid invoices</h2><p class="subtitle">Generated automatically when Learn Being Forward records your payment.</p></div></div>` +
      (list.length ? `<div class="table-wrap"><table class="table" style="min-width:620px"><thead><tr><th>Invoice</th><th>Training</th><th>Amount received</th><th>Paid on</th><th></th></tr></thead><tbody>` +
        list.map(({ id, d }) => `<tr><td class="strong">${esc(d.invNo)}</td><td>${esc(d.course)}<div class="small muted">${esc(d.students)} students · ${esc(d.days)} day(s)${d.funding === 'CSR sponsor' ? ' · CSR' : ''}</div></td><td>${D.inr(d.amountReceived)}</td><td>${D.fdate(d.paidOn)}</td><td><a class="btn btn-sm" href="${VIEW('college-invoice', id)}">${I('download')}PDF</a></td></tr>`).join('') + '</tbody></table></div>' : '<p class="muted">No paid invoices yet.</p>') + '</section>';
  }

  /* ===== notifications (any role) ===== */
  function wNotes(el) {
    const to = el.dataset.to; const list = events().filter(e => e.to === to);
    el.innerHTML = list.length ? '<ul class="list">' + list.slice(0, Number(el.dataset.max || 20)).map(e => `<li class="list-row"><span class="icon-box gold">${I(e.icon || 'bell')}</span><div class="grow"><div class="strong">${esc(e.text)}</div><div class="small muted">${esc(e.sub || '')}</div></div><span class="small muted">${ago(e.at)}</span>${e.link ? `<a class="btn btn-sm" href="${e.link}">Open</a>` : ''}</li>`).join('') + '</ul>'
      : '<div class="empty"><div class="h3" style="color:var(--text)">No new notifications.</div></div>';
  }

  /* ===== super-admin: schedule — first session needs a trainer MOU ===== */
  function wSchedule(el) {
    const b = el.querySelector('[data-schedule]'); if (!b) return;
    b.addEventListener('click', () => {
      const batch = el.querySelector('[data-f=batch]').value, trainer = el.querySelector('[data-f=trainer]').value, date = el.querySelector('[data-f=date]').value;
      if (batch.startsWith('Select') || trainer.startsWith('Select') || !date) { toast('Pick a batch, a trainer and a date first'); return; }
      const id = 'tr-' + (trainer + '-' + batch).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const has = D.meta(id).status;
      if (has) { toast(`Session scheduled for ${trainer} on ${D.fdate(date)}`); return; }
      const [college, bname] = batch.split(' · ');
      modal(`<span class="icon-box gold" style="margin-bottom:10px">${I('file')}</span><h2 class="h2">First session for ${esc(trainer)} with this batch</h2>
<p class="muted" style="margin-top:6px">The session on ${D.fdate(date)} is saved. Because it is the first one for ${esc(trainer)} with <b style="color:var(--text)">${esc(batch)}</b>, a trainer MOU is needed. It is shared once — not for every session.</p>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap"><button class="btn" type="button" data-x>Later</button><a class="btn btn-gold" id="go" href="#">${I('edit')}Prepare trainer MOU</a></div>`, ov => {
        const go = $('#go', ov);
        const fullCollege = { CCE: 'Crestview College of Engineering', Sunrise: 'Sunrise Engineering College', Pinnacle: 'Pinnacle Institute of Technology' }[college] || college;
        go.href = EDIT('trainer-mou', id);
        go.onclick = () => {
          const nTr = 15 + allOf('trainer-mou').length;
          D.put(id, Object.assign({}, D.DEFAULTS['trainer-mou'], { trName: trainer, trEmail: trainer.toLowerCase().replace(/\s+/g, '.') + '@learnbeingforward.in', college: fullCollege, batch: bname || batch, startDate: date, agNo: `LBF/TR/2026-27/${String(nTr).padStart(3, '0')}` }),
            { type: 'trainer-mou', status: 'draft', title: `${trainer} — ${fullCollege}` });
        };
      });
    });
  }
  /* list of trainer MOUs on the admin schedule page */
  function wAdminTrainerMous(el) {
    const list = allOf('trainer-mou');
    el.innerHTML = list.length ? '<ul class="list">' + list.map(({ id, m, d }) => {
      const [lab, k] = { draft: ['Draft', 'info'], shared: ['Waiting for trainer', 'gold'], signed: ['Signed', 'success'] }[m.status] || ['—', ''];
      const act = m.status === 'draft' ? `<a class="btn btn-gold btn-sm" href="${EDIT('trainer-mou', id)}">Continue</a>` : m.status === 'signed' ? `<a class="btn btn-sm" href="${VIEW('trainer-mou', id)}&signed=1">${I('download')}Signed</a>` : `<a class="btn btn-sm" href="${VIEW('trainer-mou', id)}">${I('eye')}View</a>`;
      return `<li class="list-row" style="flex-wrap:wrap"><div class="grow"><div class="strong">${esc(d.trName)}</div><div class="small muted">${esc(d.college)} · ${esc(d.batch)}</div></div>${pill(lab, k)}${act}</li>`;
    }).join('') + '</ul>' : '<p class="muted">No trainer MOUs yet.</p>';
  }
  /* ===== trainer: agreements to sign ===== */
  function wTrainerMous(el) {
    const me = el.dataset.trainer || 'Demo Trainer';
    const list = allOf('trainer-mou').filter(x => x.d.trName === me && ['shared', 'signed'].includes(x.m.status));
    list.sort((a, b) => (a.m.status === 'shared' ? 0 : 1) - (b.m.status === 'shared' ? 0 : 1));
    if (!list.length) { el.innerHTML = el.dataset.always ? `<section class="card"><div class="empty"><div class="h3" style="color:var(--text)">No MOU yet</div><p class="small muted" style="margin-top:6px">When you're scheduled for your first session with a new batch, Learn Being Forward sends your MOU here.</p></div></section>` : ''; return; }
    el.innerHTML = `<section class="card"><div class="split" style="margin-bottom:14px"><div><h2 class="h2">Trainer MOU</h2><p class="subtitle">Read the rules and payment terms, sign, and share it back before your first session.</p></div></div>` + list.map(({ id, m, d }) => {
      const f = D.trainerFee(d), pend = m.status === 'shared';
      return `<div class="box" style="margin-bottom:12px"><div class="split" style="flex-wrap:wrap;gap:10px"><div><b style="color:var(--navy)">${esc(d.college)} — ${esc(d.course)}</b><div class="small muted">${esc(d.batch)} · ${esc(d.days)} days × ${D.inr(d.perDay)} = ${D.inr(f.gross)} · TDS ${esc(d.tds)}% · paid within ${esc(d.payMin)}–${esc(d.payMax)} days</div></div>${pend ? pill('Needs your signature', 'warning') : pill('Signed', 'success')}</div>
${pend ? `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px"><a class="btn btn-sm" href="${VIEW('trainer-mou', id)}">${I('download')}Download MOU</a><label class="btn btn-sm" style="cursor:pointer">${I('upload')}<span data-fname="${id}">Upload signed copy</span><input type="file" accept="application/pdf,image/*" data-up="${id}" style="display:none"></label><button class="btn btn-gold btn-sm" type="button" data-share="${id}" disabled>${I('mail')}Share signed MOU</button></div>`
          : `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px"><a class="btn btn-sm" href="${VIEW('trainer-mou', id)}&signed=1">${I('download')}Download MOU</a><span class="small muted">Signed copy: ${esc(m.signedFile || '')}</span></div>`}</div>`;
    }).join('') + '</section>';
    el.onchange = e => { const id = e.target.dataset.up; if (!id || !e.target.files[0]) return; el.querySelector(`[data-fname="${id}"]`).textContent = e.target.files[0].name; const b = el.querySelector(`[data-share="${id}"]`); b.disabled = false; b.dataset.file = e.target.files[0].name; };
    el.onclick = e => {
      const b = e.target.closest('[data-share]'); if (!b || b.disabled) return; const id = b.dataset.share, d = D.get(id, 'trainer-mou');
      modal(`<h2 class="h2">Share the signed MOU?</h2><p class="muted" style="margin-top:6px">By sharing, you confirm you accept the rules and payment terms for ${esc(d.college)}.</p><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-gold" type="button" id="go">Share signed MOU</button></div>`, ov => {
        $('#go', ov).onclick = () => { D.put(id, null, { status: 'signed', signedFile: b.dataset.file, signedAt: new Date().toISOString() }); notify('admin', `${d.trName} shared the signed trainer MOU`, `Trainer · ${d.college} · ${d.batch}`, '../super-admin/trainers-schedule.html', 'file'); ov.remove(); wTrainerMous(el); toast('Signed MOU shared'); };
      });
    };
  }

  /* ===== super-admin: trainer payments → payment advice ===== */
  const PAYS = [{ k: 'p1', adv: 'adv-demo-nov', trainer: 'Demo Trainer', period: '01 Nov – 15 Nov 2026', sub: 'Sunrise Engineering College · Backend Development · 6 days × ₹4,000 + travel ₹1,200', state: 'approved' }];
  function wAdminPays(el) {
    el.innerHTML = '<ul class="list">' + PAYS.map(p => {
      const meta = D.meta(p.adv); const paid = meta.status === 'paid';
      const d = D.get(p.adv, 'trainer-advice'); const f = D.trainerFee(d);
      return `<li class="list-row" style="flex-wrap:wrap;align-items:flex-start"><div class="grow"><div class="stat-inline"><span class="avatar sm">DT</span><div><div class="strong">${esc(p.trainer)} · ${esc(p.period)}</div><div class="small muted">${esc(p.sub)}</div></div></div>${paid ? `<div class="attach">${I('file')}<span><b>Payment advice ${esc(d.advNo)}</b> · net ${D.inr(f.net)} paid ${D.fdate(d.paidOn)} · shared with the trainer</span></div>` : ''}</div>
<div style="text-align:right"><strong style="font-size:18px">${D.inr(f.net)}</strong><div class="small muted">gross ${D.inr(f.gross + f.allow)} · TDS ${D.inr(f.tds)}</div></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${paid ? `${pill('Paid', 'success')}<a class="btn btn-sm" href="${VIEW('trainer-advice', p.adv)}">${I('file')}Advice PDF</a>` : `${pill('Approved · not paid', 'warning')}<button class="btn btn-success btn-sm" type="button" data-pay="${p.k}">${I('check')}Mark as paid</button>`}</div></li>`;
    }).join('') + '</ul>';
    el.onclick = e => {
      const b = e.target.closest('[data-pay]'); if (!b) return; const p = PAYS.find(x => x.k === b.dataset.pay); const d = D.get(p.adv, 'trainer-advice'); const f = D.trainerFee(d);
      modal(`<h2 class="h2">Mark trainer payment as paid</h2><p class="muted" style="margin-top:6px">${esc(p.trainer)} · ${esc(p.period)}. Saving creates the payment advice and shares it with the trainer.</p>
<div class="grid" style="--min:160px;margin-top:16px"><label class="field"><span>Paid on <span class="req">*</span></span><input class="input" type="date" id="dt" value="${today()}"></label><label class="field"><span>Mode</span><select class="select" id="mode"><option>NEFT</option><option>IMPS</option><option>UPI</option></select></label><label class="field"><span>UTR / reference <span class="req">*</span></span><input class="input" id="ref"></label></div>
<div class="small muted" style="margin-top:8px">Net ${D.inr(f.net)} = fee ${D.inr(f.gross)} + allowances ${D.inr(f.allow)} − TDS ${D.inr(f.tds)}</div><span class="error-text" id="err" hidden>Enter the date and UTR / reference.</span>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Cancel</button><button class="btn btn-success" type="button" id="go">${I('check')}Mark paid &amp; share advice</button></div>`, ov => {
        $('#go', ov).onclick = () => {
          const dt = $('#dt', ov).value, ref = $('#ref', ov).value.trim(); if (!dt || !ref) { $('#err', ov).hidden = false; return; }
          D.put(p.adv, Object.assign({}, d, { paidOn: dt, payMode: $('#mode', ov).value, payRef: ref, advNo: 'LBF/PA/2026-27/0' + (9 + allOf('trainer-advice').length) }), { type: 'trainer-advice', status: 'paid', pay: p.k, paidAt: new Date().toISOString(), title: `${p.trainer} — ${p.period}` });
          notify('trainer', `Payment of ${D.inr(f.net)} made`, `${p.period} · payment advice attached`, '../trainer/invoice.html', 'money');
          ov.remove(); wAdminPays(el); toast('Payment advice generated and shared with the trainer');
        };
      });
    };
  }
  function wTrainerAdvices(el) {
    const me = el.dataset.trainer || 'Demo Trainer';
    const list = allOf('trainer-advice').filter(x => x.m.status === 'paid' && x.d.trName === me);
    el.innerHTML = list.length ? `<div class="table-wrap"><table class="table" style="min-width:600px"><thead><tr><th>Advice</th><th>Period</th><th>Net paid</th><th>Paid on</th><th></th></tr></thead><tbody>` +
      list.map(({ id, d }) => `<tr><td class="strong">${esc(d.advNo)}</td><td>${esc(d.period)}<div class="small muted">${esc(d.college)}</div></td><td>${D.inr(D.trainerFee(d).net)}<div class="small muted">TDS ${D.inr(D.trainerFee(d).tds)}</div></td><td>${D.fdate(d.paidOn)}</td><td><a class="btn btn-sm" href="${VIEW('trainer-advice', id)}">${I('download')}PDF</a></td></tr>`).join('') + '</tbody></table></div>' : '<p class="muted">No payments yet.</p>';
  }

  const W = { 'admin-mous': wAdminMous, 'college-mous': wCollegeMous, 'admin-sent': wAdminSent, 'college-invoices': wCollegeInvoices, notes: wNotes, schedule: wSchedule, 'admin-trainer-mous': wAdminTrainerMous, 'trainer-mous': wTrainerMous, 'admin-pays': wAdminPays, 'trainer-advices': wTrainerAdvices };
  function run() { seed(); seed2(); document.querySelectorAll('[data-w]').forEach(el => W[el.dataset.w] && W[el.dataset.w](el)); }
  window.LBFFlows = { run, notify, events };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
