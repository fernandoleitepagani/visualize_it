import type {
  CallFrame,
  FrameStateName,
  FrameVar,
  Lesson,
  Step,
  VarValue,
} from '@/engine/types';
import { lines } from '@/lib/lines';

const recursaoCode = lines(`
#include <stdio.h>

int fatorial(int n) {
  if (n <= 1) {
    return 1;
  }
  return n * fatorial(n - 1);
}

int main(void) {
  int r = fatorial(4);
  printf("%d\\n", r);
  return 0;
}`);

const lineOf = (text: string): number => {
  const index = recursaoCode.findIndex((line) => line.includes(text));
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
  received?: string,
): CallFrame => ({
  id,
  fn,
  state,
  vars,
  ...(call ? { call } : {}),
  ...(returns ? { returns } : {}),
  ...(received ? { received } : {}),
});

const main = (state: FrameStateName, vars: FrameVar[]): CallFrame =>
  frame('main', 'main', state, vars);

const fatorial = (
  n: number,
  state: FrameStateName,
  returns?: string,
  received?: string,
): CallFrame =>
  frame(
    `fatorial-${n}`,
    'fatorial',
    state,
    [variable('param', 'n', n)],
    `fatorial(${n})`,
    returns,
    received,
  );

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

const mainWaiting = (): CallFrame => main('waiting', []);

export const lesson: Lesson = {
  id: 'recursao',
  title: 'Recursão: a pilha de chamadas',
  subtitle: 'Por que a chamada volta e como o valor sobe',
  description:
    'Mostra fatorial(4) descendo até o caso base e voltando: cada chamada ganha um quadro com ' +
    'seu próprio n, a pilha cresce até n = 1 e o retorno desenrola de dentro para fora, ' +
    'multiplicando 2 * 1, 3 * 2 e 4 * 6 até 24.',
  view: 'callstack',
  panelLabel: 'pilha de chamadas',
  languages: ['c'],
  inputless: true,

  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(n)',
    note: 'Uma chamada por valor de n; a pilha mantém n + 1 quadros no pico, incluindo main.',
  },

  code: { c: recursaoCode },

  steps: () => [
    step(
      lineOf('int r = fatorial'),
      'main chama fatorial(4): novo quadro com n = 4; main fica aguardando.',
      [mainWaiting(), fatorial(4, 'active')],
      { n: 4 },
    ),
    step(lineOf('if (n <= 1)'), 'n = 4: 4 <= 1 é falso; fatorial(4) ainda não é caso base.', [
      mainWaiting(),
      fatorial(4, 'active'),
    ], { n: 4 }),
    step(
      lineOf('return n * fatorial'),
      'fatorial(4) precisa de fatorial(3): fica aguardando 4 * ?; novo quadro com n = 3.',
      [mainWaiting(), fatorial(4, 'waiting'), fatorial(3, 'active')],
      { n: 3, '4 *': '?' },
    ),
    step(lineOf('if (n <= 1)'), 'n = 3: 3 <= 1 é falso.', [
      mainWaiting(),
      fatorial(4, 'waiting'),
      fatorial(3, 'active'),
    ], { n: 3 }),
    step(
      lineOf('return n * fatorial'),
      'fatorial(3) chama fatorial(2): aguarda 3 * ?; novo quadro com n = 2.',
      [mainWaiting(), fatorial(4, 'waiting'), fatorial(3, 'waiting'), fatorial(2, 'active')],
      { n: 2, '3 *': '?' },
    ),
    step(lineOf('if (n <= 1)'), 'n = 2: 2 <= 1 é falso.', [
      mainWaiting(),
      fatorial(4, 'waiting'),
      fatorial(3, 'waiting'),
      fatorial(2, 'active'),
    ], { n: 2 }),
    step(
      lineOf('return n * fatorial'),
      'fatorial(2) chama fatorial(1): aguarda 2 * ?; novo quadro com n = 1.',
      [
        mainWaiting(),
        fatorial(4, 'waiting'),
        fatorial(3, 'waiting'),
        fatorial(2, 'waiting'),
        fatorial(1, 'active'),
      ],
      { n: 1, '2 *': '?' },
    ),
    step(lineOf('if (n <= 1)'), 'n = 1: 1 <= 1 é verdadeiro; chegamos ao caso base.', [
      mainWaiting(),
      fatorial(4, 'waiting'),
      fatorial(3, 'waiting'),
      fatorial(2, 'waiting'),
      fatorial(1, 'active'),
    ], { n: 1 }),
    step(
      lineOf('return 1'),
      'return 1: fatorial(1) devolve 1; o quadro será destruído e o valor desce para fatorial(2).',
      [
        mainWaiting(),
        fatorial(4, 'waiting'),
        fatorial(3, 'waiting'),
        fatorial(2, 'waiting'),
        fatorial(1, 'returning', '1'),
      ],
      { retorno: 1 },
    ),
    step(
      lineOf('return n * fatorial'),
      'fatorial(2) recebe 1: calcula 2 * 1 = 2.',
      [
        mainWaiting(),
        fatorial(4, 'waiting'),
        fatorial(3, 'waiting'),
        fatorial(2, 'active', undefined, '1'),
      ],
      { 'fatorial(n-1)': 1, 'expressão': '2 * 1' },
    ),
    step(
      lineOf('return n * fatorial'),
      'return 2: fatorial(2) devolve 2 para fatorial(3).',
      [
        mainWaiting(),
        fatorial(4, 'waiting'),
        fatorial(3, 'waiting'),
        fatorial(2, 'returning', '2'),
      ],
      { retorno: 2 },
    ),
    step(
      lineOf('return n * fatorial'),
      'fatorial(3) recebe 2: calcula 3 * 2 = 6.',
      [mainWaiting(), fatorial(4, 'waiting'), fatorial(3, 'active', undefined, '2')],
      { 'fatorial(n-1)': 2, 'expressão': '3 * 2' },
    ),
    step(
      lineOf('return n * fatorial'),
      'return 6: fatorial(3) devolve 6 para fatorial(4).',
      [mainWaiting(), fatorial(4, 'waiting'), fatorial(3, 'returning', '6')],
      { retorno: 6 },
    ),
    step(
      lineOf('return n * fatorial'),
      'fatorial(4) recebe 6: calcula 4 * 6 = 24.',
      [mainWaiting(), fatorial(4, 'active', undefined, '6')],
      { 'fatorial(n-1)': 6, 'expressão': '4 * 6' },
    ),
    step(
      lineOf('return n * fatorial'),
      'return 24: fatorial(4) devolve 24 para main.',
      [mainWaiting(), fatorial(4, 'returning', '24')],
      { retorno: 24 },
    ),
    step(
      lineOf('int r = fatorial'),
      'De volta em main: a pilha de fatorial foi liberada e r recebe 24.',
      [main('active', [variable('local', 'r', 24)])],
      { r: 24 },
    ),
    step(lineOf('printf'), 'printf mostra r = 24.', [
      main('active', [variable('local', 'r', 24)]),
    ], { r: 24 }, '24'),
    step(lineOf('return 0'), 'return 0: main termina; r continua 24.', [
      main('done', [variable('local', 'r', 24)]),
    ], { r: 24 }, '24'),
  ],
};
