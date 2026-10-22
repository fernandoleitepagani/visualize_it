import type { VimChallenge, VimState } from './types';

/**
 * Guided missions. Each `solution` is a reference keystroke sequence and is
 * executed by `challenges.test.ts`, so the missions cannot drift from the engine.
 */
export const challenges: VimChallenge[] = [
  {
    slug: 'hjkl',
    title: 'Mover sem as setas',
    brief: 'Use apenas h, j, k e l para chegar à terceira coluna da quarta linha.',
    initialLines: [
      'primeira linha',
      'segunda linha',
      'terceira linha',
      'quarta linha',
      'quinta linha',
      'sexta linha',
    ],
    goal: { kind: 'cursor', at: { line: 3, col: 3 } },
    hint: 'j desce, k sobe, h vai à esquerda e l à direita.',
    solution: ['j', 'j', 'j', 'l', 'l', 'l'],
    par: 6,
  },
  {
    slug: 'contagem',
    title: 'Contagem antes do movimento',
    brief: 'Vá direto para a oitava linha com uma contagem.',
    initialLines: [
      'linha 1',
      'linha 2',
      'linha 3',
      'linha 4',
      'linha 5',
      'linha 6',
      'linha 7',
      'linha 8',
    ],
    goal: { kind: 'cursor', at: { line: 7, col: 0 } },
    hint: 'O número antes do comando multiplica o movimento: 8G.',
    solution: ['8', 'G'],
    par: 2,
  },
  {
    slug: 'palavras',
    title: 'Salto entre palavras',
    brief: 'Pare no início da palavra "buffer".',
    initialLines: ['mova o cursor buffer até a palavra alvo'],
    goal: { kind: 'cursor', at: { line: 0, col: 14 } },
    hint: 'w avança para o início da próxima palavra.',
    solution: ['w', 'w', 'w'],
    par: 3,
  },
  {
    slug: 'linha',
    title: 'Começo e fim da linha',
    brief: 'Vá ao último caractere da linha e volte para o primeiro.',
    initialLines: ['uma linha longa para praticar o movimento'],
    start: { line: 0, col: 10 },
    goal: { kind: 'cursor', at: { line: 0, col: 0 } },
    hint: '$ vai ao fim; 0 volta ao começo.',
    solution: ['$', '0'],
    par: 2,
  },
  {
    slug: 'inserir',
    title: 'Inserir no fim',
    brief: 'Acrescente um "!" no fim da primeira linha.',
    initialLines: ['const total = 0;', 'return total;'],
    goal: { kind: 'text', lines: ['const total = 0;!', 'return total;'] },
    hint: 'A entra no modo insert depois do último caractere.',
    solution: ['A', '!', 'Escape'],
    par: 3,
  },
  {
    slug: 'apagar',
    title: 'Apagar uma palavra',
    brief: 'Apague a palavra "buffer" sem tocar no resto da linha.',
    initialLines: ['const buffer = 3;'],
    start: { line: 0, col: 6 },
    goal: { kind: 'text', lines: ['const  = 3;'] },
    hint: 'diw apaga a palavra sob o cursor.',
    solution: ['d', 'i', 'w'],
    par: 3,
  },
  {
    slug: 'trocar',
    title: 'Trocar dentro das aspas',
    brief: 'Troque "antigo" por "novo".',
    initialLines: ['const name = "antigo";'],
    start: { line: 0, col: 14 },
    goal: { kind: 'text', lines: ['const name = "novo";'] },
    hint: 'ci" altera o conteúdo das aspas e entra em insert.',
    solution: ['c', 'i', '"', 'n', 'o', 'v', 'o', 'Escape'],
    par: 8,
  },
  {
    slug: 'copiar',
    title: 'Duplicar uma linha',
    brief: 'Copie a primeira linha e cole logo abaixo dela.',
    initialLines: ['const a = 1;', 'const b = 2;', 'const c = 3;'],
    goal: {
      kind: 'text',
      lines: ['const a = 1;', 'const a = 1;', 'const b = 2;', 'const c = 3;'],
    },
    hint: 'yy copia a linha; p cola abaixo.',
    solution: ['y', 'y', 'p'],
    par: 3,
  },
  {
    slug: 'desfazer',
    title: 'Desfazer em um toque',
    brief: 'Apague três linhas e recupere tudo com um único undo.',
    initialLines: ['um', 'dois', 'três', 'quatro', 'cinco'],
    goal: { kind: 'text', lines: ['um', 'dois', 'três', 'quatro', 'cinco'], requireDirty: true },
    hint: '3dd apaga três linhas; u desfaz o bloco inteiro.',
    solution: ['3', 'd', 'd', 'u'],
    par: 4,
  },
  {
    slug: 'buscar',
    title: 'Encontrar a segunda ocorrência',
    brief: 'Vá para a segunda ocorrência de "total".',
    initialLines: ['const total = 0;', 'function soma() {', '  return total + 1;', '}', 'total'],
    goal: { kind: 'cursor', at: { line: 2, col: 9 } },
    hint: '/total encontra a primeira; n vai para a próxima.',
    solution: ['/', 't', 'o', 't', 'a', 'l', 'Enter', 'n'],
    par: 8,
  },
  {
    slug: 'substituir',
    title: 'Substituir um caractere',
    brief: 'Troque o x por y sem entrar no modo insert.',
    initialLines: ['let x = 1;'],
    start: { line: 0, col: 4 },
    goal: { kind: 'text', lines: ['let y = 1;'] },
    hint: 'r substitui exatamente um caractere.',
    solution: ['r', 'y'],
    par: 2,
  },
  {
    slug: 'salvar',
    title: 'Escrever e sair',
    brief: 'Encerre a sessão com o comando de salvar e sair.',
    initialLines: ['# rascunho', 'linha dois'],
    goal: { kind: 'message', includes: 'escrito' },
    hint: ':wq escreve o buffer e fecha.',
    solution: [':', 'w', 'q', 'Enter'],
    par: 4,
  },
];

export function getChallenge(slug: string | undefined): VimChallenge | undefined {
  return challenges.find((challenge) => challenge.slug === slug);
}

export function challengeIndex(slug: string | undefined): number {
  if (!slug) return 0;
  const index = challenges.findIndex((challenge) => challenge.slug === slug);
  return index < 0 ? 0 : index;
}

export function goalLabel(challenge: VimChallenge): string {
  const { goal } = challenge;
  switch (goal.kind) {
    case 'cursor':
      return `cursor em ${goal.at.line + 1}:${goal.at.col + 1}`;
    case 'text':
      return 'conteúdo do buffer alterado';
    case 'mode':
      return `modo ${goal.mode}`;
    case 'register':
      return `registrador com "${goal.value}"`;
    case 'message':
      return `mensagem contendo "${goal.includes}"`;
    default:
      return 'buffer salvo';
  }
}

export function isSolved(
  challenge: VimChallenge,
  state: Pick<VimState, 'lines' | 'cursor' | 'mode' | 'register' | 'dirty' | 'message'>,
): boolean {
  const { goal } = challenge;
  switch (goal.kind) {
    case 'cursor':
      return state.cursor.line === goal.at.line && state.cursor.col === goal.at.col;
    case 'text': {
      const matches =
        state.lines.length === goal.lines.length &&
        state.lines.every((line, index) => line === goal.lines[index]);
      return matches && (!goal.requireDirty || state.dirty);
    }
    case 'mode':
      return state.mode === goal.mode;
    case 'register':
      return state.register === goal.value;
    case 'message':
      return state.message.includes(goal.includes);
    default:
      return !state.dirty;
  }
}
