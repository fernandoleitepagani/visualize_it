import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'busca-sequencial',
  title: 'Busca Sequencial',
  subtitle: 'Procura linear',
  description:
    'Percorre o vetor da esquerda para a direita, comparando cada elemento com o alvo até encontrá-lo ou chegar ao fim.',
  hasTarget: true,
  defaultTarget: 55,
  initial: [10, 25, 30, 45, 55, 60, 75, 88],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(1)',
    stable: false,
    note: 'Melhor caso: alvo na primeira posição. Pior caso: alvo na última posição ou ausente.',
  },
  code: {
    java: lines(`
int buscaSequencial(int[] v, int x) {
  for (int i = 0; i < v.length; i++) {
    if (v[i] == x) return i;
  }
  return -1;
}`),
    c: lines(`
int buscaSequencial(int v[], int n, int x) {
  for (int i = 0; i < n; i++) {
    if (v[i] == x) return i;
  }
  return -1;
}`),
  },
  steps(arr, _approach, targetParam) {
    const v = arr.slice();
    const target =
      targetParam !== undefined && Number.isFinite(targetParam)
        ? Math.floor(targetParam)
        : (v[Math.floor(v.length / 2)] ?? 55);
    const out: Step[] = [];

    const push = (line: number, desc: string, extra: Partial<Step> = {}) =>
      out.push({ line, desc, arr: v.slice(), ...extra });

    push(0, `Iniciando busca sequencial pelo alvo ${target} em ${v.length} elementos.`, {
      vars: { i: null, alvo: target, 'v[i]': null },
    });

    for (let i = 0; i < v.length; i++) {
      push(1, `i = ${i} (verificação do laço for).`, {
        cmp: [i],
        vars: { i, alvo: target, 'v[i]': v[i] },
      });
      push(2, `Comparando v[${i}] = ${v[i]} com o alvo ${target}.`, {
        cmp: [i],
        vars: { i, alvo: target, 'v[i]': v[i] },
      });
      if (v[i] === target) {
        push(2, `Alvo ${target} encontrado na posição v[${i}]! Retorno: ${i}.`, {
          swap: [i],
          vars: { i, alvo: target, 'v[i]': v[i], retorno: i },
        });
        return out;
      }
    }

    push(4, `Varredura concluída. Alvo ${target} não encontrado no vetor. Retorno: -1.`, {
      vars: { i: v.length, alvo: target, 'v[i]': null, retorno: -1 },
    });
    return out;
  },
};
