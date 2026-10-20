import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

/**
 * 0-based line indices shared by the Java and C listings. The two listings are
 * structurally identical, so a single `line` value points at the same
 * statement in both languages.
 */
const L = {
  start: 0,
  initMax: 1,
  maxLoop: 2,
  allocCount: 3,
  zero: 4,
  count: 5,
  prefix: 6,
  allocOut: 7,
  distributeLoop: 8,
  write: 9,
  decrement: 10,
  copyBack: 12,
  end: 13,
} as const;

export const lesson: Lesson = {
  id: 'counting',
  title: 'Counting Sort',
  subtitle: 'Ordenação por Contagem',
  description: 'Conta ocorrências de cada valor e distribui direto na posição final.',
  complexity: {
    time: { best: 'Θ(n + k)', avg: 'Θ(n + k)', worst: 'Θ(n + k)' },
    space: 'Θ(n + k)',
    stable: true,
    note: 'k = maior valor + 1. Tempo linear, mas exige chaves inteiras em faixa pequena.',
  },
  initial: [4, 2, 2, 8, 3, 3, 1],
  complexityAnalysis: {
    comparisons: `Counting sort não compara elementos entre si para ordenar.

A única comparação entre valores é a busca do máximo:
C(n) = n − 1

Os outros laços apenas verificam limites (zerar, contar, somar prefixos,
distribuir e copiar), o que custa Θ(n + k).

Complexidade: Θ(n + k), com k = max + 1.`,
    movements: `Movimentações de elementos:
n escritas em out (distribuição) + n escritas de volta em v = 2n.

Atualizações do vetor count:
k inicializações + n incrementos + (k − 1) somas de prefixo + n decrementos
= 2n + 2k − 1.

Total de escritas: 4n + 2k − 1 = Θ(n + k).

Complexidade: Θ(n + k).`,
  },
  code: {
    java: lines(`
void countingSort(int[] v) {
  int max = v[0];
  for (int i = 1; i < v.length; i++) if (v[i] > max) max = v[i];
  int[] count = new int[max + 1];
  for (int i = 0; i <= max; i++) count[i] = 0;
  for (int i = 0; i < v.length; i++) count[v[i]]++;
  for (int i = 1; i <= max; i++) count[i] += count[i - 1];
  int[] out = new int[v.length];
  for (int i = v.length - 1; i >= 0; i--) {
    out[count[v[i]] - 1] = v[i];
    count[v[i]]--;
  }
  for (int i = 0; i < v.length; i++) v[i] = out[i];
}`),
    c: lines(`
void countingSort(int v[], int n) {
  int max = v[0];
  for (int i = 1; i < n; i++) if (v[i] > max) max = v[i];
  int count[max + 1];
  for (int i = 0; i <= max; i++) count[i] = 0;
  for (int i = 0; i < n; i++) count[v[i]]++;
  for (int i = 1; i <= max; i++) count[i] += count[i - 1];
  int out[n];
  for (int i = n - 1; i >= 0; i--) {
    out[count[v[i]] - 1] = v[i];
    count[v[i]]--;
  }
  for (int i = 0; i < n; i++) v[i] = out[i];
}`),
  },
  steps(arr) {
    const v = arr.map((x) => Math.max(0, Math.floor(x)));
    const n = v.length;
    if (n === 0) return [{ line: L.start, desc: 'Vetor vazio.', arr: [] }];

    const steps: Step[] = [];
    const max = Math.max(...v);
    const count = new Array<number>(max + 1).fill(0);
    const out = new Array<number>(n).fill(0);
    const push = (line: number, desc: string, extra: Partial<Step> = {}) =>
      steps.push({ line, desc, arr: v.slice(), ...extra });

    push(L.start, `Início: ${n} elementos.`);

    let currentMax = v[0];
    push(L.initMax, `max = v[0] = ${currentMax}.`, {
      cmp: [0],
      vars: { max: currentMax },
    });
    for (let i = 1; i < n; i++) {
      if (v[i] > currentMax) currentMax = v[i];
      push(L.maxLoop, `Compara v[${i}] = ${v[i]} com max = ${currentMax}.`, {
        cmp: [i],
        vars: { i, max: currentMax },
      });
    }

    push(L.allocCount, `count[0..${max}] criado.`, {
      arr: count.slice(),
      vars: { k: max + 1 },
    });
    push(L.zero, `count[0..${max}] = 0.`, { arr: count.slice() });

    for (let i = 0; i < n; i++) {
      count[v[i]]++;
      push(L.count, `count[${v[i]}]++ → ${count[v[i]]}.`, {
        arr: count.slice(),
        cmp: [v[i]],
        vars: { i, valor: v[i], contagem: count[v[i]] },
      });
    }

    for (let i = 1; i <= max; i++) {
      count[i] += count[i - 1];
      push(L.prefix, `count[${i}] += count[${i - 1}] → ${count[i]}.`, {
        arr: count.slice(),
        cmp: [i],
        vars: { i, acumulado: count[i] },
      });
    }

    push(L.allocOut, `out[0..${n - 1}] criado.`, { arr: out.slice() });
    for (let i = n - 1; i >= 0; i--) {
      const valor = v[i];
      const pos = count[valor] - 1;

      push(L.distributeLoop, `i = ${i}: distribui v[${i}] = ${valor}.`, {
        arr: out.slice(),
        vars: { i, valor },
      });

      out[pos] = valor;
      push(L.write, `out[${pos}] = ${valor}.`, {
        arr: out.slice(),
        swap: [pos],
        vars: { i, valor, pos },
      });

      count[valor]--;
      push(L.decrement, `count[${valor}]-- → ${count[valor]}.`, {
        arr: out.slice(),
        vars: { valor, contagem: count[valor] },
      });
    }

    for (let i = 0; i < n; i++) {
      v[i] = out[i];
      push(L.copyBack, `v[${i}] = out[${i}] = ${v[i]}.`, {
        arr: v.slice(),
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
        vars: { i },
      });
    }

    push(L.end, `Vetor ordenado: [${v.join(', ')}].`, {
      arr: v.slice(),
      sorted: v.map((_, i) => i),
    });

    return steps;
  },
};
