import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'busca-binaria',
  title: 'Busca Binária',
  subtitle: 'Procura em vetor ordenado',
  description:
    'Compara com o elemento central e descarta metade do vetor a cada passo. Requer que os dados estejam ordenados.',
  hasTarget: true,
  defaultTarget: 55,
  initial: [10, 25, 30, 45, 55, 60, 75, 88],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(log n)', worst: 'Θ(log n)' },
    space: 'Θ(1)',
    stable: false,
    note: 'Melhor caso: alvo no meio na primeira comparação. Pior caso: ⌊log₂ n⌋ + 1 comparações.',
  },
  code: {
    java: lines(`
int buscaBinaria(int[] v, int x) {
  int esq = 0, dir = v.length - 1;
  while (esq <= dir) {
    int meio = (esq + dir) / 2;
    if (v[meio] == x) return meio;
    else if (v[meio] < x) esq = meio + 1;
    else dir = meio - 1;
  }
  return -1;
}`),
    c: lines(`
int buscaBinaria(int v[], int n, int x) {
  int esq = 0, dir = n - 1;
  while (esq <= dir) {
    int meio = (esq + dir) / 2;
    if (v[meio] == x) return meio;
    else if (v[meio] < x) esq = meio + 1;
    else dir = meio - 1;
  }
  return -1;
}`),
  },
  steps(arr, _approach, targetParam) {
    const v = arr.slice().sort((a, b) => a - b);
    const target =
      targetParam !== undefined && Number.isFinite(targetParam)
        ? Math.floor(targetParam)
        : (v[Math.floor(v.length / 2)] ?? 55);
    const out: Step[] = [];

    const push = (line: number, desc: string, extra: Partial<Step> = {}) =>
      out.push({ line, desc, arr: v.slice(), ...extra });

    push(0, `Iniciando busca binária no vetor ordenado. Alvo: ${target}.`, {
      vars: { esq: 0, dir: v.length - 1, meio: null, alvo: target, 'v[meio]': null },
    });

    let esq = 0;
    let dir = v.length - 1;

    push(1, `Inicializar limites de busca: esq = 0 e dir = ${dir}.`, {
      vars: { esq: 0, dir, meio: null, alvo: target, 'v[meio]': null },
    });

    while (esq <= dir) {
      const meio = Math.floor((esq + dir) / 2);
      const dim: number[] = [];
      for (let i = 0; i < v.length; i++) {
        if (i < esq || i > dir) dim.push(i);
      }

      push(2, `Faixa ativa: [${esq}..${dir}] (${dir - esq + 1} elementos). Teste esq ≤ dir é Verdadeiro.`, {
        dim,
        vars: { esq, dir, meio: null, alvo: target, 'v[meio]': null },
      });

      push(3, `Calcular elemento central: meio = (${esq} + ${dir}) / 2 = ${meio}.`, {
        dim,
        cmp: [meio],
        vars: { esq, dir, meio, alvo: target, 'v[meio]': v[meio] },
      });

      push(4, `Comparando v[${meio}] (${v[meio]}) com alvo ${target}.`, {
        dim,
        cmp: [meio],
        vars: { esq, dir, meio, alvo: target, 'v[meio]': v[meio] },
      });

      if (v[meio] === target) {
        push(4, `Alvo ${target} encontrado na posição v[${meio}]! Retorno: ${meio}.`, {
          dim,
          swap: [meio],
          vars: { esq, dir, meio, alvo: target, 'v[meio]': v[meio], retorno: meio },
        });
        return out;
      } else if (v[meio] < target) {
        esq = meio + 1;
        push(5, `v[${meio}] (${v[meio]}) < alvo (${target}) → descartar metade esquerda; esq avança para ${esq}.`, {
          dim: dim.concat([meio]),
          cmp: [meio],
          vars: { esq, dir, meio, alvo: target, 'v[meio]': v[meio] },
        });
      } else {
        dir = meio - 1;
        push(6, `v[${meio}] (${v[meio]}) > alvo (${target}) → descartar metade direita; dir recua para ${dir}.`, {
          dim: dim.concat([meio]),
          cmp: [meio],
          vars: { esq, dir, meio, alvo: target, 'v[meio]': v[meio] },
        });
      }
    }

    push(8, `Faixa de busca esgotada (esq = ${esq} > dir = ${dir}). Alvo ${target} não encontrado no vetor. Retorno: -1.`, {
      dim: v.map((_, i) => i),
      vars: { esq, dir, meio: null, alvo: target, 'v[meio]': null, retorno: -1 },
    });
    return out;
  },
};
