import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';
import { lineOf, stringRow, stringStep, textWithTerminator } from './string-utils';

const code = lines(`
#include <stdio.h>
#include <string.h>

int main() {
  char s[] = "BANANA";
  size_t n = strlen(s);
  printf("%zu\\n", n);
  return 0;
}`);

const callLine = lineOf(code, 'strlen(s)');
const printLine = lineOf(code, 'printf("%zu');
const text = 'BANANA';

function frame(active: number): ReturnType<typeof textWithTerminator> {
  if (active >= text.length) {
    return textWithTerminator(text, {}, {}, ['i']);
  }
  return textWithTerminator(text, { [active]: 'active' }, { [active]: ['i'] });
}

const steps: Step[] = [
  stringStep(
    lineOf(code, 'char s[]'),
    'A string ocupa sete bytes: seis letras e o terminador.',
    [stringRow('s', textWithTerminator(text, {}, { 0: ['i'] }))],
    { vars: { i: 0, 's[0]': text[0], n: 0 } },
  ),
];

for (let i = 0; i < text.length; i++) {
  steps.push(
    stringStep(
      callLine,
      `s[${i}] = '${text[i]}' é diferente de '\\0'; o contador vira ${i + 1}.`,
      [stringRow('s', frame(i))],
      { vars: { i, 's[i]': text[i], n: i + 1 } },
    ),
  );
}

steps.push(
  stringStep(
    callLine,
    's[6] é o terminador; a varredura para e o tamanho é 6.',
    [stringRow('s', frame(text.length))],
    { vars: { i: text.length, 's[6]': '\\0', n: text.length } },
  ),
);

steps.push(
  stringStep(
    printLine,
    'strlen devolve 6: o terminador não entra na contagem.',
    [stringRow('s', frame(text.length))],
    { vars: { n: text.length }, result: { label: 'strlen(s)', value: '6' } },
  ),
);

export const lesson: Lesson = {
  id: 'strlen',
  title: 'strlen',
  subtitle: 'Tamanho de uma string',
  description:
    'strlen percorre a string a partir do primeiro caractere e conta quantos passos existem até encontrar o terminador \\0. O terminador não entra na conta: "BANANA" tem 6 caracteres e ocupa 7 bytes. Por isso sizeof(s) e strlen(s) podem dar resultados diferentes.',
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
