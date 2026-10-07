viz.register('radix', {
  title: 'Radix Sort',
  subtitle: 'Ordenação Digital',
  description: 'Ordena dígito a dígito, do menos ao mais significativo, com counting sort estável.',
  complexity: {
    time: { best: 'Θ(d·(n + b))', avg: 'Θ(d·(n + b))', worst: 'Θ(d·(n + b))' },
    space: 'Θ(n + b)', stable: true,
    note: 'd = número de dígitos, b = base (10 aqui). Excelente para inteiros com poucos dígitos.'
  },
  initial: [170, 45, 75, 90, 802, 24, 2, 66],
  code: {
    java: `
void radixSort(int[] v) {
  int max = maxOf(v);
  for (int exp = 1; max / exp > 0; exp *= 10)
    countingByDigit(v, exp);
}
void countingByDigit(int[] v, int exp) {
  int[] count = new int[10];
  int[] out = new int[v.length];
  for (int x : v) count[(x / exp) % 10]++;
  for (int i = 1; i < 10; i++) count[i] += count[i - 1];
  for (int i = v.length - 1; i >= 0; i--) {
    int d = (v[i] / exp) % 10;
    out[count[d] - 1] = v[i];
    count[d]--;
  }
  System.arraycopy(out, 0, v, 0, v.length);
}`.trim().split('\n'),
    c: `
void radixSort(int v[], int n) {
  int max = v[0];
  for (int i = 1; i < n; i++) if (v[i] > max) max = v[i];
  for (int exp = 1; max / exp > 0; exp *= 10)
    countingByDigit(v, n, exp);
}
void countingByDigit(int v[], int n, int exp) {
  int count[10] = {0};
  int out[n];
  for (int i = 0; i < n; i++) count[(v[i] / exp) % 10]++;
  for (int i = 1; i < 10; i++) count[i] += count[i - 1];
  for (int i = n - 1; i >= 0; i--) {
    int d = (v[i] / exp) % 10;
    out[count[d] - 1] = v[i];
    count[d]--;
  }
  for (int i = 0; i < n; i++) v[i] = out[i];
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.map(x => Math.max(0, Math.floor(x)));
    const n = v.length, max = Math.max(...v, 0);
    const out = [];
    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: v.slice(), ...extra });

    push(0, `Início: ${n} elementos, maior = ${max}.`);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      const nome = exp === 1 ? 'unidades' : exp === 10 ? 'dezenas'
                : exp === 100 ? 'centenas' : `10^${Math.round(Math.log10(exp))}`;
      push(2, `Passada pelas ${nome} (exp = ${exp}).`);
      const count = new Array(10).fill(0);
      for (let i = 0; i < n; i++) count[Math.floor(v[i] / exp) % 10]++;
      for (let i = 1; i < 10; i++) count[i] += count[i - 1];
      const aux = new Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        const d = Math.floor(v[i] / exp) % 10;
        const pos = count[d] - 1;
        aux[pos] = v[i];
        count[d]--;
        push(12, `v[${i}] = ${v[i]} → dígito ${d} → posição ${pos}.`, { cmp: [i] });
      }
      for (let i = 0; i < n; i++) v[i] = aux[i];
      push(16, `Fim da passada: [${v.join(', ')}].`);
    }
    push(4, 'Vetor ordenado.');
    return out;
  }
});