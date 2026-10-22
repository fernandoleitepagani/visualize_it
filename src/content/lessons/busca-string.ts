import type { Cell, Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';
import { cellList, lineOf, stringRow, stringStep } from './string-utils';

const code = lines(`
#include <stdio.h>
#include <string.h>

int main() {
  char s[] = "BANANA";

  char *p = strchr(s, 'N');
  char *q = strrchr(s, 'N');
  char *r = strstr(s, "ANA");
  char *nulo = strchr(s, 'Z');

  printf("%td %td %td\\n", p - s, q - s, r - s);
  printf("%p\\n", (void *)nulo);
  return 0;
}`);

const strchrLine = lineOf(code, 'strchr(s,');
const strrchrLine = lineOf(code, 'strrchr(s,');
const strstrLine = lineOf(code, 'strstr(s,');
const nullLine = lineOf(code, 'char *nulo');
const finalLine = lineOf(code, 'printf("%td %td %td');

const text = 'BANANA';
const sValues: Array<Cell['val']> = [...text, '\\0'];

function sRow(
  states: Record<number, string> = {},
  labels: Record<number, string[]> = {},
) {
  return stringRow('s', cellList(sValues, { 6: 'terminator', ...states }, labels));
}

const steps: Step[] = [
  stringStep(
    lineOf(code, 'char s[]'),
    'A string s guarda BANANA e termina no índice 6.',
    [sRow()],
  ),
];

for (let i = 0; i <= 2; i++) {
  const found = i === 2;
  steps.push(
    stringStep(
      strchrLine,
      found
        ? "strchr encontrou o primeiro 'N' no índice 2 e devolveu &s[2]."
        : `strchr procura 'N'; s[${i}] = '${text[i]}' não é o alvo.`,
      [sRow({ [i]: 'active' }, { [i]: found ? ['i', 'p'] : ['i'] })],
      { vars: { i, 's[i]': text[i], p: found ? '&s[2]' : 'procurando' } },
    ),
  );
}

for (const i of [5, 4]) {
  const found = i === 4;
  steps.push(
    stringStep(
      strrchrLine,
      found
        ? "strrchr encontrou o último 'N' no índice 4 e devolveu &s[4]."
        : `strrchr continua procurando 'N'; s[${i}] = '${text[i]}' não é o alvo.`,
      [sRow({ [i]: 'active' }, { [i]: found ? ['q'] : ['i'], 2: ['p'] })],
      { vars: { i, 's[i]': text[i], q: found ? '&s[4]' : 'procurando' } },
    ),
  );
}

steps.push(
  stringStep(
    strstrLine,
    'strstr tenta alinhar "ANA" no índice 0, mas B é diferente de A. A tentativa falha.',
    [sRow({ 0: 'diff' }, { 2: ['p'], 4: ['q'] })],
    { vars: { tentativa: 0, resultado: 'falhou' } },
  ),
);

steps.push(
  stringStep(
    strstrLine,
    'No índice 1, "ANA" coincide com s[1..3]. strstr devolve &s[1].',
    [sRow({ 1: 'compare', 2: 'compare', 3: 'compare' }, { 1: ['r'], 2: ['p'], 4: ['q'] })],
    {
      vars: { tentativa: 1, 'r - s': 1, resultado: 'achou' },
      result: { label: 'posições', value: 'p=2 · q=4 · r=1' },
    },
  ),
);

steps.push(
  stringStep(
    nullLine,
    "A busca por 'Z' não encontra nada e devolve NULL. Sempre teste o ponteiro antes de usá-lo.",
    [sRow({}, { 1: ['r'], 2: ['p'], 4: ['q'] })],
    { vars: { nulo: 'NULL' } },
  ),
);

steps.push(
  stringStep(
    finalLine,
    'As posições são p = 2, q = 4 e r = 1. A subtração r - s devolve o índice da substring.',
    [sRow({ 1: 'compare', 2: 'compare', 3: 'compare' }, { 1: ['r'], 2: ['p'], 4: ['q'] })],
    {
      vars: { p: 2, q: 4, r: 1, nulo: 'NULL' },
      result: { label: 'posições', value: 'p=2 · q=4 · r=1' },
    },
  ),
);

export const lesson: Lesson = {
  id: 'busca-string',
  title: 'strchr, strrchr e strstr',
  subtitle: 'Buscar em strings',
  description:
    'strchr procura a primeira ocorrência de um caractere; strrchr procura a última; strstr procura uma substring. As três funções devolvem um ponteiro para o início da ocorrência ou NULL quando não encontram. A subtração entre ponteiros, como r - s, devolve o índice. A busca é linear, mas strstr pode comparar várias posições e chegar a Θ(n·m) no pior caso.',
  view: 'strings',
  panelLabel: 'string',
  inputless: true,
  initial: [1],
  languages: ['c'],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n·m)' },
    space: 'Θ(1)',
    note: 'strchr e strrchr são Θ(n); strstr pode ser Θ(n·m) na implementação ingênua.',
  },
  code: { c: code },
  steps: () => steps,
};
