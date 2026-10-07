viz.register('busca-sequencial', {
  title: 'Busca Sequencial',
  subtitle: 'Procura linear',
  description: 'Percorre o vetor da esquerda para a direita, comparando cada elemento com o alvo até encontrá-lo ou chegar ao fim.',
  initial: [10, 25, 30, 45, 55, 60, 75, 88],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(1)', stable: false,
    note: 'Melhor caso: alvo na primeira posição. Pior caso: alvo na última posição ou ausente.'
  },
  code: {
    java: `
int buscaSequencial(int[] v, int x) {
  for (int i = 0; i < v.length; i++) {
    if (v[i] == x) return i;
  }
  return -1;
}`.trim().split('\n'),
    c: `
int buscaSequencial(int v[], int n, int x) {
  for (int i = 0; i < n; i++) {
    if (v[i] == x) return i;
  }
  return -1;
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.slice();
    const target = v[Math.floor(v.length / 2)];
    const out = [];

    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: v.slice(), ...extra });

    push(0, `Procurando o valor ${target} em ${v.length} elementos.`);
    for (let i = 0; i < v.length; i++) {
      push(1, `i = ${i}.`, { cmp: [i] });
      push(2, `Comparando v[${i}] = ${v[i]} com ${target}.`, { cmp: [i] });
      if (v[i] === target) {
        push(2, `Alvo ${target} encontrado em v[${i}].`, { swap: [i] });
        push(5, `Retorno: ${i}.`);
        return out;
      }
    }
    push(4, `Alvo ${target} não está no vetor. Retorno: -1.`);
    return out;
  }
});