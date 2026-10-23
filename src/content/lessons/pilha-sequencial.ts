import type { Lesson, LessonOperationsGroup, Step, StepLine } from '@/engine/types';
import { lines } from '@/lib/lines';

const MAX = 8;

function normalizeInput(input: number[] | number[][]): number[] {
  if (!Array.isArray(input)) return [10, 20, 30];
  const flat = Array.isArray(input[0]) ? (input as number[][]).flat() : (input as number[]);
  const nums = flat.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  return nums.length > 0 ? nums.slice(0, MAX) : [10, 20, 30];
}

/* ──────────────────────────────────────────────────────────
   1. Push (Empilhar)
   ────────────────────────────────────────────────────────── */
function getPushCode(topo: number, val: number) {
  return {
    java: lines(`
class Pilha {
  int[] v = new int[${MAX}];
  int topo = ${topo};
  void push(int x) { // x = ${val}
    if (topo + 1 >= v.length) return;
    v[++topo] = x;
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], topo = ${topo};
void push(int x) { // x = ${val}
  if (topo + 1 >= MAX) return;
  v[++topo] = x;
}`),
  };
}

function generatePushSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? 40;
  const v: (number | null)[] = new Array(MAX).fill(null);
  let topo = -1;
  for (let i = 0; i < Math.min(initial.length, MAX); i++) {
    v[i] = initial[i];
    topo = i;
  }
  const out: Step[] = [];

  const snap = (
    desc: string,
    states: Record<number, string> = {},
    labels: Record<number, string[]> = {},
    line: StepLine = 0,
  ) => {
    out.push({
      line,
      desc,
      cells: v.map((cellVal, i) => {
        const lbls = ([] as string[]).concat(labels[i] || []);
        if (i === topo && cellVal !== null) lbls.unshift('topo');
        return {
          val: cellVal,
          labels: lbls,
          state: states[i] || (cellVal === null ? 'empty' : i === topo ? 'active' : ''),
        };
      }),
    });
  };

  snap(`Início: Pilha com ${topo + 1} elementos, topo = ${topo}. Executar push(${val}).`, {}, {}, { java: 2, c: 2 });

  if (topo + 1 >= MAX) {
    snap(`Pilha cheia (overflow): topo = ${topo} atingiu a capacidade máxima ${MAX}.`, { [topo]: 'write' }, { [topo]: ['!'] }, { java: 3, c: 3 });
    return out;
  }

  snap(`Verificação de capacidade: topo + 1 (${topo + 1}) < MAX (${MAX}). Espaço disponível.`, {}, {}, { java: 3, c: 3 });

  topo++;
  v[topo] = val;
  snap(`v[++topo] = ${val}: topo incrementado para ${topo} recebendo ${val}.`, { [topo]: 'write' }, { [topo]: ['topo', 'novo'] }, { java: 4, c: 4 });
  snap(`Operação push finalizada com sucesso em Θ(1).`, {}, {}, { java: 5, c: 5 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   2. Pop (Desempilhar)
   ────────────────────────────────────────────────────────── */
function getPopCode(topo: number) {
  return {
    java: lines(`
class Pilha {
  int[] v = new int[${MAX}];
  int topo = ${topo};
  int pop() {
    if (topo == -1) throw new RuntimeException("vazia");
    int r = v[topo--];
    return r;
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], topo = ${topo};
int pop() {
  if (topo == -1) return -1;
  int r = v[topo--];
  return r;
}`),
  };
}

function generatePopSteps(rawInput: number[] | number[][]): Step[] {
  const initial = normalizeInput(rawInput);
  const v: (number | null)[] = new Array(MAX).fill(null);
  let topo = -1;
  for (let i = 0; i < Math.min(initial.length, MAX); i++) {
    v[i] = initial[i];
    topo = i;
  }
  const out: Step[] = [];

  const snap = (
    desc: string,
    states: Record<number, string> = {},
    labels: Record<number, string[]> = {},
    line: StepLine = 0,
  ) => {
    out.push({
      line,
      desc,
      cells: v.map((cellVal, i) => {
        const lbls = ([] as string[]).concat(labels[i] || []);
        if (i === topo && cellVal !== null) lbls.unshift('topo');
        return {
          val: cellVal,
          labels: lbls,
          state: states[i] || (cellVal === null ? 'empty' : i === topo ? 'active' : ''),
        };
      }),
    });
  };

  snap(`Início: Executar pop() na pilha (topo atual = ${topo}).`, {}, {}, { java: 2, c: 2 });

  if (topo === -1) {
    snap(`Pilha vazia (underflow): topo = -1. Impossível desempilhar.`, {}, {}, { java: 3, c: 3 });
    return out;
  }

  const r = v[topo];
  snap(`Lendo elemento do topo: r = v[${topo}] = ${r}.`, { [topo]: 'write' }, { [topo]: ['removendo'] }, { java: 4, c: 4 });

  v[topo] = null;
  topo--;
  snap(`Posição liberada e topo decrementado para ${topo}. Valor retornado: ${r}.`, {}, {}, { java: 5, c: 5 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   3. Top (Consultar Topo)
   ────────────────────────────────────────────────────────── */
function getTopCode(topo: number) {
  return {
    java: lines(`
class Pilha {
  int[] v = new int[${MAX}];
  int topo = ${topo};
  int top() {
    if (topo == -1) throw new RuntimeException("vazia");
    return v[topo];
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], topo = ${topo};
int top() {
  if (topo == -1) return -1;
  return v[topo];
}`),
  };
}

function generateTopSteps(rawInput: number[] | number[][]): Step[] {
  const initial = normalizeInput(rawInput);
  const v: (number | null)[] = new Array(MAX).fill(null);
  let topo = -1;
  for (let i = 0; i < Math.min(initial.length, MAX); i++) {
    v[i] = initial[i];
    topo = i;
  }
  const out: Step[] = [];

  const snap = (
    desc: string,
    states: Record<number, string> = {},
    labels: Record<number, string[]> = {},
    line: StepLine = 0,
  ) => {
    out.push({
      line,
      desc,
      cells: v.map((cellVal, i) => {
        const lbls = ([] as string[]).concat(labels[i] || []);
        if (i === topo && cellVal !== null) lbls.unshift('topo');
        return {
          val: cellVal,
          labels: lbls,
          state: states[i] || (cellVal === null ? 'empty' : i === topo ? 'active' : ''),
        };
      }),
    });
  };

  snap(`Início: Consultar elemento no topo da pilha sem remover.`, {}, {}, { java: 2, c: 2 });

  if (topo === -1) {
    snap(`Pilha vazia (topo = -1). Nenhum elemento disponível.`, {}, {}, { java: 3, c: 3 });
    return out;
  }

  const r = v[topo];
  snap(`Elemento no topo consultado: v[${topo}] = ${r}. Operação somente leitura em Θ(1).`, { [topo]: 'write' }, { [topo]: ['topo', 'consultado'] }, { java: 4, c: 4 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   Definição da Lição e Grupo de Operações
   ────────────────────────────────────────────────────────── */
export const operationsGroup: LessonOperationsGroup = {
  structures: [
    {
      id: 'pilha-sequencial',
      label: 'Pilha Sequencial',
      defaultInput: [10, 20, 30],
      operations: [
        {
          id: 'push',
          label: 'Push (Empilhar)',
          panelLabel: 'pilha sequencial',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 40 }],
          code: (input, p) => getPushCode(normalizeInput(input).length - 1, p?.val ?? 40),
          steps: (input, p) => generatePushSteps(input, p),
        },
        {
          id: 'pop',
          label: 'Pop (Desempilhar)',
          panelLabel: 'pilha sequencial',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          code: (input) => getPopCode(normalizeInput(input).length - 1),
          steps: (input) => generatePopSteps(input),
        },
        {
          id: 'top',
          label: 'Top (Consultar topo)',
          panelLabel: 'pilha sequencial',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          code: (input) => getTopCode(normalizeInput(input).length - 1),
          steps: (input) => generateTopSteps(input),
        },
      ],
    },
  ],
};

const defaultInput = [10, 20, 30];

export const lesson: Lesson = {
  id: 'pilha-sequencial',
  title: 'Pilha Sequencial',
  subtitle: 'LIFO em vetor',
  description:
    'Empilha e desempilha sempre no topo com capacidade fixa. Escolha operações interativas como Push (Empilhar), Pop (Desempilhar) e Top (Consultar topo).',
  view: 'cells',
  panelLabel: 'pilha sequencial',
  initial: defaultInput,
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(n)',
    stable: false,
    note: 'push, pop e top tocam apenas a posição topo — sempre Θ(1).',
  },
  code: getPushCode(defaultInput.length - 1, 40),
  operationsGroup,
  steps: (input) => generatePushSteps(input, { val: 40 }),
};
