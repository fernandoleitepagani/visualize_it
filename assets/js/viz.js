/* viz.js — registry + player. Pages call viz.register(id, cfg) and set
   data-algo on <body>; boot happens automatically. */
window.viz = (function () {
  const registry = {};
  const $  = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const KW = /\b(void|int|for|if|else|while|return|new|boolean|true|false|null|length|break|continue)\b/g;

  const hl = (s) => esc(s)
    .replace(/(\/\/.*)$/, '<i class="c">$1</i>')
    .replace(KW, '<span class="k">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="n">$1</span>');

  let cfg, steps, idx = 0, timer = null, lang = 'java';

  function paintBars(st) {
    const max = Math.max(...st.arr, 1);
    const S = (xs = []) => new Set(xs);
    const cmp = S(st.cmp), swap = S(st.swap), piv = S(st.pivot),
          sorted = S(st.sorted), dim = S(st.dim);
    $('#bars').innerHTML = st.arr.map((v, i) => {
      const h = Math.max(8, Math.round(v / max * 220));
      let c = 'bar';
      if (swap.has(i))        c += ' swap';
      else if (piv.has(i))    c += ' pivot';
      else if (cmp.has(i))    c += ' cmp';
      else if (sorted.has(i)) c += ' sorted';
      const w = 'bar-wrap' + (dim.has(i) ? ' dim' : '');
      return `<div class="${w}">
        <span class="bar-val">${v}</span>
        <div class="${c}" style="height:${h}px"></div>
      </div>`;
    }).join('');
  }

  function paintCode(activeLine) {
    $('#code').innerHTML = cfg.code[lang].map((l, i) =>
      `<div class="line${i === activeLine ? ' active' : ''}">` +
      `<span class="ln">${i + 1}</span><span>${hl(l)}</span></div>`
    ).join('');
    const a = $('#code .active');
    if (a) a.scrollIntoView({ block: 'nearest' });
  }

  function render() {
    const st = steps[idx];
    paintBars(st);
    paintCode(st.line);
    $('#desc').textContent = st.desc;
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
      if (parts.length < 2 || parts.length > 12 || parts.some(n => !isFinite(n))) {
        $('#values-error').textContent = 'Use entre 2 e 12 números separados por vírgula.';
        return;
      }
      $('#values-error').textContent = '';
      load(parts);
    };

    $('#btn-random').onclick = () => {
      const n = 5 + Math.floor(Math.random() * 4);
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
  function boot(id) { const o = registry[id]; if (o) init(o); }

  document.addEventListener('DOMContentLoaded', () => {
    const id = document.body.dataset.algo;
    if (id) boot(id);
  });

  return { register, boot };
})();