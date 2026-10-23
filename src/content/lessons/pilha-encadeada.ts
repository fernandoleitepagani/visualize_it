import type { Lesson, LessonOperationsGroup, Step, Node, StepLine } from '@/engine/types';
import { lines } from '@/lib/lines';

interface RawNode extends Node {
  prox: string | null;
}

function normalizeInput(input: number[] | number[][]): number[] {
  if (!Array.isArray(input)) return [10, 20, 30];
  const flat = Array.isArray(input[0]) ? (input as number[][]).flat() : (input as number[]);
  const nums = flat.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  return nums.length > 0 ? nums.slice(0, 8) : [10, 20, 30];
}

/* ──────────────────────────────────────────────────────────
   1. Push (Empilhar)
   ────────────────────────────────────────────────────────── */
function getPushCode(val: number) {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No topo = null;
void push(int x) { // x = ${val}
  No novo = new No(x);
  novo.prox = topo;
  topo = novo;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *topo = NULL;
void push(int x) { // x = ${val}
  No *novo = malloc(sizeof(No));
  novo->val = x;
  novo->prox = topo;
  topo = novo;
}`),
  };
}

function generatePushSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? 40;
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let topo: string | null = null;

  for (const item of initial) {
    const nd: RawNode = { id: 'n' + ++idc, val: item, prox: topo };
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

  snap(`Início: Pilha encadeada com topo → ${topo ? nodes[topo].val : 'NULL'}. Executar push(${val}).`, {}, {}, { java: 2, c: 2 });

  const novoId = 'n' + (idc + 1);
  const novoNd: RawNode = { id: novoId, val, prox: null };
  nodes[novoId] = novoNd;

  out.push({
    line: { java: 3, c: 3 },
    desc: `Alocado novo nó com valor ${val}.`,
    nodes: [
      { id: novoId, val, next: null, labels: ['novo'], state: 'write' },
      ...((topo ? [nodes[topo]] : []) as RawNode[]).map((nd) => ({
        id: nd.id,
        val: nd.val,
        next: nd.prox,
        labels: nd.id === topo ? ['topo'] : [],
        state: '',
      })),
    ],
  });

  novoNd.prox = topo;
  out.push({
    line: { java: 4, c: 5 },
    desc: `novo.prox passa a apontar para o topo atual (${topo ? nodes[topo].val : 'NULL'}).`,
    nodes: [
      { id: novoId, val, next: topo, labels: ['novo'], state: 'write' },
      ...((topo ? [nodes[topo]] : []) as RawNode[]).map((nd) => ({
        id: nd.id,
        val: nd.val,
        next: nd.prox,
        labels: nd.id === topo ? ['topo'] : [],
        state: '',
      })),
    ],
  });

  topo = novoId;
  snap(`topo atualizado para apontar para o novo nó (${val}). Empilhamento concluído em Θ(1).`, { [novoId]: 'write' }, { [novoId]: ['topo'] }, { java: 5, c: 6 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   2. Pop (Desempilhar)
   ────────────────────────────────────────────────────────── */
function getPopCode() {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No topo = null;
int pop() {
  if (topo == null) throw new RuntimeException("vazia");
  int r = topo.val;
  topo = topo.prox;
  return r;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *topo = NULL;
int pop() {
  if (!topo) return -1;
  int r = topo->val;
  No *tmp = topo;
  topo = topo->prox;
  free(tmp);
  return r;
}`),
  };
}

function generatePopSteps(rawInput: number[] | number[][]): Step[] {
  const initial = normalizeInput(rawInput);
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let topo: string | null = null;

  for (const item of initial) {
    const nd: RawNode = { id: 'n' + ++idc, val: item, prox: topo };
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

  snap(`Início: Desempilhar elemento do topo da pilha encadeada.`, {}, {}, { java: 2, c: 2 });

  if (!topo) {
    snap(`Pilha vazia: topo é NULL. Underflow.`, {}, {}, { java: 3, c: 3 });
    return out;
  }

  const r = nodes[topo].val;
  snap(`Lendo valor do nó no topo: r = ${r}.`, { [topo]: 'write' }, { [topo]: ['removendo'] }, { java: 4, c: 4 });

  const oldTopo = topo;
  topo = nodes[topo].prox;
  delete nodes[oldTopo];

  snap(`topo avança para topo.prox (${topo ? nodes[topo].val : 'NULL'}). Memória liberada, retorna ${r}.`, {}, {}, { java: 5, c: 6 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   3. Top (Consultar Topo)
   ────────────────────────────────────────────────────────── */
function getTopCode() {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No topo = null;
int top() {
  if (topo == null) throw new RuntimeException("vazia");
  return topo.val;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *topo = NULL;
int top() {
  if (!topo) return -1;
  return topo->val;
}`),
  };
}

function generateTopSteps(rawInput: number[] | number[][]): Step[] {
  const initial = normalizeInput(rawInput);
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let topo: string | null = null;

  for (const item of initial) {
    const nd: RawNode = { id: 'n' + ++idc, val: item, prox: topo };
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

  snap(`Início: Consultar nó do topo sem desempilhar.`, {}, {}, { java: 2, c: 2 });

  if (!topo) {
    snap(`Pilha vazia: topo é NULL.`, {}, {}, { java: 3, c: 3 });
    return out;
  }

  const r = nodes[topo].val;
  snap(`Nó do topo consultado: ${r}. Operação de leitura em Θ(1).`, { [topo]: 'write' }, { [topo]: ['topo', 'consultado'] }, { java: 4, c: 4 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   Definição da Lição e Grupo de Operações
   ────────────────────────────────────────────────────────── */
export const operationsGroup: LessonOperationsGroup = {
  structures: [
    {
      id: 'pilha-encadeada',
      label: 'Pilha Encadeada',
      defaultInput: [10, 20, 30],
      operations: [
        {
          id: 'push',
          label: 'Push (Empilhar)',
          panelLabel: 'pilha encadeada',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 40 }],
          code: (_input, p) => getPushCode(p?.val ?? 40),
          steps: (input, p) => generatePushSteps(input, p),
        },
        {
          id: 'pop',
          label: 'Pop (Desempilhar)',
          panelLabel: 'pilha encadeada',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          code: () => getPopCode(),
          steps: (input) => generatePopSteps(input),
        },
        {
          id: 'top',
          label: 'Top (Consultar topo)',
          panelLabel: 'pilha encadeada',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          code: () => getTopCode(),
          steps: (input) => generateTopSteps(input),
        },
      ],
    },
  ],
};

const defaultInput = [10, 20, 30];

export const lesson: Lesson = {
  id: 'pilha-encadeada',
  title: 'Pilha Encadeada',
  subtitle: 'LIFO com nós dinâmicos',
  description:
    'Cada nó guarda valor e ponteiro para o nó abaixo. Só o topo é referenciado — push, pop e top ocorrem em Θ(1), sem capacidade máxima fixa.',
  view: 'nodes',
  linked: 'singly',
  panelLabel: 'pilha encadeada',
  initial: defaultInput,
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(n)',
    stable: false,
    note: 'Sempre Θ(1). Sem limite de capacidade, ao custo de um ponteiro por elemento.',
  },
  code: getPushCode(40),
  operationsGroup,
  steps: (input) => generatePushSteps(input, { val: 40 }),
};
