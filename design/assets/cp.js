/* Coding Patterns — public hub (14 levels) and the level visualiser.
   The visualiser steps through a pattern on an array with the matching code line highlighted. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const I = (n, z = 16) => `<svg width="${z}" height="${z}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const LEVELS = [
    ['Programming Basics', ['Linear Search', 'Min / Max Tracking', 'Accumulator', 'Counter', 'Swap', 'Digit Extraction', 'Flag / Sentinel', 'Early Exit / Guard Clause', 'Nested Loops', 'Parity / Toggle']],
    ['Arrays and Strings', ['Two Pointers', 'Sliding Window', 'Prefix Sum', 'Difference Array', 'Kadane’s Algorithm', 'Dutch National Flag']],
    ['Searching and Sorting', ['Binary Search', 'Binary Search on the Answer', 'Modified Binary Search', 'Counting / Bucket Sort', 'Custom Comparator', 'Cyclic Sort']],
    ['Hashing', ['Frequency Counting', 'Complement Lookup (Two Sum)', 'Group By Key', 'Prefix Sum + Hash Map']],
    ['Linked Lists', ['Fast and Slow Pointers', 'In-place Reversal', 'Dummy Head Node', 'Merge Two Sorted Lists', 'Gap Runner (N-th From the End)']],
    ['Stacks and Queues', ['Monotonic Stack', 'Monotonic Deque', 'Min Stack (Auxiliary Stack)', 'Expression Evaluation']],
    ['Recursion and Backtracking', ['Base Case + Recursive Case', 'Combinations / Combination Sum', 'Permutations', 'Constraint Backtracking (N-queens)']],
    ['Trees', ['DFS Traversals', 'BFS Level Order', 'BST Property', 'Lowest Common Ancestor', 'Build / Serialize Trees']],
    ['Heaps', ['Top-K Elements', 'K-way Merge', 'Two Heaps (Median)']],
    ['Graphs', ['DFS / Connected Components', 'BFS Shortest Path', 'Multi-source BFS', 'Cycle Detection', 'Topological Sort', 'Dijkstra', 'Minimum Spanning Tree']],
    ['Greedy', ['Greedy With Sorting', 'Interval Scheduling / Activity Selection', 'Jump Game / Reachability']],
    ['Dynamic Programming', ['1-D DP', 'Grid DP', '0/1 Knapsack', 'Longest Increasing Subsequence', 'Interval DP', 'Bitmask DP', 'Digit DP', 'DP on Trees']],
    ['Bit Manipulation', ['Get, Set, Clear, Toggle a Bit', 'Counting Bits / Power of Two', 'Bitmask Subsets / Parity Masks']],
    ['Advanced Patterns', ['Meet in the Middle', 'KMP / Z-algorithm', 'Divide and Conquer', 'Math Patterns (Sieve, GCD, Fast Power)']]
  ];
  const pad = n => String(n).padStart(2, '0');
  function owned() {
    if (new URLSearchParams(location.search).get('owned') === '1') return true;
    return false; // on the real site: the server decides, from the signed-in buyer's paid orders
  }

  function hub(root) {
    root.innerHTML = (owned() ? `<div class="alert success" style="margin-bottom:16px">${I('check', 18)}<span>You own Coding Patterns — every pattern is unlocked.</span></div>` : `<div class="alert gold" style="margin-bottom:16px">${I('lock', 18)}<span>The first pattern in every level is free. <a href="buy-detail.html?id=coding-patterns" style="color:inherit;font-weight:700">Get the course</a> to unlock all ${LEVELS.reduce((a, l) => a + l[1].length, 0)} patterns.</span></div>`) + `<div class="cp-grid">${LEVELS.map(([t, ps], i) => `<a class="cp-card" href="coding-patterns-level.html?l=${i + 1}"><span class="cp-num">Level ${pad(i + 1)}</span><b>${esc(t)}</b><small>${ps.length} patterns · ${owned() ? 'all unlocked' : '1 free, ' + (ps.length - 1) + ' with the course'}</small><span class="cp-dots">${ps.slice(0, 6).map(() => '<i></i>').join('')}</span><span class="cp-go">Open visualiser ${I('arrowR', 14)}</span></a>`).join('')}</div>`;
  }

  /* ---------- simulators: each returns steps {arr, hi:[idx], ptr:{name:idx}, line, say, vars} ---------- */
  const ARR = [7, 3, 9, 4, 12, 6, 1, 8];
  const SIMS = {
    'Linear Search': { code: ['int find(int[] a, int target) {', '  for (int i = 0; i < a.length; i++) {', '    if (a[i] == target)', '      return i;   // found', '  }', '  return -1;     // not found', '}'], run() {
      const t = 12, s = []; s.push({ ptr: {}, line: 0, say: `Look for ${t}, starting at index 0.`, vars: { target: t } });
      for (let i = 0; i < ARR.length; i++) { s.push({ ptr: { i }, hi: [i], line: 2, say: `Is a[${i}] = ${ARR[i]} equal to ${t}?`, vars: { target: t, i } }); if (ARR[i] === t) { s.push({ ptr: { i }, ok: [i], line: 3, say: `Yes — found ${t} at index ${i}. Stop early.`, vars: { target: t, i } }); break; } }
      return s; } },
    'Min / Max Tracking': { code: ['int max = a[0];', 'for (int i = 1; i < a.length; i++) {', '  if (a[i] > max)', '    max = a[i];', '}', 'return max;'], run() {
      const s = []; let m = ARR[0], mi = 0; s.push({ ptr: { i: 0 }, ok: [0], line: 0, say: `Start with max = a[0] = ${m}.`, vars: { max: m } });
      for (let i = 1; i < ARR.length; i++) { s.push({ ptr: { i }, hi: [i], ok: [mi], line: 2, say: `Compare a[${i}] = ${ARR[i]} with max = ${m}.`, vars: { max: m, i } }); if (ARR[i] > m) { m = ARR[i]; mi = i; s.push({ ptr: { i }, ok: [i], line: 3, say: `${ARR[i]} is bigger — max becomes ${m}.`, vars: { max: m, i } }); } }
      s.push({ ok: [mi], line: 5, say: `Done. The maximum is ${m}.`, vars: { max: m } }); return s; } },
    'Two Pointers': { code: ['int l = 0, r = a.length - 1;', 'while (l < r) {', '  int sum = a[l] + a[r];', '  if (sum == target) return true;', '  if (sum < target) l++;', '  else r--;', '}'], run() {
      const a = [1, 3, 4, 6, 7, 8, 9, 12], t = 15, s = []; let l = 0, r = a.length - 1; s.push({ arr: a, ptr: { l, r }, line: 0, say: `Sorted array, target ${t}. Put l at the start and r at the end.`, vars: { target: t } });
      while (l < r) { const sum = a[l] + a[r]; s.push({ arr: a, ptr: { l, r }, hi: [l, r], line: 2, say: `a[l] + a[r] = ${a[l]} + ${a[r]} = ${sum}.`, vars: { target: t, sum } }); if (sum === t) { s.push({ arr: a, ptr: { l, r }, ok: [l, r], line: 3, say: `${sum} equals the target — pair found.`, vars: { target: t, sum } }); break; } if (sum < t) { l++; s.push({ arr: a, ptr: { l, r }, line: 4, say: `Too small — move l right.`, vars: { target: t, sum } }); } else { r--; s.push({ arr: a, ptr: { l, r }, line: 5, say: `Too big — move r left.`, vars: { target: t, sum } }); } }
      return s; } },
    'Swap': { code: ['int tmp = a[i];', 'a[i] = a[j];', 'a[j] = tmp;'], run() {
      const a = ARR.slice(), i = 1, j = 5, s = [], t = a[i]; s.push({ arr: a.slice(), ptr: { i, j }, hi: [i, j], line: 0, say: `Save a[i] = ${t} in tmp.`, vars: { tmp: t } }); a[i] = a[j]; s.push({ arr: a.slice(), ptr: { i, j }, hi: [i], line: 1, say: `Copy a[j] into a[i].`, vars: { tmp: t } }); a[j] = t; s.push({ arr: a.slice(), ptr: { i, j }, ok: [i, j], line: 2, say: `Put tmp into a[j]. Swapped.`, vars: { tmp: t } }); return s; } }
  };
  SIMS['Accumulator'] = { code: ['int sum = 0;', 'for (int x : a)', '  sum += x;', 'return sum;'], run() { const s = []; let t = 0; s.push({ line: 0, say: 'Start the running total at 0.', vars: { sum: 0 } }); ARR.forEach((x, i) => { t += x; s.push({ ptr: { i }, hi: [i], line: 2, say: `Add ${x}. Running total = ${t}.`, vars: { sum: t } }); }); s.push({ line: 3, say: `Total is ${t}.`, vars: { sum: t } }); return s; } };

  function level(root) {
    const q = new URLSearchParams(location.search); const li = Math.min(Math.max(Number(q.get('l') || 1), 1), 14) - 1;
    const [title, pats] = LEVELS[li];
    let pat = q.get('p') && pats.includes(q.get('p')) ? q.get('p') : pats[0];
    let steps, k, timer = null, speed = 900;
    document.title = `Level ${pad(li + 1)} · ${title} | Coding Patterns`;
    function load() { const sim = SIMS[pat] || SIMS['Linear Search']; steps = sim.run(); k = 0; stop(); draw(); }
    function stop() { clearInterval(timer); timer = null; }
    function draw() {
      const own = owned(), locked = !own && pats.indexOf(pat) > 0;
      const sim = SIMS[pat] || SIMS['Linear Search'], st = steps[k], a = st.arr || ARR;
      const ptrAt = {}; Object.entries(st.ptr || {}).forEach(([n, i]) => (ptrAt[i] = ptrAt[i] ? ptrAt[i] + ', ' + n : n));
      root.innerHTML = `<div class="cp-app">
<header class="cp-top"><a class="cp-back" href="coding-patterns.html">${I('arrowL')}All levels</a><div class="cp-title"><span>Level ${pad(li + 1)}</span><b>${esc(title)}</b></div>
<div style="display:flex;gap:6px">${li > 0 ? `<a class="btn btn-sm" href="?l=${li}">${I('arrowL', 14)}Level ${pad(li)}</a>` : ''}${li < 13 ? `<a class="btn btn-sm" href="?l=${li + 2}">Level ${pad(li + 2)}${I('arrowR', 14)}</a>` : ''}<button class="btn btn-sm" type="button" data-fs>${I('grid', 14)}Full screen</button></div></header>
<div class="cp-body"><aside class="cp-side" aria-label="Patterns"><div class="label" style="color:#9AA6BF;margin-bottom:8px">Patterns (${pats.length})</div>${pats.map((p, i) => `<button type="button" class="${p === pat ? 'on' : ''}" data-pat="${esc(p)}">${esc(p)}${i === 0 ? '<small>free</small>' : own ? '' : '<small>🔒</small>'}</button>`).join('')}</aside>
<main class="cp-stage${locked ? ' locked' : ''}">${locked ? `<div class="cp-lock"><div class="cp-lk">${I('lock', 28)}</div><b>Purchase to unlock</b><p>The first pattern in every level is free to explore — the rest come with the full Coding Patterns course.</p><a class="btn btn-gold" href="buy-detail.html?id=coding-patterns">${I('cart')}Get Coding Patterns · ₹499</a><button class="btn btn-sm cp-free" type="button" data-pat="${esc(pats[0])}">Try the free pattern: ${esc(pats[0])}</button></div>` : ''}<div class="cp-h"><h1>${esc(pat)}</h1><span class="pill gold">Step ${k + 1} of ${steps.length}</span></div>
${SIMS[pat] || locked ? '' : '<div class="alert info" style="margin-bottom:14px">Animation coming soon for this pattern — showing the Linear Search demo.</div>'}
<div class="cp-arr">${a.map((v, i) => `<div class="cp-cell ${(st.ok || []).includes(i) ? 'ok' : (st.hi || []).includes(i) ? 'hi' : ''}"><b>${v}</b><small>${i}</small>${ptrAt[i] ? `<em>${ptrAt[i]}</em>` : ''}</div>`).join('')}</div>
<p class="cp-say" aria-live="polite">${esc(st.say)}</p>
<div class="cp-vars">${Object.entries(st.vars || {}).map(([n, v]) => `<span><small>${n}</small><b>${v}</b></span>`).join('')}</div>
<div class="cp-ctl"><button class="btn btn-sm" type="button" data-c="reset">${I('refresh', 14)}Reset</button><button class="btn btn-sm" type="button" data-c="prev" ${k ? '' : 'disabled'}>${I('arrowL', 14)}Back</button><button class="btn btn-gold" type="button" data-c="play">${I(timer ? 'clock' : 'play', 14)}${timer ? 'Pause' : 'Play'}</button><button class="btn btn-sm" type="button" data-c="next" ${k < steps.length - 1 ? '' : 'disabled'}>Step${I('arrowR', 14)}</button>
<label class="small" style="display:flex;gap:6px;align-items:center;color:#D9DEE8">Speed<input type="range" min="300" max="1500" step="100" value="${1800 - speed}" data-speed aria-label="Speed"></label></div></main>
<aside class="cp-code${locked ? ' blur' : ''}" aria-label="Code"><div class="label" style="color:#9AA6BF;margin-bottom:8px">Java</div><pre>${(locked ? ['// unlocks with the course', '', '', '', ''] : sim.code).map((c, i) => `<span class="${i === st.line ? 'on' : ''}"><i>${i + 1}</i>${esc(c)}</span>`).join('')}</pre></aside></div></div>`;
    }
    root.addEventListener('click', e => {
      const p = e.target.closest('[data-pat]'), c = e.target.closest('[data-c]'), fs = e.target.closest('[data-fs]');
      if (p) { pat = p.dataset.pat; history.replaceState(null, '', `?l=${li + 1}&p=${encodeURIComponent(pat)}${owned() ? '&owned=1' : ''}`); load(); }
      if (fs) { const el = root.querySelector('.cp-app'); try { document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen(); } catch (x) { } }
      if (!c) return; const a = c.dataset.c;
      if (a === 'reset') { k = 0; stop(); } if (a === 'prev') { k = Math.max(0, k - 1); stop(); } if (a === 'next') { k = Math.min(steps.length - 1, k + 1); stop(); }
      if (a === 'play') { if (timer) stop(); else { if (k >= steps.length - 1) k = 0; timer = setInterval(() => { if (k >= steps.length - 1) { stop(); draw(); return; } k++; draw(); }, speed); } }
      draw();
    });
    root.addEventListener('input', e => { if (e.target.dataset.speed !== undefined) { speed = 1800 - Number(e.target.value); if (timer) { stop(); timer = setInterval(() => { if (k >= steps.length - 1) { stop(); draw(); return; } k++; draw(); }, speed); } } });
    load();
  }
  function mount() { const h = $('#cp-hub'), l = $('#cp-level'); if (h) hub(h); if (l) level(l); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
