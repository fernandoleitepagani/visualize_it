import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const code = lines(`
#include <stdio.h>

int main() {
  int nota = 7;

  if (nota >= 9) {
    printf("Excelente\\n");
  } else if (nota >= 6) {
    printf("Aprovado\\n");
  } else {
    printf("Reprovado\\n");
  }

  return 0;
}`);

const NEXT = 'return 0;';

const lineOf = (text: string): number => {
  const index = code.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada: ${text}`);
  return index;
};

const branches = (
  ifState: 'idle' | 'active' | 'done' | 'skipped',
  elseIfState: 'idle' | 'active' | 'done' | 'skipped',
  elseState: 'idle' | 'active' | 'done' | 'skipped',
) => [
  {
    id: 'if',
    label: 'if',
    condition: 'nota >= 9',
    evaluation: '7 >= 9',
    result: false,
    statements: ['printf("Excelente")'],
    state: ifState,
  },
  {
    id: 'else-if',
    label: 'else if',
    condition: 'nota >= 6',
    evaluation: '7 >= 6',
    result: true,
    statements: ['printf("Aprovado")'],
    state: elseIfState,
  },
  {
    id: 'else',
    label: 'else',
    statements: ['printf("Reprovado")'],
    state: elseState,
  },
];

export const lesson: Lesson = {
  id: 'if-else',
  title: 'If / Else',
  subtitle: 'Decisões com uma ou mais condições',
  description:
    'Avalia condições em ordem e executa apenas o primeiro bloco verdadeiro. ' +
    'O else-if permite testar alternativas; o else cobre o caso em que nenhuma condição anterior foi satisfeita.',
  view: 'flow',
  panelLabel: 'ramos',
  languages: ['c'],
  inputless: true,
  initial: [7],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(1)',
    stable: undefined,
    note: 'Cada condição é avaliada uma vez, na ordem do código; no máximo um bloco executa.',
  },
  code: { c: code },
  steps: () => {
    const out: Step[] = [];

    out.push({
      line: lineOf('int nota = 7'),
      desc: 'nota recebe 7.',
      vars: { nota: 7 },
      flow: { kind: 'if', branches: branches('idle', 'idle', 'idle') },
    });

    out.push({
      line: lineOf('if (nota >= 9)'),
      desc: 'A condição nota >= 9 é falsa; o primeiro bloco é ignorado.',
      vars: { nota: 7, 'nota >= 9': 'falso' },
      flow: { kind: 'if', selector: 'nota >= 9', branches: branches('skipped', 'idle', 'idle') },
    });

    out.push({
      line: lineOf('printf("Excelente'),
      desc: 'printf("Excelente") não executa porque a condição do if é falsa.',
      vars: { nota: 7, 'nota >= 9': 'falso' },
      flow: { kind: 'if', selector: 'nota >= 9', branches: branches('skipped', 'idle', 'idle') },
    });

    out.push({
      line: lineOf('} else if (nota >= 6)'),
      desc: 'A condição nota >= 6 é verdadeira; o ramo else-if é escolhido.',
      vars: { nota: 7, 'nota >= 6': 'verdadeiro' },
      flow: { kind: 'if', selector: 'nota >= 6', branches: branches('skipped', 'active', 'idle') },
    });

    out.push({
      line: lineOf('printf("Aprovado'),
      desc: 'printf("Aprovado") executa; a saída do programa é Aprovado.',
      vars: { nota: 7, 'nota >= 6': 'verdadeiro', saida: 'Aprovado' },
      flow: {
        kind: 'if',
        selector: 'nota >= 6',
        branches: [
          {
            id: 'if',
            label: 'if',
            condition: 'nota >= 9',
            evaluation: '7 >= 9',
            result: false,
            statements: ['printf("Excelente")'],
            state: 'skipped',
          },
          {
            id: 'else-if',
            label: 'else if',
            condition: 'nota >= 6',
            evaluation: '7 >= 6',
            result: true,
            statements: ['printf("Aprovado")'],
            state: 'done',
          },
          {
            id: 'else',
            label: 'else',
            statements: ['printf("Reprovado")'],
            state: 'skipped',
          },
        ],
        result: { label: 'saída', value: 'Aprovado' },
      },
    });

    const finalFlow = {
      kind: 'if' as const,
      selector: 'nota >= 6',
      branches: [
        {
          id: 'if',
          label: 'if',
          condition: 'nota >= 9',
          evaluation: '7 >= 9',
          result: false,
          statements: ['printf("Excelente")'],
          state: 'skipped' as const,
        },
        {
          id: 'else-if',
          label: 'else if',
          condition: 'nota >= 6',
          evaluation: '7 >= 6',
          result: true,
          statements: ['printf("Aprovado")'],
          state: 'done' as const,
        },
        {
          id: 'else',
          label: 'else',
          statements: ['printf("Reprovado")'],
          state: 'skipped' as const,
        },
      ],
      result: { label: 'saída', value: 'Aprovado' },
    };

    out.push({
      line: lineOf('} else {'),
      desc: 'O else não é avaliado: o else-if já havia sido escolhido.',
      vars: { nota: 7, 'nota >= 6': 'verdadeiro', saida: 'Aprovado' },
      flow: finalFlow,
    });

    out.push({
      line: lineOf('printf("Reprovado'),
      desc: 'printf("Reprovado") não executa porque o else foi ignorado.',
      vars: { nota: 7, 'nota >= 6': 'verdadeiro', saida: 'Aprovado' },
      flow: finalFlow,
    });

    out.push({
      line: lineOf('return 0;'),
      desc: 'Fim: apenas o ramo else-if executou; a saída permanece Aprovado.',
      vars: { nota: 7, 'nota >= 6': 'verdadeiro', saida: 'Aprovado' },
      flow: finalFlow,
    });

    return out.map((step) =>
      step.flow ? { ...step, flow: { ...step.flow, next: NEXT } } : step,
    );
  },
};
