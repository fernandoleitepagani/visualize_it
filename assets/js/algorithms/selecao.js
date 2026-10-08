viz.register('selecao', {
  title: 'Selection Sort',
  subtitle: 'Ordenação por Seleção',
  description: 'Selection Sort (ordenação por seleção) é um algoritmo que ordena um vetor procurando repetidamente o menor elemento da parte não ordenada e colocando-o na posição correta.',
  complexity: {
    time: { best: 'Θ(n²)', avg: 'Θ(n²)', worst: 'Θ(n²)' },
    space: 'Θ(1)', stable: false,
    note: 'Sempre faz ~n²/2 comparações, mas no máximo n−1 trocas.'
  },
  code: {
    java: `
void selectionSort(int[] v) {
  for (int i = 0; i < v.length - 1; i++) {
    int menor = i;
    for (int j = i + 1; j < v.length; j++) {
      if (v[j] < v[menor]) menor = j;
    }
    int tmp = v[i]; 
    v[i] = v[menor]; 
    v[menor] = tmp;
  }
}`.trim().split('\n'),
    c: `
void selectionSort(int v[], int n) {
  for (int i = 0; i < n - 1; i++) {
    int menor = i;
    for (int j = i + 1; j < n; j++) {
      if (v[j] < v[menor]) menor = j;
    }
    int tmp = v[i]; 
    v[i] = v[menor]; 
    v[menor] = tmp;
  }
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.slice();
    const n = v.length;
    const out = [];
    const sorted = [];

    let i = -1, j = -1, menor = -1, tmp = null;

    const push = (line, desc, extra = {}) =>
      out.push({
        line, desc,
        arr: v.slice(),
        sorted: [...sorted],
        vars: {
          i:     i     >= 0 ? i     : null,
          j:     j     >= 0 ? j     : null,
          menor: menor >= 0 ? menor : null,
          tmp,
        },
        ...extra
      });

    push(0, `Início: ${n} elemento${n === 1 ? '' : 's'}.`);

    if (n <= 1) {
      if (n === 1) sorted.push(0);
      push(10, n === 0 ? 'Vetor vazio — nada a ordenar.' : 'Vetor já ordenado (1 elemento).');
      return out;
    }

    for (i = 0; i < n - 1; i++) {
      j = -1;
      tmp = null;

      push(1, `Rodada ${i + 1}: i = ${i}. Buscando o menor em [${i}..${n - 1}].`,
          { pivot: [i] });

      menor = i;
      push(2, `menor = i = ${menor} → v[${menor}] = ${v[menor]}.`,
          { pivot: [i], cmp: [menor] });

      for (j = i + 1; j < n; j++) {
        const vj       = v[j];
        const oldMenor = menor;
        const vm       = v[oldMenor];

        push(4, `j = ${j}: v[${j}] = ${vj} vs v[${oldMenor}] = ${vm}.`,
            { pivot: [i], cmp: [j, oldMenor] });

        if (vj < vm) {
          menor = j;
          push(4, `Sim — ${vj} < ${vm}. Novo menor: índice ${menor} (v[${menor}] = ${vj}).`,
              { pivot: [i], cmp: [menor] });
        }
      }

      j = -1;

      if (menor !== i) {
        tmp = v[i];
        push(6, `tmp = v[${i}] = ${tmp}.`,
            { pivot: [i], swap: [i, menor] });

        v[i] = v[menor];
        push(7, `v[${i}] = v[${menor}] = ${v[i]}.`,
            { pivot: [i], swap: [i, menor] });

        v[menor] = tmp;
        push(8, `v[${menor}] = tmp = ${tmp}. Trocado: v[${i}] ↔ v[${menor}].`,
            { swap: [i, menor] });

        tmp = null;
      } else {
        push(9, `v[${i}] = ${v[i]} já é o menor do trecho — sem troca.`,
            { pivot: [i] });
      }

      sorted.push(i);
      push(9, `Posição ${i} definida: v[${i}] = ${v[i]}.`);
    }

    sorted.push(n - 1);
    push(10, `Vetor ordenado: [${v.join(', ')}].`);

    return out;
  }
});