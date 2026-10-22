import type { Cell, Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';
import {
  cellList,
  lineOf,
  stringRow,
  stringStep,
  textWithTerminator,
} from './string-utils';

const code = lines(`
#include <stdio.h>
#include <string.h>

int main() {
  char origem[] = "BANANA";
  char copia1[7] = "";
  char copia2[7] = "";

  strcpy(copia1, origem);
  strncpy(copia2, origem, 3);
  copia2[3] = '\\0';

  printf("%s\\n", copia1);
  printf("%s\\n", copia2);
  return 0;
}`);

const strcpyLine = lineOf(code, 'strcpy(copia1');
const strncpyLine = lineOf(code, 'strncpy(copia2');
const terminatorLine = lineOf(code, 'copia2[3]');
const printCopia1Line = lineOf(code, 'printf("%s\\n", copia1');
const printCopia2Line = lineOf(code, 'printf("%s\\n", copia2');

const word = 'BANANA';
const limit = 3;

/** `char copia[7] = ""` starts as an empty string; the rest is unused capacity. */
const emptyBuffer: Array<Cell['val']> = ['\\0', null, null, null, null, null, null];
const afterStrcpy: Array<Cell['val']> = [...word, '\\0'];
const afterStrncpy: Array<Cell['val']> = ['B', 'A', 'N', '\\0', null, null, null];

const origem = (active?: number) => {
  if (active === undefined) return textWithTerminator(word);
  if (active >= word.length) return textWithTerminator(word, {}, {}, ['i']);
  return textWithTerminator(word, { [active]: 'active' }, { [active]: ['i'] });
};

const destination = (
  values: Array<Cell['val']>,
  states: Record<number, string> = {},
  labels: Record<number, string[]> = {},
) => cellList(values, states, labels);

const steps: Step[] = [
  stringStep(
    lineOf(code, 'char origem[]'),
    'origem guarda BANANA; copia1 e copia2 são buffers vazios com espaço para 7 bytes.',
    [
      stringRow('origem', origem()),
      stringRow('copia1', destination(emptyBuffer)),
      stringRow('copia2', destination(emptyBuffer)),
    ],
  ),
];

for (let i = 0; i < word.length; i++) {
  const values = emptyBuffer.map((value, index) => (index <= i ? word[index] : value));
  steps.push(
    stringStep(
      strcpyLine,
      `strcpy copia origem[${i}] = '${word[i]}' para copia1[${i}].`,
      [
        stringRow('origem', origem(i)),
        stringRow('copia1', destination(values, { [i]: 'write' })),
        stringRow('copia2', destination(emptyBuffer)),
      ],
      {
        links: [{ fromRow: 0, fromIndex: i, toRow: 1, toIndex: i }],
        vars: { i, 'origem[i]': word[i], 'copia1[i]': word[i] },
      },
    ),
  );
}

steps.push(
  stringStep(
    strcpyLine,
    "strcpy também copia o '\\0' no índice 6: agora copia1 é uma string completa.",
    [
      stringRow('origem', origem(word.length)),
      stringRow('copia1', destination(afterStrcpy, { 6: 'write' })),
      stringRow('copia2', destination(emptyBuffer)),
    ],
    {
      links: [{ fromRow: 0, fromIndex: word.length, toRow: 1, toIndex: word.length }],
      vars: { i: word.length, 'origem[6]': '\\0', copia1: 'BANANA' },
      result: { label: 'copia1', value: 'BANANA' },
    },
  ),
);

for (let i = 0; i < limit; i++) {
  const values = emptyBuffer.map((value, index) => (index <= i ? word[index] : value));
  steps.push(
    stringStep(
      strncpyLine,
      `strncpy copia origem[${i}] = '${word[i]}' para copia2[${i}] e respeita o limite de ${limit}.`,
      [
        stringRow('origem', origem(i)),
        stringRow('copia1', destination(afterStrcpy)),
        stringRow('copia2', destination(values, { [i]: 'write' })),
      ],
      {
        links: [{ fromRow: 0, fromIndex: i, toRow: 2, toIndex: i }],
        vars: { i, n: limit, 'copia2[i]': word[i] },
      },
    ),
  );
}

steps.push(
  stringStep(
    strncpyLine,
    "O limite de 3 foi atingido: strncpy copiou B, A e N, mas não copiou o '\\0' de origem[3]. O terminador em copia2[3] veio da inicialização vazia do vetor.",
    [
      stringRow('origem', origem()),
      stringRow('copia1', destination(afterStrcpy)),
      stringRow('copia2', destination(afterStrncpy)),
    ],
    {
      vars: { n: limit, 'copia2[3]': '\\0', terminador: 'da inicialização' },
    },
  ),
);

steps.push(
  stringStep(
    terminatorLine,
    "copia2[3] = '\\0' escreve o terminador manualmente; agora copia2 vale BAN. Se o vetor não tivesse sido zerado, esta linha seria obrigatória.",
    [
      stringRow('origem', origem()),
      stringRow('copia1', destination(afterStrcpy)),
      stringRow('copia2', destination(afterStrncpy, { 3: 'write' })),
    ],
    {
      vars: { 'copia2[3]': '\\0', copia2: 'BAN' },
      result: { label: 'copia2', value: 'BAN' },
    },
  ),
);

steps.push(
  stringStep(
    printCopia1Line,
    'printf imprime copia1: BANANA.',
    [
      stringRow('origem', origem()),
      stringRow('copia1', destination(afterStrcpy)),
      stringRow('copia2', destination(afterStrncpy)),
    ],
    { vars: { copia1: 'BANANA' }, result: { label: 'saída', value: 'BANANA' } },
  ),
);

steps.push(
  stringStep(
    printCopia2Line,
    'printf imprime copia2: BAN. strcpy copiou a palavra toda; strncpy parou no limite de 3.',
    [
      stringRow('origem', origem()),
      stringRow('copia1', destination(afterStrcpy)),
      stringRow('copia2', destination(afterStrncpy)),
    ],
    {
      vars: { copia1: 'BANANA', copia2: 'BAN' },
      result: { label: 'saída', value: 'BANANA · BAN' },
    },
  ),
);

export const lesson: Lesson = {
  id: 'strcpy',
  title: 'strcpy e strncpy',
  subtitle: 'Copiar strings',
  description:
    'strcpy copia a origem inteira, incluindo o terminador, e não conhece o tamanho do destino: é rápido, mas pode estourar o buffer. strncpy limita a cópia a n caracteres; quando a origem é maior ou igual a n, o terminador não é copiado e precisa ser escrito manualmente. Sempre reserve espaço para o \\0.',
  view: 'strings',
  panelLabel: 'string',
  inputless: true,
  initial: [1],
  languages: ['c'],
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(n)',
  },
  code: { c: code },
  steps: () => steps,
};
