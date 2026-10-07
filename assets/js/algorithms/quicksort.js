viz.register('quicksort', {
  title: 'Quicksort',
  subtitle: 'Ordenação Rápida',
  description: 'Particiona em torno de um pivô e ordena recursivamente os dois lados.',
  complexity: {
    time: { best: 'Θ(n·log n)', avg: 'Θ(n·log n)', worst: 'Θ(n²)' },
    space: 'Θ(log n)', stable: false,
    note: 'Pior caso Θ(n²) quando o pivô é sempre o maior/menor — por exemplo, vetor ordenado com pivô no fim.'
  },
  code: {
    java: `
void quickSort(int[] v, int lo, int hi) {
  if (lo < hi) {
    int p = partition(v, lo, hi);
    quickSort(v, lo, p - 1);
    quickSort(v, p + 1, hi);
  }
}
int partition(int[] v, int lo, int hi) {
  int pivot = v[hi], i = lo - 1;
  for (int j = lo; j < hi; j++) {
    if (v[j] <= pivot) {
      i++;
      int t = v[i]; v[i] = v[j]; v[j] = t;
    }
  }
  int t = v[i + 1]; v[i + 1] = v[hi]; v[hi] = t;
  return i + 1;
}`.trim().split('\n'),
    c: `
void quickSort(int v[], int lo, int hi) {
  if (lo < hi) {
    int p = partition(v, lo, hi);
    quickSort(v, lo, p - 1);
    quickSort(v, p + 1, hi);
  }
}
int partition(int v[], int lo, int hi) {
  int pivot = v[hi], i = lo - 1;
  for (int j = lo; j < hi; j++) {
    if (v[j] <= pivot) {
      i++;
      int t = v[i]; v[i] = v[j]; v[j] = t;
    }
  }
  int t = v[i + 1]; v[i + 1] = v[hi]; v[hi] = t;
  return i + 1;
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.slice(), n = v.length, out = [];
    const done = new Set();
    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: v.slice(), sorted: [...done], ...extra });

    push(0, `Início: ${n} elementos.`);

    function partition(lo, hi) {
      const pivot = v[hi];
      push(9, `Pivô = v[${hi}] = ${pivot}.`, { pivot: [hi] });
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        push(11, `v[${j}] = ${v[j]} vs pivô ${pivot}.`, { pivot: [hi], cmp: [j] });
        if (v[j] <= pivot) {
          i++;
          if (i !== j) {
            [v[i], v[j]] = [v[j], v[i]];
            push(13, `Troca v[${i}] ↔ v[${j}].`, { pivot: [hi], swap: [i, j] });
          }
        }
      }
      [v[i + 1], v[hi]] = [v[hi], v[i + 1]];
      push(16, `Pivô para v[${i + 1}].`, { swap: [i + 1, hi] });
      done.add(i + 1);
      push(17, `Posição ${i + 1} fechada.`);
      return i + 1;
    }

    function qs(lo, hi) {
      if (lo >= hi) {
        if (lo === hi) { done.add(lo); push(1, `Trecho [${lo}] trivial.`); }
        return;
      }
      const dim = [];
      for (let k = 0; k < n; k++) if (k < lo || k > hi) dim.push(k);
      push(1, `Trecho [${lo}..${hi}] será particionado.`, { dim });
      const p = partition(lo, hi);
      qs(lo, p - 1);
      qs(p + 1, hi);
    }

    qs(0, n - 1);
    push(5, 'Vetor ordenado.');
    return out;
  }
});