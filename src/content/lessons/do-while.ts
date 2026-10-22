import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'do-while',
  title: 'Do While',
  subtitle: 'Repetição com teste depois',
  description:
    'O do-while testa a condição depois de cada execução, então o corpo roda pelo menos uma vez. ' +
    'Aqui somamos 1..n para ilustrar. O primeiro valor informado é usado como n.',
  view: 'loop',
  panelLabel: 'variáveis',
  languages: ['c'],
  initial: [5],
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(1)',
    note: 'Executa pelo menos uma vez; o teste acontece depois do corpo. Mesmo custo linear do while.',
  },
  code: {
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
    let iterationCount = 0;

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
          explanation: 'No do-while, o bloco será executado antes de qualquer teste.',
        },
        accumulator: { label: 'S', value: 0 },
      },
    });

    do {
      iterationCount += 1;

      // Linha 1: do {
      out.push({
        line: 1,
        desc: `Entrada no bloco do: iteração ${iterationCount} inicia sem teste prévio.`,
        vars: { n, i, S },
        loop: {
          phase: 'body',
          iteration: { current: iterationCount, total: n, label: `Iteração ${iterationCount} de ${n}` },
          condition: {
            expression: 'i <= n',
            satisfied: null,
            explanation: 'Condição só será avaliada ao final desta iteração.',
          },
          accumulator: { label: 'S', value: S },
        },
      });

      const prevS = S;
      S += i;
      // Linha 2: S += i;
      out.push({
        line: 2,
        desc: `Corpo do laço: soma i (${i}) ao acumulador S → S passa a ser ${S}.`,
        vars: { n, i, S },
        loop: {
          phase: 'body',
          iteration: { current: iterationCount, total: n, label: `Iteração ${iterationCount} de ${n}` },
          condition: {
            expression: 'i <= n',
            satisfied: null,
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
          iteration: { current: iterationCount, total: n, label: `i incrementado para ${i}` },
          condition: {
            expression: 'i <= n',
            satisfied: null,
            explanation: 'Prepara para o teste de repetição do while.',
          },
          accumulator: { label: 'S', value: S },
        },
      });

      const isSatisfied = i <= n;
      // Linha 4: } while (i <= n);
      out.push({
        line: 4,
        desc: isSatisfied
          ? `Teste de repetição: i (${i}) ≤ n (${n}) é Verdadeiro → volta para o bloco do.`
          : `Teste de repetição: i (${i}) ≤ n (${n}) é Falso → encerra o laço. Resultado: S = ${S}.`,
        vars: { n, i, S },
        loop: {
          phase: isSatisfied ? 'check' : 'end',
          iteration: { current: iterationCount, total: n, label: `Teste da iteração ${iterationCount}` },
          condition: {
            expression: 'i <= n',
            evaluation: `${i} <= ${n}`,
            satisfied: isSatisfied,
            explanation: isSatisfied
              ? `${i} ≤ ${n} é verdadeiro → repete o laço.`
              : `${i} ≤ ${n} é falso → o laço encerra.`,
          },
          accumulator: { label: 'S', value: S },
        },
      });
    } while (i <= n);

    return out;
  },
};
