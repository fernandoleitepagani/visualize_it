import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'for',
  title: 'For',
  subtitle: 'Somatório com laço aninhado',
  description:
    'Calcula o valor de S. ' +
    'Exemplo real de codigo que já apareceu em prova: dois laços aninhados, e o interno depende do externo. ' +
    'O primeiro valor informado é usado como N (1 a 10).',
  view: 'cells',
  panelLabel: 'variáveis',
  languages: ['c'],
  initial: [3],

  complexity: {
    time: { best: 'Θ(N²)', avg: 'Θ(N²)', worst: 'Θ(N²)' },
    space: 'Θ(1)',
    stable: undefined, // não se aplica a um somatório
    note:
      'O laço externo executa N vezes; o interno, N − i vezes. ' +
      'Total ≈ N²/2 iterações → Θ(N²) em qualquer caso. ' +
      'Espaço constante: apenas S, num, i e p.',
  },

  code: {

    c: lines(`
int main() {
    float S = 0, num;
    int N;

    printf("N: ");
    scanf("%d", &N);

    for (int i = 1; i <= N; i++) {
        num = 0;
        for (int p = i + 1; p <= N-1; p++) {
            num += i * p;
        }
        S += num / (3 * i - 1);
    }
    printf("resultado: %f", S);
    return 0;
}`),
  },

  steps(initial) {
    const raw = Number(initial[0]);
    const N = Number.isFinite(raw) && raw >= 1 ? Math.min(10, Math.floor(raw)) : 6;

    const out: Step[] = [];
    let S = 0;
    let i: number | string = '—',
      p: number | string = '—',
      num: number | string = '—';

    const fmt = (x: number): string => {
      if (typeof x !== 'number' || !Number.isFinite(x)) return '—';
      return String(Math.round(x * 1000) / 1000);
    };

    const snap = (desc: string, line: number, hl: Record<string, string> = {}) => {
      out.push({
        line,
        desc,
        cells: [
          { val: N, labels: ['N'], state: hl.N || '' },
          { val: i, labels: ['i'], state: hl.i || '' },
          { val: p, labels: ['p'], state: hl.p || '' },
          { val: num, labels: ['num'], state: hl.num || '' },
          { val: fmt(S), labels: ['S'], state: hl.S || '' },
        ],
      });
    };

    // linha 1: float S = 0, num;
    snap('Declarar S = 0 e num.', 1, { S: 'write' });

    // linha 4: printf
    snap('Ler N.', 4);

    // linha 5: scanf
    snap(`N = ${N}.`, 5, { N: 'active' });

    for (let ii = 1; ii <= N; ii++) {
      i = ii;

      // linha 7: for (int i = 1; i <= N; i++)
      snap(`i = ${i} — início do laço externo.`, 7, { i: 'active' });

      // linha 8: num = 0;
      num = 0;
      snap('num = 0.', 8, { num: 'write' });

      if (ii + 1 > N - 1) {
        // linha 9: condição do for interno já falha
        snap(`p = ${ii + 1} > N — laço interno não executa.`, 9, {
          i: 'active',
        });
      } else {
        for (let pp = ii + 1; pp <= N - 1; pp++) {
          p = pp;
          // linha 9: for (int p = i+1; p <= N-1; p++)
          snap(`p = ${p}.`, 9, { p: 'active' });

          // linha 10: num += i * p;
          num += ii * pp;
          snap(`num += ${ii} · ${pp} = ${ii * pp} → num = ${num}.`, 10, {
            num: 'write',
          });
        }
        p = '—';
        // linha 11: } do for interno
        snap(`Fim do laço interno (p chegou a ${N} > N-1).`, 11);
      }

      // linha 12: S += num / (3*i - 1);
      const denom = 3 * ii - 1;
      const parcela = num / denom;
      S += parcela;
      snap(
        `S += ${num} / (3·${ii} − 1) = ${num}/${denom} ≈ ${parcela.toFixed(3)} → S = ${fmt(S)}.`,
        12,
        { S: 'write' },
      );
    }

    // linha 14: printf do resultado
    snap(`Fim. Resultado: S = ${fmt(S)}.`, 14, { S: 'active' });

    return out;
  },
};
