import type { Cell, Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';
import { cellList, lineOf, stringRow, stringStep } from './string-utils';

const code = lines(`
#include <stdio.h>
#include <string.h>

int main() {
  char frase[] = "um,dois,tres";
  char *token = strtok(frase, ",");

  while (token != NULL) {
    printf("%s\\n", token);
    token = strtok(NULL, ",");
  }
  return 0;
}`);

const firstLine = lineOf(code, 'token = strtok(frase');
const nextLine = lineOf(code, 'token = strtok(NULL');
const whileLine = lineOf(code, 'while (token != NULL)');
const printLine = lineOf(code, 'printf("%s\\n", token)');

const text = 'um,dois,tres';
const terminatorIndex = text.length;
const baseValues: Array<Cell['val']> = [...text, '\\0'];

function frame(
  replaced: number[] = [],
  active: number[] = [],
  tokenIndex?: number,
  writing?: number,
): ReturnType<typeof stringRow> {
  const states: Record<number, string> = { [terminatorIndex]: 'terminator' };
  for (const index of replaced) states[index] = 'terminator';
  if (writing !== undefined) states[writing] = 'write';
  for (const index of active) states[index] = 'active';

  const labels: Record<number, string[]> =
    tokenIndex === undefined ? {} : { [tokenIndex]: ['token'] };
  const values = baseValues.map((value, index) =>
    replaced.includes(index) || index === writing ? '\\0' : value,
  );

  return stringRow('frase', cellList(values, states, labels));
}

const steps: Step[] = [
  stringStep(
    lineOf(code, 'char frase[]'),
    'A frase guarda um,dois,tres. As duas vírgulas ainda estão intactas; o terminador fica no índice 12.',
    [frame()],
  ),
  stringStep(
    firstLine,
    "strtok encontra a vírgula no índice 2, escreve '\\0' no lugar dela e devolve o token \"um\".",
    [frame([], [0, 1], 0, 2)],
    {
      vars: { token: 'um', posicao: 0, delimitador: ',' },
      result: { label: 'tokens', value: 'um' },
    },
  ),
  stringStep(
    whileLine,
    'token vale "um", então é diferente de NULL e o laço executa.',
    [frame([2], [0, 1], 0)],
    {
      vars: { token: 'um', condicao: 'verdadeira' },
      result: { label: 'tokens', value: 'um' },
    },
  ),
  stringStep(
    printLine,
    'printf imprime o token atual: "um".',
    [frame([2], [0, 1], 0)],
    { vars: { token: 'um', saida: 'um' }, result: { label: 'saída', value: 'um' } },
  ),
  stringStep(
    nextLine,
    "A próxima chamada começa depois do terminador, encontra a vírgula no índice 7, escreve '\\0' e devolve \"dois\".",
    [frame([2], [3, 4, 5, 6], 3, 7)],
    {
      vars: { token: 'dois', posicao: 3, delimitador: ',' },
      result: { label: 'tokens', value: 'um · dois' },
    },
  ),
  stringStep(
    whileLine,
    'token vale "dois", então o laço continua.',
    [frame([2, 7], [3, 4, 5, 6], 3)],
    {
      vars: { token: 'dois', condicao: 'verdadeira' },
      result: { label: 'tokens', value: 'um · dois' },
    },
  ),
  stringStep(
    printLine,
    'printf imprime o token atual: "dois".',
    [frame([2, 7], [3, 4, 5, 6], 3)],
    { vars: { token: 'dois', saida: 'dois' }, result: { label: 'saída', value: 'um · dois' } },
  ),
  stringStep(
    nextLine,
    'Sem outra vírgula, strtok percorre a string até o terminador no índice 12 e devolve o último token: "tres".',
    [frame([2, 7], [8, 9, 10, 11], 8)],
    {
      vars: { token: 'tres', posicao: 8 },
      result: { label: 'tokens', value: 'um · dois · tres' },
    },
  ),
  stringStep(
    whileLine,
    'token vale "tres", então o laço continua.',
    [frame([2, 7], [8, 9, 10, 11], 8)],
    {
      vars: { token: 'tres', condicao: 'verdadeira' },
      result: { label: 'tokens', value: 'um · dois · tres' },
    },
  ),
  stringStep(
    printLine,
    'printf imprime o token atual: "tres".',
    [frame([2, 7], [8, 9, 10, 11], 8)],
    {
      vars: { token: 'tres', saida: 'tres' },
      result: { label: 'saída', value: 'um · dois · tres' },
    },
  ),
  stringStep(
    nextLine,
    'A chamada seguinte não encontra mais tokens e devolve NULL.',
    [frame([2, 7])],
    {
      vars: { token: 'NULL' },
      result: { label: 'tokens', value: 'um · dois · tres' },
    },
  ),
  stringStep(
    whileLine,
    'token é NULL: a condição é falsa e o laço termina. As vírgulas viraram terminadores.',
    [frame([2, 7])],
    {
      vars: { token: 'NULL', condicao: 'falsa' },
      result: { label: 'saída', value: 'um · dois · tres' },
    },
  ),
];

export const lesson: Lesson = {
  id: 'strtok',
  title: 'strtok',
  subtitle: 'Separar strings',
  description:
    'strtok quebra uma string em tokens usando um ou mais delimitadores. A primeira chamada recebe a string; as seguintes recebem NULL para continuar de onde parou. A função modifica a string original, trocando cada delimitador por \\0, e mantém estado interno entre chamadas. Por isso ela não é reentrante: para concorrência ou chamadas aninhadas, use strtok_r.',
  view: 'strings',
  panelLabel: 'string',
  inputless: true,
  initial: [1],
  languages: ['c'],
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(1)',
    note: 'Espaço auxiliar constante; a string original é alterada no lugar.',
  },
  code: { c: code },
  steps: () => steps,
};
