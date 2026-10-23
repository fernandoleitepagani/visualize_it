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
   1. Enqueue (Enfileirar)
   ────────────────────────────────────────────────────────── */
function getEnqueueCode(val: number) {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No pri = null, ult = null;
void enqueue(int x) { // x = ${val}
  No novo = new No(x);
  if (pri == null) pri = ult = novo;
  else { ult.prox = novo; ult = novo; }
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *pri = NULL, *ult = NULL;
void enqueue(int x) { // x = ${val}
  No *novo = malloc(sizeof(No));
  novo->val = x; novo->prox = NULL;
  if (!pri) pri = ult = novo;
  else { ult->prox = novo; ult = novo; }
}`),
  };
}

function generateEnqueueSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? 40;
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let pri: string | null = null;
  let ult: string | null = null;

  for (const item of initial) {
    const nd: RawNode = { id: 'n' + ++idc, val: item, prox: null };
    nodes[nd.id] = nd;
    if (!pri) {
      pri = ult = nd.id;
    } else {
      nodes[ult!].prox = nd.id;
      ult = nd.id;
    }
  }

  const out: Step[] = [];

  const snap = (
    desc: string,
    states: Record<string, string> = {},
    labels: Record<string, string[]> = {},
    line: StepLine = 0,
  ) => {
    const list: RawNode[] = [];
    let cur: string | null = pri;
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
        const lbls = ([] as string[]).concat(labels[nd.id] || []);
        if (nd.id === pri) lbls.unshift('pri');
        if (nd.id === ult) lbls.push('ult');
        return {
          id: nd.id,
          val: nd.val,
          next: nd.prox,
          labels: lbls,
          state: states[nd.id] || '',
        };
      }),
    });
  };

  snap(`Início: Fila encadeada com pri → ${pri ? nodes[pri].val : 'NULL'}, ult → ${ult ? nodes[ult].val : 'NULL'}.`, {}, {}, { java: 2, c: 2 });

  const novoId = 'n' + (idc + 1);
  const novoNd: RawNode = { id: novoId, val, prox: null };
  nodes[novoId] = novoNd;

  if (!pri) {
    pri = ult = novoId;
    snap(`Fila estava vazia: pri e ult passam a apontar para o novo nó ${val}.`, { [novoId]: 'write' }, { [novoId]: ['pri', 'ult'] }, { java: 4, c: 5 });
    return out;
  }

  out.push({
    line: { java: 3, c: 3 },
    desc: `Alocado novo nó com valor ${val} e prox = NULL.`,
    nodes: [
      ...(() => {
        const list: RawNode[] = [];
        let cur: string | null = pri;
        while (cur) {
          list.push(nodes[cur]);
          cur = nodes[cur].prox;
        }
        return list.map((nd) => ({
          id: nd.id,
          val: nd.val,
          next: nd.prox,
          labels: nd.id === pri ? ['pri'] : nd.id === ult ? ['ult'] : [],
          state: '',
        }));
      })(),
      { id: novoId, val, next: null, labels: ['novo'], state: 'write' },
    ],
  });

  nodes[ult!].prox = novoId;
  snap(`ult.prox conectado ao novo nó (${val}).`, { [ult!]: 'active', [novoId]: 'write' }, { [novoId]: ['novo'] }, { java: 5, c: 6 });

  ult = novoId;
  snap(`Ponteiro ult atualizado para o novo nó. Enfileiramento concluído em Θ(1).`, { [novoId]: 'write' }, { [novoId]: ['ult'] }, { java: 5, c: 6 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   2. Dequeue (Desenfileirar)
   ────────────────────────────────────────────────────────── */
function getDequeueCode() {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No pri = null, ult = null;
int dequeue() {
  if (pri == null) throw new RuntimeException("vazia");
  int r = pri.val;
  pri = pri.prox;
  if (pri == null) ult = null;
  return r;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *pri = NULL, *ult = NULL;
int dequeue() {
  if (!pri) return -1;
  int r = pri->val;
  No *tmp = pri;
  pri = pri->prox;
  if (!pri) ult = NULL;
  free(tmp);
  return r;
}`),
  };
}

function generateDequeueSteps(rawInput: number[] | number[][]): Step[] {
  const initial = normalizeInput(rawInput);
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let pri: string | null = null;
  let ult: string | null = null;

  for (const item of initial) {
    const nd: RawNode = { id: 'n' + ++idc, val: item, prox: null };
    nodes[nd.id] = nd;
    if (!pri) {
      pri = ult = nd.id;
    } else {
      nodes[ult!].prox = nd.id;
      ult = nd.id;
    }
  }

  const out: Step[] = [];

  const snap = (
    desc: string,
    states: Record<string, string> = {},
    labels: Record<string, string[]> = {},
    line: StepLine = 0,
  ) => {
    const list: RawNode[] = [];
    let cur: string | null = pri;
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
        const lbls = ([] as string[]).concat(labels[nd.id] || []);
        if (nd.id === pri) lbls.unshift('pri');
        if (nd.id === ult) lbls.push('ult');
        return {
          id: nd.id,
          val: nd.val,
          next: nd.prox,
          labels: lbls,
          state: states[nd.id] || '',
        };
      }),
    });
  };

  snap(`Início: Desenfileirar primeiro elemento da fila encadeada.`, {}, {}, { java: 2, c: 2 });

  if (!pri) {
    snap(`Fila vazia: pri é NULL. Underflow.`, {}, {}, { java: 3, c: 3 });
    return out;
  }

  const r = nodes[pri].val;
  snap(`Lendo valor do nó em pri: r = ${r}.`, { [pri]: 'write' }, { [pri]: ['removendo'] }, { java: 4, c: 4 });

  const oldPri = pri;
  pri = nodes[pri].prox;
  delete nodes[oldPri];

  if (!pri) ult = null;

  snap(`pri avança para pri.prox (${pri ? nodes[pri].val : 'NULL'}). Retornando ${r} em Θ(1).`, {}, {}, { java: 5, c: 6 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   3. Front (Consultar Primeiro)
   ────────────────────────────────────────────────────────── */
function getFrontCode() {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No pri = null, ult = null;
int front() {
  if (pri == null) throw new RuntimeException("vazia");
  return pri.val;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *pri = NULL, *ult = NULL;
int front() {
  if (!pri) return -1;
  return pri->val;
}`),
  };
}

function generateFrontSteps(rawInput: number[] | number[][]): Step[] {
  const initial = normalizeInput(rawInput);
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let pri: string | null = null;
  let ult: string | null = null;

  for (const item of initial) {
    const nd: RawNode = { id: 'n' + ++idc, val: item, prox: null };
    nodes[nd.id] = nd;
    if (!pri) {
      pri = ult = nd.id;
    } else {
      nodes[ult!].prox = nd.id;
      ult = nd.id;
    }
  }

  const out: Step[] = [];

  const snap = (
    desc: string,
    states: Record<string, string> = {},
    labels: Record<string, string[]> = {},
    line: StepLine = 0,
  ) => {
    const list: RawNode[] = [];
    let cur: string | null = pri;
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
        const lbls = ([] as string[]).concat(labels[nd.id] || []);
        if (nd.id === pri) lbls.unshift('pri');
        if (nd.id === ult) lbls.push('ult');
        return {
          id: nd.id,
          val: nd.val,
          next: nd.prox,
          labels: lbls,
          state: states[nd.id] || '',
        };
      }),
    });
  };

  snap(`Início: Consultar primeiro elemento da fila encadeada sem desenfileirar.`, {}, {}, { java: 2, c: 2 });

  if (!pri) {
    snap(`Fila vazia: pri é NULL.`, {}, {}, { java: 3, c: 3 });
    return out;
  }

  const r = nodes[pri].val;
  snap(`Elemento na frente da fila consultado: ${r}. Operação em Θ(1).`, { [pri]: 'write' }, { [pri]: ['pri', 'consultado'] }, { java: 4, c: 4 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   Definição da Lição e Grupo de Operações
   ────────────────────────────────────────────────────────── */
export const operationsGroup: LessonOperationsGroup = {
  structures: [
    {
      id: 'fila-encadeada',
      label: 'Fila Encadeada',
      defaultInput: [10, 20, 30],
      operations: [
        {
          id: 'enqueue',
          label: 'Enqueue (Enfileirar)',
          panelLabel: 'fila encadeada',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 40 }],
          code: (_input, p) => getEnqueueCode(p?.val ?? 40),
          steps: (input, p) => generateEnqueueSteps(input, p),
        },
        {
          id: 'dequeue',
          label: 'Dequeue (Desenfileirar)',
          panelLabel: 'fila encadeada',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          code: () => getDequeueCode(),
          steps: (input) => generateDequeueSteps(input),
        },
        {
          id: 'front',
          label: 'Front (Consultar primeiro)',
          panelLabel: 'fila encadeada',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          code: () => getFrontCode(),
          steps: (input) => generateFrontSteps(input),
        },
      ],
    },
  ],
};

const defaultInput = [10, 20, 30];

export const lesson: Lesson = {
  id: 'fila-encadeada',
  title: 'Fila Encadeada',
  subtitle: 'FIFO com nós dinâmicos',
  description:
    'Mantém ponteiros para o primeiro (pri) e o último (ult) nó. Enfileirar no fim e desenfileirar do início ocorrem ambos em Θ(1). Escolha operações interativas como Enqueue (Enfileirar), Dequeue (Desenfileirar) e Front (Consultar primeiro).',
  view: 'nodes',
  linked: 'singly',
  panelLabel: 'fila encadeada',
  initial: defaultInput,
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(n)',
    stable: true,
    note: 'Com dois ponteiros (pri e ult), as duas pontas custam Θ(1).',
  },
  code: getEnqueueCode(40),
  operationsGroup,
  steps: (input) => generateEnqueueSteps(input, { val: 40 }),
};
