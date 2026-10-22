import type { Lesson, Step, StepLine } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'lista-sequencial',
  title: 'Lista Sequencial',
  subtitle: 'Vetor + contador n',
  description:
    'Lista em vetor de capacidade fixa. Inserir no meio empurra os elementos à direita; remover, à esquerda.',
  view: 'cells',
  panelLabel: 'lista',
  initial: [10, 20, 30],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(n)',
    stable: true,
    note: 'Inserir/remover no fim é Θ(1); no início ou no meio, Θ(n) por causa do deslocamento.',
  },
  code: {
    java: lines(`
class Lista {
  int[] v = new int[8];
  int n = 0;
  void inserir(int pos, int x) {
    if (n >= v.length) return;
    for (int i = n; i > pos; i--) v[i] = v[i - 1];
    v[pos] = x; n++;
  }
  int remover(int pos) {
    int r = v[pos];
    for (int i = pos; i < n - 1; i++) v[i] = v[i + 1];
    n--; return r;
  }
}`),
    c: lines(`
#define MAX 8
int v[MAX], n = 0;
void inserir(int pos, int x) {
  if (n >= MAX) return;
  for (int i = n; i > pos; i--) v[i] = v[i - 1];
  v[pos] = x; n++;
}
int remover(int pos) {
  int r = v[pos];
  for (int i = pos; i < n - 1; i++) v[i] = v[i + 1];
  n--; return r;
}`),
  },
  steps(initial) {
    const MAX = 8;
    const v: (number | null)[] = new Array(MAX).fill(null);
    let n = 0;
    for (let i = 0; i < Math.min(initial.length, MAX); i++) {
      v[i] = initial[i];
      n++;
    }
    const out: Step[] = [];

    const snap = (
      desc: string,
      states: Record<number, string> = {},
      labels: Record<number, string[]> = {},
      line: StepLine = 0,
    ) => {
      out.push({
        line,
        desc,
        cells: v.map((val, i) => ({
          val,
          labels: labels[i] || [],
          state: states[i] || (val === null ? 'empty' : ''),
        })),
      });
    };

    snap(`Início: [${v.slice(0, n).join(', ')}], n = ${n}.`, {}, {}, { java: 2, c: 1 });

    function inserir(pos: number, val: number) {
      if (n >= MAX) {
        snap('Lista cheia.', {}, { [pos]: ['!'] }, { java: 4, c: 3 });
        return;
      }
      snap(`Inserir ${val} na posição ${pos}.`, { [pos]: 'active' }, { [pos]: ['pos'] }, { java: 3, c: 2 });
      for (let i = n; i > pos; i--) {
        v[i] = v[i - 1];
        snap(
          `Desloca v[${i}] ← v[${i - 1}] = ${v[i]}.`,
          { [i]: 'write', [i - 1]: 'active' },
          {},
          { java: 5, c: 4 },
        );
      }
      v[pos] = val;
      n++;
      snap(`v[${pos}] = ${val}, n = ${n}.`, { [pos]: 'write' }, {}, { java: 6, c: 5 });
    }

    function remover(pos: number) {
      if (pos >= n) {
        snap('Posição inválida.', {}, {}, { java: 8, c: 7 });
        return;
      }
      const r = v[pos];
      snap(`Remover v[${pos}] = ${r}.`, { [pos]: 'active' }, {}, { java: 9, c: 8 });
      for (let i = pos; i < n - 1; i++) {
        v[i] = v[i + 1];
        snap(
          `Desloca v[${i}] ← v[${i + 1}] = ${v[i]}.`,
          { [i]: 'write', [i + 1]: 'active' },
          {},
          { java: 10, c: 9 },
        );
      }
      v[n - 1] = null;
      n--;
      snap(`Removido ${r}. n = ${n}.`, {}, {}, { java: 11, c: 10 });
    }

    inserir(2, 15);
    inserir(0, 5);
    inserir(n, 40);
    remover(1);
    remover(0);
    snap('Fim.', {}, {}, { java: 13, c: 11 });
    return out;
  },
};
