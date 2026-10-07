viz.register('busca-binaria', {
  title: 'Busca Binária',
  subtitle: 'Procura em vetor ordenado',
  description: 'Compara com o elemento central e descarta metade do vetor a cada passo. Requer que os dados estejam ordenados.',
  initial: [10, 25, 30, 45, 55, 60, 75, 88],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(log n)', worst: 'Θ(log n)' },
    space: 'Θ(1)', stable: false,
    note: 'Melhor caso: alvo no meio na primeira comparação. Pior caso: ⌊log₂ n⌋ + 1 comparações.'
  },
  code: {
    java: `
int buscaBinaria(int[] v, int x) {
  int esq = 0, dir = v.length - 1;
  while (esq <= dir) {
    int meio = (esq + dir) / 2;
    if (v[meio] == x) return meio;
    else if (v[meio] < x) esq = meio + 1;
    else dir = meio - 1;
  }
  return -1;
}`.trim().split('\n'),
    c: `
int buscaBinaria(int v[], int n, int x) {
  int esq = 0, dir = n - 1;
  while (esq <= dir) {
    int meio = (esq + dir) / 2;
    if (v[meio] == x) return meio;
    else if (v[meio] < x) esq = meio + 1;
    else dir = meio - 1;
  }
  return -1;
}`.trim().split('\n')
  },
  steps(arr) {
    const v = arr.slice().sort((a, b) => a - b);
    const target = v[Math.floor(v.length / 2)];
    const out = [];

    const push = (line, desc, extra = {}) =>
      out.push({ line, desc, arr: v.slice(), ...extra });

    push(0, `Vetor ordenado para busca binária. Alvo: ${target}.`);
    let esq = 0, dir = v.length - 1;

    while (esq <= dir) {
      const meio = Math.floor((esq + dir) / 2);
      const dim = [];
      for (let i = 0; i < v.length; i++) if (i < esq || i > dir) dim.push(i);

      push(2, `Faixa ativa: [${esq}..${dir}] (${dir - esq + 1} elementos).`, { dim });
      push(3, `meio = (${esq} + ${dir}) / 2 = ${meio}.`, { dim, cmp: [meio] });
      push(4, `v[${meio}] = ${v[meio]} vs alvo ${target}.`, { dim, cmp: [meio] });

      if (v[meio] === target) {
        push(4, `Encontrado em v[${meio}]. Retorno: ${meio}.`, { swap: [meio] });
        return out;
      } else if (v[meio] < target) {
        push(5, `${v[meio]} < ${target} → busca só na metade direita.`, { dim: dim.concat([meio]), cmp: [meio] });
        esq = meio + 1;
      } else {
        push(6, `${v[meio]} > ${target} → busca só na metade esquerda.`, { dim: dim.concat([meio]), cmp: [meio] });
        dir = meio - 1;
      }
    }
    push(8, `Alvo ${target} não encontrado. Retorno: -1.`);
    return out;
  }
});