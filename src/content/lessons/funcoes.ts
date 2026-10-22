import type {
  CallFrame,
  FrameStateName,
  FrameVar,
  Lesson,
  Step,
  VarValue,
} from '@/engine/types';
import { lines } from '@/lib/lines';

const funcoesCode = lines(`
#include <stdio.h>

int dobro(int n) {
  n = n * 2;
  return n;
}

int soma(int a, int b) {
  int total = a + b;
  int d = dobro(a);
  return total + d;
}

int main(void) {
  int x = 3;
  int y = 4;
  int z = soma(x, y);
  printf("%d\\n", z);
  return 0;
}`);

const lineOf = (text: string): number => {
  const index = funcoesCode.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada: ${text}`);
  return index;
};

const variable = (
  kind: FrameVar['kind'],
  name: string,
  value: string | number,
  state?: FrameVar['state'],
): FrameVar => ({ kind, name, value, ...(state ? { state } : {}) });

const frame = (
  id: string,
  fn: string,
  state: FrameStateName,
  vars: FrameVar[],
  call?: string,
  returns?: string,
): CallFrame => ({
  id,
  fn,
  state,
  vars,
  ...(call ? { call } : {}),
  ...(returns ? { returns } : {}),
});

const main = (state: FrameStateName, vars: FrameVar[]): CallFrame =>
  frame('main', 'main', state, vars);

const soma = (state: FrameStateName, vars: FrameVar[], returns?: string): CallFrame =>
  frame('soma', 'soma', state, vars, 'soma(x, y)', returns);

const dobro = (state: FrameStateName, vars: FrameVar[], returns?: string): CallFrame =>
  frame('dobro', 'dobro', state, vars, 'dobro(a)', returns);

const step = (
  line: number,
  desc: string,
  frames: CallFrame[],
  vars: Record<string, VarValue> = {},
  result?: string,
): Step => ({
  line,
  desc,
  ...(Object.keys(vars).length > 0 ? { vars } : {}),
  callstack: {
    frames,
    ...(result ? { result: { label: 'saída', value: result } } : {}),
  },
});

export const lesson: Lesson = {
  id: 'funcoes',
  title: 'Funções: parâmetros, retorno e escopo',
  subtitle: 'O que acontece com x, a e n a cada chamada',
  description:
    'Mostra uma chamada aninhada em C: main chama soma, que chama dobro. Cada função ganha ' +
    'seu próprio quadro na pilha; parâmetros são cópias, variáveis locais vivem só naquele ' +
    'quadro e o valor de retorno volta para quem chamou.',
  view: 'callstack',
  panelLabel: 'pilha de chamadas',
  languages: ['c'],
  inputless: true,

  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(1)',
    note: 'A cadeia de chamadas é fixa; cada chamada, atribuição e retorno custa Θ(1).',
  },

  code: { c: funcoesCode },

  steps: () => [
    step(lineOf('int x = 3'), 'main começa: x é local e vale 3.', [
      main('active', [variable('local', 'x', 3)]),
    ], { x: 3 }),
    step(lineOf('int y = 4'), 'y = 4: outra variável local de main.', [
      main('active', [variable('local', 'x', 3), variable('local', 'y', 4)]),
    ], { x: 3, y: 4 }),
    step(
      lineOf('int z = soma'),
      'Chamada soma(x, y): main fica aguardando e soma recebe as cópias a = 3 e b = 4.',
      [
        main('waiting', [variable('local', 'x', 3), variable('local', 'y', 4)]),
        soma('active', [
          variable('param', 'a', 3),
          variable('param', 'b', 4),
        ]),
      ],
      { a: 3, b: 4, x: 3 },
    ),
    step(lineOf('int total = a + b'), 'total = 3 + 4 = 7: a variável nasce dentro de soma.', [
      main('waiting', [variable('local', 'x', 3), variable('local', 'y', 4)]),
      soma('active', [
        variable('param', 'a', 3),
        variable('param', 'b', 4),
        variable('local', 'total', 7),
      ]),
    ], { total: 7 }),
    step(
      lineOf('int d = dobro'),
      'Chamada dobro(a): soma aguarda e dobro recebe uma cópia de a em n = 3.',
      [
        main('waiting', [variable('local', 'x', 3), variable('local', 'y', 4)]),
        soma('waiting', [
          variable('param', 'a', 3),
          variable('param', 'b', 4),
          variable('local', 'total', 7),
        ]),
        dobro('active', [variable('param', 'n', 3)]),
      ],
      { a: 3, n: 3, x: 3 },
    ),
    step(
      lineOf('n = n * 2'),
      'n = n * 2 deixa n = 6. É só a cópia de dobro; a e x continuam 3.',
      [
        main('waiting', [variable('local', 'x', 3), variable('local', 'y', 4)]),
        soma('waiting', [
          variable('param', 'a', 3),
          variable('param', 'b', 4),
          variable('local', 'total', 7),
        ]),
        dobro('active', [variable('param', 'n', 6, 'changed')]),
      ],
      { n: 6, a: 3, x: 3 },
    ),
    step(
      lineOf('return n'),
      'return n devolve 6: o quadro de dobro será destruído e o valor vai para quem chamou.',
      [
        main('waiting', [variable('local', 'x', 3), variable('local', 'y', 4)]),
        soma('waiting', [
          variable('param', 'a', 3),
          variable('param', 'b', 4),
          variable('local', 'total', 7),
        ]),
        dobro('returning', [variable('param', 'n', 6)], '6'),
      ],
      { retorno: 6 },
    ),
    step(
      lineOf('int d = dobro'),
      'De volta em soma: o quadro de dobro sumiu e d recebe 6; a continua 3.',
      [
        main('waiting', [variable('local', 'x', 3), variable('local', 'y', 4)]),
        soma('active', [
          variable('param', 'a', 3),
          variable('param', 'b', 4),
          variable('local', 'total', 7),
          variable('local', 'd', 6),
        ]),
      ],
      { d: 6, a: 3, x: 3 },
    ),
    step(
      lineOf('return total + d'),
      'return total + d: soma devolve 7 + 6 = 13.',
      [
        main('waiting', [variable('local', 'x', 3), variable('local', 'y', 4)]),
        soma(
          'returning',
          [
            variable('param', 'a', 3),
            variable('param', 'b', 4),
            variable('local', 'total', 7),
            variable('local', 'd', 6),
          ],
          '13',
        ),
      ],
      { retorno: 13 },
    ),
    step(
      lineOf('int z = soma'),
      'De volta em main: o quadro de soma sumiu e z recebe 13.',
      [
        main('active', [
          variable('local', 'x', 3),
          variable('local', 'y', 4),
          variable('local', 'z', 13),
        ]),
      ],
      { x: 3, y: 4, z: 13 },
    ),
    step(lineOf('printf'), 'printf mostra z = 13.', [
      main('active', [
        variable('local', 'x', 3),
        variable('local', 'y', 4),
        variable('local', 'z', 13),
      ]),
    ], { x: 3, y: 4, z: 13 }, '13'),
    step(lineOf('return 0'), 'return 0: main termina e a pilha é liberada; z continua 13.', [
      main('done', [
        variable('local', 'x', 3),
        variable('local', 'y', 4),
        variable('local', 'z', 13),
      ]),
    ], { x: 3, y: 4, z: 13 }, '13'),
  ],
};
