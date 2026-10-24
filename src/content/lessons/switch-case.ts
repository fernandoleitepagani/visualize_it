import type { FlowBranch, FlowBranchState, Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const code = lines(`
#include <stdio.h>

int main() {
  int opcao = 2;

  switch (opcao) {
    case 1:
      printf("Um\\n");
      break;
    case 2:
      printf("Dois\\n");
      break;
    case 3:
      printf("Três\\n");
      break;
    default:
      printf("Outro\\n");
  }

  return 0;
}`);

const NEXT = 'return 0;';

const lineOf = (text: string): number => {
  const index = code.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada: ${text}`);
  return index;
};

const lineOfFrom = (text: string, from: number): number => {
  const index = code.findIndex((line, lineIndex) => lineIndex >= from && line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada a partir de ${from}: ${text}`);
  return index;
};

const branches = (
  case1: FlowBranchState,
  case2: FlowBranchState,
  case3: FlowBranchState,
  fallback: FlowBranchState,
): FlowBranch[] => [
  {
    id: 'case-1',
    label: 'case 1',
    condition: 'opcao == 1',
    evaluation: '2 == 1',
    result: false,
    statements: ['printf("Um")'],
    exit: 'break',
    state: case1,
  },
  {
    id: 'case-2',
    label: 'case 2',
    condition: 'opcao == 2',
    evaluation: '2 == 2',
    result: true,
    statements: ['printf("Dois")'],
    exit: 'break',
    state: case2,
  },
  {
    id: 'case-3',
    label: 'case 3',
    condition: 'opcao == 3',
    evaluation: '2 == 3',
    result: false,
    statements: ['printf("Três")'],
    exit: 'break',
    state: case3,
  },
  {
    id: 'default',
    label: 'default',
    statements: ['printf("Outro")'],
    state: fallback,
  },
];

export const lesson: Lesson = {
  id: 'switch-case',
  title: 'Switch / Case',
  subtitle: 'Escolha entre valores discretos',
  description:
    'O switch compara uma expressão com vários casos. O case correspondente executa até um break; ' +
    'sem break, a execução continua no case seguinte (fall-through). O default cobre os valores não listados.',
  view: 'flow',
  panelLabel: 'ramos',
  languages: ['c'],
  inputless: true,
  initial: [2],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(1)',
    stable: undefined,
    note: 'O switch seleciona um caso; a execução segue até o break ou o fim do bloco.',
  },
  code: { c: code },
  steps: () => {
    const out: Step[] = [];

    out.push({
      line: lineOf('int opcao = 2'),
      desc: 'opcao recebe 2; o switch ainda não foi avaliado.',
      vars: { opcao: 2 },
      flow: { kind: 'switch', selector: 'opcao', branches: branches('idle', 'idle', 'idle', 'idle') },
    });

    out.push({
      line: lineOf('switch (opcao)'),
      desc: 'O switch vai comparar opcao com cada case, na ordem do código.',
      vars: { opcao: 2 },
      flow: { kind: 'switch', selector: 'opcao', branches: branches('idle', 'idle', 'idle', 'idle') },
    });

    out.push({
      line: lineOf('case 1:'),
      desc: 'opcao == 1 é falso; o case 1 é ignorado.',
      vars: { opcao: 2, 'opcao == 1': 'falso' },
      flow: { kind: 'switch', selector: 'opcao', branches: branches('skipped', 'idle', 'idle', 'idle') },
    });

    out.push({
      line: lineOf('printf("Um'),
      desc: 'printf("Um") não executa porque o case 1 não foi escolhido.',
      vars: { opcao: 2, 'opcao == 1': 'falso' },
      flow: { kind: 'switch', selector: 'opcao', branches: branches('skipped', 'idle', 'idle', 'idle') },
    });

    out.push({
      line: lineOf('break;'),
      desc: 'O break do case 1 também é ignorado.',
      vars: { opcao: 2, 'opcao == 1': 'falso' },
      flow: { kind: 'switch', selector: 'opcao', branches: branches('skipped', 'idle', 'idle', 'idle') },
    });

    out.push({
      line: lineOf('case 2:'),
      desc: 'opcao == 2 é verdadeiro; o case 2 é escolhido.',
      vars: { opcao: 2, 'opcao == 2': 'verdadeiro' },
      flow: { kind: 'switch', selector: 'opcao', branches: branches('skipped', 'active', 'idle', 'idle') },
    });

    out.push({
      line: lineOf('printf("Dois'),
      desc: 'printf("Dois") executa; a saída do programa é Dois.',
      vars: { opcao: 2, 'opcao == 2': 'verdadeiro', saida: 'Dois' },
      flow: {
        kind: 'switch',
        selector: 'opcao',
        branches: branches('skipped', 'done', 'idle', 'idle'),
        result: { label: 'saída', value: 'Dois' },
      },
    });

    out.push({
      line: lineOfFrom('break;', lineOf('printf("Dois')),
      desc: 'O break encerra o switch. Sem break, a execução continuaria no case 3 (fall-through).',
      vars: { opcao: 2, 'opcao == 2': 'verdadeiro', saida: 'Dois', break: 'executado' },
      flow: {
        kind: 'switch',
        selector: 'opcao',
        branches: branches('skipped', 'done', 'skipped', 'skipped'),
        result: { label: 'saída', value: 'Dois' },
        note: 'Sem break, a execução continuaria no case 3 (fall-through).',
      },
    });

    const skipped: Array<{ line: number; desc: string }> = [
      {
        line: lineOf('case 3:'),
        desc: 'opcao == 3 não é avaliado: o break do case 2 já encerrou o switch.',
      },
      {
        line: lineOf('printf("Três'),
        desc: 'printf("Três") não executa porque o case 3 não foi escolhido.',
      },
      {
        line: lineOfFrom('break;', lineOf('printf("Três')),
        desc: 'O break do case 3 também não executa.',
      },
      {
        line: lineOf('default:'),
        desc: 'O default não é executado porque um case já foi escolhido.',
      },
      {
        line: lineOf('printf("Outro'),
        desc: 'printf("Outro") não executa porque o default foi ignorado.',
      },
    ];

    for (const item of skipped) {
      out.push({
        line: item.line,
        desc: item.desc,
        vars: { opcao: 2, 'opcao == 2': 'verdadeiro', saida: 'Dois' },
        flow: {
          kind: 'switch',
          selector: 'opcao',
          branches: branches('skipped', 'done', 'skipped', 'skipped'),
          result: { label: 'saída', value: 'Dois' },
          note: 'Sem break, a execução continuaria no case 3 (fall-through).',
        },
      });
    }

    out.push({
      line: lineOf('return 0;'),
      desc: 'Fim: o case 2 executou e o break impediu o fall-through.',
      vars: { opcao: 2, 'opcao == 2': 'verdadeiro', saida: 'Dois' },
      flow: {
        kind: 'switch',
        selector: 'opcao',
        branches: branches('skipped', 'done', 'skipped', 'skipped'),
        result: { label: 'saída', value: 'Dois' },
        note: 'Sem break, a execução continuaria no case 3 (fall-through).',
      },
    });

    return out.map((step) =>
      step.flow ? { ...step, flow: { ...step.flow, next: NEXT } } : step,
    );
  },
};
