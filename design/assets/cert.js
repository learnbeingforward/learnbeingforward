/* Learn Being Forward — certificate template.
   One template per batch, created automatically when the batch is created (from the course and
   college). Student name, course and date fill in by themselves; the admin can edit the college
   name (long names break onto two lines), the wording and the signatory from the batch page. */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KEY = 'lbf-cert';
  const DEFAULT = {
    college: 'Crestview College of Engineering', collegeLines: '', course: 'Full-Stack Development',
    heading: 'Course Certificate', completed: 'has successfully completed',
    line: 'a placement training programme delivered by Learn Being Forward at {college}',
    signName: 'Lohit Kumar A B', signTitle: 'Founder & CEO, Learn Being Forward', signTyped: 'Lohit Kumar', signImg: '',
    verifyNote: 'Learn Being Forward has confirmed the identity of this student and their participation in the training.'
  };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fdate = s => { const d = new Date((s || '2026-11-07') + 'T00:00:00'); return `${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };

  /* split a long college name onto two balanced lines (unless the admin set the lines) */
  function collegeLines(t) {
    if (t.collegeLines && t.collegeLines.includes('\n')) return t.collegeLines.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 2);
    const name = (t.college || '').trim();
    if (name.length <= 34) return [name];
    const words = name.split(/\s+/); let best = [name], diff = 1e9;
    for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(' '), b = words.slice(i).join(' '); const d = Math.abs(a.length - b.length); if (d < diff) { diff = d; best = [a, b]; } }
    return best;
  }
  /* soft guilloche background, drawn once */
  function guilloche() {
    let p = '';
    for (let k = 0; k < 26; k++) {
      const r = 150 + k * 9; let d = '';
      for (let a = 0; a <= 360; a += 3) { const t = a * Math.PI / 180; const rr = r + 18 * Math.sin(t * 9 + k * .4); d += `${a ? 'L' : 'M'}${(560 + rr * Math.cos(t)).toFixed(1)} ${(400 + rr * Math.sin(t)).toFixed(1)}`; }
      p += `<path d="${d}Z"/>`;
    }
    return `<svg class="ct-bg" viewBox="0 0 1123 794" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#C9973C" stroke-width=".6" opacity=".22">${p}</g></svg>`;
  }
  function seal() {
    return `<svg class="ct-seal" viewBox="0 0 220 220" role="img" aria-label="Learn Being Forward seal — Education is for everyone">
<defs><path id="ct-ring" d="M110,110 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0"/></defs>
<circle cx="110" cy="110" r="106" fill="#fff" stroke="#1C2B4A" stroke-width="3" stroke-dasharray="2 3"/>
<circle cx="110" cy="110" r="98" fill="none" stroke="#1C2B4A" stroke-width="2"/>
<circle cx="110" cy="110" r="70" fill="none" stroke="#C9973C" stroke-width="1.5"/>
<text font-family="Poppins,sans-serif" font-size="12.5" font-weight="600" letter-spacing="3" fill="#1C2B4A"><textPath href="#ct-ring" startOffset="0">EDUCATION IS FOR EVERYONE · LEARN BEING FORWARD ·</textPath></text>
<path d="M110 74 l26 12 -26 12 -26 -12z" fill="#C9973C"/><path d="M96 92 v8 c8 5 20 5 28 0 v-8" fill="none" stroke="#C9973C" stroke-width="3"/>
<text x="110" y="124" text-anchor="middle" font-family="Poppins,sans-serif" font-size="19" font-weight="700" fill="#1C2B4A">Learn Being</text>
<text x="110" y="148" text-anchor="middle" font-family="Poppins,sans-serif" font-size="21" font-weight="700" fill="#C9973C" letter-spacing="1">Forward</text>
</svg>`;
  }
  function render(t, s) {
    t = Object.assign({}, DEFAULT, t || {}); s = s || {};
    const lines = collegeLines(t);
    const course = s.course || t.course, college = t.college;
    const line = (t.line || '').replace('{college}', esc(college)).replace('{course}', esc(course));
    const sig = t.signImg ? `<img src="${t.signImg}" alt="Signature">` : `<span class="ct-typed">${esc(t.signTyped)}</span>`;
    const id = s.id || 'LBF-C-2026-00593';
    return `<div class="ct">${guilloche()}<div class="ct-wm" aria-hidden="true"><span>LBF</span><small>LEARN BEING FORWARD</small></div><span class="ct-c tl"></span><span class="ct-c tr"></span><span class="ct-c bl"></span><span class="ct-c br"></span>
<div class="ct-main">
  <div class="ct-college ${lines.length > 1 ? 'two' : ''}">${lines.map(l => `<span>${esc(l)}</span>`).join('')}</div>
  <div class="ct-date">${esc(fdate(s.date))}</div>
  <div class="ct-name">${esc(s.name || 'Student Name')}</div>
  <div class="ct-small">${esc(t.completed)}</div>
  <div class="ct-course">${esc(course)}</div>
  <div class="ct-small">${line}</div>
  <div class="ct-sign"><div class="ct-pad">${sig}</div><div class="ct-who">${esc(t.signName)}<br>${esc(t.signTitle)}</div></div>
</div>
<div class="ct-ribbon"><div class="ct-head">${esc(t.heading).replace(/ /, '<br>')}</div>${seal()}</div>
<div class="ct-verify"><div>Verify at:</div><a href="../public/verify.html?id=${esc(id)}">learnbeingforward.in/verify/${esc(id)}</a><p>${esc(t.verifyNote)}</p><a class="ct-vbtn" href="../public/verify.html?id=${esc(id)}">✓ Verify certificate</a></div>
</div>`;
  }
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = all => { try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { } };
  /* scale a rendered certificate to fit its box (phones, previews) without sideways scrolling */
  function fit(box) {
    const ct = box.querySelector('.ct'); if (!ct) return;
    const sc = Math.min(1, box.clientWidth / 1123); ct.style.transform = `scale(${sc})`; ct.style.transformOrigin = 'top left';
    box.style.height = (794 * sc) + 'px';
  }
  window.addEventListener('resize', () => document.querySelectorAll('.ct-fit').forEach(fit));
  /* the students whose certificates exist (prototype data; on the server: issued certificates) */
  const ISSUED = {
    'LBF-C-2026-00417': { name: 'Aadhya Joshi', course: 'Java & DSA', date: '2026-09-25', batch: 'cce-java-b1', college: 'Crestview College of Engineering' },
    'LBF-C-2026-00593': { name: 'Aadhya Joshi', course: 'Full-Stack Development', date: '2026-11-07', batch: 'cce-fsd-b1', college: 'Crestview College of Engineering' },
    'LBF-C-2026-00601': { name: 'Myra Gupta', course: 'Full-Stack Development', date: '2026-11-07', batch: 'cce-fsd-b1', college: 'Crestview College of Engineering' },
    'LBF-C-2026-00602': { name: 'Varun Kumar', course: 'Full-Stack Development', date: '2026-11-07', batch: 'cce-fsd-b1', college: 'Crestview College of Engineering' }
  };
  window.LBFCert = { fit, ISSUED, render, DEFAULT, collegeLines, get: b => Object.assign({}, DEFAULT, load()[b] || {}), put: (b, t) => { const a = load(); a[b] = t; save(a); } };
})();
