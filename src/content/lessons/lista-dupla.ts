import type { Lesson, Step, Node, StepLine } from '@/engine/types';
import { lines } from '@/lib/lines';

interface RawNode extends Node {
  ant: string | null;
  prox: string | null;
}

export const lesson: Lesson = {
  id: 'lista-dupla',
  title: 'Lista Dupla',
  subtitle: 'Células com ant e prox',
  description:
    'Cada nó aponta para o anterior e o próximo. Inserir/remover nas duas pontas é O(1).',
  view: 'nodes',
  linked: 'doubly',
  panelLabel: 'lista',
  initial: [10, 20],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(n) — 2 ponteiros por nó',
    stable: false,
    note: 'Vantagem sobre a lista simples: remover o último elemento é Θ(1), porque cada nó conhece o anterior.',
  },
  code: {
    java: lines(`
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
}`),
    c: lines(`
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
}`),
  },
  steps(initial) {
    let idc = 0;
    const makeNode = (val: number): RawNode => ({ id: 'n' + ++idc, val, ant: null, prox: null });
    const nodes: Record<string, RawNode> = {};
    let head: string | null = null,
      tail: string | null = null;
    for (const val of initial) {
      const nd = makeNode(val);
      nd.ant = tail;
      if (tail) nodes[tail].prox = nd.id;
      else head = nd.id;
      tail = nd.id;
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
      let cur: string | null = head;
      const seen = new Set<string>();
      while (cur && !seen.has(cur)) {
        seen.add(cur);
        list.push(nodes[cur]);
        cur = nodes[cur].prox;
      }
      out.push({
        line,
        desc,
        nodes: list.map((nd) => {
          const lbls: string[] = ([] as string[]).concat(labels[nd.id] || []);
          if (nd.id === head) lbls.unshift('head');
          if (nd.id === tail) lbls.push('tail');
          return {
            id: nd.id,
            val: nd.val,
            prev: nd.ant,
            next: nd.prox,
            labels: lbls,
            state: states[nd.id] || '',
          };
        }),
      });
    };

    snap(`Início: head → tail.`, {}, {}, { java: 1, c: 1 });

    function inserirFim(x: number) {
      const nd = makeNode(x);
      nodes[nd.id] = nd;
      if (!tail) {
        head = tail = nd.id;
        snap(`Primeiro nó: head = tail = ${x}.`, {}, {}, { java: 4, c: 5 });
        return;
      }
      nd.ant = tail;
      snap(`inserirFim(${x}): novo.ant = tail (${nodes[tail].val}).`, {}, { [nd.id]: ['novo'] }, { java: 5, c: 6 });
      nodes[tail].prox = nd.id;
      snap(`tail.prox = novo.`, {}, { [nd.id]: ['novo'] }, { java: 6, c: 6 });
      tail = nd.id;
      snap(`tail = ${x}.`, {}, {}, { java: 7, c: 6 });
    }

    function removerFim() {
      if (!tail) {
        snap('Lista vazia.', {}, {}, { java: 10, c: 9 });
        return;
      }
      const r = nodes[tail].val;
      snap(`removerFim(): remove ${r} — O(1) graças ao ant.`, { [tail]: 'active' }, {}, { java: 10, c: 9 });
      tail = nodes[tail].ant;
      if (tail) nodes[tail].prox = null;
      else head = null;
      snap(`tail = ${tail ? nodes[tail].val : '∅'}.`, {}, {}, { java: 11, c: 10 });
    }

    inserirFim(30);
    inserirFim(40);
    removerFim();
    removerFim();
    snap('Fim.', {}, {}, { java: 14, c: 13 });
    return out;
  },
};
