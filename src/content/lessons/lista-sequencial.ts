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
   1. Inserir Início
   ────────────────────────────────────────────────────────── */
function getInserirInicioCode(n: number, val: number) {
  return {
    java: lines(`
class Lista {
  int[] v = new int[${MAX}];
  int n = ${n};
  void inserirInicio(int x) { // x = ${val}
    if (n >= v.length) return;
    for (int i = n; i > 0; i--) {
      v[i] = v[i - 1];
    }
    v[0] = x;
    n++;
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], n = ${n};
void inserirInicio(int x) { // x = ${val}
  if (n >= MAX) return;
  for (int i = n; i > 0; i--) {
    v[i] = v[i - 1];
  }
  v[0] = x;
  n++;
}`),
  };
}

function generateInserirInicioSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? 5;
  const v: (number | null)[] = new Array(MAX).fill(null);
  let n = 0;
  for (let i = 0; i < Math.min(initial.length, MAX); i++) {
    v[i] = initial[i];
    n++;
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
      cells: v.map((cellVal, i) => ({
        val: cellVal,
        labels: labels[i] || [],
        state: states[i] || (cellVal === null ? 'empty' : ''),
      })),
    });
  };

  snap(`Início: Lista com ${n} elementos, n = ${n}. Inserir ${val} no início (índice 0).`, {}, {}, { java: 4, c: 3 });

  if (n >= MAX) {
    snap(`Lista cheia (capacidade máxima de ${MAX} atingida). Não é possível inserir.`, {}, { 0: ['!'] }, { java: 5, c: 4 });
    return out;
  }

  snap(`Preparando para deslocar elementos à direita para abrir espaço em v[0].`, {}, {}, { java: 6, c: 5 });

  for (let i = n; i > 0; i--) {
    v[i] = v[i - 1];
    snap(
      `Deslocando v[${i}] ← v[${i - 1}] (${v[i]}).`,
      { [i]: 'write', [i - 1]: 'active' },
      { [i]: ['aberto'] },
      { java: 7, c: 6 },
    );
  }

  v[0] = val;
  n++;
  snap(`Elemento ${val} inserido em v[0]. Agora n = ${n}.`, { 0: 'write' }, { 0: ['novo'] }, { java: 9, c: 8 });
  snap(`Inserção no início concluída com sucesso. Lista final com n = ${n}.`, {}, {}, { java: 10, c: 9 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   2. Inserir Fim
   ────────────────────────────────────────────────────────── */
function getInserirFimCode(n: number, val: number) {
  return {
    java: lines(`
class Lista {
  int[] v = new int[${MAX}];
  int n = ${n};
  void inserirFim(int x) { // x = ${val}
    if (n >= v.length) return;
    v[n] = x;
    n++;
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], n = ${n};
void inserirFim(int x) { // x = ${val}
  if (n >= MAX) return;
  v[n] = x;
  n++;
}`),
  };
}

function generateInserirFimSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? 40;
  const v: (number | null)[] = new Array(MAX).fill(null);
  let n = 0;
  for (let i = 0; i < Math.min(initial.length, MAX); i++) {
    v[i] = initial[i];
    n++;
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
      cells: v.map((cellVal, i) => ({
        val: cellVal,
        labels: labels[i] || [],
        state: states[i] || (cellVal === null ? 'empty' : ''),
      })),
    });
  };

  snap(`Início: Inserir ${val} no fim da lista (posição n = ${n}).`, {}, {}, { java: 4, c: 3 });

  if (n >= MAX) {
    snap(`Lista cheia (n = ${MAX}). Não há espaço no fim.`, {}, { [MAX - 1]: ['!'] }, { java: 5, c: 4 });
    return out;
  }

  v[n] = val;
  snap(`Posição v[${n}] recebe o valor ${val}.`, { [n]: 'write' }, { [n]: ['fim'] }, { java: 6, c: 5 });
  n++;
  snap(`Contador n incrementado para ${n}. Operação em Θ(1) sem deslocamentos.`, { [n - 1]: 'active' }, {}, { java: 7, c: 6 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   3. Inserir Posição
   ────────────────────────────────────────────────────────── */
function getInserirPosicaoCode(n: number, pos: number, val: number) {
  return {
    java: lines(`
class Lista {
  int[] v = new int[${MAX}];
  int n = ${n};
  void inserir(int pos, int x) { // pos = ${pos}, x = ${val}
    if (n >= v.length || pos < 0 || pos > n) return;
    for (int i = n; i > pos; i--) {
      v[i] = v[i - 1];
    }
    v[pos] = x;
    n++;
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], n = ${n};
void inserir(int pos, int x) { // pos = ${pos}, x = ${val}
  if (n >= MAX || pos < 0 || pos > n) return;
  for (int i = n; i > pos; i--) {
    v[i] = v[i - 1];
  }
  v[pos] = x;
  n++;
}`),
  };
}

function generateInserirPosicaoSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const pos = Math.max(0, Math.min(params?.pos ?? 1, MAX - 1));
  const val = params?.val ?? 15;
  const v: (number | null)[] = new Array(MAX).fill(null);
  let n = 0;
  for (let i = 0; i < Math.min(initial.length, MAX); i++) {
    v[i] = initial[i];
    n++;
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
      cells: v.map((cellVal, i) => ({
        val: cellVal,
        labels: labels[i] || [],
        state: states[i] || (cellVal === null ? 'empty' : ''),
      })),
    });
  };

  snap(`Início: Inserir ${val} na posição especificada [${pos}], com n = ${n}.`, {}, { [pos]: ['alvo'] }, { java: 4, c: 3 });

  if (n >= MAX) {
    snap(`Lista cheia (n = ${n} >= ${MAX}). Inserção cancelada.`, {}, { [pos]: ['!'] }, { java: 5, c: 4 });
    return out;
  }
  if (pos > n) {
    snap(`Posição ${pos} inválida (fora do intervalo [0, ${n}]).`, {}, {}, { java: 5, c: 4 });
    return out;
  }

  for (let i = n; i > pos; i--) {
    v[i] = v[i - 1];
    snap(
      `Deslocando v[${i}] ← v[${i - 1}] (${v[i]}).`,
      { [i]: 'write', [i - 1]: 'active' },
      { [i]: ['move'] },
      { java: 7, c: 6 },
    );
  }

  v[pos] = val;
  n++;
  snap(`v[${pos}] = ${val}. n incrementado para ${n}.`, { [pos]: 'write' }, { [pos]: ['novo'] }, { java: 9, c: 8 });
  snap(`Inserção na posição ${pos} concluída.`, {}, {}, { java: 10, c: 9 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   4. Remover
   ────────────────────────────────────────────────────────── */
function getRemoverCode(n: number, pos: number) {
  return {
    java: lines(`
class Lista {
  int[] v = new int[${MAX}];
  int n = ${n};
  int remover(int pos) { // pos = ${pos}
    if (pos < 0 || pos >= n) return -1;
    int r = v[pos];
    for (int i = pos; i < n - 1; i++) {
      v[i] = v[i + 1];
    }
    v[n - 1] = 0;
    n--;
    return r;
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], n = ${n};
int remover(int pos) { // pos = ${pos}
  if (pos < 0 || pos >= n) return -1;
  int r = v[pos];
  for (int i = pos; i < n - 1; i++) {
    v[i] = v[i + 1];
  }
  v[n - 1] = 0;
  n--;
  return r;
}`),
  };
}

function generateRemoverSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const pos = Math.max(0, Math.min(params?.pos ?? 1, MAX - 1));
  const v: (number | null)[] = new Array(MAX).fill(null);
  let n = 0;
  for (let i = 0; i < Math.min(initial.length, MAX); i++) {
    v[i] = initial[i];
    n++;
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
      cells: v.map((cellVal, i) => ({
        val: cellVal,
        labels: labels[i] || [],
        state: states[i] || (cellVal === null ? 'empty' : ''),
      })),
    });
  };

  snap(`Início: Remover elemento na posição [${pos}], lista com n = ${n}.`, {}, { [pos]: ['remover'] }, { java: 4, c: 3 });

  if (n === 0 || pos >= n) {
    snap(`Posição ${pos} inválida para remoção (n = ${n}).`, {}, {}, { java: 5, c: 4 });
    return out;
  }

  const r = v[pos];
  snap(`Salvando valor removido r = v[${pos}] = ${r}.`, { [pos]: 'active' }, { [pos]: ['removido'] }, { java: 6, c: 5 });

  for (let i = pos; i < n - 1; i++) {
    v[i] = v[i + 1];
    snap(
      `Deslocando v[${i}] ← v[${i + 1}] (${v[i]}).`,
      { [i]: 'write', [i + 1]: 'active' },
      { [i]: ['deslocado'] },
      { java: 8, c: 7 },
    );
  }

  v[n - 1] = null;
  n--;
  snap(`Última posição liberada, n decrementado para ${n}. Valor retornado: ${r}.`, {}, {}, { java: 11, c: 10 });

  return out;
}

/* ──────────────────────────────────────────────────────────
   5. Buscar
   ────────────────────────────────────────────────────────── */
function getBuscarCode(n: number, val: number) {
  return {
    java: lines(`
class Lista {
  int[] v = new int[${MAX}];
  int n = ${n};
  int buscar(int x) { // x = ${val}
    for (int i = 0; i < n; i++) {
      if (v[i] == x) {
        return i;
      }
    }
    return -1;
  }
}`),
    c: lines(`
#define MAX ${MAX}
int v[MAX], n = ${n};
int buscar(int x) { // x = ${val}
  for (int i = 0; i < n; i++) {
    if (v[i] == x) {
      return i;
    }
  }
  return -1;
}`),
  };
}

function generateBuscarSteps(rawInput: number[] | number[][], params?: Record<string, number>): Step[] {
  const initial = normalizeInput(rawInput);
  const val = params?.val ?? (initial[1] ?? 20);
  const v: (number | null)[] = new Array(MAX).fill(null);
  let n = 0;
  for (let i = 0; i < Math.min(initial.length, MAX); i++) {
    v[i] = initial[i];
    n++;
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
      cells: v.map((cellVal, i) => ({
        val: cellVal,
        labels: labels[i] || [],
        state: states[i] || (cellVal === null ? 'empty' : ''),
      })),
    });
  };

  snap(`Início: Buscar valor ${val} na lista sequencial com ${n} elementos.`, {}, {}, { java: 4, c: 3 });

  let foundIndex = -1;
  for (let i = 0; i < n; i++) {
    const isMatch = v[i] === val;
    snap(
      `Comparando v[${i}] (${v[i]}) com ${val}: ${isMatch ? 'IGUAL' : 'diferente'}.`,
      { [i]: isMatch ? 'write' : 'compare' },
      { [i]: [isMatch ? 'achou!' : 'i'] },
      { java: 6, c: 5 },
    );

    if (isMatch) {
      foundIndex = i;
      snap(`Elemento ${val} encontrado no índice ${i}. Retornando ${i}.`, { [i]: 'write' }, { [i]: ['pos'] }, { java: 7, c: 6 });
      break;
    }
  }

  if (foundIndex === -1) {
    snap(`Fim da varredura: elemento ${val} não encontrado na lista. Retornando -1.`, {}, {}, { java: 10, c: 9 });
  }

  return out;
}

/* ──────────────────────────────────────────────────────────
   Definição da Lição e Grupo de Operações
   ────────────────────────────────────────────────────────── */
export const operationsGroup: LessonOperationsGroup = {
  structures: [
    {
      id: 'lista-sequencial',
      label: 'Lista Sequencial',
      defaultInput: [10, 20, 30],
      operations: [
        {
          id: 'inserir-inicio',
          label: 'Inserir Início',
          panelLabel: 'lista sequencial',
          complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 5 }],
          code: (input, p) => getInserirInicioCode(normalizeInput(input).length, p?.val ?? 5),
          steps: (input, p) => generateInserirInicioSteps(input, p),
        },
        {
          id: 'inserir-fim',
          label: 'Inserir Fim',
          panelLabel: 'lista sequencial',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 40 }],
          code: (input, p) => getInserirFimCode(normalizeInput(input).length, p?.val ?? 40),
          steps: (input, p) => generateInserirFimSteps(input, p),
        },
        {
          id: 'inserir-posicao',
          label: 'Inserir Posição',
          panelLabel: 'lista sequencial',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          params: [
            { id: 'pos', label: 'Posição', defaultValue: 1, min: 0, max: 7 },
            { id: 'val', label: 'Valor', defaultValue: 15 },
          ],
          code: (input, p) => getInserirPosicaoCode(normalizeInput(input).length, p?.pos ?? 1, p?.val ?? 15),
          steps: (input, p) => generateInserirPosicaoSteps(input, p),
        },
        {
          id: 'remover',
          label: 'Remover',
          panelLabel: 'lista sequencial',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          params: [{ id: 'pos', label: 'Posição', defaultValue: 1, min: 0, max: 7 }],
          code: (input, p) => getRemoverCode(normalizeInput(input).length, p?.pos ?? 1),
          steps: (input, p) => generateRemoverSteps(input, p),
        },
        {
          id: 'buscar',
          label: 'Buscar',
          panelLabel: 'lista sequencial',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          params: [{ id: 'val', label: 'Valor', defaultValue: 20 }],
          code: (input, p) => getBuscarCode(normalizeInput(input).length, p?.val ?? 20),
          steps: (input, p) => generateBuscarSteps(input, p),
        },
      ],
    },
  ],
};

const defaultInput = [10, 20, 30];

export const lesson: Lesson = {
  id: 'lista-sequencial',
  title: 'Lista Sequencial',
  subtitle: 'Vetor + contador n',
  description:
    'Lista em vetor de capacidade fixa. Inserir no meio empurra os elementos à direita; remover, à esquerda. Escolha operações interativas como Inserir Início, Inserir Fim, Inserir Posição, Remover e Buscar.',
  view: 'cells',
  panelLabel: 'lista sequencial',
  initial: defaultInput,
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(n)',
    stable: true,
    note: 'Inserir/remover no fim é Θ(1); no início ou no meio, Θ(n) por causa do deslocamento.',
  },
  code: getInserirInicioCode(defaultInput.length, 5),
  operationsGroup,
  steps: (input) => generateInserirInicioSteps(input, { val: 5 }),
};
