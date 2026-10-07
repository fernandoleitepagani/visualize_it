viz.register('insercao', {
  title: 'Insertion Sort',
  subtitle: 'Ordenação por Inserção',
  description: 'Empurra cada elemento para trás até achar o lugar certo na parte já ordenada.',
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n²)', worst: 'Θ(n²)' },
    space: 'Θ(1)', stable: true,
    note: 'Melhor caso Θ(n) quando o vetor já está quase ordenado.'
  },
  code: {
    java: `
void insertionSort(int[] v) {
  for (int i = 1; i < v.length; i++) {
    int key = v[i], j = i - 1;
    while (j >= 0 && v[j] > key) {
      v[j + 1] = v[j];
      j--;
    }
    v[j + 1] = key;
  }
}`.trim().split('\n'),
    c: `
void insertionSort(int v[], int n) {
  for (int i = 1; i < n; i++) {
    int key = v[i], j = i - 1;
    while (j >= 0 && v[j] > key) {
      v[j + 1] = v[j];
      j--;
    }
    v[j + 1] = key;
  }
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.slice(), n = v.length, out = [], sorted = [0];
    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: v.slice(), sorted: [...sorted], ...extra });

    push(0, `Início: ${n} elementos. O primeiro já conta como ordenado.`);
    for (let i = 1; i < n; i++) {
      push(1, `Inserindo v[${i}] = ${v[i]}.`);
      const key = v[i];
      push(2, `key = ${key}.`);
      let j = i - 1;
      push(2, `j = ${j}.`);
      while (j >= 0 && v[j] > key) {
        push(3, `v[${j}] = ${v[j]} > ${key} → desloca.`, { cmp: [j] });
        v[j + 1] = v[j];
        push(4, `v[${j + 1}] = ${v[j + 1]}.`);
        j--;
      }
      push(3, j >= 0
        ? `v[${j}] = ${v[j]} ≤ key → achou o lugar.`
        : `j < 0 → key é o menor até agora.`, j >= 0 ? { cmp: [j] } : {});
      v[j + 1] = key;
      push(6, `key = ${key} em v[${j + 1}].`);
      sorted.push(i);
    }
    push(7, 'Vetor ordenado.');
    return out;
  }
});