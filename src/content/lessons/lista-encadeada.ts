import type { Lesson, LessonOperationsGroup, Step, Node, StepLine } from '@/engine/types';
import { lines } from '@/lib/lines';

interface RawNode extends Node {
  prox: string | null;
}

function normalizeInput(input: number[] | number[][]): number[] {
  if (!Array.isArray(input)) return [10, 20];
  const flat = Array.isArray(input[0]) ? (input as number[][]).flat() : (input as number[]);
  const nums = flat.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  return nums.length > 0 ? nums.slice(0, 8) : [10, 20];
}

/* ──────────────────────────────────────────────────────────
   1. Inserir Início
   ────────────────────────────────────────────────────────── */
function getInserirInicioCode(val: number) {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No head = null;
void inserirInicio(int x) { // x = ${val}
  No novo = new No(x);
  novo.prox = head;
  head = novo;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *head = NULL;
void inserirInicio(int x) { // x = ${val}
  No *novo = malloc(sizeof(No));
  novo->val = x;
  novo->prox = head;
  head = novo;
}`),
  };
}

function generateInserirInicioSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? 5;
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let head: string | null = null;

  for (let i = initial.length - 1; i >= 0; i--) {
    const nd: RawNode = { id: 'n' + ++idc, val: initial[i], prox: head };
    head = nd.id;
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
      nodes: list.map((nd) => ({
        id: nd.id,
        val: nd.val,
        next: nd.prox,
        labels: labels[nd.id] || (nd.id === head ? ['head'] : []),
        state: states[nd.id] || '',
      })),
    });
  };

  snap(`Início: head aponta para ${head ? nodes[head].val : 'NULL'}.`, {}, {}, { java: 2, c: 2 });

  const novoId = 'n' + (idc + 1);
  const novoNd: RawNode = { id: novoId, val, prox: null };
  nodes[novoId] = novoNd;

  out.push({
    line: { java: 3, c: 3 },
    desc: `Alocado novo nó com valor ${val}.`,
    nodes: [
      { id: novoId, val, next: null, labels: ['novo'], state: 'write' },
      ...((head ? [nodes[head]] : []) as RawNode[]).map((nd) => ({
        id: nd.id,
        val: nd.val,
        next: nd.prox,
        labels: nd.id === head ? ['head'] : [],
        state: '',
      })),
    ],
  });

  novoNd.prox = head;
  out.push({
    line: { java: 4, c: 5 },
    desc: `novo->prox aponta para o antigo head (${head ? nodes[head].val : 'NULL'}).`,
    nodes: [
      { id: novoId, val, next: head, labels: ['novo'], state: 'write' },
      ...((head ? [nodes[head]] : []) as RawNode[]).map((nd) => ({
        id: nd.id,
        val: nd.val,
        next: nd.prox,
        labels: nd.id === head ? ['head'] : [],
        state: '',
      })),
    ],
  });

  head = novoId;
  snap(`head atualizado para apontar para o novo nó (${val}). Inserção em Θ(1) concluída.`, { [novoId]: 'write' }, { [novoId]: ['head'] }, { java: 5, c: 6 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   2. Inserir Fim
   ────────────────────────────────────────────────────────── */
function getInserirFimCode(val: number) {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No head = null;
void inserirFim(int x) { // x = ${val}
  No novo = new No(x);
  if (head == null) { head = novo; return; }
  No at = head;
  while (at.prox != null) at = at.prox;
  at.prox = novo;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *head = NULL;
void inserirFim(int x) { // x = ${val}
  No *novo = malloc(sizeof(No));
  novo->val = x; novo->prox = NULL;
  if (!head) { head = novo; return; }
  No *at = head;
  while (at->prox) at = at->prox;
  at->prox = novo;
}`),
  };
}

function generateInserirFimSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? 40;
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let head: string | null = null;

  for (let i = initial.length - 1; i >= 0; i--) {
    const nd: RawNode = { id: 'n' + ++idc, val: initial[i], prox: head };
    head = nd.id;
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
      nodes: list.map((nd) => ({
        id: nd.id,
        val: nd.val,
        next: nd.prox,
        labels: labels[nd.id] || (nd.id === head ? ['head'] : []),
        state: states[nd.id] || '',
      })),
    });
  };

  snap(`Início: Inserir ${val} no fim da lista encadeada.`, {}, {}, { java: 2, c: 2 });

  const novoId = 'n' + (idc + 1);
  const novoNd: RawNode = { id: novoId, val, prox: null };
  nodes[novoId] = novoNd;

  if (!head) {
    head = novoId;
    snap(`Lista estava vazia. head aponta para ${val}.`, { [novoId]: 'write' }, { [novoId]: ['head'] }, { java: 4, c: 5 });
    return out;
  }

  let at: string | null = head;
  snap(`Iniciando percurso a partir de head (${nodes[at].val}).`, { [at]: 'active' }, { [at]: ['at', 'head'] }, { java: 5, c: 6 });

  while (nodes[at!].prox) {
    snap(`at.prox não é NULL (${nodes[nodes[at!].prox!].val}). Avançando ponteiro at.`, { [at!]: 'compare' }, { [at!]: ['at'] }, { java: 6, c: 7 });
    at = nodes[at!].prox;
  }

  snap(`Chegamos ao último nó (${nodes[at!].val}). at.prox é NULL.`, { [at!]: 'active' }, { [at!]: ['fim'] }, { java: 6, c: 7 });

  nodes[at!].prox = novoId;
  snap(`at.prox agora aponta para o novo nó ${val}. Inserção concluída em Θ(n).`, { [novoId]: 'write' }, { [novoId]: ['novo'] }, { java: 7, c: 8 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   3. Inserir Posição
   ────────────────────────────────────────────────────────── */
function getInserirPosicaoCode(pos: number, val: number) {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No head = null;
void inserirPosicao(int pos, int x) { // pos = ${pos}, x = ${val}
  if (pos == 0) {
    No novo = new No(x); novo.prox = head; head = novo; return;
  }
  No at = head;
  for (int i = 0; at != null && i < pos - 1; i++) at = at.prox;
  if (at == null) return;
  No novo = new No(x);
  novo.prox = at.prox;
  at.prox = novo;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *head = NULL;
void inserirPosicao(int pos, int x) { // pos = ${pos}, x = ${val}
  if (pos == 0) {
    No *novo = malloc(sizeof(No)); novo->val = x; novo->prox = head; head = novo; return;
  }
  No *at = head;
  for (int i = 0; at && i < pos - 1; i++) at = at->prox;
  if (!at) return;
  No *novo = malloc(sizeof(No)); novo->val = x;
  novo->prox = at->prox;
  at->prox = novo;
}`),
  };
}

function generateInserirPosicaoSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const pos = Math.max(0, params?.pos ?? 1);
  const val = params?.val ?? 15;
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let head: string | null = null;

  for (let i = initial.length - 1; i >= 0; i--) {
    const nd: RawNode = { id: 'n' + ++idc, val: initial[i], prox: head };
    head = nd.id;
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
      nodes: list.map((nd) => ({
        id: nd.id,
        val: nd.val,
        next: nd.prox,
        labels: labels[nd.id] || (nd.id === head ? ['head'] : []),
        state: states[nd.id] || '',
      })),
    });
  };

  snap(`Início: Inserir ${val} na posição ${pos}.`, {}, {}, { java: 2, c: 2 });

  const novoId = 'n' + (idc + 1);
  const novoNd: RawNode = { id: novoId, val, prox: null };
  nodes[novoId] = novoNd;

  if (pos === 0) {
    novoNd.prox = head;
    head = novoId;
    snap(`pos = 0: Inserido diretamente no início. head aponta para ${val}.`, { [novoId]: 'write' }, { [novoId]: ['head'] }, { java: 4, c: 4 });
    return out;
  }

  let at: string | null = head;
  let idx = 0;
  snap(`Buscando nó anterior à posição ${pos} (índice ${pos - 1}).`, { [at!]: 'active' }, { [at!]: ['at'] }, { java: 6, c: 6 });

  while (at && idx < pos - 1) {
    snap(`at está no índice ${idx} (${nodes[at].val}). Avançando.`, { [at]: 'compare' }, { [at]: ['at'] }, { java: 7, c: 7 });
    at = nodes[at].prox;
    idx++;
  }

  if (!at) {
    snap(`Posição ${pos} além dos limites da lista.`, {}, {}, { java: 8, c: 8 });
    return out;
  }

  snap(`Encontrado nó anterior: ${nodes[at].val} no índice ${idx}.`, { [at]: 'active' }, { [at]: ['ant'] }, { java: 7, c: 7 });

  novoNd.prox = nodes[at].prox;
  snap(`novo.prox conectado ao sucessor (${nodes[at].prox ? nodes[nodes[at].prox!].val : 'NULL'}).`, { [at]: 'active' }, {}, { java: 10, c: 10 });

  nodes[at].prox = novoId;
  snap(`at.prox conectado ao novo nó (${val}). Inserção concluída.`, { [novoId]: 'write' }, { [novoId]: ['novo'] }, { java: 11, c: 11 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   4. Remover
   ────────────────────────────────────────────────────────── */
function getRemoverCode(val: number) {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No head = null;
void remover(int x) { // x = ${val}
  No ant = null, at = head;
  while (at != null && at.val != x) {
    ant = at;
    at = at.prox;
  }
  if (at == null) return;
  if (ant == null) head = at.prox;
  else ant.prox = at.prox;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *head = NULL;
void remover(int x) { // x = ${val}
  No *ant = NULL, *at = head;
  while (at && at->val != x) {
    ant = at;
    at = at->prox;
  }
  if (!at) return;
  if (!ant) head = at->prox;
  else ant->prox = at->prox;
  free(at);
}`),
  };
}

function generateRemoverSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? (initial[1] ?? 20);
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let head: string | null = null;

  for (let i = initial.length - 1; i >= 0; i--) {
    const nd: RawNode = { id: 'n' + ++idc, val: initial[i], prox: head };
    head = nd.id;
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
      nodes: list.map((nd) => ({
        id: nd.id,
        val: nd.val,
        next: nd.prox,
        labels: labels[nd.id] || (nd.id === head ? ['head'] : []),
        state: states[nd.id] || '',
      })),
    });
  };

  snap(`Início: Buscar e remover nó com valor ${val}.`, {}, {}, { java: 2, c: 2 });

  let ant: string | null = null;
  let at: string | null = head;

  snap(`Inicializando ant = NULL e at = head.`, { ...(at ? { [at]: 'active' } : {}) }, { ...(at ? { [at]: ['at'] } : {}) }, { java: 3, c: 3 });

  while (at && nodes[at].val !== val) {
    snap(`Nó ${nodes[at].val} ≠ ${val}. Avançando ant e at.`, { [at]: 'compare' }, { [at]: ['at'] }, { java: 4, c: 4 });
    ant = at;
    at = nodes[at].prox;
  }

  if (!at) {
    snap(`Valor ${val} não encontrado na lista encadeada. Remoção abortada.`, {}, {}, { java: 8, c: 8 });
    return out;
  }

  snap(`Encontrado nó alvo (${val})!`, { [at]: 'write' }, { [at]: ['alvo'] }, { java: 8, c: 8 });

  if (ant === null) {
    head = nodes[at].prox;
    snap(`Removendo primeiro nó: head passa a apontar para o sucessor (${head ? nodes[head].val : 'NULL'}).`, {}, {}, { java: 9, c: 9 });
  } else {
    nodes[ant].prox = nodes[at].prox;
    snap(`ant.prox contorna o nó ${val} e conecta diretamente em ${nodes[ant].prox ? nodes[nodes[ant].prox!].val : 'NULL'}.`, { [ant]: 'active' }, { [ant]: ['ant'] }, { java: 10, c: 10 });
  }

  delete nodes[at];
  snap(`Nó com valor ${val} removido e memória liberada.`, {}, {}, { java: 11, c: 11 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   5. Buscar
   ────────────────────────────────────────────────────────── */
function getBuscarCode(val: number) {
  return {
    java: lines(`
class No { int val; No prox; No(int v){val=v;} }
No head = null;
boolean buscar(int x) { // x = ${val}
  No at = head;
  while (at != null) {
    if (at.val == x) return true;
    at = at.prox;
  }
  return false;
}`),
    c: lines(`
typedef struct No { int val; struct No *prox; } No;
No *head = NULL;
int buscar(int x) { // x = ${val}
  No *at = head;
  while (at) {
    if (at->val == x) return 1;
    at = at->prox;
  }
  return 0;
}`),
  };
}

function generateBuscarSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? (initial[1] ?? 20);
  let idc = 0;
  const nodes: Record<string, RawNode> = {};
  let head: string | null = null;

  for (let i = initial.length - 1; i >= 0; i--) {
    const nd: RawNode = { id: 'n' + ++idc, val: initial[i], prox: head };
    head = nd.id;
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
      nodes: list.map((nd) => ({
        id: nd.id,
        val: nd.val,
        next: nd.prox,
        labels: labels[nd.id] || (nd.id === head ? ['head'] : []),
        state: states[nd.id] || '',
      })),
    });
  };

  snap(`Início: Buscar valor ${val} na lista encadeada.`, {}, {}, { java: 2, c: 2 });

  let at: string | null = head;
  let found = false;

  snap(`at aponta para head (${at ? nodes[at].val : 'NULL'}).`, { ...(at ? { [at]: 'active' } : {}) }, { ...(at ? { [at]: ['at'] } : {}) }, { java: 3, c: 3 });

  while (at) {
    const isMatch = nodes[at].val === val;
    snap(
      `Comparando nó ${nodes[at].val} com ${val}: ${isMatch ? 'IGUAL' : 'diferente'}.`,
      { [at]: isMatch ? 'write' : 'compare' },
      { [at]: [isMatch ? 'achou!' : 'at'] },
      { java: 5, c: 5 },
    );

    if (isMatch) {
      found = true;
      snap(`Elemento ${val} encontrado! Retornando true (1).`, { [at]: 'write' }, { [at]: ['achou'] }, { java: 5, c: 5 });
      break;
    }
    at = nodes[at].prox;
  }

  if (!found) {
    snap(`Fim da lista (NULL atingido). Elemento ${val} não encontrado. Retornando false (0).`, {}, {}, { java: 8, c: 8 });
  }

  return out;
}

/* ──────────────────────────────────────────────────────────
   Definição da Lição e Grupo de Operações
   ────────────────────────────────────────────────────────── */
export const operationsGroup: LessonOperationsGroup = {
  structures: [
    {
      id: 'lista-encadeada',
      label: 'Lista Encadeada',
      defaultInput: [10, 20],
      operations: [
        {
          id: 'inserir-inicio',
          label: 'Inserir Início',
          panelLabel: 'lista encadeada',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 5 }],
          code: (_input, p) => getInserirInicioCode(p?.val ?? 5),
          steps: (input, p) => generateInserirInicioSteps(input, p),
        },
        {
          id: 'inserir-fim',
          label: 'Inserir Fim',
          panelLabel: 'lista encadeada',
          complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 40 }],
          code: (_input, p) => getInserirFimCode(p?.val ?? 40),
          steps: (input, p) => generateInserirFimSteps(input, p),
        },
        {
          id: 'inserir-posicao',
          label: 'Inserir Posição',
          panelLabel: 'lista encadeada',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          params: [
            { id: 'pos', label: 'Posição', defaultValue: 1, min: 0 },
            { id: 'val', label: 'Valor', defaultValue: 15 },
          ],
          code: (_input, p) => getInserirPosicaoCode(p?.pos ?? 1, p?.val ?? 15),
          steps: (input, p) => generateInserirPosicaoSteps(input, p),
        },
        {
          id: 'remover',
          label: 'Remover',
          panelLabel: 'lista encadeada',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 20 }],
          code: (_input, p) => getRemoverCode(p?.val ?? 20),
          steps: (input, p) => generateRemoverSteps(input, p),
        },
        {
          id: 'buscar',
          label: 'Buscar',
          panelLabel: 'lista encadeada',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 20 }],
          code: (_input, p) => getBuscarCode(p?.val ?? 20),
          steps: (input, p) => generateBuscarSteps(input, p),
        },
      ],
    },
  ],
};

const defaultInput = [10, 20];

export const lesson: Lesson = {
  id: 'lista-encadeada',
  title: 'Lista Encadeada',
  subtitle: 'Células com um ponteiro prox',
  description:
    'Cada nó guarda um valor e um ponteiro para o próximo. Inserir no início é Θ(1); no fim, em posição arbitrária ou remoção exigem percorrer os nós. Escolha operações interativas como Inserir Início, Inserir Fim, Inserir Posição, Remover e Buscar.',
  view: 'nodes',
  linked: 'singly',
  panelLabel: 'lista encadeada',
  initial: defaultInput,
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(n)',
    stable: false,
    note: 'inserirInicio é Θ(1). Inserir/remover no fim ou buscar por valor é Θ(n).',
  },
  code: getInserirInicioCode(5),
  operationsGroup,
  steps: (input) => generateInserirInicioSteps(input, { val: 5 }),
};
