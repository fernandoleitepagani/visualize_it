viz.register('lista-encadeada', {
  title: 'Lista Encadeada',
  subtitle: 'Células com um ponteiro prox',
  description: 'Cada nó aponta para o próximo. Inserir no início é O(1); no fim ou no meio, O(n).',
  view: 'nodes',
  linked: 'singly',
  panelLabel: 'lista',
  initial: [10, 20],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(n)', stable: false,
    note: 'inserirInicio é Θ(1). Inserir/remover no fim ou buscar por valor é Θ(n).'
  },
  code: {
    java: `
class No { int val; No prox; No(int v){val=v;} }
No head = null;
void inserirInicio(int x) {
  No novo = new No(x);
  novo.prox = head;
  head = novo;
}
void remover(int x) {
  No ant = null, at = head;
  while (at != null && at.val != x) { ant = at; at = at.prox; }
  if (at == null) return;
  if (ant == null) head = at.prox;
  else ant.prox = at.prox;
}`.trim().split('\n'),
    c: `
typedef struct No { int val; struct No *prox; } No;
No *head = NULL;
void inserirInicio(int x) {
  No *novo = malloc(sizeof(No));
  novo->val = x;
  novo->prox = head;
  head = novo;
}
void remover(int x) {
  No *ant = NULL, *at = head;
  while (at && at->val != x) { ant = at; at = at->prox; }
  if (!at) return;
  if (!ant) head = at->prox;
  else ant->prox = at->prox;
}`.trim().split('\n')
  },
  steps(initial) {
    let idc = 0;
    const makeNode = (val) => ({ id: 'n' + (++idc), val, prox: null });
    const nodes = {};   // id -> node
    let head = null;
    for (const val of initial) {
      const nd = makeNode(val);
      nd.prox = head;
      head = nd.id;
      nodes[nd.id] = nd;
    }
    const out = [];

    const snap = (desc, states = {}, labels = {}, line = 0) => {
      // traverse from head
      const list = [];
      let cur = head; const seen = new Set();
      while (cur && !seen.has(cur)) { seen.add(cur); list.push(nodes[cur]); cur = nodes[cur].prox; }
      out.push({
        line, desc,
        nodes: list.map(nd => ({
          id: nd.id, val: nd.val, next: nd.prox,
          labels: labels[nd.id] || (nd.id === head ? ['head'] : []),
          state: states[nd.id] || ''
        }))
      });
    };

    snap(`Início: head → ${head ? nodes[head].val : '∅'}.`, {}, {}, 0);

    function inserirInicio(x) {
      const nd = makeNode(x);
      snap(`inserirInicio(${x}): cria nó.`, {}, { [nd.id]: ['novo'] }, 2);
      nd.prox = head;
      nodes[nd.id] = nd;
      snap(`novo.prox = head (${head ? nodes[head].val : '∅'}).`, {}, { [nd.id]: ['novo'] }, 3);
      head = nd.id;
      snap(`head = novo (${x}).`, {}, {}, 4);
    }

    function remover(x) {
      snap(`remover(${x}): percorre a lista.`, {}, {}, 7);
      let ant = null, at = head;
      while (at && nodes[at].val !== x) {
        snap(`v[${nodes[at].val}] ≠ ${x} → avança.`, { [at]: 'compare' }, {}, 8);
        ant = at; at = nodes[at].prox;
      }
      if (!at) { snap(`Valor ${x} não encontrado.`, {}, {}, 8); return; }
      snap(`Encontrado nó ${nodes[at].val}.`, { [at]: 'active' }, {}, 8);
      if (ant === null) head = nodes[at].prox;
      else nodes[ant].prox = nodes[at].prox;
      delete nodes[at];
      snap(`Removido ${x}.`, {}, {}, 11);
    }

    inserirInicio(5);
    inserirInicio(3);
    remover(10);
    inserirInicio(1);
    snap('Fim.');
    return out;
  }
});