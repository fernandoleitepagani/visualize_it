import type { Lesson, PointerBox, Step, VarValue } from '@/engine/types';
import { lines } from '@/lib/lines';

const doubleCode = lines(`
#include <stdio.h>

int main() {
  int x = 42;
  int y = 7;
  int *p = &x;
  int **pp = &p;

  printf("pp = %p\\n", (void *)pp);
  printf("*pp = %p\\n", (void *)*pp);
  printf("**pp = %d\\n", **pp);

  *pp = &y;
  printf("p agora = %p\\n", (void *)p);
  printf("**pp agora = %d\\n", **pp);

  **pp = 99;
  printf("y agora = %d\\n", y);

  return 0;
}`);

const lineOf = (text: string): number => {
  const index = doubleCode.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada: ${text}`);
  return index;
};

const xBox = (
  value: number,
  state?: PointerBox['state'],
  labels?: string[],
): PointerBox => ({
  id: 'x',
  name: 'x',
  type: 'int',
  address: '0x1000',
  value,
  ...(state ? { state } : {}),
  ...(labels ? { labels } : {}),
});

const yBox = (
  value: number,
  state?: PointerBox['state'],
  labels?: string[],
): PointerBox => ({
  id: 'y',
  name: 'y',
  type: 'int',
  address: '0x1004',
  value,
  ...(state ? { state } : {}),
  ...(labels ? { labels } : {}),
});

const pBox = (
  targetId: 'x' | 'y',
  value: string,
  state?: PointerBox['state'],
  labels?: string[],
): PointerBox => ({
  id: 'p',
  name: 'p',
  type: 'int *',
  address: '0x1008',
  value,
  targetId,
  ...(state ? { state } : {}),
  ...(labels ? { labels } : {}),
});

const ppBox = (state?: PointerBox['state']): PointerBox => ({
  id: 'pp',
  name: 'pp',
  type: 'int **',
  address: '0x100c',
  value: '0x1008',
  targetId: 'p',
  ...(state ? { state } : {}),
});

const baseVars: Record<string, VarValue> = {
  x: 42,
  '&x': '0x1000',
  y: 7,
  '&y': '0x1004',
};

const step = (
  line: number,
  desc: string,
  boxes: PointerBox[],
  vars: Record<string, VarValue> = {},
  result?: string,
): Step => ({
  line,
  desc,
  ...(Object.keys(vars).length > 0 ? { vars } : {}),
  pointers: {
    boxes,
    ...(result ? { result: { label: 'saída', value: result } } : {}),
  },
});

export const lesson: Lesson = {
  id: 'ponteiros-duplos',
  title: 'Ponteiros duplos',
  subtitle: 'Quando *pp ainda é um ponteiro',
  description:
    'Mostra um ponteiro para ponteiro: pp guarda &p, *pp é o próprio p e **pp chega ao valor ' +
    'final. *pp = &y muda o alvo de p; **pp = 99 altera y. Endereços fictícios, modelo didático ' +
    'de 32 bits.',
  view: 'pointers',
  panelLabel: 'memória',
  languages: ['c'],
  inputless: true,

  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(1)',
    note: 'Cada desreferência é Θ(1); a lição não percorre estruturas.',
  },

  code: { c: doubleCode },

  steps: () => [
    step(
      lineOf('int x = 42'),
      'int x = 42: x nasce em 0x1000 e guarda 42.',
      [xBox(42, 'write')],
      { x: 42, '&x': '0x1000' },
    ),
    step(
      lineOf('int y = 7'),
      'int y = 7: y nasce em 0x1004 e guarda 7.',
      [xBox(42), yBox(7, 'write')],
      baseVars,
    ),
    step(
      lineOf('int *p = &x'),
      'int *p = &x: p guarda o endereço de x.',
      [xBox(42), yBox(7), pBox('x', '0x1000', 'write')],
      { ...baseVars, p: '0x1000', '&p': '0x1008', '*p': 42 },
    ),
    step(
      lineOf('int **pp = &p'),
      'int **pp = &p: pp guarda o endereço de p e fecha a cadeia pp → p → x.',
      [xBox(42), yBox(7), pBox('x', '0x1000', undefined, ['*pp']), ppBox('write')],
      {
        ...baseVars,
        p: '0x1000',
        '&p': '0x1008',
        '*p': 42,
        pp: '0x1008',
        '&pp': '0x100c',
        '*pp': '0x1000',
        '**pp': 42,
      },
    ),
    step(
      lineOf('printf("pp = %p'),
      'printf mostra o valor de pp: 0x1008, o endereço de p.',
      [xBox(42), yBox(7), pBox('x', '0x1000', undefined, ['*pp']), ppBox('compare')],
      { pp: '0x1008', '&pp': '0x100c', '*pp': '0x1000', p: '0x1000', '&p': '0x1008' },
      'pp = 0x1008',
    ),
    step(
      lineOf('printf("*pp = %p'),
      'printf segue pp e lê p: *pp vale 0x1000, o endereço de x.',
      [xBox(42), yBox(7), pBox('x', '0x1000', 'compare', ['*pp']), ppBox('active')],
      { pp: '0x1008', '&pp': '0x100c', '*pp': '0x1000', p: '0x1000', '&p': '0x1008' },
      '*pp = 0x1000',
    ),
    step(
      lineOf('printf("**pp = %d'),
      'printf segue pp duas vezes e chega a x: **pp vale 42.',
      [
        xBox(42, 'compare', ['**pp']),
        yBox(7),
        pBox('x', '0x1000', 'compare', ['*pp']),
        ppBox('active'),
      ],
      { pp: '0x1008', '&pp': '0x100c', '*pp': '0x1000', p: '0x1000', '&p': '0x1008', '**pp': 42 },
      '**pp = 42',
    ),
    step(
      lineOf('*pp = &y'),
      '*pp = &y muda o valor de p, não de x; a seta de p passa a apontar para y.',
      [
        xBox(42),
        yBox(7, undefined, ['**pp']),
        pBox('y', '0x1004', 'write', ['*pp']),
        ppBox('active'),
      ],
      {
        pp: '0x1008',
        '&pp': '0x100c',
        '*pp': '0x1004',
        p: '0x1004',
        '&p': '0x1008',
        '**pp': 7,
      },
    ),
    step(
      lineOf('printf("p agora'),
      'printf confirma que p agora guarda 0x1004, o endereço de y.',
      [
        xBox(42),
        yBox(7, undefined, ['**pp']),
        pBox('y', '0x1004', 'compare', ['*pp']),
        ppBox(),
      ],
      { p: '0x1004', '&p': '0x1008', '*pp': '0x1004', '**pp': 7 },
      'p agora = 0x1004',
    ),
    step(
      lineOf('printf("**pp agora'),
      'printf segue pp e p e lê y: **pp agora vale 7.',
      [
        xBox(42),
        yBox(7, 'compare', ['**pp']),
        pBox('y', '0x1004', 'compare', ['*pp']),
        ppBox('active'),
      ],
      { pp: '0x1008', '&pp': '0x100c', '*pp': '0x1004', p: '0x1004', '**pp': 7 },
      '**pp agora = 7',
    ),
    step(
      lineOf('**pp = 99'),
      '**pp = 99 percorre pp → p → y e escreve 99 em y.',
      [
        xBox(42),
        yBox(99, 'write', ['**pp']),
        pBox('y', '0x1004', 'compare', ['*pp']),
        ppBox('active'),
      ],
      { pp: '0x1008', '&pp': '0x100c', '*pp': '0x1004', p: '0x1004', '**pp': 99, y: 99 },
    ),
    step(
      lineOf('printf("y agora'),
      'printf confirma que y agora vale 99.',
      [
        xBox(42),
        yBox(99, 'compare', ['**pp']),
        pBox('y', '0x1004', undefined, ['*pp']),
        ppBox(),
      ],
      { y: 99, '&y': '0x1004', pp: '0x1008', '&pp': '0x100c', '*pp': '0x1004', '**pp': 99 },
      'y agora = 99',
    ),
    step(
      lineOf('return 0'),
      'return 0: fim do programa; p aponta para y e pp continua apontando para p.',
      [
        xBox(42),
        yBox(99, undefined, ['**pp']),
        pBox('y', '0x1004', undefined, ['*pp']),
        ppBox(),
      ],
      {
        x: 42,
        '&x': '0x1000',
        y: 99,
        '&y': '0x1004',
        p: '0x1004',
        '&p': '0x1008',
        '*p': 99,
        pp: '0x1008',
        '&pp': '0x100c',
        '*pp': '0x1004',
        '**pp': 99,
      },
    ),
  ],
};
