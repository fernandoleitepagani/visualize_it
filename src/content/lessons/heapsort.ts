import type { Lesson, Step, StepLine } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'heapsort',
  title: 'Heapsort',
  subtitle: 'Ordenação por Heap',
  description: 'Constrói um heap de máximo e extrai repetidamente o maior para o fim.',
  complexity: {
    time: { best: 'Θ(n·log n)', avg: 'Θ(n·log n)', worst: 'Θ(n·log n)' },
    space: 'Θ(1)',
    stable: false,
    note: 'Garante Θ(n·log n) e não usa memória extra. Constrói o heap em Θ(n).',
  },
  complexityAnalysis: {},
  code: {
    java: lines(`
void heapSort(int[] v) {
  int n = v.length;
  for (int i = n / 2 - 1; i >= 0; i--) heapify(v, n, i);
  for (int i = n - 1; i > 0; i--) {
    int t = v[0]; v[0] = v[i]; v[i] = t;
    heapify(v, i, 0);
  }
}
void heapify(int[] v, int n, int i) {
  int largest = i, l = 2 * i + 1, r = 2 * i + 2;
  if (l < n && v[l] > v[largest]) largest = l;
  if (r < n && v[r] > v[largest]) largest = r;
  if (largest != i) {
    int t = v[i]; v[i] = v[largest]; v[largest] = t;
    heapify(v, n, largest);
  }
}`),
    c: lines(`
void heapSort(int v[], int n) {
  for (int i = n / 2 - 1; i >= 0; i--) heapify(v, n, i);
  for (int i = n - 1; i > 0; i--) {
    int t = v[0]; v[0] = v[i]; v[i] = t;
    heapify(v, i, 0);
  }
}
void heapify(int v[], int n, int i) {
  int largest = i, l = 2 * i + 1, r = 2 * i + 2;
  if (l < n && v[l] > v[largest]) largest = l;
  if (r < n && v[r] > v[largest]) largest = r;
  if (largest != i) {
    int t = v[i]; v[i] = v[largest]; v[largest] = t;
    heapify(v, n, largest);
  }
}`),
  },
  steps(arr) {
    const v = arr.slice(),
      n = v.length,
      out: Step[] = [];
    const done = new Set<number>();
    const push = (line: StepLine, desc: string, extra: Partial<Step> = {}) =>
      out.push({ line, desc, arr: v.slice(), sorted: [...done], ...extra });

    push({ java: 0, c: 0 }, `Início: ${n} elementos.`);

    function heapify(size: number, i: number) {
      let largest = i;
      const l = 2 * i + 1,
        r = 2 * i + 2;
      push({ java: 9, c: 8 }, `heapify i=${i}.`, { pivot: [i] });
      if (l < size) {
        push({ java: 10, c: 9 }, `v[${i}] = ${v[i]} vs filho esq v[${l}] = ${v[l]}.`, {
          cmp: [i, l],
        });
        if (v[l] > v[largest]) largest = l;
      }
      if (r < size) {
        push({ java: 11, c: 10 }, `vs filho dir v[${r}] = ${v[r]}.`, { cmp: [largest, r] });
        if (v[r] > v[largest]) largest = r;
      }
      if (largest !== i) {
        [v[i], v[largest]] = [v[largest], v[i]];
        push({ java: 13, c: 12 }, `Troca v[${i}] ↔ v[${largest}].`, { swap: [i, largest] });
        heapify(size, largest);
      }
    }

    push({ java: 2, c: 1 }, 'Fase 1: construir o heap.');
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      push({ java: 2, c: 1 }, `heapify da raiz ${i}.`);
      heapify(n, i);
    }
    push({ java: 3, c: 2 }, 'Fase 2: extrair o máximo.');
    for (let i = n - 1; i > 0; i--) {
      [v[0], v[i]] = [v[i], v[0]];
      push({ java: 4, c: 3 }, `Troca v[0] ↔ v[${i}].`, { swap: [0, i] });
      done.add(i);
      push({ java: 5, c: 4 }, `Posição ${i} fechada.`);
      heapify(i, 0);
    }
    done.add(0);
    push({ java: 7, c: 6 }, 'Vetor ordenado.');
    return out;
  },
};
