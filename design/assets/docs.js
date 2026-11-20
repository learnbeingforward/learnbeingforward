/* Learn Being Forward — document engine.
   Renders the College MOU, Trainer MOU, College tax invoice and Trainer payment advice
   from a plain data object, so the same template is used by the editor preview,
   the shared copy and the downloadable PDF (browser print → Save as PDF; on the
   real server, render the same HTML with a headless browser to make the PDF).
   Values filled from data are wrapped in .fv so the editor can highlight them. */
(function () {
  const CAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = x => { const n = parseFloat(String(x).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : n; };
  const inr = n => '₹' + Math.round(num(n)).toLocaleString('en-IN');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fdate = s => { if (!s) return ''; const d = new Date(s + 'T00:00:00'); return isNaN(d) ? s : `${String(d.getDate()).padStart(2, '0')} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
  const t12 = s => { if (!s) return ''; const [h, m] = s.split(':').map(Number); if (isNaN(h)) return s; return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };

  /* Indian-system amount in words: "Rupees One Lakh Twenty Thousand Only" */
  function words(n) {
    n = Math.round(num(n));
    if (n === 0) return 'Rupees Zero Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const two = x => x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : '');
    const three = x => (x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' : '') : '') + (x % 100 ? two(x % 100) : '');
    const parts = [];
    const cr = Math.floor(n / 1e7); n %= 1e7; const lk = Math.floor(n / 1e5); n %= 1e5; const th = Math.floor(n / 1e3); n %= 1e3;
    if (cr) parts.push(three(cr) + ' Crore'); if (lk) parts.push(two(lk) + ' Lakh'); if (th) parts.push(two(th) + ' Thousand'); if (n) parts.push(three(n));
    return 'Rupees ' + parts.join(' ') + ' Only';
  }

  /* ---------- shared page chrome ---------- */
  function page(ctx, inner, i, n, opts = {}) {
    const d = ctx.d;
    return `<section class="doc-page${opts.cls ? ' ' + opts.cls : ''}">
<div class="doc-wm" aria-hidden="true">${CAP}<span>LEARN BEING FORWARD</span></div>
<div class="doc-body">
<div class="doc-head"><div class="doc-brand">${CAP}<div><b>Learn Being <span>Forward</span></b><small>Training · Placements · Careers</small></div></div>
<div class="meta">${esc(ctx.kind)}<br>${esc(ctx.ref)}</div></div>
<div class="doc-company"><strong>${V(d, 'coName')}</strong><br>${V(d, 'coAddr')}<br>${V(d, 'coEmail')} · ${V(d, 'coPhone')}${d.coGstin ? ' · GSTIN ' + V(d, 'coGstin') : ''}</div>
${inner}
</div>
<div class="doc-foot"><span>${esc(ctx.ref)} · Page ${i} of ${n}</span>${opts.initials === false ? '' : `<span class="init"><span>For ${esc(opts.leftInit || 'Learn Being Forward')}</span><span>For ${esc(opts.rightInit || '')}</span></span>`}</div>
</section>`;
  }
  /* value from data, highlighted; blank shows a red "fill in" marker */
  function V(d, k, fmt) {
    let v = d[k];
    if (v == null || v === '') return `<span class="fv blank">[${esc(LABEL[k] || k)}]</span>`;
    if (fmt) v = fmt(v);
    return `<span class="fv">${esc(v)}</span>`;
  }
  const RAW = (v) => `<span class="fv">${esc(v)}</span>`;
  function sign(d, side) {
    const co = side === 'co';
    const img = co ? d.coSign : d.otherSign;
    const typed = co ? d.coSignTyped : d.otherSignTyped;
    const name = co ? d.coRep : (d.clRep || d.trName);
    const title = co ? d.coRepTitle : (d.clRepTitle || 'Trainer');
    const org = co ? d.coName : (d.clName || '');
    const date = co ? d.coSignDate : d.otherSignDate;
    const pad = img ? `<img src="${img}" alt="Signature">` : typed ? `<span class="typed">${esc(typed)}</span>` : `<span class="sig-empty">Signature</span>`;
    return `<div class="blk"><div class="date">Date: ${date ? RAW(fdate(date)) : '<span class="fv blank">[date]</span>'}</div><div class="pad">${pad}</div>
<div class="who"><b>${name ? RAW(name) : '<span class="fv blank">[name]</span>'}</b>${esc(title)}${org ? '<br>' + esc(org) : ''}</div></div>`;
  }
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);

  const LABEL = {
    coName: 'Company name', coAddr: 'Registered address', coEmail: 'Company email', coPhone: 'Company phone', coGstin: 'Company GSTIN', coPan: 'Company PAN', coRep: 'Signatory name', coRepTitle: 'Signatory title',
    clName: 'College name', clAddr: 'College address', clRep: 'College signatory', clRepTitle: 'Designation', clEmail: 'College email', clPhone: 'College phone', clGstin: 'College GSTIN',
    course: 'Course', sections: 'Sections', branch: 'Branch', semester: 'Semester', students: 'Total student strength', batches: 'Number of batches', startDate: 'Start date', endDate: 'End date', days: 'Total days', hoursPerDay: 'Hours per day',
    timeFrom: 'Daily start time', timeTo: 'Daily end time', venue: 'Venue', rate: 'Rate', payDays: 'Payment days', interestRate: 'Late interest', delayCharge: 'Delay charge', postponeNotice: 'Notice days', jurisdiction: 'City for courts',
    trName: 'Trainer name', trPhone: 'Trainer phone', trEmail: 'Trainer email', trPan: 'Trainer PAN', trAddr: 'Trainer address', college: 'College', batch: 'Batch', perDay: 'Per-day payment', travel: 'Travel allowance', food: 'Food', accommodation: 'Accommodation',
    mouNo: 'MOU number', mouDate: 'MOU date', place: 'Place', agNo: 'Agreement number', agDate: 'Agreement date', invNo: 'Invoice number', invDate: 'Invoice date', paidOn: 'Payment date', payRef: 'UTR / reference', payMode: 'Payment mode',
    csrSponsor: 'CSR sponsor', advNo: 'Advice number', period: 'Period', bankName: 'Bank name', bankAcc: 'Account number', bankIfsc: 'IFSC', placeOfSupply: 'Place of supply', amountReceived: 'Amount received', trBank: 'Trainer bank account', clGstin: 'College GSTIN', payMin: 'From days', payMax: 'To days', tds: 'TDS %'
  };

  /* ---------- fee maths (college) ---------- */
  function collegeFee(d) {
    const days = num(d.days), hrs = num(d.hoursPerDay), st = num(d.students), bt = num(d.batches) || 1, rate = num(d.rate);
    let basisText, qty, sub;
    if (d.funding === 'Free') { basisText = 'Free of cost'; qty = ''; sub = 0; }
    else if (d.feeType === 'student_hour') { sub = rate * st * hrs * days; basisText = `${inr(rate)} per student per hour`; qty = `${st} students × ${hrs} hrs/day × ${days} days`; }
    else if (d.feeType === 'batch_day') { sub = rate * bt * days; basisText = `${inr(rate)} per batch per day`; qty = `${bt} batch${bt > 1 ? 'es' : ''} × ${days} days`; }
    else { sub = rate; basisText = 'Lump sum for the programme'; qty = '1'; }
    const g = d.gstMode === 'Not applicable' || d.funding === 'Free' ? 0 : num(d.gstRate || 18);
    const tax = Math.round(sub * g / 100);
    return { sub, tax, g, total: sub + tax, basisText, qty };
  }
  function trainerFee(d) {
    const gross = num(d.perDay) * num(d.days);
    const allow = num(d.travel) + num(d.food) + num(d.accommodation);
    const tds = Math.round(gross * num(d.tds || 10) / 100);
    return { gross, allow, tds, net: gross + allow - tds };
  }

  /* =====================================================================
     COLLEGE MOU — 7 pages
     ===================================================================== */
  function collegeMOU(d) {
    const ctx = { d, kind: 'Memorandum of Understanding', ref: 'MOU No. ' + (d.mouNo || '—') };
    const f = collegeFee(d), N = 7, o = { rightInit: d.clName || 'the College' };
    const sec = lines(d.sections);
    const pages = [];
    pages.push(page(ctx, `
<div class="doc-title"><h1>Memorandum of Understanding</h1><p>Campus Training Programme · ${V(d, 'course')}</p></div>
<p style="text-align:center;margin-top:3mm">This Memorandum of Understanding (“MOU”) is made and entered into on ${V(d, 'mouDate', fdate)} at ${V(d, 'place')}</p>
<p style="text-align:center;font-weight:600;color:#1C2B4A">BY AND BETWEEN</p>
<div class="doc-parties">
<div class="doc-party"><div class="lbl">First party · Training partner</div><b>${V(d, 'coName')}</b>${V(d, 'coAddr')}<br>Represented by ${V(d, 'coRep')}, ${V(d, 'coRepTitle')}<br>${V(d, 'coEmail')} · ${V(d, 'coPhone')}</div>
<div class="doc-party"><div class="lbl">Second party · Institution</div><b>${V(d, 'clName')}</b>${V(d, 'clAddr')}<br>Represented by ${V(d, 'clRep')}, ${V(d, 'clRepTitle')}<br>${V(d, 'clEmail')} · ${V(d, 'clPhone')}</div>
</div>
<p>hereinafter referred to as “<b>the Company</b>” and “<b>the College</b>” respectively, which expressions shall, unless repugnant to the context, include their successors, administrators and permitted assigns. The Company and the College are together referred to as “the Parties” and individually as “a Party”.</p>
<h2>Recitals</h2>
<ol type="A">
<li><b>WHEREAS</b> the Company is engaged in providing technical, aptitude, soft-skills and placement-oriented training to students of educational institutions;</li>
<li><b>WHEREAS</b> the College is an educational institution desirous of improving the employability and academic outcomes of its students;</li>
<li><b>WHEREAS</b> the Company shared a training requirement with the College, and the College reviewed and accepted the said requirement through the Learn Being Forward portal;</li>
<li><b>NOW, THEREFORE</b>, in consideration of the mutual promises set out herein, the Parties agree to the following terms and conditions.</li>
</ol>`, 1, N, o));

    pages.push(page(ctx, `
<h2><span class="n">1.</span>Purpose and scope</h2>
<p>The purpose of this MOU is to set out the terms on which the Company shall deliver the training programme described below to the identified students of the College, and the obligations of each Party in respect of scheduling, conduct, attendance, assessment and payment.</p>
<h2><span class="n">2.</span>Programme details</h2>
<table>
<tr><th>Name of the institution</th><td>${V(d, 'clName')}</td></tr>
<tr><th>Training programme / course</th><td>${V(d, 'course')}${d.domain ? ' (' + RAW(d.domain) + ')' : ''}</td></tr>
<tr><th>Branch</th><td>${V(d, 'branch')}</td></tr>
<tr><th>Semester</th><td>${V(d, 'semester')}</td></tr>
<tr><th>Total student strength</th><td>${V(d, 'students')} students</td></tr>
<tr><th>Number of batches</th><td>${V(d, 'batches')}</td></tr>
<tr><th>Training period</th><td>${V(d, 'startDate', fdate)} to ${V(d, 'endDate', fdate)}</td></tr>
<tr><th>Total training days</th><td>${V(d, 'days')} days</td></tr>
<tr><th>Training hours per day</th><td>${V(d, 'hoursPerDay')} hours per batch per day</td></tr>
<tr><th>Daily timing</th><td>${V(d, 'timeFrom', t12)} to ${V(d, 'timeTo', t12)}</td></tr>
<tr><th>Venue / mode</th><td>${V(d, 'venue')}</td></tr>
</table>
<h2><span class="n">3.</span>Sections and topics to be covered</h2>
${sec.length ? '<ol>' + sec.map(s => `<li>${RAW(s)}</li>`).join('') + '</ol>' : '<p><span class="fv blank">[Sections]</span></p>'}
<p>The detailed day-wise plan for the above sections shall be shared by the Company before the start of the programme and may be reordered by the trainer to suit the pace of the batch, without reducing the total hours agreed.</p>`, 2, N, o));

    pages.push(page(ctx, `
<h2><span class="n">4.</span>Schedule and timings</h2>
<ol>
<li>Once this MOU is signed and the training dates are confirmed, both Parties shall strictly adhere to the confirmed dates. The training shall run for ${V(d, 'days')} days from ${V(d, 'startDate', fdate)} to ${V(d, 'endDate', fdate)}.</li>
<li>Each batch shall be trained for ${V(d, 'hoursPerDay')} hours per day between ${V(d, 'timeFrom', t12)} and ${V(d, 'timeTo', t12)}. Session start and end times shall be followed as published in the schedule shared on the portal.</li>
<li>The College shall ensure that students are released from other academic activities during the scheduled hours and that the classroom or lab is available and ready at least 15 minutes before the first session of each day.</li>
<li>Breaks within a training day shall be as per the College timetable and shall not reduce the agreed training hours.</li>
</ol>
<h2><span class="n">5.</span>Postponement, cancellation and delay charges</h2>
<ol>
<li><b>No postponement after confirmation.</b> Once the dates are confirmed, the training shall not be postponed or rescheduled by either Party, except in the circumstances described in the clause on force majeure.</li>
<li>If a postponement is unavoidable, the Party seeking it shall give at least ${V(d, 'postponeNotice')} days’ written notice to the other Party, along with the reason and proposed new dates.</li>
<li><b>Delay charges.</b> If any scheduled training day is postponed, cancelled or not delivered, the Party responsible for the postponement shall bear delay charges of ${V(d, 'delayCharge', inr)} per affected training day, in addition to any direct costs already incurred by the other Party (such as trainer travel and accommodation).</li>
<li>Where the postponement is caused by the College (for example, examinations, events, holidays or non-availability of students or rooms that were not communicated before confirmation), the delay charges shall be added to the College’s invoice.</li>
<li>Where the postponement is caused by the Company (for example, non-availability of the trainer), the Company shall arrange a replacement trainer of equivalent expertise or deliver the missed hours at no extra cost, and the delay charges shall be adjusted against the College’s invoice.</li>
<li>Missed hours shall be rescheduled by mutual agreement within the training period wherever possible.</li>
</ol>`, 3, N, o));

    pages.push(page(ctx, `
<h2><span class="n">6.</span>Responsibilities of the Company</h2>
<ol>
<li>Provide qualified trainers for the agreed course and sections, and replace a trainer promptly if required.</li>
<li>Share the day-wise plan, session schedule and course content through the Learn Being Forward portal.</li>
<li>Ensure that trainers report on time, follow the published timings, maintain professional conduct and dress code, and mark attendance for every session on the portal.</li>
<li>Conduct assessments where included in the programme and share results with the College through the portal.</li>
<li>Issue certificates to eligible students as per the clause on certificates.</li>
<li>Keep student data confidential and use it only for delivering and reporting on the training.</li>
</ol>
<h2><span class="n">7.</span>Responsibilities of the College</h2>
<ol>
<li>Provide a classroom or computer lab for each batch with working systems (for technical training), a projector or display with HDMI connectivity, power supply, a whiteboard and a stable internet connection.</li>
<li>Nominate a single point of contact (training / placement coordinator) who is available during training hours.</li>
<li>Ensure the attendance and discipline of students, and support the trainer in maintaining classroom conduct.</li>
<li>Share the final list of students for each batch, with branch and semester, at least 3 working days before the start date, and register the students on the portal.</li>
<li>Review and approve attendance and other requests raised on the portal within a reasonable time.</li>
<li>Not engage the trainers deputed by the Company directly or through any other agency, for training of a similar nature, during the term of this MOU and for 12 months thereafter.</li>
</ol>
<h2><span class="n">8.</span>Certificates</h2>
<p>A certificate of completion shall be issued to every student with at least 75% attendance. The College may request, in writing on the portal, that a certificate be issued to a student below this threshold for a genuine reason; the Company may approve such a request at its discretion.</p>`, 4, N, o));

    const fundingRow = d.funding === 'CSR sponsor' ? `<tr><th>Funding</th><td>CSR programme, sponsored by ${V(d, 'csrSponsor')}</td></tr>` : d.funding === 'Free' ? `<tr><th>Funding</th><td>${RAW('Free of cost to the College')}</td></tr>` : `<tr><th>Funding</th><td>${RAW('Paid by the College')}</td></tr>`;
    pages.push(page(ctx, `
<h2><span class="n">9.</span>Commercials</h2>
<table>
${fundingRow}
<tr><th>Fee basis</th><td>${RAW(f.basisText)}</td></tr>
<tr><th>Quantity</th><td>${RAW(f.qty || '—')}</td></tr>
<tr><th>Training fee</th><td>${RAW(inr(f.sub))}</td></tr>
<tr><th>GST</th><td>${f.g ? RAW(`${d.gstMode || 'GST'} @ ${f.g}% — ${inr(f.tax)}`) : RAW('Not applicable')}</td></tr>
<tr class="total"><td>Total payable</td><td>${RAW(inr(f.total))}<br><span style="font-weight:500;font-size:8.5pt">${esc(words(f.total))}</span></td></tr>
</table>
<p>The final invoice shall be raised on the actual number of students, batches and days delivered, at the rate above. Any delay charges under clause 5 shall be shown separately on the invoice.</p>
<h2><span class="n">10.</span>Payment terms</h2>
<ol>
<li>The College shall clear the full invoice amount within <b>${V(d, 'payDays')} working days</b> of the completion of the training, by bank transfer to the account mentioned on the invoice.</li>
<li><b>Late payment.</b> If the payment is not received within ${V(d, 'payDays')} working days of the training completion, the College shall be liable to pay interest at <b>${V(d, 'interestRate')}% ${V(d, 'interestPer')}</b> on the outstanding amount, from the day after the due date until the date of actual payment.</li>
<li>Tax deducted at source, if any, shall be deducted as per law, and the College shall issue the TDS certificate within the statutory time.</li>
<li>Once the Company’s accounts team marks the payment as received, a paid invoice shall be generated and shared with the College on the portal.</li>
<li>The Company reserves the right to withhold certificates, assessment reports and further training under any other engagement until the outstanding amount, including interest, is cleared.</li>
</ol>`, 5, N, o));

    const special = lines(d.specialTerms);
    pages.push(page(ctx, `
<h2><span class="n">11.</span>Confidentiality</h2>
<p>Each Party shall keep confidential the commercial terms of this MOU, the course content and materials of the Company, and the personal data of students, and shall not disclose them to any third party without the prior written consent of the other Party, except as required by law. The College shall not discuss or negotiate commercial terms with the trainers directly; all such matters shall be addressed to the Company.</p>
<h2><span class="n">12.</span>Intellectual property</h2>
<p>All course content, presentations, assessments, notes and other materials provided by the Company remain the intellectual property of the Company. They are provided for the use of the enrolled students only and shall not be copied, recorded, distributed or used for any other training without the Company’s written consent.</p>
<h2><span class="n">13.</span>Term and termination</h2>
<ol>
<li>This MOU comes into force on the date of signing by both Parties and remains valid until the completion of the training and the settlement of all payments.</li>
<li>Either Party may terminate this MOU by giving 15 days’ written notice if the other Party materially breaches its terms and does not remedy the breach within 7 days of being notified.</li>
<li>On termination, the College shall pay for all training days delivered up to the date of termination, together with any delay charges and interest due.</li>
</ol>
<h2><span class="n">14.</span>Additional terms</h2>
${special.length ? '<ol>' + special.map(s => `<li>${RAW(s)}</li>`).join('') + '</ol>' : '<p>None.</p>'}`, 6, N, o));

    pages.push(page(ctx, `
<h2><span class="n">15.</span>Force majeure</h2>
<p>Neither Party shall be liable for a delay or failure caused by events beyond its reasonable control, including natural disasters, epidemics, government orders, riots or prolonged disruption of essential services. The affected Party shall inform the other promptly, and the Parties shall agree new dates for the affected days. Delay charges under clause 5 shall not apply to such events.</p>
<h2><span class="n">16.</span>Dispute resolution</h2>
<p>The Parties shall first attempt to resolve any dispute amicably through discussion between their authorised representatives. If the dispute is not resolved within 30 days, it shall be subject to the exclusive jurisdiction of the courts at ${V(d, 'jurisdiction')}. This MOU is governed by the laws of India.</p>
<h2><span class="n">17.</span>General</h2>
<p>This MOU, together with the training requirement accepted on the portal, is the entire understanding between the Parties on this programme. Any change shall be valid only if made in writing and accepted by both Parties. Notices may be sent by email to the addresses above or through the portal.</p>
<p style="margin-top:5mm"><b>IN WITNESS WHEREOF</b>, the Parties have signed this Memorandum of Understanding through their authorised representatives on the dates written below.</p>
<div class="doc-sign">${sign(d, 'co')}${sign(d, 'other')}</div>
<div class="doc-witness"><div>Witness 1: name &amp; signature</div><div>Witness 2: name &amp; signature</div></div>`, 7, N, o));
    return pages.join('');
  }

  /* =====================================================================
     TRAINER MOU — 6 pages
     ===================================================================== */
  function trainerMOU(d) {
    const ctx = { d, kind: 'Trainer Engagement MOU', ref: 'Agreement No. ' + (d.agNo || '—') };
    const f = trainerFee(d), N = 6, o = { rightInit: 'the Trainer' };
    const allowRow = (k, label) => `<tr><th>${label}</th><td>${num(d[k]) ? RAW(inr(d[k])) + (d[k + 'Note'] ? ' — ' + RAW(d[k + 'Note']) : '') : RAW(d[k + 'Note'] || 'Not applicable (₹0)')}</td></tr>`;
    const P = [];
    P.push(page(ctx, `
<div class="doc-title"><h1>Trainer Engagement MOU</h1><p>Memorandum of Understanding for Training Delivery</p></div>
<p style="text-align:center;margin-top:3mm">This Memorandum of Understanding is made on ${V(d, 'agDate', fdate)} at ${V(d, 'place')}</p>
<p style="text-align:center;font-weight:600;color:#1C2B4A">BY AND BETWEEN</p>
<div class="doc-parties">
<div class="doc-party"><div class="lbl">The Company</div><b>${V(d, 'coName')}</b>${V(d, 'coAddr')}<br>Represented by ${V(d, 'coRep')}, ${V(d, 'coRepTitle')}</div>
<div class="doc-party"><div class="lbl">The Trainer</div><b>${V(d, 'trName')}</b>${V(d, 'trAddr')}<br>${V(d, 'trPhone')} · ${V(d, 'trEmail')}<br>PAN: ${V(d, 'trPan')}</div>
</div>
<p>The Company engages the Trainer, as an independent professional and not as an employee, to deliver the training described below on behalf of the Company, on the terms set out in this MOU.</p>
<h2><span class="n">1.</span>Assignment</h2>
<table>
<tr><th>College</th><td>${V(d, 'college')}</td></tr>
<tr><th>Course / subject</th><td>${V(d, 'course')}</td></tr>
<tr><th>Batch(es)</th><td>${V(d, 'batch')}</td></tr>
<tr><th>Training period</th><td>${V(d, 'startDate', fdate)} to ${V(d, 'endDate', fdate)}</td></tr>
<tr><th>Total training days</th><td>${V(d, 'days')} days</td></tr>
<tr><th>Daily timing</th><td>${V(d, 'timeFrom', t12)} to ${V(d, 'timeTo', t12)} (as per the schedule on the portal)</td></tr>
</table>
<p>The session-wise schedule is published on the Trainer’s portal and forms part of this MOU. Changes to the schedule will be communicated only by the Company.</p>`, 1, N, o));

    P.push(page(ctx, `
<h2><span class="n">2.</span>Code of conduct — punctuality and classes</h2>
<ol>
<li>Reach the college campus at least <b>10 minutes</b> before the first session of the day.</li>
<li>Be present in the classroom or lab at least <b>5 minutes</b> before each session starts, with the system and projector ready.</li>
<li>Follow the session timings exactly as mentioned in the schedule. Do not start late, end early or extend sessions without the Company’s approval.</li>
<li>Release the students on time at the end of every session.</li>
<li>Take attendance in every session and update it on the portal <b>per session</b>, on the same day. Payments are calculated from the attendance and sessions recorded on the portal.</li>
<li>Cover the topics planned for each session and record what was taught on the portal.</li>
</ol>
<h2><span class="n">3.</span>Escalation</h2>
<ol>
<li>For any issue at the college — students, rooms, systems, timings, behaviour or any request from college staff — contact the Company administration immediately.</li>
<li>Do not take any decision on your own about changing the schedule, cancelling or adding sessions, changing the syllabus, or making any commitment to the college. All such decisions are taken only by the Company.</li>
</ol>`, 2, N, o));

    P.push(page(ctx, `
<h2><span class="n">4.</span>Dress code and presentation</h2>
<ol>
<li>Wear formal, decent clothing in all colleges for the full training day.</li>
<li><b>Men:</b> formal shirt and formal trousers with formal shoes. Jeans, T-shirts and sports shoes are not allowed.</li>
<li><b>Women:</b> sarees, kurtis, or salwar kameez, or formal shirt and trousers. Jeans and casual tops are not allowed.</li>
<li>Carry the Learn Being Forward ID card, if issued, and maintain a professional appearance throughout.</li>
</ol>
<h2><span class="n">5.</span>Equipment</h2>
<ol>
<li>Carry your own laptop with the required software installed and tested before the training starts.</li>
<li>Carry your own HDMI cable, display adapters (for example USB-C to HDMI), charger and any other accessories needed to connect to the college projector.</li>
<li>Keep backup copies of the session material, so that a session is not lost due to an equipment or internet problem.</li>
</ol>
<h2><span class="n">6.</span>Content</h2>
<p>All course content provided by the Company remains its property and shall be used only for this training. Content created by the Trainer for the batch shall be uploaded to the portal for the Company’s review before it is shared with students.</p>`, 3, N, o));

    P.push(page(ctx, `
<h2><span class="n">7.</span>Confidentiality of commercials</h2>
<ol>
<li>The Trainer’s remuneration and all other commercial terms are strictly confidential between the Trainer and the Company.</li>
<li>The Trainer shall not discuss commercials with other trainers, college staff, coordinators or students, on the campus or outside it.</li>
<li>If it is found that the Trainer has discussed commercials with anyone other than the Company, a <b>heavy penalty</b> will be levied, which may be deducted from the payment due, and <b>strict action</b> will be taken, including immediate termination of this MOU and of future engagements.</li>
</ol>
<h2><span class="n">8.</span>Personal details and conduct with students</h2>
<ol>
<li>Do not share personal details with students — no personal mobile number, WhatsApp, social-media accounts or personal email. Communication with students shall be only through official channels or channels set up by the college.</li>
<li>If the college itself shares a contact detail for official coordination, that is the college’s decision and may be used only for that purpose.</li>
<li>Maintain respectful and professional behaviour with students and staff at all times.</li>
</ol>
<h2><span class="n">9.</span>Non-solicitation</h2>
<p>During this engagement and for 12 months after it, the Trainer shall not offer or accept training work directly from the college, or through any other agency, for the colleges introduced by the Company.</p>`, 4, N, o));

    P.push(page(ctx, `
<h2><span class="n">10.</span>Remuneration</h2>
<table>
<tr><th>Per-day payment</th><td>${V(d, 'perDay', inr)} per training day</td></tr>
<tr><th>Total training days</th><td>${V(d, 'days')} days</td></tr>
<tr><th>Training fee (auto-calculated)</th><td>${RAW(inr(f.gross))}</td></tr>
${allowRow('travel', 'Travel allowance')}
${allowRow('food', 'Food')}
${allowRow('accommodation', 'Accommodation')}
<tr><th>TDS @ ${RAW((d.tds || 10) + '%')} on the training fee</th><td>− ${RAW(inr(f.tds))}</td></tr>
<tr class="total"><td>Estimated net payable</td><td>${RAW(inr(f.net))}<br><span style="font-weight:500;font-size:8.5pt">${esc(words(f.net))}</span></td></tr>
</table>
<h2><span class="n">11.</span>Payment terms</h2>
<ol>
<li>Payment shall be made within <b>${V(d, 'payMin')} to ${V(d, 'payMax')} days</b> of the completion of the training, by bank transfer to the account in the Trainer’s portal profile.</li>
<li>Payment is for the training days actually delivered, as recorded by session attendance on the portal. Days not delivered are not payable.</li>
<li>Tax Deducted at Source (TDS) at ${RAW((d.tds || 10) + '%')} will be deducted from the training fee as per the Income Tax Act, and the TDS certificate will be issued. The Trainer is responsible for their own GST registration and returns, if applicable.</li>
<li>Any penalty under clause 7, or recovery for sessions missed without valid reason, may be deducted from the payment.</li>
<li>When the payment is made, a payment advice will be generated and shared with the Trainer on the portal.</li>
</ol>`, 5, N, o));

    P.push(page(ctx, `
<h2><span class="n">12.</span>Absence and replacement</h2>
<p>If the Trainer is unable to take a scheduled session for any reason, they shall inform the Company at least 48 hours in advance, except in an emergency. The Company may then assign another trainer. Repeated absence or late arrival is a breach of this MOU.</p>
<h2><span class="n">13.</span>Termination</h2>
<p>The Company may terminate this MOU with immediate effect for breach of the code of conduct, the dress code, confidentiality or the rules on personal details, or for misconduct. Otherwise, either party may end the engagement with 7 days’ written notice. Payment for days delivered until termination will be made as per clause 11, after any deductions.</p>
<h2><span class="n">14.</span>Governing law</h2>
<p>This MOU is governed by the laws of India and is subject to the exclusive jurisdiction of the courts at ${V(d, 'jurisdiction')}.</p>
${lines(d.specialTerms).length ? '<h2><span class="n">15.</span>Additional terms</h2><ol>' + lines(d.specialTerms).map(s => `<li>${RAW(s)}</li>`).join('') + '</ol>' : ''}
<p style="margin-top:5mm"><b>IN WITNESS WHEREOF</b>, the parties have signed this MOU on the dates written below. By signing, the Trainer confirms that they have read and accept all the rules and terms above.</p>
<div class="doc-sign">${sign(d, 'co')}${sign(Object.assign({}, d, { clRep: d.trName, clRepTitle: 'Trainer', clName: '' }), 'other')}</div>`, 6, N, o));
    return P.join('');
  }

  /* =====================================================================
     COLLEGE TAX INVOICE (generated when accounts mark it paid)
     ===================================================================== */
  function collegeInvoice(d) {
    const ctx = { d, kind: 'Tax Invoice', ref: 'Invoice No. ' + (d.invNo || '—') };
    const f = collegeFee(d);
    const extra = num(d.delayAmt);
    const total = f.total + extra;
    const half = f.g ? Math.round(f.tax / 2) : 0;
    const taxRows = !f.g ? `<tr><td colspan="3" class="num">GST</td><td class="num">Not applicable</td></tr>` :
      d.gstMode === 'IGST' ? `<tr><td colspan="3" class="num">IGST @ ${f.g}%</td><td class="num">${inr(f.tax)}</td></tr>` :
        `<tr><td colspan="3" class="num">CGST @ ${f.g / 2}%</td><td class="num">${inr(half)}</td></tr><tr><td colspan="3" class="num">SGST @ ${f.g / 2}%</td><td class="num">${inr(f.tax - half)}</td></tr>`;
    return page(ctx, `
${d.paidOn ? '<div class="doc-paid">PAID</div>' : ''}
<div class="doc-title" style="margin-top:0"><h1>Tax Invoice</h1><p>${d.funding === 'CSR sponsor' ? 'CSR training programme' : 'Campus training programme'}</p></div>
<div class="doc-kv" style="margin-top:4mm">
<div><span>Invoice number</span><b>${V(d, 'invNo')}</b></div><div><span>Invoice date</span><b>${V(d, 'invDate', fdate)}</b></div>
<div><span>MOU reference</span><b>${V(d, 'mouNo')}</b></div><div><span>Place of supply</span><b>${V(d, 'placeOfSupply')}</b></div>
</div>
<div class="doc-parties"><div class="doc-party"><div class="lbl">Billed to</div><b>${V(d, 'clName')}</b>${V(d, 'clAddr')}${d.clGstin ? '<br>GSTIN: ' + V(d, 'clGstin') : ''}</div>
<div class="doc-party"><div class="lbl">${d.funding === 'CSR sponsor' ? 'CSR sponsor' : 'Training delivered'}</div>${d.funding === 'CSR sponsor' ? `<b>${V(d, 'csrSponsor')}</b>` : ''}${V(d, 'startDate', fdate)} to ${V(d, 'endDate', fdate)}<br>${V(d, 'days')} day(s) · ${V(d, 'hoursPerDay')} hrs/day<br>${V(d, 'students')} students · ${V(d, 'batches')} batch(es)</div></div>
<table class="items">
<thead><tr><th>Description</th><th>SAC</th><th class="num">Basis</th><th class="num">Amount</th></tr></thead>
<tbody>
<tr><td><b>${V(d, 'course')}</b> training<br><span style="font-size:8.5pt;color:#5D6472">${V(d, 'branch')} · Semester ${V(d, 'semester')} · ${esc(f.qty)}</span></td><td>999293</td><td class="num">${esc(f.basisText)}</td><td class="num">${inr(f.sub)}</td></tr>
${extra ? `<tr><td>Delay charges (clause 5 of MOU)${d.delayNote ? '<br><span style="font-size:8.5pt;color:#5D6472">' + esc(d.delayNote) + '</span>' : ''}</td><td>999293</td><td class="num">—</td><td class="num">${inr(extra)}</td></tr>` : ''}
<tr><td colspan="3" class="num">Taxable value</td><td class="num">${inr(f.sub + extra)}</td></tr>
${taxRows}
<tr class="total"><td colspan="3" class="num">Total</td><td class="num">${inr(total + (f.g ? Math.round(extra * f.g / 100) : 0))}</td></tr>
</tbody></table>
<p style="font-size:9pt"><b>Amount in words:</b> ${esc(words(total + (f.g ? Math.round(extra * f.g / 100) : 0)))}</p>
${!d.paidOn ? `<h2>Payment due</h2><div class="doc-note">Please pay within ${esc(d.payDays || 20)} working days of the training completion to the bank account below, and quote invoice ${esc(d.invNo)} as the reference.</div><div class="doc-kv k4"><div><span>Our bank</span><b>${V(d, 'bankName')}</b></div><div><span>Account no.</span><b>${V(d, 'bankAcc')}</b></div><div><span>IFSC</span><b>${V(d, 'bankIfsc')}</b></div></div>` : `<h2>Payment received</h2>
<div class="doc-kv k4"><div><span>Amount received</span><b>${V(d, 'amountReceived', inr)}</b></div><div><span>Received on</span><b>${V(d, 'paidOn', fdate)}</b></div><div><span>Mode</span><b>${V(d, 'payMode')}</b></div><div><span>UTR / reference</span><b>${V(d, 'payRef')}</b></div>
${num(d.tdsDeducted) ? `<div><span>TDS deducted by college</span><b>${inr(d.tdsDeducted)}</b></div>` : ''}<div><span>Our bank</span><b>${V(d, 'bankName')}</b></div><div><span>Account no.</span><b>${V(d, 'bankAcc')}</b></div><div><span>IFSC</span><b>${V(d, 'bankIfsc')}</b></div></div>`}
<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:6mm"><p style="font-size:8.5pt;color:#5D6472;max-width:60%">This is a computer-generated invoice issued on receipt of payment. Thank you for partnering with Learn Being Forward.</p>
<div style="text-align:center;min-width:60mm"><div class="doc-sign" style="display:block;margin:0"><div class="pad" style="height:14mm;border-bottom:1.5px solid #1C2B4A;display:flex;align-items:flex-end;justify-content:center">${d.coSign ? `<img src="${d.coSign}" alt="Signature" style="max-height:16mm">` : d.coSignTyped ? `<span class="typed" style="font-family:'Dancing Script',cursive;font-size:20pt;color:#1C2B4A">${esc(d.coSignTyped)}</span>` : ''}</div></div><div style="font-size:8.5pt;margin-top:1mm">Authorised signatory<br><b>${V(d, 'coName')}</b></div></div></div>`, 1, 1, { initials: false, cls: 'compact' });
  }

  /* =====================================================================
     TRAINER PAYMENT ADVICE (generated when the trainer is paid)
     ===================================================================== */
  function trainerAdvice(d) {
    const ctx = { d, kind: 'Payment Advice', ref: 'Advice No. ' + (d.advNo || '—') };
    const f = trainerFee(d);
    const sess = lines(d.sessions);
    return page(ctx, `
${d.paidOn ? '<div class="doc-paid">PAID</div>' : ''}
<div class="doc-title" style="margin-top:0"><h1>Payment Advice</h1><p>Trainer remuneration</p></div>
<div class="doc-kv" style="margin-top:4mm">
<div><span>Advice number</span><b>${V(d, 'advNo')}</b></div><div><span>Date</span><b>${V(d, 'paidOn', fdate)}</b></div>
<div><span>Agreement reference</span><b>${V(d, 'agNo')}</b></div><div><span>Period</span><b>${V(d, 'period')}</b></div>
</div>
<div class="doc-parties"><div class="doc-party"><div class="lbl">Paid to</div><b>${V(d, 'trName')}</b>PAN: ${V(d, 'trPan')}<br>${V(d, 'trEmail')}</div>
<div class="doc-party"><div class="lbl">Training</div><b>${V(d, 'college')}</b>${V(d, 'course')}<br>Batch: ${V(d, 'batch')}</div></div>
${sess.length ? `<table class="items"><thead><tr><th>Date</th><th>Session</th><th class="num">Hours</th></tr></thead><tbody>${sess.map(s => { const p = s.split('|').map(x => x.trim()); return `<tr><td>${esc(p[0] || '')}</td><td>${esc(p[1] || '')}</td><td class="num">${esc(p[2] || '')}</td></tr>`; }).join('')}</tbody></table>` : ''}
<table class="items"><thead><tr><th>Item</th><th class="num">Amount</th></tr></thead><tbody>
<tr><td>Training fee — ${V(d, 'days')} days × ${V(d, 'perDay', inr)}</td><td class="num">${inr(f.gross)}</td></tr>
${num(d.travel) ? `<tr><td>Travel allowance</td><td class="num">${inr(d.travel)}</td></tr>` : ''}
${num(d.food) ? `<tr><td>Food</td><td class="num">${inr(d.food)}</td></tr>` : ''}
${num(d.accommodation) ? `<tr><td>Accommodation</td><td class="num">${inr(d.accommodation)}</td></tr>` : ''}
<tr><td>Less: TDS @ ${esc(d.tds || 10)}% on training fee (Sec. 194J)</td><td class="num">− ${inr(f.tds)}</td></tr>
<tr class="total"><td>Net amount paid</td><td class="num">${inr(f.net)}</td></tr>
</tbody></table>
<p style="font-size:9pt"><b>Amount in words:</b> ${esc(words(f.net))}</p>
<div class="doc-kv k4"><div><span>Paid on</span><b>${V(d, 'paidOn', fdate)}</b></div><div><span>Mode</span><b>${V(d, 'payMode')}</b></div><div><span>UTR / reference</span><b>${V(d, 'payRef')}</b></div><div><span>Credited to</span><b>${V(d, 'trBank')}</b></div></div>
<div class="doc-note">TDS deducted will reflect in your Form 26AS, and the TDS certificate (Form 16A) will be shared after the quarter ends.</div>
<p style="font-size:8.5pt;color:#5D6472;margin-top:6mm">This is a computer-generated payment advice from ${esc(d.coName || 'Learn Being Forward')} and does not need a signature.</p>`, 1, 1, { initials: false, cls: 'compact' });
  }

  /* ---------- defaults (filled from the portal's data; editable before sharing) ---------- */
  const COMPANY = { coName: 'Learn Being Forward', coAddr: '', coEmail: 'info@learnbeingforward.in', coPhone: '+91 99729 34418', coGstin: '', coPan: '', coRep: 'Lohit Kumar A B', coRepTitle: 'Founder & CEO', coSignTyped: 'Lohit Kumar', coSignDate: '2026-11-19',
    bankName: '', bankAcc: '', bankIfsc: '', place: 'Bengaluru', jurisdiction: 'Bengaluru' };
  const DEFAULTS = {
    'college-mou': Object.assign({}, COMPANY, {
      mouNo: 'LBF/MOU/2026-27/007', mouDate: '2026-11-19',
      clName: 'Crestview College of Engineering', clAddr: '', clRep: '', clRepTitle: 'Principal', clEmail: 'placements@crestview.edu.in', clPhone: '',
      course: 'Java & DSA', domain: 'Technical', sections: 'Core Java — OOP, collections and exception handling\nData structures — arrays, strings, linked lists, stacks and queues\nAlgorithms — searching, sorting, recursion and two pointers\nTrees, graphs and dynamic programming basics\nPlacement coding practice and mock assessments',
      branch: 'Computer Science & Engineering', semester: '7', students: '120', batches: '3', startDate: '2026-12-01', endDate: '2026-12-12', days: '10', hoursPerDay: '6', timeFrom: '09:30', timeTo: '16:30', venue: 'On campus — computer labs',
      funding: 'College', feeType: 'batch_day', rate: '10000', gstMode: 'CGST + SGST', gstRate: '18', csrSponsor: '',
      payDays: '20', interestRate: '15', interestPer: 'per day', postponeNotice: '7', delayCharge: '5000', specialTerms: '', otherSign: '', otherSignTyped: '', otherSignDate: '' }),
    'trainer-mou': Object.assign({}, COMPANY, {
      agNo: 'LBF/TR/2026-27/014', agDate: '2026-11-19', trName: 'Demo Trainer', trPhone: '', trEmail: 'demo.trainer@learnbeingforward.in', trPan: '', trAddr: '',
      college: 'Crestview College of Engineering', course: 'Java & DSA', batch: 'JAVA-SEM7-B1', startDate: '2026-12-01', endDate: '2026-12-12', days: '10', timeFrom: '09:30', timeTo: '16:30',
      perDay: '4000', travel: '', travelNote: '', food: '', foodNote: '', accommodation: '', accommodationNote: '', tds: '10', payMin: '20', payMax: '30', specialTerms: '', otherSign: '', otherSignTyped: '', otherSignDate: '' }),
    'college-invoice': Object.assign({}, COMPANY, {
      invNo: 'LBF/INV/2026-27/014', invDate: '2026-11-19', mouNo: 'LBF/MOU/2026-27/004', placeOfSupply: 'Karnataka (29)',
      clName: 'Crestview College of Engineering', clAddr: '', clGstin: '', course: 'Data Science / AI Fundamentals', branch: 'Computer Science & Engineering', semester: '7',
      startDate: '2026-09-16', endDate: '2026-09-16', days: '1', hoursPerDay: '6', students: '9', batches: '1', funding: 'College', feeType: 'student_hour', rate: '500', gstMode: 'CGST + SGST', gstRate: '18', csrSponsor: '',
      delayAmt: '', delayNote: '', amountReceived: '31860', paidOn: '2026-11-18', payMode: 'NEFT', payRef: 'N3221XXXXXXX', tdsDeducted: '' }),
    'trainer-advice': Object.assign({}, COMPANY, {
      advNo: 'LBF/PA/2026-27/009', agNo: 'LBF/TR/2026-27/011', period: '01 Nov – 15 Nov 2026', trName: 'Demo Trainer', trPan: '', trEmail: 'demo.trainer@learnbeingforward.in',
      college: 'Sunrise Engineering College', course: 'Backend Development', batch: 'BE-SEM5-B1', days: '6', perDay: '4000', travel: '1200', food: '', accommodation: '', tds: '10',
      sessions: '03 Nov 2026 | Server frameworks — Express | 6\n04 Nov 2026 | REST API design | 6\n06 Nov 2026 | Databases & indexing | 6\n10 Nov 2026 | Authentication — JWT | 6\n12 Nov 2026 | Deployment | 6\n14 Nov 2026 | Project review | 6',
      paidOn: '2026-11-18', payMode: 'NEFT', payRef: 'N3229XXXXXXX', trBank: 'HDFC Bank ···· 4417' })
  };
  const RENDER = { 'college-mou': collegeMOU, 'trainer-mou': trainerMOU, 'college-invoice': collegeInvoice, 'trainer-advice': trainerAdvice };

  /* ---------- tiny store so editor, shared copy and download read the same data ---------- */
  const KEY = 'lbf-docs';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = all => { try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { } };
  function get(id, type) { const all = load(); return Object.assign({}, DEFAULTS[type], (all[id] || {}).data || {}); }
  function meta(id) { return (load()[id] || {}).meta || {}; }
  function put(id, data, m) { const all = load(); all[id] = { data: data || (all[id] || {}).data || {}, meta: Object.assign({}, (all[id] || {}).meta || {}, m || {}) }; save(all); }

  window.LBFDocs = { render: (type, d) => RENDER[type](d), DEFAULTS, get, put, meta, load, collegeFee, trainerFee, words, inr, fdate };
})();
