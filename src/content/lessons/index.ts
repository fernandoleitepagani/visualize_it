import type { Lesson } from '@/engine/types';
import { lesson as aritmetica } from './aritmetica';
import { lesson as bolha } from './bolha';
import { lesson as bucket } from './bucket';
import { lesson as buscaBinaria } from './busca-binaria';
import { lesson as buscaSequencial } from './busca-sequencial';
import { lesson as counting } from './counting';
import { lesson as doWhile } from './do-while';
import { lesson as filaCircular } from './fila-circular';
import { lesson as filaEncadeada } from './fila-encadeada';
import { lesson as forLoop } from './for';
import { lesson as heapsort } from './heapsort';
import { lesson as insercao } from './insercao';
import { lesson as listaDupla } from './lista-dupla';
import { lesson as listaEncadeada } from './lista-encadeada';
import { lesson as listaSequencial } from './lista-sequencial';
import { lesson as mergesort } from './mergesort';
import { lesson as pilhaEncadeada } from './pilha-encadeada';
import { lesson as pilhaSequencial } from './pilha-sequencial';
import { lesson as quicksort } from './quicksort';
import { lesson as radix } from './radix';
import { lesson as selecao } from './selecao';
import { lesson as shellsort } from './shellsort';
import { lesson as whileLoop } from './while';

/** Every lesson, keyed by slug. The key is the URL segment. */
export const lessons = {
  for: forLoop,
  while: whileLoop,
  'do-while': doWhile,
  aritmetica,
  selecao,
  insercao,
  bolha,
  bucket,
  shellsort,
  quicksort,
  mergesort,
  heapsort,
  counting,
  radix,
  'busca-sequencial': buscaSequencial,
  'busca-binaria': buscaBinaria,
  'lista-sequencial': listaSequencial,
  'lista-encadeada': listaEncadeada,
  'lista-dupla': listaDupla,
  'pilha-sequencial': pilhaSequencial,
  'pilha-encadeada': pilhaEncadeada,
  'fila-circular': filaCircular,
  'fila-encadeada': filaEncadeada,
} satisfies Record<string, Lesson>;

export type LessonSlug = keyof typeof lessons;

export function getLesson(slug: string | undefined): Lesson | undefined {
  if (!slug) return undefined;
  return (lessons as Record<string, Lesson>)[slug];
}
