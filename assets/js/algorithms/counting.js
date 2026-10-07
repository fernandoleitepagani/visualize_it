viz.register('counting', {
  title: 'Counting Sort',
  subtitle: 'Ordenação por Contagem',
  description: 'Conta ocorrências de cada valor e distribui direto na posição final.',
  complexity: {
    time: { best: 'Θ(n + k)', avg: 'Θ(n + k)', worst: 'Θ(n + k)' },
    space: 'Θ(n + k)', stable: true,
    note: 'k = maior valor + 1. Tempo linear, mas exige chaves inteiras em faixa pequena.'
  },
  initial: [4, 2, 2, 8, 3, 3, 1],
  code: {
    java: `
void countingSort(int[] v) {
  int max = maxOf(v);
  int[] count = new int[max + 1];
  for (int x : v) count[x]++;
  for (int i = 1; i <= max; i++) count[i] += count[i - 1];
  int[] out = new int[v.length];
  for (int i = v.length - 1; i >= 0; i--) {
    out[count[v[i]] - 1] = v[i];
    count[v[i]]--;
  }
  System.arraycopy(out, 0, v, 0, v.length);
}`.trim().split('\n'),
    c: `
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
}`.trim().split('\n')
  },
  steps(arr) {
    const src = arr.map(x => Math.max(0, Math.floor(x)));
    const n = src.length, max = Math.max(...src, 0);
    const out = [];
    const count = new Array(max + 1).fill(0);
    const result = src.slice();
    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: result.slice(), ...extra });

    push(0, `Início: ${n} elementos, valores entre 0 e ${max}.`);
    for (let i = 0; i < n; i++) {
      count[src[i]]++;
      push(3, `count[${src[i]}]++ → ${count[src[i]]}.`, { cmp: [i] });
    }
    for (let i = 1; i <= max; i++) count[i] += count[i - 1];
    push(4, 'Soma acumulada em count.');
    for (let i = n - 1; i >= 0; i--) {
      const val = src[i], pos = count[val] - 1;
      result[pos] = val;
      push(7, `v[${i}] = ${val} → posição ${pos}.`, { cmp: [i] });
      count[val]--;
      push(7, `Saída: [${result.join(', ')}].`, { swap: [pos] });
    }
    push(9, 'Vetor ordenado.');
    return out;
  }
});