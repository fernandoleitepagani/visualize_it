import type { Lesson, Step, StepLine } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'fila-circular',
  title: 'Fila Circular',
  subtitle: 'FIFO em vetor circular',
  description:
    'Usa índices primeiro e ultimo que dão a volta no vetor — nada de deslocar elementos.',
  view: 'cells',
  panelLabel: 'fila',
  initial: [10, 20, 30],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(n)',
    stable: true,
    note: 'Enfileirar e desenfileirar mexem só em primeiro/ultimo, com módulo pelo tamanho. Θ(1) sempre.',
  },
  code: {
    java: lines(`
class Fila {
  int[] v = new int[7];   // 6 + 1 de folga
  int pri = 0, ult = 0;
  void enqueue(int x) {
    if ((ult + 1) % v.length == pri) return;
    v[ult] = x;
    ult = (ult + 1) % v.length;
  }
  int dequeue() {
    if (pri == ult) throw new RuntimeException("vazia");
    int r = v[pri];
    pri = (pri + 1) % v.length;
    return r;
  }
}`),
    c: lines(`
#define MAX 7
int v[MAX], pri = 0, ult = 0;
void enqueue(int x) {
  if ((ult + 1) % MAX == pri) return;
  v[ult] = x;
  ult = (ult + 1) % MAX;
}
int dequeue() {
  if (pri == ult) return -1;
  int r = v[pri];
  pri = (pri + 1) % MAX;
  return r;
}`),
  },
  steps(initial) {
    const MAX = 7;
    const v: (number | null)[] = new Array(MAX).fill(null);
    let pri = 0,
      ult = 0;
    for (let i = 0; i < Math.min(initial.length, MAX - 1); i++) {
      v[ult] = initial[i];
      ult = (ult + 1) % MAX;
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
        cells: v.map((val, i) => {
          const lbls: string[] = ([] as string[]).concat(labels[i] || []);
          if (i === pri) lbls.unshift('pri');
          if (i === ult) lbls.push('ult');
          return {
            val,
            labels: lbls,
            state: states[i] || (val === null ? 'empty' : ''),
          };
        }),
      });
    };

    snap(`Início: pri=${pri}, ult=${ult}.`, {}, {}, { java: 0, c: 0 });

    function enqueue(x: number) {
      if ((ult + 1) % MAX === pri) {
        snap('Fila cheia.', {}, {}, { java: 4, c: 3 });
        return;
      }
      snap(`enqueue(${x}) → v[${ult}].`, {}, { [ult]: ['novo'] }, { java: 4, c: 3 });
      v[ult] = x;
      snap(
        `v[${ult}] = ${x}.`,
        { [ult]: 'write' },
        {},
        { java: 5, c: 4 },
      );
      ult = (ult + 1) % MAX;
      snap(
        `ult = ${ult}.`,
        {},
        {},
        { java: 6, c: 5 },
      );
    }

    function dequeue() {
      if (pri === ult) {
        snap('Fila vazia.', {}, {}, { java: 9, c: 8 });
        return;
      }
      const r = v[pri];
      snap(`dequeue() retorna v[${pri}] = ${r}.`, { [pri]: 'active' }, {}, { java: 10, c: 9 });
      v[pri] = null;
      pri = (pri + 1) % MAX;
      snap(`pri = ${pri}.`, {}, {}, { java: 11, c: 10 });
    }

    enqueue(40);
    enqueue(50);
    dequeue();
    enqueue(60); // dá a volta
    dequeue();
    snap('Fim.', {}, {}, { java: 14, c: 12 });
    return out;
  },
};
