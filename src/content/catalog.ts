/**
 * Site navigation: the sections shown on the home page, in order.
 *
 * Card copy mirrors the legacy `index.html` catalog. Titles for lessons come
 * from the lesson itself; theory pages carry their own title.
 */

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
  title: string;
  entries: CatalogEntry[];
}

export interface CatalogSection {
  title: string;
  groups: CatalogGroup[];
}

export const catalog: CatalogSection[] = [
  {
    title: 'AEDS I',
    groups: [
      {
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
        title: 'Ponteiros',
        entries: [
          {
            kind: 'lesson',
            slug: 'aritmetica',
            blurb: 'operações utilizando ponteiros.',
            tag: 'Θ(n)',
          },
        ],
      },
      {
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
    ],
  },
  {
    title: 'AEDS II',
    groups: [
      {
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
            slug: 'radix',
            blurb: 'Ordena dígito por dígito, do menos ao mais significativo.',
            tag: 'Θ(d·(n + b))',
          },
        ],
      },
      {
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
    title: 'Análise',
    groups: [
      {
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
