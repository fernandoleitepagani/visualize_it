import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'for',
  title: 'For',
  subtitle: 'Somatório com laço aninhado',
  description:
    'Calcula o valor do somatório S usando dois laços aninhados, onde o laço interno depende do externo (j ≤ i). ' +
    'O primeiro valor informado é usado como n (1 a 10).',
  view: 'loop',
  panelLabel: 'variáveis',
  languages: ['c'],
  initial: [3],

  complexity: {
    time: { best: 'Θ(n²)', avg: 'Θ(n²)', worst: 'Θ(n²)' },
    space: 'Θ(1)',
    stable: undefined,
    note:
      'O laço externo executa n vezes; para cada i, o interno executa i vezes. ' +
      'Total de iterações = 1 + 2 + ... + n = n(n+1)/2 → Θ(n²). ' +
      'Espaço constante: apenas n, i, j e S.',
  },

  code: {
    c: lines(`
int main() {
    int n;
    int S = 0;

    printf("n: ");
    scanf("%d", &n);

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            S += j;
        }
    }
    printf("resultado: %d\\n", S);
    return 0;
}`),
  },

  steps(initial) {
    const raw = Number(initial[0]);
    const n = Number.isFinite(raw) && raw >= 1 ? Math.min(10, Math.floor(raw)) : 3;

    const out: Step[] = [];
    let S = 0;
    let i: number | null;
    let j: number | null;

    // Linha 1: int n;
    out.push({
      line: 1,
      desc: 'Declarar variável inteira n.',
      vars: { n: null, i: null, j: null, S: null },
      loop: {
        phase: 'init',
        condition: { expression: 'i <= n', satisfied: null },
      },
    });

    // Linha 2: int S = 0;
    out.push({
      line: 2,
      desc: 'Inicializar acumulador S = 0.',
      vars: { n: null, i: null, j: null, S: 0 },
      loop: {
        phase: 'init',
        accumulator: { label: 'S', value: 0 },
        condition: { expression: 'i <= n', satisfied: null },
      },
    });

    // Linha 4: printf("n: ");
    out.push({
      line: 4,
      desc: 'Solicitar ao usuário o valor de n.',
      vars: { n: null, i: null, j: null, S: 0 },
      loop: {
        phase: 'init',
        accumulator: { label: 'S', value: 0 },
      },
    });

    // Linha 5: scanf("%d", &n);
    out.push({
      line: 5,
      desc: `Valor de n definido como ${n}.`,
      vars: { n, i: null, j: null, S: 0 },
      loop: {
        phase: 'init',
        iteration: { current: 1, total: n, label: `n = ${n}` },
        accumulator: { label: 'S', value: 0 },
        condition: { expression: 'i <= n', satisfied: null },
      },
    });

    for (let currentI = 1; currentI <= n; currentI++) {
      i = currentI;

      // Linha 7: for (int i = 1; i <= n; i++)
      out.push({
        line: 7,
        desc: `Laço externo: i = ${i} (teste: ${i} ≤ ${n} é Verdadeiro).`,
        vars: { n, i, j: null, S },
        loop: {
          phase: 'check',
          iteration: { current: i, total: n, label: `i = ${i} de ${n}` },
          condition: {
            expression: 'i <= n',
            evaluation: `${i} <= ${n}`,
            satisfied: true,
            explanation: `Laço externo avança para a linha i = ${i}. O laço interno rodará para j de 1 até ${i}.`,
          },
          accumulator: { label: 'S', value: S },
        },
      });

      for (let currentJ = 1; currentJ <= currentI; currentJ++) {
        j = currentJ;

        // Linha 8: for (int j = 1; j <= i; j++)
        out.push({
          line: 8,
          desc: `Laço interno: j = ${j} (teste: ${j} ≤ ${i} é Verdadeiro).`,
          vars: { n, i, j, S },
          loop: {
            phase: 'check',
            iteration: { current: i, total: n, label: `i = ${i} de ${n}` },
            innerIteration: { current: j, total: i, label: `j = ${j} de ${i}` },
            condition: {
              expression: 'j <= i',
              evaluation: `${j} <= ${i}`,
              satisfied: true,
              explanation: `${j} ≤ ${i} é verdadeiro → executa o corpo interno.`,
            },
            accumulator: { label: 'S', value: S },
          },
        });

        const prevS = S;
        S += j;

        // Linha 9: S += j;
        out.push({
          line: 9,
          desc: `Corpo interno: soma j (${j}) a S → S passa a ser ${S}.`,
          vars: { n, i, j, S },
          loop: {
            phase: 'body',
            iteration: { current: i, total: n, label: `i = ${i} de ${n}` },
            innerIteration: { current: j, total: i, label: `j = ${j} de ${i}` },
            condition: {
              expression: 'j <= i',
              evaluation: `${j} <= ${i}`,
              satisfied: true,
            },
            accumulator: {
              label: 'S',
              value: S,
              previousValue: prevS,
              delta: `+ ${j}`,
            },
          },
        });
      }

      // Linha 8: teste que falha no laço interno (j = i + 1 > i)
      const nextJ = currentI + 1;
      out.push({
        line: 8,
        desc: `Laço interno: j = ${nextJ} > i (${i}) é Falso → encerra iterações internas de i = ${i}.`,
        vars: { n, i, j: nextJ, S },
        loop: {
          phase: 'update',
          iteration: { current: i, total: n, label: `i = ${i} de ${n}` },
          innerIteration: { current: nextJ, total: i, label: `j = ${nextJ} (sai)` },
          condition: {
            expression: 'j <= i',
            evaluation: `${nextJ} <= ${i}`,
            satisfied: false,
            explanation: `${nextJ} ≤ ${i} é falso → conclui o laço interno desta rodada.`,
          },
          accumulator: { label: 'S', value: S },
        },
      });
    }

    // Linha 7: teste que falha no laço externo (i = n + 1 > n)
    const nextI = n + 1;
    out.push({
      line: 7,
      desc: `Laço externo: i = ${nextI} > n (${n}) é Falso → encerra os laços aninhados.`,
      vars: { n, i: nextI, j: null, S },
      loop: {
        phase: 'end',
        iteration: { current: nextI, total: n, label: `i = ${nextI} (fim)` },
        condition: {
          expression: 'i <= n',
          evaluation: `${nextI} <= ${n}`,
          satisfied: false,
          explanation: `${nextI} ≤ ${n} é falso → o laço externo termina.`,
        },
        accumulator: { label: 'S', value: S },
      },
    });

    // Linha 12: printf("resultado: %d\n", S);
    out.push({
      line: 12,
      desc: `Fim da execução. Resultado impresso: S = ${S}.`,
      vars: { n, i: nextI, j: null, S },
      loop: {
        phase: 'end',
        iteration: { current: n, total: n, label: 'Concluído' },
        accumulator: { label: 'S', value: S },
      },
    });

    return out;
  },
};
