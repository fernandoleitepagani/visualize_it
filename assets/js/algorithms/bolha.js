viz.register('bolha', {
  title: 'Bubble Sort',
  subtitle: 'Ordenação por Bolha',
  description: 'Compara vizinhos e troca quando estão fora de ordem; o maior borbulha até o fim.',
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n²)', worst: 'Θ(n²)' },
    space: 'Θ(1)', stable: true,
    note: 'Com a flag de "trocou", o melhor caso é Θ(n) — vetor já ordenado.'
  },
  code: {
    java: `
void bubbleSort(int[] v) {
  for (int i = 0; i < v.length - 1; i++) {
    boolean swapped = false;
    for (int j = 0; j < v.length - 1 - i; j++) {
      if (v[j] > v[j + 1]) {
        int t = v[j]; v[j] = v[j + 1]; v[j + 1] = t;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
}`.trim().split('\n'),
    c: `
void bubbleSort(int v[], int n) {
  for (int i = 0; i < n - 1; i++) {
    int swapped = 0;
    for (int j = 0; j < n - 1 - i; j++) {
      if (v[j] > v[j + 1]) {
        int t = v[j]; v[j] = v[j + 1]; v[j + 1] = t;
        swapped = 1;
      }
    }
    if (!swapped) break;
  }
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.slice(), n = v.length, out = [], sorted = [];
    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: v.slice(), sorted: [...sorted], ...extra });

    push(0, `Início: ${n} elementos.`);
    for (let i = 0; i < n - 1; i++) {
      push(1, `Rodada ${i + 1}: pares até v[${n - 2 - i}].`);
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        push(3, `v[${j}] = ${v[j]} vs v[${j + 1}] = ${v[j + 1]}.`, { cmp: [j, j + 1] });
        if (v[j] > v[j + 1]) {
          [v[j], v[j + 1]] = [v[j + 1], v[j]];
          push(4, `Troca: ${v[j]}, ${v[j + 1]}.`, { swap: [j, j + 1] });
          swapped = true;
        }
      }
      sorted.push(n - 1 - i);
      push(8, `Maior do trecho em v[${n - 1 - i}].`);
      if (!swapped) {
        push(9, 'Nenhuma troca → já ordenado.');
        for (let k = 0; k < n; k++) if (!sorted.includes(k)) sorted.push(k);
        break;
      }
    }
    push(10, 'Vetor ordenado.');
    return out;
  }
});