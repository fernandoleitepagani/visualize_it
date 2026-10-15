import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'do-while',
  title: 'Do While',
  subtitle: 'Repetição com teste depois',
  description:
    'O do-while testa a condição depois de cada execução, então o corpo roda pelo menos uma vez. ' +
    'Aqui somamos 1..n para ilustrar. O primeiro valor informado é usado como n.',
  view: 'cells',
  panelLabel: 'variáveis',
  initial: [5],
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(1)',
    note: 'Executa pelo menos uma vez; o teste acontece depois do corpo. Mesmo custo linear do while.',
  },
  code: {
    java: lines(`
int i = 1, S = 0;
do {
  S += i;
  i++;
} while (i <= n);`),
    c: lines(`
int i = 1, S = 0;
do {
  S += i;
  i++;
} while (i <= n);`),
  },
  steps(initial) {
    const raw = Number(initial[0]);
    const n = Number.isFinite(raw) && raw >= 1 ? Math.min(12, Math.floor(raw)) : 5;
    const out: Step[] = [];
    let i = 1;
    let S = 0;

    const snap = (desc: string, line: number, hl: Record<string, string> = {}) => {
      out.push({
        line,
        desc,
        cells: [
          { val: n, labels: ['n'], state: hl.n || '' },
          { val: i, labels: ['i'], state: hl.i || '' },
          { val: S, labels: ['S'], state: hl.S || '' },
        ],
      });
    };

    snap('Declarar i = 1 e S = 0.', 0, { i: 'write', S: 'write' });

    do {
      snap(`Corpo: S += ${i}.`, 2, { S: 'active' });
      S += i;
      snap(`S = ${S}.`, 2, { S: 'write' });
      i += 1;
      snap(`i++ → i = ${i}.`, 3, { i: 'write' });
      snap(`Testa: i = ${i} ≤ n = ${n}?`, 4, { i: 'active' });
    } while (i <= n);

    snap(`i = ${i} > n = ${n} → encerra. S = ${S}.`, 4, { i: 'active' });
    return out;
  },
};
