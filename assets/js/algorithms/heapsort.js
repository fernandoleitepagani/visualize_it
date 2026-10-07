viz.register('heapsort', {
  title: 'Heapsort',
  subtitle: 'Ordenação por Heap',
  description: 'Constrói um heap de máximo e extrai repetidamente o maior para o fim.',
  complexity: {
    time: { best: 'Θ(n·log n)', avg: 'Θ(n·log n)', worst: 'Θ(n·log n)' },
    space: 'Θ(1)', stable: false,
    note: 'Garante Θ(n·log n) e não usa memória extra. Constrói o heap em Θ(n).'
  },
  code: {
    java: `
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
}`.trim().split('\n'),
    c: `
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
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.slice(), n = v.length, out = [];
    const done = new Set();
    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: v.slice(), sorted: [...done], ...extra });

    push(0, `Início: ${n} elementos.`);

    function heapify(size, i) {
      let largest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      push(10, `heapify i=${i}.`, { pivot: [i] });
      if (l < size) {
        push(12, `v[${i}] = ${v[i]} vs filho esq v[${l}] = ${v[l]}.`, { cmp: [i, l] });
        if (v[l] > v[largest]) largest = l;
      }
      if (r < size) {
        push(13, `vs filho dir v[${r}] = ${v[r]}.`, { cmp: [largest, r] });
        if (v[r] > v[largest]) largest = r;
      }
      if (largest !== i) {
        [v[i], v[largest]] = [v[largest], v[i]];
        push(15, `Troca v[${i}] ↔ v[${largest}].`, { swap: [i, largest] });
        heapify(size, largest);
      }
    }

    push(2, 'Fase 1: construir o heap.');
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      push(3, `heapify da raiz ${i}.`);
      heapify(n, i);
    }
    push(4, 'Fase 2: extrair o máximo.');
    for (let i = n - 1; i > 0; i--) {
      [v[0], v[i]] = [v[i], v[0]];
      push(5, `Troca v[0] ↔ v[${i}].`, { swap: [0, i] });
      done.add(i);
      push(6, `Posição ${i} fechada.`);
      heapify(i, 0);
    }
    done.add(0);
    push(7, 'Vetor ordenado.');
    return out;
  }
});