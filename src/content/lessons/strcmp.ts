import type { Cell, Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';
import { cellList, lineOf, stringRow, stringStep } from './string-utils';

const code = lines(`
#include <stdio.h>
#include <string.h>

int main() {
  char a[] = "BANANA";
  char b[] = "BAN";

  int x = strcmp(a, b);
  int y = strncmp(a, b, 3);

  printf("%d %d\\n", x, y);
  return 0;
}`);

const strcmpLine = lineOf(code, 'int x = strcmp');
const strncmpLine = lineOf(code, 'int y = strncmp');
const finalLine = lineOf(code, 'printf("%d %d');

const aText = 'BANANA';
const bText = 'BAN';
const aValues: Array<Cell['val']> = [...aText, '\\0'];
const bValues: Array<Cell['val']> = [...bText, '\\0'];

function frame(
  aStates: Record<number, string> = {},
  bStates: Record<number, string> = {},
  aLabels: Record<number, string[]> = {},
  bLabels: Record<number, string[]> = {},
) {
  return [
    stringRow('a', cellList(aValues, aStates, aLabels)),
    stringRow('b', cellList(bValues, bStates, bLabels)),
  ];
}

const steps: Step[] = [
  stringStep(
    lineOf(code, 'char a[]'),
    'a guarda BANANA e b guarda BAN. A comparação começa no primeiro caractere.',
    frame({}, {}, { 0: ['i'] }, { 0: ['i'] }),
    { vars: { i: 0 } },
  ),
];

for (let i = 0; i < 3; i++) {
  steps.push(
    stringStep(
      strcmpLine,
      `a[${i}] = '${aText[i]}' e b[${i}] = '${bText[i]}' são iguais; a comparação continua.`,
      frame(
        { [i]: 'compare' },
        { [i]: 'compare' },
        { [i]: ['i'] },
        { [i]: ['i'] },
      ),
      { vars: { i, 'a[i]': aText[i], 'b[i]': bText[i], resultado: 'iguais até aqui' } },
    ),
  );
}

steps.push(
  stringStep(
    strcmpLine,
    "No índice 3, a tem 'A' e b tem '\\0'. A primeira string é maior; strcmp para e devolve um valor positivo.",
    frame(
      { 3: 'diff' },
      { 3: 'diff' },
      { 3: ['i'] },
      { 3: ['i'] },
    ),
    { vars: { i: 3, 'a[i]': 'A', 'b[i]': '\\0', resultado: '> 0' } },
  ),
);

steps.push(
  stringStep(
    strncmpLine,
    'strncmp compara apenas os três primeiros caracteres: B, A e N são iguais, então o resultado é 0.',
    frame(
      { 0: 'compare', 1: 'compare', 2: 'compare' },
      { 0: 'compare', 1: 'compare', 2: 'compare' },
      { 0: ['i'], 1: ['i'], 2: ['i'] },
      { 0: ['i'], 1: ['i'], 2: ['i'] },
    ),
    { vars: { n: 3, resultado: '0', y: 0 } },
  ),
);

steps.push(
  stringStep(
    finalLine,
    'x é positivo porque BANANA vem depois de BAN; y é 0 porque os três primeiros caracteres são iguais.',
    frame(
      { 0: 'compare', 1: 'compare', 2: 'compare' },
      { 0: 'compare', 1: 'compare', 2: 'compare' },
    ),
    {
      vars: { x: '> 0', y: 0 },
      result: { label: 'resultado', value: 'strcmp > 0 · strncmp 0' },
    },
  ),
);

export const lesson: Lesson = {
  id: 'strcmp',
  title: 'strcmp e strncmp',
  subtitle: 'Comparar strings',
  description:
    'strcmp compara duas strings caractere a caractere, em ordem lexicográfica, até encontrar uma diferença ou o terminador. Retorna 0 quando são iguais, um valor negativo quando a primeira vem antes e um valor positivo quando vem depois. strncmp limita a comparação aos n primeiros caracteres. Nunca use == para comparar conteúdo: ele compara endereços.',
  view: 'strings',
  panelLabel: 'string',
  inputless: true,
  initial: [1],
  languages: ['c'],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(1)',
  },
  code: { c: code },
  steps: () => steps,
};
