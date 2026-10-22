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
  strings: {
    tip: 'sizeof conta o vetor inteiro, incluindo o terminador; strlen conta só os caracteres antes dele.',
    funFact: 'C não tem um tipo string nativo: uma string é apenas um vetor de char com \\0 no fim.',
  },
  strlen: {
    tip: 'A varredura para no primeiro \\0. Se o terminador estiver faltando, strlen continua lendo memória indefinidamente.',
    funFact: 'O custo é proporcional ao tamanho da string: não existe atalho para saber o comprimento.',
  },
  strcpy: {
    tip: 'O destino precisa ter espaço para todos os caracteres da origem mais o terminador.',
    funFact: 'strncpy não garante o \\0 quando a origem tem n ou mais caracteres; finalize manualmente.',
  },
  strcat: {
    tip: 'Antes de concatenar, confira se o destino comporta o texto atual, o sufixo e o terminador.',
    funFact: 'strncat sempre termina a string, mas ainda pode estourar o buffer se o destino for pequeno demais.',
  },
  strcmp: {
    tip: 'Use strcmp ou strncmp para comparar conteúdo; == compara os endereços dos vetores.',
    funFact: 'O retorno de strcmp só precisa ser negativo, zero ou positivo; não confie em valores como -1 ou 1.',
  },
  'busca-string': {
    tip: 'Sempre teste o retorno de strchr, strrchr e strstr contra NULL antes de desreferenciar o ponteiro.',
    funFact: 'A diferença entre dois ponteiros do mesmo vetor, como r - s, produz um índice do tipo ptrdiff_t.',
  },
  strtok: {
    tip: 'strtok altera a string original trocando delimitadores por \\0; guarde uma cópia se precisar do texto intacto.',
    funFact: 'strtok mantém estado interno e não é reentrante; strtok_r permite tokenizações independentes.',
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
