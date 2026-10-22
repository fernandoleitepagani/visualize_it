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
  char destino[16] = "BAN";
  char sufixo[] = "ANA";

  strcat(destino, sufixo);
  strncat(destino, "!!!!!", 2);
  printf("%s\\n", destino);
  return 0;
}`);

const strcatLine = lineOf(code, 'strcat(destino');
const strncatLine = lineOf(code, 'strncat(destino');
const finalLine = lineOf(code, 'printf("%s\\n", destino');

const initial: Array<Cell['val']> = [
  'B',
  'A',
  'N',
  '\\0',
  null,
  null,
  null,
  null,
  null,
  null,
];
const afterStrcat: Array<Cell['val']> = [
  'B',
  'A',
  'N',
  'A',
  'N',
  'A',
  '\\0',
  null,
  null,
  null,
];
const afterStrncat: Array<Cell['val']> = [
  'B',
  'A',
  'N',
  'A',
  'N',
  'A',
  '!',
  '!',
  '\\0',
  null,
];

const destination = (
  values: Array<Cell['val']>,
  states: Record<number, string> = {},
  labels: Record<number, string[]> = {},
) => cellList(values, states, labels);

const sufixo = (active?: number) =>
  active === undefined
    ? textWithTerminator('ANA')
    : textWithTerminator('ANA', { [active]: 'active' }, { [active]: ['i'] });

const acrescento = (active?: number) =>
  active === undefined
    ? textWithTerminator('!!!!!')
    : textWithTerminator('!!!!!', { [active]: 'active' }, { [active]: ['i'] });

const steps: Step[] = [
  stringStep(
    lineOf(code, 'char destino[16]'),
    'destino começa com BAN e ainda tem espaço livre; sufixo guarda ANA.',
    [
      stringRow('destino', destination(initial)),
      stringRow('sufixo', sufixo()),
      stringRow('acrescento', acrescento()),
    ],
  ),
];

for (let d = 0; d <= 3; d++) {
  steps.push(
    stringStep(
      strcatLine,
      d === 3
        ? "strcat encontrou o '\\0' no índice 3: é aqui que a cópia começa."
        : `strcat procura o fim de destino; destino[${d}] = '${initial[d]}' ainda não é o terminador.`,
      [
        stringRow('destino', destination(initial, { [d]: 'active' }, { [d]: ['d'] })),
        stringRow('sufixo', sufixo()),
        stringRow('acrescento', acrescento()),
      ],
      { vars: { d, 'destino[d]': initial[d] } },
    ),
  );
}

for (let i = 0; i < 3; i++) {
  const values = afterStrcat.map((_, index) =>
    index <= 3 + i ? (index === 3 + i ? 'ANA'[i] : afterStrcat[index]) : null,
  );
  steps.push(
    stringStep(
      strcatLine,
      `strcat copia sufixo[${i}] = '${'ANA'[i]}' para destino[${3 + i}].`,
      [
        stringRow('destino', destination(values, { [3 + i]: 'write' })),
        stringRow('sufixo', sufixo(i)),
        stringRow('acrescento', acrescento()),
      ],
      {
        links: [{ fromRow: 1, fromIndex: i, toRow: 0, toIndex: 3 + i }],
        vars: { i, 'sufixo[i]': 'ANA'[i], 'destino[i]': 'ANA'[i] },
      },
    ),
  );
}

steps.push(
  stringStep(
    strcatLine,
    "O terminador de sufixo também é copiado. destino passa a ser BANANA.",
    [
      stringRow('destino', destination(afterStrcat, { 6: 'write' })),
      stringRow('sufixo', sufixo(3)),
      stringRow('acrescento', acrescento()),
    ],
    {
      links: [{ fromRow: 1, fromIndex: 3, toRow: 0, toIndex: 6 }],
      vars: { i: 3, destino: 'BANANA' },
      result: { label: 'destino', value: 'BANANA' },
    },
  ),
);

for (let i = 0; i < 2; i++) {
  const values =
    i === 0
      ? (['B', 'A', 'N', 'A', 'N', 'A', '!', '\\0', null, null] as Array<Cell['val']>)
      : afterStrncat;
  steps.push(
    stringStep(
      strncatLine,
      `strncat copia apenas ${i + 1} caractere(s) de "!!!!!": destino[${6 + i}] = '!'.`,
      [
        stringRow('destino', destination(values, { [6 + i]: 'write' })),
        stringRow('sufixo', sufixo()),
        stringRow('acrescento', acrescento(i)),
      ],
      {
        links: [{ fromRow: 2, fromIndex: i, toRow: 0, toIndex: 6 + i }],
        vars: { i, limite: 2, 'destino[i]': '!' },
        result: { label: 'destino', value: i === 0 ? 'BANANA!' : 'BANANA!!' },
      },
    ),
  );
}

steps.push(
  stringStep(
    strncatLine,
    "O limite de 2 foi respeitado e o terminador foi recolocado em destino[8].",
    [
      stringRow('destino', destination(afterStrncat, { 8: 'write' })),
      stringRow('sufixo', sufixo()),
      stringRow('acrescento', acrescento()),
    ],
    {
      vars: { limite: 2, destino: 'BANANA!!' },
      result: { label: 'destino', value: 'BANANA!!' },
    },
  ),
);

steps.push(
  stringStep(
    finalLine,
    'O resultado final é BANANA!!. strncat nunca escreve mais que o limite pedido.',
    [
      stringRow('destino', destination(afterStrncat)),
      stringRow('sufixo', sufixo()),
      stringRow('acrescento', acrescento()),
    ],
    { vars: { destino: 'BANANA!!' }, result: { label: 'resultado', value: 'BANANA!!' } },
  ),
);

export const lesson: Lesson = {
  id: 'strcat',
  title: 'strcat e strncat',
  subtitle: 'Concatenar strings',
  description:
    'strcat encontra o terminador do destino e copia o sufixo inteiro, incluindo o \\0. O destino precisa ter espaço para o texto atual, o sufixo e o terminador. strncat limita quantos caracteres são anexados e sempre termina a string; ele é mais seguro, mas ainda depende de o buffer ter espaço suficiente.',
  view: 'strings',
  panelLabel: 'string',
  inputless: true,
  initial: [1],
  languages: ['c'],
  complexity: {
    time: { best: 'Θ(n + m)', avg: 'Θ(n + m)', worst: 'Θ(n + m)' },
    space: 'Θ(n + m)',
  },
  code: { c: code },
  steps: () => steps,
};
