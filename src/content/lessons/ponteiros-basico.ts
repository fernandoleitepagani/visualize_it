import type { Lesson, PointerBox, Step, VarValue } from '@/engine/types';
import { lines } from '@/lib/lines';

const basicCode = lines(`
#include <stdio.h>

int main() {
  int x = 42;
  int y = 7;
  int *p = &x;

  printf("x = %d\\n", x);
  printf("&x = %p\\n", (void *)&x);
  printf("p = %p\\n", (void *)p);
  printf("*p = %d\\n", *p);

  *p = 99;
  printf("x agora = %d\\n", x);

  p = &y;
  printf("*p agora = %d\\n", *p);

  return 0;
}`);

const lineOf = (text: string): number => {
  const index = basicCode.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada: ${text}`);
  return index;
};

const xBox = (value: number, state?: PointerBox['state']): PointerBox => ({
  id: 'x',
  name: 'x',
  type: 'int',
  address: '0x1000',
  value,
  ...(state ? { state } : {}),
});

const yBox = (value: number, state?: PointerBox['state']): PointerBox => ({
  id: 'y',
  name: 'y',
  type: 'int',
  address: '0x1004',
  value,
  ...(state ? { state } : {}),
});

const pBox = (
  targetId: 'x' | 'y',
  value: string,
  state?: PointerBox['state'],
): PointerBox => ({
  id: 'p',
  name: 'p',
  type: 'int *',
  address: '0x1008',
  value,
  targetId,
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
  id: 'ponteiros-basico',
  title: 'Ponteiros: endereço e valor',
  subtitle: 'O que &x guarda e o que *p acessa',
  description:
    'Mostra a relação entre uma variável, seu endereço e um ponteiro: &x devolve o endereço, ' +
    'p guarda esse endereço e *p lê ou escreve o valor apontado. Endereços fictícios, modelo ' +
    'didático de 32 bits.',
  view: 'pointers',
  panelLabel: 'memória',
  languages: ['c'],
  inputless: true,

  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(1)',
    note: 'Cada leitura ou escrita por ponteiro é Θ(1).',
  },

  code: { c: basicCode },

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
      'int *p = &x: p nasce em 0x1008 e guarda o endereço de x.',
      [xBox(42), yBox(7), pBox('x', '0x1000', 'write')],
      { ...baseVars, p: '0x1000', '&p': '0x1008', '*p': 42 },
    ),
    step(
      lineOf('printf("x = %d'),
      'printf lê x diretamente: 42.',
      [xBox(42, 'compare'), yBox(7), pBox('x', '0x1000')],
      { x: 42, '&x': '0x1000', p: '0x1000', '&p': '0x1008', '*p': 42 },
      'x = 42',
    ),
    step(
      lineOf('printf("&x = %p'),
      'printf mostra o endereço de x: 0x1000.',
      [xBox(42, 'compare'), yBox(7), pBox('x', '0x1000')],
      { '&x': '0x1000', p: '0x1000', '&p': '0x1008' },
      '&x = 0x1000',
    ),
    step(
      lineOf('printf("p = %p'),
      'printf mostra o valor guardado em p: 0x1000, o endereço de x.',
      [xBox(42), yBox(7), pBox('x', '0x1000', 'compare')],
      { p: '0x1000', '&p': '0x1008', '*p': 42 },
      'p = 0x1000',
    ),
    step(
      lineOf('printf("*p = %d'),
      'printf segue a seta de p e lê x: 42.',
      [xBox(42, 'compare'), yBox(7), pBox('x', '0x1000', 'compare')],
      { p: '0x1000', '&p': '0x1008', '*p': 42 },
      '*p = 42',
    ),
    step(
      lineOf('*p = 99'),
      '*p = 99 escreve no endereço apontado; x vira 99.',
      [xBox(99, 'write'), yBox(7), pBox('x', '0x1000', 'active')],
      { p: '0x1000', '&p': '0x1008', '*p': 99 },
    ),
    step(
      lineOf('printf("x agora'),
      'printf confirma que x agora vale 99.',
      [xBox(99, 'compare'), yBox(7), pBox('x', '0x1000')],
      { x: 99, '&x': '0x1000', p: '0x1000', '*p': 99 },
      'x agora = 99',
    ),
    step(
      lineOf('p = &y'),
      'p = &y move p para o endereço de y; x continua 99.',
      [xBox(99), yBox(7), pBox('y', '0x1004', 'write')],
      { x: 99, p: '0x1004', '&p': '0x1008', '*p': 7 },
    ),
    step(
      lineOf('printf("*p agora'),
      'printf segue p, agora aponta para y, e lê 7.',
      [xBox(99), yBox(7, 'compare'), pBox('y', '0x1004', 'active')],
      { p: '0x1004', '&p': '0x1008', '*p': 7 },
      '*p agora = 7',
    ),
    step(
      lineOf('return 0'),
      'return 0: fim do programa; p continua apontando para y.',
      [xBox(99), yBox(7), pBox('y', '0x1004')],
      { x: 99, '&x': '0x1000', y: 7, '&y': '0x1004', p: '0x1004', '&p': '0x1008', '*p': 7 },
    ),
  ],
};
