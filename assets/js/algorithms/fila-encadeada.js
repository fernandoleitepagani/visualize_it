viz.register('fila-encadeada', {
  title: 'Fila Encadeada',
  subtitle: 'FIFO com nós dinâmicos',
  description: 'Guarda primeiro e ultimo. Enfileirar no fim e desenfileirar do início são ambos O(1).',
  view: 'nodes',
  linked: 'singly',
  panelLabel: 'fila',
  initial: [10, 20, 30],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(n)', stable: true,
    note: 'Com dois ponteiros (primeiro e ultimo), as duas pontas custam Θ(1).'
  },
  code: {
    java: `
class No { int val; No prox; No(int v){val=v;} }
No primeiro = null, ultimo = null;
void enqueue(int x) {
  No novo = new No(x);
  if (primeiro == null) primeiro = ultimo = novo;
  else { ultimo.prox = novo; ultimo = novo; }
}
int dequeue() {
  if (primeiro == null) throw new RuntimeException("vazia");
  int r = primeiro.val;
  primeiro = primeiro.prox;
  if (primeiro == null) ultimo = null;
  return r;
}`.trim().split('\n'),
    c: `
typedef struct No { int val; struct No *prox; } No;
No *pri = NULL, *ult = NULL;
void enqueue(int x) {
  No *novo = malloc(sizeof(No));
  novo->val = x; novo->prox = NULL;
  if (!pri) pri = ult = novo;
  else { ult->prox = novo; ult = novo; }
}
int dequeue() {
  if (!pri) return -1;
  int r = pri->val;
  pri = pri->prox;
  if (!pri) ult = NULL;
  return r;
}`.trim().split('\n')
  },
  steps(initial) {
    let idc = 0;
    const nodes = {}; let pri = null, ult = null;
    for (const val of initial) {
      const nd = { id: 'n' + (++idc), val, prox: null };
      nodes[nd.id] = nd;
      if (!pri) { pri = ult = nd.id; }
      else { nodes[ult].prox = nd.id; ult = nd.id; }
    }
    const out = [];

    const snap = (desc, states = {}, labels = {}, line = 0) => {
      const list = [];
      let cur = pri; const seen = new Set();
      while (cur && !seen.has(cur)) { seen.add(cur); list.push(nodes[cur]); cur = nodes[cur].prox; }
      out.push({
        line, desc,
        nodes: list.map(nd => {
          const lbls = [].concat(labels[nd.id] || []);
          if (nd.id === pri) lbls.unshift('pri');
          if (nd.id === ult) lbls.push('ult');
          return { id: nd.id, val: nd.val, next: nd.prox, labels: lbls, state: states[nd.id] || '' };
        })
      });
    };

    snap(`Início: pri → ult.`);

    function enqueue(x) {
      const nd = { id: 'n' + (++idc), val: x, prox: null };
      nodes[nd.id] = nd;
      if (!pri) { pri = ult = nd.id; snap(`Fila vazia: pri = ult = ${x}.`, {}, {}, 4); return; }
      snap(`enqueue(${x}): cria nó.`, {}, { [nd.id]: ['novo'] }, 3);
      nodes[ult].prox = nd.id;
      snap(`ult.prox = novo.`, {}, { [nd.id]: ['novo'] }, 5);
      ult = nd.id;
      snap(`ult = ${x}.`, {}, {}, 6);
    }

    function dequeue() {
      if (!pri) { snap('Fila vazia.'); return; }
      const r = nodes[pri].val;
      snap(`dequeue() retorna ${r}.`, { [pri]: 'active' }, {}, 9);
      pri = nodes[pri].prox;
      if (!pri) ult = null;
      snap(`pri = ${pri ? nodes[pri].val : '∅'}.`, {}, {}, 10);
    }

    enqueue(40);
    enqueue(50);
    dequeue();
    enqueue(60);
    dequeue();
    snap('Fim.');
    return out;
  }
});