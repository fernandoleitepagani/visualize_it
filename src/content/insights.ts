export interface LessonInsight {
  tip?: string;
  funFact?: string;
}

/**
 * Optional teaching notes shown in the "Sobre" panel. Kept separate from the
 * Lesson contract so adding copy never changes the algorithm data.
 */
export const insights: Record<string, LessonInsight> = {
  for: {
    tip: 'O contador externo controla quantas vezes o bloco interno repete; o interno depende do valor atual de i.',
    funFact: 'Um for pode ser reescrito como while com inicialização, teste e incremento explícitos.',
  },
  while: {
    tip: 'O teste acontece antes do corpo. Se a condição já for falsa na entrada, o corpo nunca executa.',
    funFact: 'O while é a forma mais direta de expressar repetição com condição.',
  },
  'do-while': {
    tip: 'O teste acontece depois do corpo, então o bloco executa pelo menos uma vez.',
    funFact: 'É útil quando a primeira leitura ou execução precisa acontecer antes da validação.',
  },
  aritmetica: {
    tip: 'p++ avança uma posição; p += 2 avança duas; p-- volta uma. O tipo do ponteiro define o tamanho do passo.',
    funFact: 'Em C, a aritmética de ponteiros é medida em elementos, não em bytes.',
  },
  soma: {
    tip: 'A cada termo, o total acumulado é a soma de tudo o que já passou.',
    funFact: 'O somatório é um exemplo simples de laço com acumulador.',
  },
  selecao: {
    tip: 'Depois de i rodadas, o prefixo já está ordenado; o próximo menor só pode estar no restante.',
    funFact: 'Faz Θ(n²) comparações mesmo quando o vetor já está ordenado.',
  },
  insercao: {
    tip: 'Se o vetor já está quase ordenado, o laço interno para cedo.',
    funFact: 'É adaptativo: o melhor caso é Θ(n).',
  },
  bolha: {
    tip: 'Se uma passada inteira não tiver trocas, o vetor já está ordenado e o algoritmo pode parar.',
    funFact: 'É estável e também adaptativo no melhor caso.',
  },
  shellsort: {
    tip: 'Gaps maiores movem elementos por distâncias grandes; gaps menores refinam a ordem.',
    funFact: 'A escolha da sequência de gaps muda o desempenho na prática.',
  },
  quicksort: {
    tip: 'A partição coloca o pivô no lugar definitivo; depois basta ordenar as duas partes.',
    funFact: 'O pior caso é Θ(n²), mas o caso médio é Θ(n log n).',
  },
  mergesort: {
    tip: 'A intercalação só funciona porque as duas metades já estão ordenadas.',
    funFact: 'É estável, mas usa memória auxiliar proporcional ao tamanho do vetor.',
  },
  heapsort: {
    tip: 'O heap de máximo deixa o maior elemento na raiz; troque-o com o fim e reduza o heap.',
    funFact: 'É Θ(n log n) no pior caso e ordena no próprio vetor.',
  },
  counting: {
    tip: 'A contagem funciona melhor quando o intervalo de valores é pequeno.',
    funFact: 'Não compara elementos: usa os valores como índices.',
  },
  radix: {
    tip: 'Cada passada ordena por um dígito; a ordem relativa dos dígitos anteriores é preservada.',
    funFact: 'É estável e não comparativo, mas depende da base e da quantidade de dígitos.',
  },
};

export function getInsight(slug: string): LessonInsight | undefined {
  return insights[slug];
}
