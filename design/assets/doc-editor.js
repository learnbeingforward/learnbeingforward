/* MOU editor: every key field is pre-filled from the portal and can be changed
   before sharing. The preview on the right is the exact document that is shared
   and downloaded. Used by super-admin/mou-editor.html?type=college-mou|trainer-mou&id=… */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const q = new URLSearchParams(location.search);
  const type = q.get('type') === 'trainer-mou' ? 'trainer-mou' : 'college-mou';
  const id = q.get('id') || (type === 'trainer-mou' ? 'tr-anil-java' : 'cl-crestview-java');
  const isTr = type === 'trainer-mou';
  const D = window.LBFDocs;
  let data = D.get(id, type);
  let m = D.meta(id);

  const F = (k, label, kind = 'text', o = {}) => Object.assign({ k, label, kind }, o);
  const COMMON_CO = [F('coName', 'Company name'), F('coAddr', 'Registered address', 'ta'), F('coEmail', 'Email', 'email'), F('coPhone', 'Phone', 'tel'), F('coGstin', 'GSTIN'), F('coPan', 'PAN'), F('coRep', 'Signatory name'), F('coRepTitle', 'Signatory title')];
  const SIGN = [F('coSign', 'Company signature image', 'file', { hint: 'PNG with a transparent background works best. Leave empty to use the typed signature.' }), F('coSignTyped', 'Typed signature (used when no image)'), F('coSignDate', 'Date beside the signature', 'date')];
  const SCHEMA = isTr ? [
    ['Agreement', 'file', [F('agNo', 'Agreement number'), F('agDate', 'Agreement date', 'date'), F('place', 'Place of signing')]],
    ['Trainer', 'user', [F('trName', 'Trainer name', 'text', { req: 1 }), F('trPhone', 'Phone', 'tel'), F('trEmail', 'Email', 'email'), F('trPan', 'PAN', 'text', { hint: 'Needed for TDS.' }), F('trAddr', 'Address', 'ta')]],
    ['Assignment', 'calendar', [F('college', 'College name', 'text', { req: 1 }), F('course', 'Course / subject', 'text', { req: 1 }), F('batch', 'Batch(es)'), F('startDate', 'Start date', 'date'), F('endDate', 'End date', 'date'), F('days', 'Total training days', 'number', { req: 1 }), F('timeFrom', 'Daily start', 'time'), F('timeTo', 'Daily end', 'time')]],
    ['Payment terms', 'money', [F('perDay', 'Per-day payment (₹)', 'number', { req: 1 }), F('_total', 'Total training fee', 'calc'), F('travel', 'Travel allowance (₹)', 'number', { hint: 'Leave blank if none — it shows as ₹0 / not applicable.' }), F('travelNote', 'Travel note', 'text', { ph: 'e.g. Bus fare actuals, up to ₹600/day' }),
      F('food', 'Food (₹)', 'number'), F('foodNote', 'Food note', 'text', { ph: 'e.g. Lunch provided by the college' }), F('accommodation', 'Accommodation (₹)', 'number'), F('accommodationNote', 'Accommodation note', 'text'),
      F('tds', 'TDS %', 'number'), F('payMin', 'Pay within — from (days)', 'number'), F('payMax', 'Pay within — to (days)', 'number'), F('jurisdiction', 'City for courts')]],
    ['Additional terms', 'clipboard', [F('specialTerms', 'One term per line (optional)', 'ta', { rows: 4 })]],
    ['Our company', 'building', COMMON_CO],
    ['Signature', 'edit', SIGN]
  ] : [
    ['MOU', 'file', [F('mouNo', 'MOU number'), F('mouDate', 'MOU date', 'date'), F('place', 'Place of signing')]],
    ['College', 'building', [F('clName', 'College name', 'text', { req: 1 }), F('clAddr', 'Address', 'ta'), F('clRep', 'Signatory name'), F('clRepTitle', 'Designation'), F('clEmail', 'Email', 'email'), F('clPhone', 'Phone', 'tel')]],
    ['Training', 'book', [F('course', 'Course / subject', 'text', { req: 1 }), F('domain', 'Domain', 'select', { opts: ['Technical', 'Aptitude', 'Soft Skills', 'Technical + Aptitude'] }), F('sections', 'Sections we train on (one per line)', 'ta', { rows: 5 }),
      F('branch', 'Branch'), F('semester', 'Semester'), F('students', 'Total student strength', 'number', { req: 1 }), F('batches', 'Number of batches', 'number'), F('startDate', 'Start date', 'date'), F('endDate', 'End date', 'date'),
      F('days', 'Total training days', 'number', { req: 1 }), F('hoursPerDay', 'Training hours per day', 'number', { req: 1 }), F('timeFrom', 'Daily start', 'time'), F('timeTo', 'Daily end', 'time'), F('venue', 'Venue / mode')]],
    ['Commercials', 'money', [F('funding', 'Who pays', 'select', { opts: ['College', 'CSR sponsor', 'Free'] }), F('csrSponsor', 'CSR sponsor name'), F('feeType', 'Fee basis', 'select', { opts: [['batch_day', 'Per batch, per day'], ['student_hour', 'Per student, per hour'], ['lump', 'Lump sum']] }),
      F('rate', 'Rate / amount (₹)', 'number', { req: 1 }), F('gstMode', 'GST', 'select', { opts: ['CGST + SGST', 'IGST', 'Not applicable'] }), F('gstRate', 'GST %', 'number'), F('_total', 'Total payable', 'calc')]],
    ['Payment & penalties', 'clock', [F('payDays', 'Pay within (working days after completion)', 'number'), F('interestRate', 'Late-payment interest %', 'number'), F('interestPer', 'Interest charged', 'select', { opts: ['per day', 'per month', 'per annum'] }),
      F('postponeNotice', 'Postponement notice (days)', 'number'), F('delayCharge', 'Delay charge per day (₹)', 'number'), F('jurisdiction', 'City for courts')]],
    ['Additional terms', 'clipboard', [F('specialTerms', 'One term per line (optional)', 'ta', { rows: 4 })]],
    ['Our company', 'building', COMMON_CO],
    ['Signature', 'edit', SIGN]
  ];

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = n => `<svg width="16" height="16" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  function control(f) {
    const v = data[f.k] == null ? '' : data[f.k];
    const at = `data-k="${f.k}" id="f-${f.k}"`;
    if (f.kind === 'ta') return `<textarea class="textarea" rows="${f.rows || 3}" ${at}>${esc(v)}</textarea>`;
    if (f.kind === 'select') return `<select class="select" ${at}>${f.opts.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}"${val === v ? ' selected' : ''}>${esc(lab)}</option>`; }).join('')}</select>`;
    if (f.kind === 'calc') return `<div class="calc" data-calc="1" style="height:44px;display:flex;align-items:center;padding:0 12px;border-radius:8px;background:var(--gold-soft);color:var(--gold-text);font-weight:700"></div>`;
    if (f.kind === 'file') return `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><label class="btn btn-sm" style="cursor:pointer">${icon('upload')}Upload<input type="file" accept="image/*" data-file="${f.k}" style="display:none"></label>${v ? `<img src="${v}" alt="" style="max-height:40px;border:1px solid var(--border);border-radius:6px;padding:2px;background:#fff"><button class="btn btn-sm btn-danger" type="button" data-clear="${f.k}">Remove</button>` : '<span class="small muted">No image yet</span>'}</div>`;
    return `<input class="input" type="${f.kind}" ${at} value="${esc(v)}"${f.ph ? ` placeholder="${esc(f.ph)}"` : ''}>`;
  }
  function form() {
    return SCHEMA.map(([t, ic, fs], gi) => `<details class="ed-group" ${gi < 3 ? 'open' : ''}><summary>${icon(ic)}<span>${t}</span>${icon('chevD')}</summary><div class="ed-fields">` +
      fs.map(f => `<label class="field${f.kind === 'ta' || f.kind === 'file' || f.kind === 'calc' ? ' wide' : ''}"><span>${esc(f.label)}${f.req ? ' <span class="req" aria-hidden="true">*</span>' : ''}</span>${control(f)}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}</label>`).join('') + '</div></details>').join('');
  }
  function calc() {
    const el = document.querySelectorAll('[data-calc]');
    if (!el.length) return;
    let txt;
    if (isTr) { const f = D.trainerFee(data); txt = `${D.inr(f.gross)}  ·  ${data.days || 0} days × ${D.inr(data.perDay)}  ·  net ${D.inr(f.net)} after TDS`; }
    else { const f = D.collegeFee(data); txt = `${D.inr(f.total)}  ·  fee ${D.inr(f.sub)} + GST ${D.inr(f.tax)}`; }
    el.forEach(e => e.textContent = txt);
  }
  function preview() { $('#doc-out').innerHTML = D.render(type, data); calc(); missing(); }
  function missing() {
    const n = $('#doc-out').querySelectorAll('.fv.blank').length;
    const el = $('#ed-missing');
    el.innerHTML = n ? `${icon('target')} ${n} blank field${n > 1 ? 's' : ''} — highlighted in red in the preview` : `${icon('check')} Every field is filled`;
    el.className = 'pill ' + (n ? 'warning' : 'success');
  }
  const STEPS = isTr ? ['Trainer finalised', 'First session scheduled', 'MOU drafted', 'Shared with trainer', 'Signed copy received'] : ['Requirement accepted', 'MOU drafted', 'Shared with college', 'Signed copy received', 'Training confirmed'];
  function stepIndex() { const s = m.status; if (isTr) return s === 'signed' || s === 'confirmed' ? 4 : s === 'shared' ? 3 : 2; return s === 'confirmed' ? 4 : s === 'signed' ? 3 : s === 'shared' ? 2 : 1; }
  function steps() {
    const i = stepIndex();
    $('#ed-steps').innerHTML = STEPS.map((s, k) => `<li class="${k < i ? 'done' : k === i ? 'now' : ''}"><span>${k < i ? icon('check') : k + 1}</span>${s}</li>`).join('');
    const who = isTr ? 'trainer' : 'college';
    const sb = $('#ed-share');
    if (m.status === 'shared') { sb.innerHTML = `${icon('clock')}Shared — waiting for the signed copy`; sb.className = 'btn'; sb.disabled = true; }
    else if (m.status === 'signed' || m.status === 'confirmed') { sb.innerHTML = `${icon('check')}Signed by the ${who}`; sb.className = 'btn btn-success'; sb.disabled = true; }
    else { sb.innerHTML = `${icon('mail')}Share with ${who}`; sb.className = 'btn btn-gold'; sb.disabled = false; }
  }
  function toast(t) { document.querySelectorAll('.toast').forEach(x => x.remove()); const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = icon('check') + esc(t); document.body.appendChild(el); setTimeout(() => el.remove(), 3200); }
  function persist(silent) { D.put(id, data, { type, status: m.status || 'draft', title: isTr ? `${data.trName} — ${data.college}` : `${data.clName} — ${data.course}`, updated: new Date().toISOString() }); m = D.meta(id); if (!silent) toast('Draft saved'); }

  function mount() {
    const root = $('#mou-editor');
    root.innerHTML = `
<div class="ed-bar card"><div class="split" style="gap:16px">
<div><div class="label">${isTr ? 'Trainer MOU' : 'College MOU'} · ${esc(isTr ? data.agNo : data.mouNo)}</div><h2 class="h2" style="margin-top:4px">${esc(isTr ? data.trName + ' — ' + data.college : data.clName + ' — ' + data.course)}</h2></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span id="ed-missing" class="pill"></span>
<button class="btn btn-sm" type="button" id="ed-reset">${icon('refresh')}Reset to defaults</button>
<button class="btn btn-sm" type="button" id="ed-save">Save draft</button>
<a class="btn btn-sm" id="ed-dl" href="#">${icon('download')}Download PDF</a>
<button class="btn btn-gold" type="button" id="ed-share"></button></div></div>
<ol class="ed-steps" id="ed-steps"></ol></div>
<div class="ed-wrap">
<aside class="card ed-form"><div class="alert gold" style="margin-bottom:14px">${icon('edit')}<span>Everything is filled from the ${isTr ? 'schedule and trainer profile' : 'requirement the college accepted'}. Change anything here — the preview updates as you type.</span></div>${form()}</aside>
<div class="doc-preview"><div class="doc-stack" id="doc-out"></div></div></div>`;
    $('#ed-dl').href = `../docs/view.html?type=${type}&id=${encodeURIComponent(id)}`;
    root.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; data[k] = e.target.value; preview(); clearTimeout(window.__t); window.__t = setTimeout(() => persist(true), 400); });
    root.addEventListener('change', e => {
      const fk = e.target.dataset.file; if (!fk || !e.target.files[0]) return;
      const r = new FileReader(); r.onload = () => { data[fk] = r.result; persist(true); rerenderForm(); preview(); }; r.readAsDataURL(e.target.files[0]);
    });
    root.addEventListener('click', e => {
      const t = e.target.closest('button,a'); if (!t) return;
      if (t.dataset.clear) { data[t.dataset.clear] = ''; persist(true); rerenderForm(); preview(); }
      if (t.id === 'ed-save') persist();
      if (t.id === 'ed-dl') persist(true);
      if (t.id === 'ed-reset') { data = Object.assign({}, D.DEFAULTS[type]); persist(true); rerenderForm(); preview(); toast('Reset to the default details'); }
      if (t.id === 'ed-share') confirmShare();
    });
    persist(true); preview(); steps();
  }
  function rerenderForm() { const open = [...document.querySelectorAll('.ed-group')].map(d => d.open); $('.ed-form').innerHTML = $('.ed-form .alert').outerHTML + form(); document.querySelectorAll('.ed-group').forEach((d, i) => d.open = open[i]); calc(); }
  function confirmShare() {
    const n = $('#doc-out').querySelectorAll('.fv.blank').length;
    const to = isTr ? `${data.trName} (${data.trEmail || 'trainer portal'})` : `${data.clName} (${data.clEmail || 'college portal'})`;
    const ov = document.createElement('div'); ov.className = 'ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = `<div class="ov-card"><h2 class="h2">Share this MOU?</h2><p class="muted" style="margin-top:6px">It goes to <b style="color:var(--text)">${esc(to)}</b> as a notification with the PDF attached. They download it, sign it and send the signed copy back here.</p>
${n ? `<div class="alert warning" style="margin-top:14px">${icon('target')}<span>${n} field${n > 1 ? 's are' : ' is'} still blank. You can share now and they’ll appear as blanks, or go back and fill them.</span></div>` : ''}
<label class="check" style="margin-top:14px"><input type="checkbox" id="ov-ok"> I have reviewed the MOU and the details are correct</label>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" type="button" data-x>Back to editing</button><button class="btn btn-gold" type="button" id="ov-go" disabled>${icon('mail')}Confirm &amp; share</button></div></div>`;
    document.body.appendChild(ov);
    const ok = $('#ov-ok', ov), go = $('#ov-go', ov); ok.focus();
    ok.onchange = () => go.disabled = !ok.checked;
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-x]')) ov.remove(); });
    go.onclick = () => { if (window.LBFFlows) LBFFlows.notify(isTr ? 'trainer' : 'college', isTr ? `Trainer MOU from Learn Being Forward — ${data.college}` : `MOU received — ${data.course}`, isTr ? 'Download, sign and share it back before your first session' : `${data.mouNo} · download, sign and share the signed copy`, isTr ? '../trainer/mou.html' : '../college/contracts.html', 'file'); m.status = 'shared'; D.put(id, data, { status: 'shared', sharedAt: new Date().toISOString() }); m = D.meta(id); ov.remove(); steps(); toast(`Shared with ${isTr ? data.trName : data.clName}`); };
  }
  document.addEventListener('DOMContentLoaded', mount);
  if (document.readyState !== 'loading') mount();
})();
