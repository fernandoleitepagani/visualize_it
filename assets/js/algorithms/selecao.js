viz.register('selecao', {
  title: 'Selection Sort',
  subtitle: 'Ordenação por Seleção',
  description: 'Encontra o menor elemento do trecho restante e o move para o início.',
  complexity: {
    time: { best: 'Θ(n²)', avg: 'Θ(n²)', worst: 'Θ(n²)' },
    space: 'Θ(1)', stable: false,
    note: 'Sempre faz ~n²/2 comparações, mas no máximo n−1 trocas.'
  },
  code: {
    java: `
void selectionSort(int[] v) {
  for (int i = 0; i < v.length - 1; i++) {
    int min = i;
    for (int j = i + 1; j < v.length; j++)
      if (v[j] < v[min]) min = j;
    int t = v[i]; v[i] = v[min]; v[min] = t;
  }
}`.trim().split('\n'),
    c: `
void selectionSort(int v[], int n) {
  for (int i = 0; i < n - 1; i++) {
    int min = i;
    for (int j = i + 1; j < n; j++)
      if (v[j] < v[min]) min = j;
    int t = v[i]; v[i] = v[min]; v[min] = t;
  }
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.slice(), n = v.length, out = [], sorted = [];
    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: v.slice(), sorted: [...sorted], ...extra });

    push(0, `Início: ${n} elementos.`);
    for (let i = 0; i < n - 1; i++) {
      push(1, `Rodada ${i + 1}: procurando o menor em [${i}..${n - 1}].`);
      let min = i;
      push(2, `Menor candidato: v[${i}] = ${v[i]}.`);
      for (let j = i + 1; j < n; j++) {
        push(4, `v[${j}] = ${v[j]} vs v[${min}] = ${v[min]}.`, { cmp: [j, min] });
        if (v[j] < v[min]) { min = j; push(4, `Novo mínimo em ${j}.`); }
      }
      if (min !== i) {
        push(6, `Troca v[${i}] ↔ v[${min}].`, { swap: [i, min] });
        [v[i], v[min]] = [v[min], v[i]];
      }
      sorted.push(i);
      push(7, `Posição ${i} definida.`);
    }
    sorted.push(n - 1);
    push(8, 'Vetor ordenado.');
    return out;
  }
});