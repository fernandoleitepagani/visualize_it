import type { FlowBranch, FlowBranchState, Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const code = lines(`
#include <stdio.h>

int main() {
  int a = 8;
  int b = 5;
  int maior = a > b ? a : b;

  printf("%d\\n", maior);

  return 0;
}`);

const NEXT = 'printf("%d", maior);';

const lineOf = (text: string): number => {
  const index = code.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada: ${text}`);
  return index;
};

const branches = (
  trueState: FlowBranchState,
  falseState: FlowBranchState,
): FlowBranch[] => [
  {
    id: 'true',
    label: 'verdadeiro',
    condition: 'a > b',
    evaluation: '8 > 5',
    result: true,
    value: 'a = 8',
    state: trueState,
  },
  {
    id: 'false',
    label: 'falso',
    condition: 'a > b',
    evaluation: '8 > 5',
    result: false,
    value: 'b = 5',
    state: falseState,
  },
];

export const lesson: Lesson = {
  id: 'ternario',
  title: 'Ternário',
  subtitle: 'Uma decisão dentro de uma expressão',
  description:
    'O operador condicional escolhe entre duas expressões e devolve um valor. ' +
    'A condição é avaliada uma vez; apenas o lado verdadeiro ou o falso é usado na atribuição.',
  view: 'flow',
  panelLabel: 'ramos',
  languages: ['c'],
  inputless: true,
  initial: [8],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(1)',
    stable: undefined,
    note: 'A condição é avaliada uma vez e apenas uma das expressões é selecionada.',
  },
  code: { c: code },
  steps: () => {
    const out: Step[] = [];

    out.push({
      line: lineOf('int a = 8'),
      desc: 'a recebe 8.',
      vars: { a: 8 },
      flow: { kind: 'ternary', selector: 'a > b', branches: branches('idle', 'idle') },
    });

    out.push({
      line: lineOf('int b = 5'),
      desc: 'b recebe 5.',
      vars: { a: 8, b: 5 },
      flow: { kind: 'ternary', selector: 'a > b', branches: branches('idle', 'idle') },
    });

    out.push({
      line: lineOf('int maior = a > b ? a : b'),
      desc: 'A condição a > b é verdadeira; o lado esquerdo do ternário será escolhido.',
      vars: { a: 8, b: 5, 'a > b': 'verdadeiro' },
      flow: { kind: 'ternary', selector: 'a > b', branches: branches('active', 'idle') },
    });

    out.push({
      line: lineOf('int maior = a > b ? a : b'),
      desc: 'O operador seleciona a e atribui 8 a maior; o lado b é ignorado.',
      vars: { a: 8, b: 5, maior: 8 },
      flow: {
        kind: 'ternary',
        selector: 'a > b',
        branches: branches('done', 'skipped'),
        result: { label: 'maior', value: 8 },
      },
    });

    out.push({
      line: lineOf('printf("%d'),
      desc: 'printf("%d") imprime o valor de maior: 8.',
      vars: { a: 8, b: 5, maior: 8, saida: 8 },
      flow: {
        kind: 'ternary',
        selector: 'a > b',
        branches: branches('done', 'skipped'),
        result: { label: 'maior', value: 8 },
      },
    });

    out.push({
      line: lineOf('return 0;'),
      desc: 'Fim: o ternário escolheu a; maior permanece 8.',
      vars: { a: 8, b: 5, maior: 8, saida: 8 },
      flow: {
        kind: 'ternary',
        selector: 'a > b',
        branches: branches('done', 'skipped'),
        result: { label: 'maior', value: 8 },
      },
    });

    return out.map((step) =>
      step.flow ? { ...step, flow: { ...step.flow, next: NEXT } } : step,
    );
  },
};
