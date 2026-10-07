viz.register('mergesort', {
  title: 'Mergesort',
  subtitle: 'Ordenação por Intercalação',
  description: 'Divide o vetor ao meio recursivamente e intercala as metades ordenadas.',
  complexity: {
    time: { best: 'Θ(n·log n)', avg: 'Θ(n·log n)', worst: 'Θ(n·log n)' },
    space: 'Θ(n)', stable: true,
    note: 'Garante Θ(n·log n) em qualquer entrada, mas precisa de um vetor auxiliar Θ(n).'
  },
  code: {
    java: `
void mergeSort(int[] v, int lo, int hi) {
  if (lo < hi) {
    int mid = (lo + hi) / 2;
    mergeSort(v, lo, mid);
    mergeSort(v, mid + 1, hi);
    merge(v, lo, mid, hi);
  }
}
void merge(int[] v, int lo, int mid, int hi) {
  int[] L = copy(v, lo, mid), R = copy(v, mid + 1, hi);
  int i = 0, j = 0, k = lo;
  while (i < L.length && j < R.length)
    v[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
  while (i < L.length) v[k++] = L[i++];
  while (j < R.length) v[k++] = R[j++];
}`.trim().split('\n'),
    c: `
void mergeSort(int v[], int lo, int hi) {
  if (lo < hi) {
    int mid = (lo + hi) / 2;
    mergeSort(v, lo, mid);
    mergeSort(v, mid + 1, hi);
    merge(v, lo, mid, hi);
  }
}
void merge(int v[], int lo, int mid, int hi) {
  int Ln = mid - lo + 1, Rn = hi - mid;
  int L[Ln], R[Rn];
  for (int i = 0; i < Ln; i++) L[i] = v[lo + i];
  for (int j = 0; j < Rn; j++) R[j] = v[mid + 1 + j];
  int i = 0, j = 0, k = lo;
  while (i < Ln && j < Rn)
    v[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
  while (i < Ln) v[k++] = L[i++];
  while (j < Rn) v[k++] = R[j++];
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.slice(), n = v.length, out = [];
    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: v.slice(), ...extra });

    push(0, `Início: ${n} elementos.`);

    function merge(lo, mid, hi) {
      push(8, `Intercala [${lo}..${mid}] com [${mid + 1}..${hi}].`);
      const L = v.slice(lo, mid + 1), R = v.slice(mid + 1, hi + 1);
      let i = 0, j = 0, k = lo;
      while (i < L.length && j < R.length) {
        push(11, `L[${i}] = ${L[i]} vs R[${j}] = ${R[j]}.`, { cmp: [k] });
        if (L[i] <= R[j]) { v[k] = L[i]; push(12, `Escolhe ${L[i]} (esq).`, { swap: [k] }); i++; }
        else               { v[k] = R[j]; push(13, `Escolhe ${R[j]} (dir).`, { swap: [k] }); j++; }
        k++;
      }
      while (i < L.length) { v[k] = L[i]; push(15, `Sobra esq: ${L[i]}.`, { swap: [k] }); i++; k++; }
      while (j < R.length) { v[k] = R[j]; push(16, `Sobra dir: ${R[j]}.`, { swap: [k] }); j++; k++; }
    }

    function ms(lo, hi) {
      if (lo >= hi) return;
      const mid = Math.floor((lo + hi) / 2);
      const dim = [];
      for (let k = 0; k < n; k++) if (k < lo || k > hi) dim.push(k);
      push(2, `Divide [${lo}..${hi}] em [${lo}..${mid}] e [${mid + 1}..${hi}].`, { dim });
      ms(lo, mid);
      ms(mid + 1, hi);
      merge(lo, mid, hi);
    }

    ms(0, n - 1);
    push(6, 'Vetor ordenado.');
    return out;
  }
});