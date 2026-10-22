import type { Lesson, Step, Node, StepLine } from '@/engine/types';
import { lines } from '@/lib/lines';

interface RawNode extends Node {
  prox: string | null;
}

export const lesson: Lesson = {
  id: 'pilha-encadeada',
  title: 'Pilha Encadeada',
  subtitle: 'LIFO com nós dinâmicos',
  description:
    'Cada nó guarda valor e prox. Só o topo é referenciado — push e pop em O(1), sem capacidade fixa.',
  view: 'nodes',
  linked: 'singly',
  panelLabel: 'pilha',
  initial: [10, 20, 30],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(n)',
    stable: false,
    note: 'Sempre Θ(1). Sem limite de capacidade, ao custo de um ponteiro por elemento.',
  },
  code: {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No topo = null;
void push(int x) {
  No novo = new No(x);
  novo.prox = topo;
  topo = novo;
}
int pop() {
  if (topo == null) throw new RuntimeException("vazia");
  int r = topo.val;
  topo = topo.prox;
  return r;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *topo = NULL;
void push(int x) {
  No *novo = malloc(sizeof(No));
  novo->val = x;
  novo->prox = topo;
  topo = novo;
}
int pop() {
  if (!topo) return -1;
  int r = topo->val;
  topo = topo->prox;
  return r;
}`),
  },
  steps(initial) {
    let idc = 0;
    const nodes: Record<string, RawNode> = {};
    let topo: string | null = null;
    // initial[0] = bottom, initial[last] = top
    for (const val of initial) {
      const nd: RawNode = { id: 'n' + ++idc, val, prox: topo };
      topo = nd.id;
      nodes[nd.id] = nd;
    }
    const out: Step[] = [];

    const snap = (
      desc: string,
      states: Record<string, string> = {},
      labels: Record<string, string[]> = {},
      line: StepLine = 0,
    ) => {
      const list: RawNode[] = [];
      let cur: string | null = topo;
      const seen = new Set<string>();
      while (cur && !seen.has(cur)) {
        seen.add(cur);
        list.push(nodes[cur]);
        cur = nodes[cur].prox;
      }
      out.push({
        line,
        desc,
        nodes: list.map((nd) => ({
          id: nd.id,
          val: nd.val,
          next: nd.prox,
          labels: labels[nd.id] || (nd.id === topo ? ['topo'] : []),
          state: states[nd.id] || '',
        })),
      });
    };

    snap(`Início: topo → ${topo ? nodes[topo].val : '∅'}.`, {}, {}, { java: 1, c: 1 });

    function push(x: number) {
      const nd = { id: 'n' + ++idc, val: x, prox: topo };
      nodes[nd.id] = nd;
      snap(`push(${x}): novo.prox = topo.`, {}, { [nd.id]: ['novo'] }, { java: 4, c: 5 });
      topo = nd.id;
      snap(`topo = ${x}.`, {}, {}, { java: 5, c: 6 });
    }

    function pop() {
      if (!topo) {
        snap('Pilha vazia.', {}, {}, { java: 8, c: 9 });
        return;
      }
      const r = nodes[topo].val;
      snap(`pop() retorna ${r}.`, { [topo]: 'active' }, {}, { java: 9, c: 10 });
      topo = nodes[topo].prox;
      snap(`topo = ${topo ? nodes[topo].val : '∅'}.`, {}, {}, { java: 10, c: 11 });
    }

    push(40);
    push(50);
    pop();
    push(60);
    pop();
    pop();
    snap('Fim.', {}, {}, { java: 12, c: 13 });
    return out;
  },
};
