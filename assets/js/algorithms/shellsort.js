viz.register('shellsort', {
  title: 'Shellsort',
  subtitle: 'Ordenação por Incrementos Decrescentes',
  description: 'Inserção com gaps decrescentes: primeiro organiza grosseiramente, depois refina.',
  complexity: {
    time: { best: 'Ω(n·log n)', avg: '≈ Θ(n^1.25)', worst: 'Θ(n²)' },
    space: 'Θ(1)', stable: false,
    note: 'Depende da sequência de gaps. Com n/2, n/4, …, 1 fica perto de Θ(n^1.3) na prática.'
  },
  code: {
    java: `
void shellSort(int[] v) {
  for (int gap = v.length / 2; gap > 0; gap /= 2) {
    for (int i = gap; i < v.length; i++) {
      int key = v[i], j = i;
      while (j >= gap && v[j - gap] > key) {
        v[j] = v[j - gap];
        j -= gap;
      }
      v[j] = key;
    }
  }
}`.trim().split('\n'),
    c: `
void shellSort(int v[], int n) {
  for (int gap = n / 2; gap > 0; gap /= 2) {
    for (int i = gap; i < n; i++) {
      int key = v[i], j = i;
      while (j >= gap && v[j - gap] > key) {
        v[j] = v[j - gap];
        j -= gap;
      }
      v[j] = key;
    }
  }
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.slice(), n = v.length, out = [];
    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: v.slice(), ...extra });

    push(0, `Início: ${n} elementos.`);
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      push(1, `Gap = ${gap}.`);
      for (let i = gap; i < n; i++) {
        const key = v[i];
        push(3, `key = v[${i}] = ${key}.`);
        let j = i;
        while (j >= gap && v[j - gap] > key) {
          push(4, `v[${j - gap}] = ${v[j - gap]} > ${key} → desloca.`, { cmp: [j - gap] });
          v[j] = v[j - gap];
          push(5, `v[${j}] = ${v[j]}.`);
          j -= gap;
        }
        if (j >= gap)
          push(4, `v[${j - gap}] = ${v[j - gap]} ≤ ${key} → achou o lugar.`, { cmp: [j - gap] });
        v[j] = key;
        push(7, `key = ${key} em v[${j}].`);
      }
    }
    push(11, 'Vetor ordenado.');
    return out;
  }
});