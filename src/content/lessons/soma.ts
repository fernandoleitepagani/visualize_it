import type { Lesson, PlotPoint, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const series = (input: number[]): PlotPoint[] =>
  input.map((value, i) => ({ label: `f(${i + 1})`, value }));

export const lesson: Lesson = {
  id: 'soma',
  title: 'Somatório',
  subtitle: 'Soma parcial dos termos, como área acumulada',
  description:
    'Percorre os termos e acumula a soma em total. A cada passo, o retângulo do termo atual ' +
    'acende e o valor acumulado aparece no topo — a área cresce conforme o somatório avança.',
  view: 'plot',
  panelLabel: 'termos',
  languages: ['c'],
  initial: [3, 5, 2, 6, 4],

  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(1)',
    stable: true,
    note: 'Uma passada pelo vetor, com uma soma por elemento.',
  },

  code: {

    c: lines(`
    int soma(int v[], int n) {
        int total = 0;
        for (int i = 0; i < n; i++) {
            total += v[i];
        }
        return total;
    }`),
  },

  steps: (input) => {
    const points = series(input);
    const steps: Step[] = [
      {
        line: 1,
        desc: 'total = 0',
        plot: { points, current: -1, total: 0 },
        vars: { total: 0 },
      },
    ];

    let total = 0;
    input.forEach((value, i) => {
      total += value;
      steps.push({
        line: 3,
        desc: `total += ${value} → ${total}`,
        plot: { points, current: i, total },
        vars: { i: i + 1, termo: value, total },
      });
    });

    steps.push({
      line: 5,
      desc: `retorna ${total}`,
      plot: { points, current: input.length - 1, total },
      vars: { total },
    });

    return steps;
  },
};
