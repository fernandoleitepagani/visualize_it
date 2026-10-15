import type { Lesson, Step } from '@/engine/types';

export const lesson: Lesson = {
  id: 'while',
  title: 'While',
  subtitle: 'Repetição com teste antes',
  description:
    'O while testa a condição antes de cada execução — se ela já for falsa na entrada, o corpo nunca roda. ' +
    'Aqui somamos 1..n para ilustrar. O primeiro valor informado é usado como n.',
  view: 'cells',
  panelLabel: 'variáveis',
  initial: [5],
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(1)',
    stable: undefined,
    note: 'O corpo executa n vezes e o teste acontece n + 1 vezes. Custo linear no número de iterações.',
  },
  code: {
    java: `
int i = 1, S = 0;
while (i <= n) {
  S += i;
  i++;
}`
      .trim()
      .split('\n'),
    c: `
int i = 1, S = 0;
while (i <= n) {
  S += i;
  i++;
}`
      .trim()
      .split('\n'),
  },
  steps(initial) {
    const raw = Number(initial[0]);
    const n = Number.isFinite(raw) && raw >= 1 ? Math.min(12, Math.floor(raw)) : 5;
    const out: Step[] = [];
    let i = 0;
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
    i = 1;
    snap('i = 1.', 0, { i: 'active' });

    while (i <= n) {
      snap(`i = ${i} ≤ n = ${n} → entra no laço.`, 1, { i: 'active' });
      S += i;
      snap(`S += ${i} → S = ${S}.`, 2, { S: 'write' });
      i += 1;
      snap(`i++ → i = ${i}.`, 3, { i: 'write' });
    }

    snap(`i = ${i} > n = ${n} → sai do laço. S = ${S}.`, 1, { i: 'active' });
    return out;
  },
};
