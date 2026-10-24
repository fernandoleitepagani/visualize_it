/**
 * Site navigation: subjects, their groups and the entries inside each group.
 *
 * This is the single source of truth for the catalog shown on the home page
 * and on the subject pages. Lesson titles and subtitles come from the lesson
 * module itself; the entry only carries the catalog copy.
 */

import type { ViewKind } from '@/engine/types';
import type { SubjectAccent } from '@/theme';
import { getLesson } from './lessons';

export interface LessonEntry {
  kind: 'lesson';
  slug: string;
  blurb: string;
  tag: string;
}

export interface TheoryEntry {
  kind: 'theory';
  slug: string;
  title: string;
  blurb: string;
  tag: string;
}

export type CatalogEntry = LessonEntry | TheoryEntry;

export interface CatalogGroup {
  /** Stable id used by filters and URLs (e.g. `ordenacao`). */
  id: string;
  title: string;
  entries: CatalogEntry[];
}

export type SubjectId = 'aeds-i' | 'aeds-ii' | 'analise';

export interface Subject {
  id: SubjectId;
  title: string;
  short: string;
  description: string;
  /** Palette key used as a subtle accent on cards and headers. */
  accent: SubjectAccent;
  groups: CatalogGroup[];
}

export interface CatalogSection {
  title: string;
  groups: CatalogGroup[];
}

export interface EntryLocation {
  subject: Subject;
  group: CatalogGroup;
  entry: CatalogEntry;
}

export const subjects: Subject[] = [
  {
    id: 'aeds-i',
    title: 'AEDS I',
    short: 'AEDS I',
    description: 'Fundamentos de programação: laços de repetição e aritmética de ponteiros.',
    accent: 'blue',
    groups: [
      {
        id: 'condicionais',
        title: 'Condicionais',
        entries: [
          {
            kind: 'lesson',
            slug: 'if-else',
            blurb: 'escolhe entre caminhos com if, else if e else.',
            tag: 'Θ(1)',
          },
          {
            kind: 'lesson',
            slug: 'switch-case',
            blurb: 'seleciona um caso e encerra com break.',
            tag: 'Θ(1)',
          },
          {
            kind: 'lesson',
            slug: 'ternario',
            blurb: 'decide entre duas expressões em uma linha.',
            tag: 'Θ(1)',
          },
        ],
      },
      {
        id: 'lacos',
        title: 'Laços de repetição',
        entries: [
          {
            kind: 'lesson',
            slug: 'for',
            blurb: 'repetição com número de vezes controlado.',
            tag: 'Θ(n)',
          },
          {
            kind: 'lesson',
            slug: 'while',
            blurb: 'repete enquanto a condição for verdadeira; testa antes.',
            tag: 'Θ(n)',
          },
          {
            kind: 'lesson',
            slug: 'do-while',
            blurb:
              'repete enquanto a condição for verdadeira; testa depois, então executa pelo menos uma vez.',
            tag: 'Θ(n)',
          },
        ],
      },
      {
        id: 'funcoes-recursao',
        title: 'Funções e recursão',
        entries: [
          {
            kind: 'lesson',
            slug: 'funcoes',
            blurb: 'chamada, parâmetros por valor, retorno e escopo.',
            tag: 'Θ(1)',
          },
          {
            kind: 'lesson',
            slug: 'recursao',
            blurb: 'a pilha cresce até o caso base e desenrola no retorno.',
            tag: 'Θ(n)',
          },
        ],
      },
      {
        id: 'ponteiros',
        title: 'Ponteiros',
        entries: [
          {
            kind: 'lesson',
            slug: 'ponteiros-basico',
            blurb: 'endereço, & e * em memória.',
            tag: 'Θ(1)',
          },
          {
            kind: 'lesson',
            slug: 'aritmetica',
            blurb: 'operações utilizando ponteiros.',
            tag: 'Θ(n)',
          },
          {
            kind: 'lesson',
            slug: 'ponteiros-duplos',
            blurb: 'um ponteiro que aponta para outro ponteiro.',
            tag: 'Θ(1)',
          },
        ],
      },
      {
        id: 'string',
        title: 'String',
        entries: [
          { kind: 'lesson', slug: 'strings', blurb: 'texto como vetor de char terminado em \\0.', tag: 'Θ(n)' },
          { kind: 'lesson', slug: 'strlen', blurb: 'conta os caracteres até o terminador.', tag: 'Θ(n)' },
          { kind: 'lesson', slug: 'strcpy', blurb: 'copia com strcpy ou limita com strncpy.', tag: 'Θ(n)' },
          { kind: 'lesson', slug: 'strcat', blurb: 'anexa texto ao fim da string.', tag: 'Θ(n + m)' },
          { kind: 'lesson', slug: 'strcmp', blurb: 'compara conteúdo em ordem lexicográfica.', tag: 'Θ(n)' },
          { kind: 'lesson', slug: 'busca-string', blurb: 'procura caracteres e substrings.', tag: 'Θ(n·m)' },
          { kind: 'lesson', slug: 'strtok', blurb: 'separa a string em tokens com delimitadores.', tag: 'Θ(n)' },
        ],
      },
      {
        id: 'matematica',
        title: 'Matemática',
        entries: [
          {
            kind: 'lesson',
            slug: 'soma',
            blurb: 'acumula os termos e mostra a soma parcial como área.',
            tag: 'Θ(n)',
          },
        ],
      },
      {
        id: 'dados-memoria',
        title: 'Dados e memória',
        entries: [
          { kind: 'lesson', slug: 'structs', blurb: 'agrupa campos em um novo tipo de dado.', tag: 'conceito' },
          { kind: 'lesson', slug: 'alocacao-memoria', blurb: 'reserva e libera memória no heap com malloc e free.', tag: 'conceito' },
          { kind: 'lesson', slug: 'arquivos', blurb: 'abre, escreve e fecha arquivos com FILE.', tag: 'conceito' },
          { kind: 'lesson', slug: 'vetores-matrizes', blurb: 'índices, linhas e colunas em C.', tag: 'Θ(n)' },
          { kind: 'lesson', slug: 'classes-vetores-matrizes', blurb: 'coleções como atributos de uma classe.', tag: 'conceito' },
        ],
      },
      {
        id: 'orientacao-objetos',
        title: 'Orientação a objetos',
        entries: [
          { kind: 'lesson', slug: 'oop', blurb: 'objetos, classes e os quatro pilares da POO.', tag: 'conceito' },
          { kind: 'lesson', slug: 'abstracao', blurb: 'expõe o essencial e esconde detalhes de implementação.', tag: 'conceito' },
          { kind: 'lesson', slug: 'classes', blurb: 'define um novo tipo com atributos e métodos.', tag: 'conceito' },
          { kind: 'lesson', slug: 'construtores', blurb: 'inicializa objetos no momento da criação.', tag: 'conceito' },
          { kind: 'lesson', slug: 'encapsulamento', blurb: 'protege o estado atrás de uma interface pública.', tag: 'conceito' },
          { kind: 'lesson', slug: 'heranca', blurb: 'reaproveita e especializa comportamento entre classes.', tag: 'conceito' },
          { kind: 'lesson', slug: 'polimorfismo', blurb: 'um método, várias implementações em tempo de execução.', tag: 'conceito' },
          { kind: 'lesson', slug: 'metodos-acessores', blurb: 'getters e setters preservam o encapsulamento.', tag: 'conceito' },
          { kind: 'lesson', slug: 'excecoes', blurb: 'trata erros com throw, try e catch.', tag: 'conceito' },
        ],
      },
    ],
  },
  {
    id: 'aeds-ii',
    title: 'AEDS II',
    short: 'AEDS II',
    description: 'Ordenação, busca e estruturas lineares com visualizações passo a passo.',
    accent: 'teal',
    groups: [
      {
        id: 'ordenacao',
        title: 'Ordenação',
        entries: [
          {
            kind: 'lesson',
            slug: 'selecao',
            blurb: 'Encontra o menor a cada rodada e o move para o início.',
            tag: 'Θ(n²)',
          },
          {
            kind: 'lesson',
            slug: 'insercao',
            blurb: 'Empurra cada elemento até a posição correta na parte já ordenada.',
            tag: 'Θ(n) – Θ(n²)',
          },
          {
            kind: 'lesson',
            slug: 'bolha',
            blurb: 'Compara vizinhos; o menor sobe para o início a cada rodada.',
            tag: 'Θ(n) – Θ(n²)',
          },
          {
            kind: 'lesson',
            slug: 'shellsort',
            blurb: 'Inserção com gaps decrescentes.',
            tag: '≈ Θ(n^1.25)',
          },
          {
            kind: 'lesson',
            slug: 'quicksort',
            blurb: 'Particiona em torno de um pivô e repete recursivamente.',
            tag: 'Θ(n·log n) médio',
          },
          {
            kind: 'lesson',
            slug: 'mergesort',
            blurb: 'Divide ao meio e intercala as metades ordenadas.',
            tag: 'Θ(n·log n)',
          },
          {
            kind: 'lesson',
            slug: 'heapsort',
            blurb: 'Constrói um heap de máximo e extrai repetidamente.',
            tag: 'Θ(n·log n)',
          },
          {
            kind: 'lesson',
            slug: 'counting',
            blurb: 'Conta ocorrências e distribui direto na posição final.',
            tag: 'Θ(n + k)',
          },
          {
            kind: 'lesson',
            slug: 'bucket',
            blurb: 'Distribui em baldes por faixa e ordena cada balde com inserção.',
            tag: 'Θ(n) – Θ(n²)',
          },
          {
            kind: 'lesson',
            slug: 'radix',
            blurb: 'Ordena dígito por dígito, do menos ao mais significativo.',
            tag: 'Θ(d·(n + b))',
          },
        ],
      },
      {
        id: 'busca',
        title: 'Busca',
        entries: [
          {
            kind: 'lesson',
            slug: 'busca-sequencial',
            blurb: 'Percorre o vetor do início ao fim comparando com o alvo.',
            tag: 'Θ(n)',
          },
          {
            kind: 'lesson',
            slug: 'busca-binaria',
            blurb: 'Descarta metade do vetor ordenado a cada comparação.',
            tag: 'Θ(log n)',
          },
        ],
      },
      {
        id: 'estruturas-lineares',
        title: 'Estruturas Lineares',
        entries: [
          {
            kind: 'lesson',
            slug: 'lista-sequencial',
            blurb: 'Lista em vetor. Inserir/remover no meio empurra elementos.',
            tag: 'Θ(1) – Θ(n)',
          },
          {
            kind: 'lesson',
            slug: 'lista-encadeada',
            blurb: 'Nós com um ponteiro prox. Cresce sob demanda.',
            tag: 'Θ(1) – Θ(n)',
          },
          {
            kind: 'lesson',
            slug: 'lista-dupla',
            blurb: 'Nós com ant e prox — percorre nos dois sentidos.',
            tag: 'Θ(1) – Θ(n)',
          },
          {
            kind: 'lesson',
            slug: 'pilha-sequencial',
            blurb: 'LIFO em vetor com topo. Capacidade fixa.',
            tag: 'Θ(1)',
          },
          {
            kind: 'lesson',
            slug: 'pilha-encadeada',
            blurb: 'LIFO com nós dinâmicos, sem limite fixo.',
            tag: 'Θ(1)',
          },
          {
            kind: 'lesson',
            slug: 'fila-circular',
            blurb: 'FIFO em vetor com índices que dão a volta.',
            tag: 'Θ(1)',
          },
          {
            kind: 'lesson',
            slug: 'fila-encadeada',
            blurb: 'FIFO com nós dinâmicos e ponteiros nas duas pontas.',
            tag: 'Θ(1)',
          },
        ],
      },
    ],
  },
  {
    id: 'analise',
    title: 'Análise',
    short: 'Análise',
    description: 'Complexidade assintótica e provas por indução para justificar os algoritmos.',
    accent: 'violet',
    groups: [
      {
        id: 'analise',
        title: 'Análise de complexidade',
        entries: [
          {
            kind: 'theory',
            slug: 'complexidade',
            title: 'Complexidade',
            blurb: 'Notações Θ, O e Ω, contagem de operações e classes de custo.',
            tag: 'leitura',
          },
          {
            kind: 'theory',
            slug: 'inducao',
            title: 'Provas por Indução',
            blurb: 'Indução simples, forte e estrutural em algoritmos.',
            tag: 'leitura',
          },
        ],
      },
    ],
  },
];

/** Backwards-compatible view of the same data, grouped by subject title. */
export const catalog: CatalogSection[] = subjects.map((subject) => ({
  title: subject.title,
  groups: subject.groups,
}));

export function getSubject(id: string | undefined): Subject | undefined {
  if (!id) return undefined;
  return subjects.find((subject) => subject.id === id);
}

export function getSubjectEntries(subject: Subject): EntryLocation[] {
  return subject.groups.flatMap((group) =>
    group.entries.map((entry) => ({ subject, group, entry })),
  );
}

export function allEntryLocations(): EntryLocation[] {
  return subjects.flatMap(getSubjectEntries);
}

export function getEntryLocation(slug: string | undefined): EntryLocation | undefined {
  if (!slug) return undefined;
  return allEntryLocations().find((location) => location.entry.slug === slug);
}

export function getEntryTitle(entry: CatalogEntry): string {
  if (entry.kind === 'theory') return entry.title;
  return getLesson(entry.slug)?.title ?? entry.slug;
}

export function getEntrySubtitle(entry: CatalogEntry): string | undefined {
  if (entry.kind === 'theory') return undefined;
  return getLesson(entry.slug)?.subtitle;
}

export function getEntryView(entry: CatalogEntry): ViewKind | undefined {
  if (entry.kind === 'theory') return undefined;
  return getLesson(entry.slug)?.view ?? 'bars';
}

export function getEntryPath(entry: CatalogEntry): string {
  return entry.kind === 'lesson' ? `/algoritmos/${entry.slug}` : `/teoria/${entry.slug}`;
}

/** Lowercase and strip accents so search is forgiving. */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function matchesEntry(location: EntryLocation, query: string): boolean {
  const needle = normalize(query.trim());
  if (!needle) return true;

  const haystack = [
    getEntryTitle(location.entry),
    getEntrySubtitle(location.entry) ?? '',
    location.entry.blurb,
    location.entry.tag,
    location.subject.title,
    location.group.title,
  ]
    .map(normalize)
    .join(' ');

  return haystack.includes(needle);
}

export function searchEntries(query: string): EntryLocation[] {
  if (!query.trim()) return allEntryLocations();
  return allEntryLocations().filter((location) => matchesEntry(location, query));
}
