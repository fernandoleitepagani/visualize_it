import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'while',
  title: 'While',
  subtitle: 'Repetição com teste antes',
  description:
    'O while testa a condição antes de cada execução — se ela já for falsa na entrada, o corpo nunca roda. ' +
    'Aqui somamos 1..n para ilustrar. O primeiro valor informado é usado como n.',
  view: 'loop',
  panelLabel: 'variáveis',
  languages: ['c'],
  initial: [5],
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(1)',
    note: 'O corpo executa n vezes e o teste acontece n + 1 vezes. Custo linear no número de iterações.',
  },
  code: {
    c: lines(`
int i = 1, S = 0;
while (i <= n) {
  S += i;
  i++;
}`),
  },
  steps(initial) {
    const raw = Number(initial[0]);
    const n = Number.isFinite(raw) && raw >= 1 ? Math.min(12, Math.floor(raw)) : 5;
    const out: Step[] = [];
    let i = 1;
    let S = 0;

    // Linha 0: int i = 1, S = 0;
    out.push({
      line: 0,
      desc: 'Declarar i = 1 e acumulador S = 0.',
      vars: { n, i, S },
      loop: {
        phase: 'init',
        iteration: { current: 1, total: n, label: 'Inicialização' },
        condition: {
          expression: 'i <= n',
          satisfied: null,
          explanation: 'Variáveis preparadas para o teste inicial.',
        },
        accumulator: { label: 'S', value: 0 },
      },
    });

    while (i <= n) {
      // Linha 1: while (i <= n) {
      out.push({
        line: 1,
        desc: `Teste condicional: i (${i}) ≤ n (${n}) é Verdadeiro → entra no corpo do laço.`,
        vars: { n, i, S },
        loop: {
          phase: 'check',
          iteration: { current: i, total: n, label: `Iteração ${i} de ${n}` },
          condition: {
            expression: 'i <= n',
            evaluation: `${i} <= ${n}`,
            satisfied: true,
            explanation: `${i} ≤ ${n} é verdadeiro → executa o corpo do laço.`,
          },
          accumulator: { label: 'S', value: S },
        },
      });

      const prevS = S;
      S += i;
      // Linha 2: S += i;
      out.push({
        line: 2,
        desc: `Corpo do laço: soma i (${i}) a S → S passa a ser ${S}.`,
        vars: { n, i, S },
        loop: {
          phase: 'body',
          iteration: { current: i, total: n, label: `Iteração ${i} de ${n}` },
          condition: {
            expression: 'i <= n',
            evaluation: `${i} <= ${n}`,
            satisfied: true,
          },
          accumulator: {
            label: 'S',
            value: S,
            previousValue: prevS,
            delta: `+ ${i}`,
          },
        },
      });

      i += 1;
      // Linha 3: i++;
      out.push({
        line: 3,
        desc: `Incremento: i++ → i avança para ${i}.`,
        vars: { n, i, S },
        loop: {
          phase: 'update',
          iteration: { current: i, total: n, label: `i incrementado para ${i}` },
          condition: {
            expression: 'i <= n',
            satisfied: null,
            explanation: 'Valor de i atualizado, retornando ao teste condicional.',
          },
          accumulator: { label: 'S', value: S },
        },
      });
    }

    // Linha 1: teste final que falha (i > n)
    out.push({
      line: 1,
      desc: `Teste condicional: i (${i}) ≤ n (${n}) é Falso → encerra o laço. Resultado final: S = ${S}.`,
      vars: { n, i, S },
      loop: {
        phase: 'end',
        iteration: { current: i, total: n, label: `Fim do laço (i = ${i})` },
        condition: {
          expression: 'i <= n',
          evaluation: `${i} <= ${n}`,
          satisfied: false,
          explanation: `${i} ≤ ${n} é falso → o laço termina.`,
        },
        accumulator: { label: 'S', value: S },
      },
    });

    return out;
  },
};
