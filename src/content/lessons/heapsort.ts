import type { Lesson, Step, StepLine } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'heapsort',
  title: 'Heapsort',
  subtitle: 'Ordenação por Heap',
  description: 'Constrói um heap de máximo e extrai repetidamente o maior para o fim.',
  view: 'heap',
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
    let currentHeapSize = n;

    const push = (line: StepLine, desc: string, extra: Partial<Step> = {}) =>
      out.push({
        line,
        desc,
        arr: v.slice(),
        sorted: [...done],
        heapSize: currentHeapSize,
        ...extra,
      });

    push({ java: 0, c: 0 }, `Início: ${n} elementos.`, {
      vars: { n, heapSize: currentHeapSize },
    });

    function heapify(size: number, i: number) {
      let largest = i;
      const l = 2 * i + 1,
        r = 2 * i + 2;
      push({ java: 9, c: 8 }, `heapify(tam=${size}, i=${i}): verificando subárvore com raiz no índice ${i}.`, {
        pivot: [i],
        vars: { i, largest: i, l: l < size ? l : null, r: r < size ? r : null, heapSize: size },
      });
      if (l < size) {
        push({ java: 10, c: 9 }, `Comparando raiz v[${i}]=${v[i]} com filho esquerdo v[${l}]=${v[l]}.`, {
          cmp: [i, l],
          vars: { i, largest, l, r: r < size ? r : null, heapSize: size },
        });
        if (v[l] > v[largest]) largest = l;
      }
      if (r < size) {
        push({ java: 11, c: 10 }, `Comparando maior v[${largest}]=${v[largest]} com filho direito v[${r}]=${v[r]}.`, {
          cmp: [largest, r],
          vars: { i, largest, l: l < size ? l : null, r, heapSize: size },
        });
        if (v[r] > v[largest]) largest = r;
      }
      if (largest !== i) {
        [v[i], v[largest]] = [v[largest], v[i]];
        push({ java: 13, c: 12 }, `Troca v[${i}] ↔ v[${largest}]: descendo elemento menor no heap.`, {
          swap: [i, largest],
          vars: { i, largest, heapSize: size },
        });
        heapify(size, largest);
      }
    }

    push({ java: 2, c: 1 }, 'Fase 1: construir o heap de máximo (de n/2 - 1 até 0).', {
      vars: { n, heapSize: currentHeapSize },
    });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      push({ java: 2, c: 1 }, `Construção: heapify da raiz ${i}.`, {
        pivot: [i],
        vars: { i, heapSize: currentHeapSize },
      });
      heapify(n, i);
    }

    push({ java: 3, c: 2 }, 'Fase 2: extrair repetidamente o elemento máximo (raiz v[0]).', {
      vars: { heapSize: currentHeapSize },
    });
    for (let i = n - 1; i > 0; i--) {
      [v[0], v[i]] = [v[i], v[0]];
      currentHeapSize = i;
      push({ java: 4, c: 3 }, `Extração: troca raiz máxima v[0] com último elemento v[${i}].`, {
        swap: [0, i],
        vars: { i, 'v[0]': v[0], 'v[i]': v[i], heapSize: currentHeapSize },
      });
      done.add(i);
      push({ java: 5, c: 4 }, `Posição ${i} fixada e ordenada. Tamanho do heap reduzido para ${currentHeapSize}.`, {
        sorted: [...done],
        vars: { i, 'fixado': v[i], heapSize: currentHeapSize },
      });
      heapify(i, 0);
    }
    done.add(0);
    currentHeapSize = 0;
    push({ java: 7, c: 6 }, 'Vetor totalmente ordenado!', {
      sorted: [...done],
      vars: { heapSize: 0 },
    });
    return out;
  },
};
