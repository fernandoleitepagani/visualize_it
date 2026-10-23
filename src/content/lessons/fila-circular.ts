import type { Lesson, LessonOperationsGroup, Step, StepLine } from '@/engine/types';
import { lines } from '@/lib/lines';

const MAX = 7; // capacidade máxima com 1 espaço de folga

function normalizeInput(input: number[] | number[][]): number[] {
  if (!Array.isArray(input)) return [10, 20, 30];
  const flat = Array.isArray(input[0]) ? (input as number[][]).flat() : (input as number[]);
  const nums = flat.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  return nums.length > 0 ? nums.slice(0, MAX - 1) : [10, 20, 30];
}

/* ──────────────────────────────────────────────────────────
   1. Enqueue (Enfileirar)
   ────────────────────────────────────────────────────────── */
function getEnqueueCode(pri: number, ult: number, val: number) {
  return {
    java: lines(`
class Fila {
  int[] v = new int[${MAX}];
  int pri = ${pri}, ult = ${ult};
  void enqueue(int x) { // x = ${val}
    if ((ult + 1) % v.length == pri) return;
    v[ult] = x;
    ult = (ult + 1) % v.length;
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], pri = ${pri}, ult = ${ult};
void enqueue(int x) { // x = ${val}
  if ((ult + 1) % MAX == pri) return;
  v[ult] = x;
  ult = (ult + 1) % MAX;
}`),
  };
}

function generateEnqueueSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? 40;
  const v: (number | null)[] = new Array(MAX).fill(null);
  const pri = 0;
  let ult = 0;

  for (let i = 0; i < Math.min(initial.length, MAX - 1); i++) {
    v[ult] = initial[i];
    ult = (ult + 1) % MAX;
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
        if (i === pri) lbls.unshift('pri');
        if (i === ult) lbls.push('ult');
        return {
          val: cellVal,
          labels: lbls,
          state: states[i] || (cellVal === null ? 'empty' : ''),
        };
      }),
    });
  };

  snap(`Início: Fila circular com pri = ${pri}, ult = ${ult}. Executar enqueue(${val}).`, {}, {}, { java: 2, c: 2 });

  if ((ult + 1) % MAX === pri) {
    snap(`Fila cheia: (ult + 1) % ${MAX} == pri (${pri}). Inserção cancelada para preservar folga.`, { [ult]: 'write' }, { [ult]: ['!'] }, { java: 3, c: 3 });
    return out;
  }

  snap(`Verificação: (ult + 1) % ${MAX} = ${(ult + 1) % MAX} ≠ pri (${pri}). Espaço livre.`, {}, {}, { java: 3, c: 3 });

  v[ult] = val;
  snap(`v[${ult}] = ${val}: posição ult recebe novo elemento.`, { [ult]: 'write' }, { [ult]: ['novo'] }, { java: 4, c: 4 });

  ult = (ult + 1) % MAX;
  snap(`ult incrementado circularmente: ult = (ult + 1) % ${MAX} = ${ult}. Enfileiramento concluído em Θ(1).`, {}, {}, { java: 5, c: 5 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   2. Dequeue (Desenfileirar)
   ────────────────────────────────────────────────────────── */
function getDequeueCode(pri: number, ult: number) {
  return {
    java: lines(`
class Fila {
  int[] v = new int[${MAX}];
  int pri = ${pri}, ult = ${ult};
  int dequeue() {
    if (pri == ult) throw new RuntimeException("vazia");
    int r = v[pri];
    pri = (pri + 1) % v.length;
    return r;
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], pri = ${pri}, ult = ${ult};
int dequeue() {
  if (pri == ult) return -1;
  int r = v[pri];
  pri = (pri + 1) % MAX;
  return r;
}`),
  };
}

function generateDequeueSteps(rawInput: number[] | number[][]): Step[] {
  const initial = normalizeInput(rawInput);
  const v: (number | null)[] = new Array(MAX).fill(null);
  let pri = 0;
  let ult = 0;

  for (let i = 0; i < Math.min(initial.length, MAX - 1); i++) {
    v[ult] = initial[i];
    ult = (ult + 1) % MAX;
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
        if (i === pri) lbls.unshift('pri');
        if (i === ult) lbls.push('ult');
        return {
          val: cellVal,
          labels: lbls,
          state: states[i] || (cellVal === null ? 'empty' : ''),
        };
      }),
    });
  };

  snap(`Início: Executar dequeue() na fila circular com pri = ${pri}, ult = ${ult}.`, {}, {}, { java: 2, c: 2 });

  if (pri === ult) {
    snap(`Fila vazia: pri == ult (${pri}). Underflow.`, {}, {}, { java: 3, c: 3 });
    return out;
  }

  const r = v[pri];
  snap(`Lendo elemento do início da fila: r = v[${pri}] = ${r}.`, { [pri]: 'active' }, { [pri]: ['removendo'] }, { java: 4, c: 4 });

  v[pri] = null;
  pri = (pri + 1) % MAX;
  snap(`pri incrementado circularmente para (pri + 1) % ${MAX} = ${pri}. Valor retornado: ${r}.`, {}, {}, { java: 5, c: 5 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   3. Front (Consultar Primeiro)
   ────────────────────────────────────────────────────────── */
function getFrontCode(pri: number, ult: number) {
  return {
    java: lines(`
class Fila {
  int[] v = new int[${MAX}];
  int pri = ${pri}, ult = ${ult};
  int front() {
    if (pri == ult) throw new RuntimeException("vazia");
    return v[pri];
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], pri = ${pri}, ult = ${ult};
int front() {
  if (pri == ult) return -1;
  return v[pri];
}`),
  };
}

function generateFrontSteps(rawInput: number[] | number[][]): Step[] {
  const initial = normalizeInput(rawInput);
  const v: (number | null)[] = new Array(MAX).fill(null);
  const pri = 0;
  let ult = 0;

  for (let i = 0; i < Math.min(initial.length, MAX - 1); i++) {
    v[ult] = initial[i];
    ult = (ult + 1) % MAX;
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
        if (i === pri) lbls.unshift('pri');
        if (i === ult) lbls.push('ult');
        return {
          val: cellVal,
          labels: lbls,
          state: states[i] || (cellVal === null ? 'empty' : ''),
        };
      }),
    });
  };

  snap(`Início: Consultar primeiro elemento da fila (pri = ${pri}).`, {}, {}, { java: 2, c: 2 });

  if (pri === ult) {
    snap(`Fila vazia: pri == ult (${pri}). Nenhum elemento para consultar.`, {}, {}, { java: 3, c: 3 });
    return out;
  }

  const r = v[pri];
  snap(`Primeiro elemento consultado: v[${pri}] = ${r}. Operação de leitura em Θ(1).`, { [pri]: 'write' }, { [pri]: ['pri', 'consultado'] }, { java: 4, c: 4 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   Definição da Lição e Grupo de Operações
   ────────────────────────────────────────────────────────── */
export const operationsGroup: LessonOperationsGroup = {
  structures: [
    {
      id: 'fila-circular',
      label: 'Fila Circular',
      defaultInput: [10, 20, 30],
      operations: [
        {
          id: 'enqueue',
          label: 'Enqueue (Enfileirar)',
          panelLabel: 'fila circular',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 40 }],
          code: (input, p) => getEnqueueCode(0, normalizeInput(input).length % MAX, p?.val ?? 40),
          steps: (input, p) => generateEnqueueSteps(input, p),
        },
        {
          id: 'dequeue',
          label: 'Dequeue (Desenfileirar)',
          panelLabel: 'fila circular',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          code: (input) => getDequeueCode(0, normalizeInput(input).length % MAX),
          steps: (input) => generateDequeueSteps(input),
        },
        {
          id: 'front',
          label: 'Front (Consultar primeiro)',
          panelLabel: 'fila circular',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          code: (input) => getFrontCode(0, normalizeInput(input).length % MAX),
          steps: (input) => generateFrontSteps(input),
        },
      ],
    },
  ],
};

const defaultInput = [10, 20, 30];

export const lesson: Lesson = {
  id: 'fila-circular',
  title: 'Fila Circular',
  subtitle: 'FIFO em vetor circular',
  description:
    'Usa índices pri e ult que dão a volta no vetor com aritmética modular, sem deslocamento de dados. Escolha operações interativas como Enqueue (Enfileirar), Dequeue (Desenfileirar) e Front (Consultar primeiro).',
  view: 'cells',
  panelLabel: 'fila circular',
  initial: defaultInput,
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(n)',
    stable: true,
    note: 'Enfileirar e desenfileirar mexem só em pri e ult, com módulo pelo tamanho. Θ(1) sempre.',
  },
  code: getEnqueueCode(0, defaultInput.length % MAX, 40),
  operationsGroup,
  steps: (input) => generateEnqueueSteps(input, { val: 40 }),
};
