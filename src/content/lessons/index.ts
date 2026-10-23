import type { Lesson } from '@/engine/types';
import { lesson as aritmetica } from './aritmetica';
import {
  lessonAbstracao,
  lessonAcessores,
  lessonClasses,
  lessonConstrutores,
  lessonEncapsulamento,
  lessonExcecoes,
  lessonHeranca,
  lessonOop,
  lessonPolimorfismo,
} from './aeds1-oop';
import { lesson as lessonArquivos } from './arquivos';
import {
  lessonClassesVetores,
  lessonMemoria,
  lessonStrings,
  lessonStructs,
  lessonVetoresMatrizes,
} from './aeds1-memory';
import { lesson as bolha } from './bolha';
import { lesson as bucket } from './bucket';
import { lesson as buscaBinaria } from './busca-binaria';
import { lesson as buscaSequencial } from './busca-sequencial';
import { lesson as buscaString } from './busca-string';
import { lesson as counting } from './counting';
import { lesson as doWhile } from './do-while';
import { lesson as funcoes } from './funcoes';
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
import { lesson as ponteirosBasico } from './ponteiros-basico';
import { lesson as ponteirosDuplos } from './ponteiros-duplos';
import { lesson as quicksort } from './quicksort';
import { lesson as recursao } from './recursao';
import { lesson as radix } from './radix';
import { lesson as selecao } from './selecao';
import { lesson as shellsort } from './shellsort';
import { lesson as soma } from './soma';
import { lesson as strcat } from './strcat';
import { lesson as strcmp } from './strcmp';
import { lesson as strcpy } from './strcpy';
import { lesson as strlen } from './strlen';
import { lesson as strtok } from './strtok';
import { lesson as whileLoop } from './while';

/** Every lesson, keyed by slug. The key is the URL segment. */
export const lessons = {
  for: forLoop,
  while: whileLoop,
  'do-while': doWhile,
  funcoes,
  recursao,
  'ponteiros-basico': ponteirosBasico,
  'ponteiros-duplos': ponteirosDuplos,
  aritmetica,
  oop: lessonOop,
  abstracao: lessonAbstracao,
  classes: lessonClasses,
  construtores: lessonConstrutores,
  encapsulamento: lessonEncapsulamento,
  heranca: lessonHeranca,
  polimorfismo: lessonPolimorfismo,
  'metodos-acessores': lessonAcessores,
  excecoes: lessonExcecoes,
  structs: lessonStructs,
  'alocacao-memoria': lessonMemoria,
  strings: lessonStrings,
  strlen,
  strcpy,
  strcat,
  strcmp,
  'busca-string': buscaString,
  strtok,
  arquivos: lessonArquivos,
  'vetores-matrizes': lessonVetoresMatrizes,
  'classes-vetores-matrizes': lessonClassesVetores,
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
  soma,
} satisfies Record<string, Lesson>;

export type LessonSlug = keyof typeof lessons;

export function getLesson(slug: string | undefined): Lesson | undefined {
  if (!slug) return undefined;
  return (lessons as Record<string, Lesson>)[slug];
}
