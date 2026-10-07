viz.register('lista-dupla', {
  title: 'Lista Dupla',
  subtitle: 'Células com ant e prox',
  description: 'Cada nó aponta para o anterior e o próximo. Inserir/remover nas duas pontas é O(1).',
  view: 'nodes',
  linked: 'doubly',
  panelLabel: 'lista',
  initial: [10, 20],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(n) — 2 ponteiros por nó', stable: false,
    note: 'Vantagem sobre a lista simples: remover o último elemento é Θ(1), porque cada nó conhece o anterior.'
  },
  code: {
    java: `
class No { int val; No ant, prox; No(int v){val=v;} }
No head = null, tail = null;
void inserirFim(int x) {
  No novo = new No(x);
  if (tail == null) { head = tail = novo; return; }
  novo.ant = tail;
  tail.prox = novo;
  tail = novo;
}
void removerFim() {
  if (tail == null) return;
  tail = tail.ant;
  if (tail != null) tail.prox = null;
  else head = null;
}`.trim().split('\n'),
    c: `
typedef struct No { int val; struct No *ant, *prox; } No;
No *head = NULL, *tail = NULL;
void inserirFim(int x) {
  No *novo = malloc(sizeof(No));
  novo->val = x; novo->prox = NULL;
  if (!tail) { novo->ant = NULL; head = tail = novo; return; }
  novo->ant = tail; tail->prox = novo; tail = novo;
}
void removerFim() {
  if (!tail) return;
  tail = tail->ant;
  if (tail) tail->prox = NULL;
  else head = NULL;
}`.trim().split('\n')
  },
  steps(initial) {
    let idc = 0;
    const makeNode = (val) => ({ id: 'n' + (++idc), val, ant: null, prox: null });
    const nodes = {};
    let head = null, tail = null;
    for (const val of initial) {
      const nd = makeNode(val);
      nd.ant = tail; if (tail) nodes[tail].prox = nd.id;
      else head = nd.id;
      tail = nd.id;
      nodes[nd.id] = nd;
    }
    const out = [];

    const snap = (desc, states = {}, labels = {}, line = 0) => {
      const list = [];
      let cur = head; const seen = new Set();
      while (cur && !seen.has(cur)) { seen.add(cur); list.push(nodes[cur]); cur = nodes[cur].prox; }
      out.push({
        line, desc,
        nodes: list.map(nd => {
          const lbls = [].concat(labels[nd.id] || []);
          if (nd.id === head) lbls.unshift('head');
          if (nd.id === tail) lbls.push('tail');
          return { id: nd.id, val: nd.val, ant: nd.ant, prox: nd.prox, labels: lbls, state: states[nd.id] || '' };
        })
      });
    };

    snap(`Início: head → tail.`, {}, {}, 0);

    function inserirFim(x) {
      const nd = makeNode(x);
      nodes[nd.id] = nd;
      if (!tail) { head = tail = nd.id; snap(`Primeiro nó: head = tail = ${x}.`, {}, {}, 3); return; }
      nd.ant = tail;
      snap(`inserirFim(${x}): novo.ant = tail (${nodes[tail].val}).`, {}, { [nd.id]: ['novo'] }, 5);
      nodes[tail].prox = nd.id;
      snap(`tail.prox = novo.`, {}, { [nd.id]: ['novo'] }, 6);
      tail = nd.id;
      snap(`tail = ${x}.`, {}, {}, 7);
    }

    function removerFim() {
      if (!tail) { snap('Lista vazia.'); return; }
      const r = nodes[tail].val;
      snap(`removerFim(): remove ${r} — O(1) graças ao ant.`, { [tail]: 'active' }, {}, 10);
      tail = nodes[tail].ant;
      if (tail) nodes[tail].prox = null;
      else head = null;
      snap(`tail = ${tail ? nodes[tail].val : '∅'}.`, {}, {}, 13);
    }

    inserirFim(30);
    inserirFim(40);
    removerFim();
    removerFim();
    snap('Fim.');
    return out;
  }
});