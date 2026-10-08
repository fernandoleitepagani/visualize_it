/* viz.js — registry + player. Pages call viz.register(id, cfg) and set
   data-algo on <body>; boot happens automatically.

   Views:
     - default (bars)  : sorting; steps return { arr, cmp, swap, pivot, sorted, dim }
     - 'cells'         : array-based structures; steps return { cells: [{val,labels,state}] }
     - 'nodes'         : linked structures; steps return { nodes: [{id,val,prev,next,labels,state}] }
*/
window.viz = (function () {
  const registry = {};
  const $  = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const KW = /\b(void|int|char|for|if|else|while|return|new|boolean|true|false|null|length|break|continue|struct|typedef|malloc|free)\b/g;

  const hl = (s) => esc(s)
    .replace(/(\/\/.*)$/, '<i class="c">$1</i>')
    .replace(KW, '<span class="k">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="n">$1</span>');

  let cfg, steps, idx = 0, timer = null, lang = 'java';

  /* ---------- Renderers ---------- */

  function paintBars(st) {
    const el = $('#bars'); el.className = 'bars';
    const { arr, cmp = [], swap = [], pivot = [], sorted = [], dim = [] } = st;
    const max = Math.max(...arr, 1);
    const S = (xs) => new Set(xs);
    const cmpS = S(cmp), swpS = S(swap), pvS = S(pivot), soS = S(sorted), dmS = S(dim);
    el.innerHTML = arr.map((v, i) => {
      const h = Math.max(8, Math.round(v / max * 220));
      let c = 'bar', extra = '';
      if (swpS.has(i))      { c += ' swap';  extra = ' swap'; }
      else if (pvS.has(i))  { c += ' pivot'; extra = ' pivot'; }
      else if (cmpS.has(i)) { c += ' cmp';   extra = ' cmp'; }
      else if (soS.has(i))  { c += ' sorted'; }
      const w = 'bar-wrap' + extra + (dmS.has(i) ? ' dim' : '');
      return `<div class="${w}">
        <span class="bar-val">${v}</span>
        <div class="${c}" style="height:${h}px"></div>
      </div>`;
    }).join('');
  }

  function paintCells(st) {
    const el = $('#bars'); el.className = 'cells';
    el.innerHTML = (st.cells || []).map((c, i) => {
      const st2 = c.state || (c.val === null ? 'empty' : '');
      const labels = (c.labels || []).map(l => `<i>${esc(l)}</i>`).join('');
      const val = (c.val === null || c.val === undefined) ? '' : c.val;
      return `<div class="cell-wrap">
        <div class="cell-labels">${labels}</div>
        <div class="cell ${st2}">${val}</div>
        <div class="cell-idx">${i}</div>
      </div>`;
    }).join('');
  }

  function paintNodes(st) {
    const el = $('#bars'); el.className = 'nodes';
    const mode = cfg.linked || 'singly';
    const nodes = st.nodes || [];
    const parts = [];
    nodes.forEach((nd, i) => {
      const s = nd.state || '';
      const labels = (nd.labels || []).map(l => `<i>${esc(l)}</i>`).join('');
      const prevCmp = (mode === 'doubly')
        ? `<span class="node-ptr">${nd.prev ? '←' + nd.prev : '∅'}</span>` : '';
      const nextCmp = `<span class="node-ptr">${nd.next ? '→' + nd.next : '∅'}</span>`;
      parts.push(`<div class="node-wrap">
        <div class="node-labels">${labels}</div>
        <div class="node ${s}">${prevCmp}<span class="node-val">${nd.val}</span>${nextCmp}</div>
      </div>`);
      if (i < nodes.length - 1) parts.push('<span class="arrow">→</span>');
    });
    el.innerHTML = parts.join('');
  }

  function paintVars(st) {
    const el = $('#vars');
    if (!el) return;
    const v = st.vars;
    if (!v || typeof v !== 'object') { el.innerHTML = ''; return; }
    const fmt = (x) =>
      (x === null || x === undefined)
        ? '<span class="var-value empty">—</span>'
        : `<span class="var-value">${esc(String(x))}</span>`;
    el.innerHTML = Object.entries(v).map(([k, val]) =>
      `<span class="var"><span class="var-name">${esc(k)}</span>${fmt(val)}</span>`
    ).join('');
  }

  function paintStep(st) {
    if (cfg.view === 'cells') paintCells(st);
    else if (cfg.view === 'nodes') paintNodes(st);
    else paintBars(st);
  }

  function paintCode(activeLine) {
    $('#code').innerHTML = cfg.code[lang].map((l, i) =>
      `<div class="line${i === activeLine ? ' active' : ''}">` +
      `<span class="ln">${i + 1}</span><span>${hl(l)}</span></div>`
    ).join('');
    const a = $('#code .active');
    if (a) a.scrollIntoView({ block: 'nearest' });
  }

  /* Atualiza o valor exibido no bloco do somatório, se existir na página. */
  function renderSomatorio(st) {
    const el = document.getElementById('s-value');
    if (!el || !st || !st.cells) return;
    const find = (label) => {
      for (const c of st.cells) {
        if ((c.labels || []).includes(label)) return c.val;
      }
      return undefined;
    };
    const S = find('S');
    if (S !== undefined && S !== '—') el.textContent = S;
  }

  function render() {
    const st = steps[idx];
    paintStep(st);
    paintVars(st);
    paintCode(st.line !== undefined ? st.line : 0);
    $('#desc').textContent = st.desc;
    renderSomatorio(st);
    $('#counter').textContent = `${idx + 1} / ${steps.length}`;
    $('#btn-prev').disabled = idx === 0;
    $('#btn-next').disabled = idx === steps.length - 1;
    $$('.code-tabs button').forEach(b =>
      b.classList.toggle('active', b.dataset.lang === lang));
  }

  const go   = (n) => { idx = Math.max(0, Math.min(steps.length - 1, n)); render(); };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } $('#btn-play').textContent = 'Executar'; };
  const play = () => {
    if (timer) return stop();
    if (idx === steps.length - 1) idx = 0;
    $('#btn-play').textContent = 'Pausar';
    timer = setInterval(() => {
      if (idx >= steps.length - 1) return stop();
      go(idx + 1);
    }, 1600 / Number($('#speed').value));
  };

  function load(vals) {
    stop();
    steps = cfg.steps(vals.slice());
    idx = 0;
    render();
  }

  function init(options) {
    cfg = options;

    $('#algo-title').textContent    = cfg.title;
    $('#algo-subtitle').textContent = cfg.subtitle || '';
    $('#algo-desc').textContent     = cfg.description || '';

    const lbl = $('#panel-label');
    if (lbl) lbl.textContent = cfg.panelLabel || 'vetor';

    const cx = cfg.complexity || {}, t = cx.time || {};
    $('#tbl-best').textContent   = t.best  || '—';
    $('#tbl-avg').textContent    = t.avg   || '—';
    $('#tbl-worst').textContent  = t.worst || '—';
    $('#tbl-space').textContent  = cx.space || '—';
    $('#tbl-stable').textContent = cx.stable ? 'Sim' : 'Não';
    $('#complexity-note').textContent = cx.note || '';

    $('#btn-prev').onclick  = () => { stop(); go(idx - 1); };
    $('#btn-next').onclick  = () => { stop(); go(idx + 1); };
    $('#btn-reset').onclick = () => { stop(); go(0); };
    $('#btn-play').onclick  = play;
    $('#speed').oninput     = () => { if (timer) { stop(); play(); } };

    $$('.code-tabs button').forEach(b =>
      b.onclick = () => { lang = b.dataset.lang; render(); });

    $('#btn-apply').onclick = () => {
      const parts = $('#values-input').value.trim()
        .split(/[,\s]+/).filter(Boolean).map(Number);
      if (parts.length < 1 || parts.length > 12 || parts.some(n => !isFinite(n))) {
        $('#values-error').textContent = 'Use entre 1 e 12 números separados por vírgula.';
        return;
      }
      $('#values-error').textContent = '';
      load(parts);
    };

    $('#btn-random').onclick = () => {
      const n = 4 + Math.floor(Math.random() * 4);
      const vals = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 60));
      $('#values-input').value = vals.join(', ');
      $('#values-error').textContent = '';
      load(vals);
    };

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight')     { e.preventDefault(); stop(); go(idx + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(idx - 1); }
      else if (e.key === ' ')         { e.preventDefault(); play(); }
      else if (e.key === 'Home')      { e.preventDefault(); stop(); go(0); }
    });

    const initial = cfg.initial || [7, 3, 9, 1, 5, 8, 2];
    $('#values-input').value = initial.join(', ');
    load(initial);
  }

  function register(id, options) { registry[id] = options; }

  document.addEventListener('DOMContentLoaded', () => {
    const id = document.body.dataset.algo;
    if (id && registry[id]) init(registry[id]);
  });

  return { register };
})();