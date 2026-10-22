import type { VimCursor } from './types';

export interface CheatPractice {
  lines: string[];
  cursor: VimCursor;
}

export interface CheatItem {
  id: string;
  keys: string[];
  label: string;
  essential?: boolean;
  practice?: CheatPractice;
}

export interface CheatGroup {
  id: string;
  title: string;
  items: CheatItem[];
}

const line = 'pratique movimentos nesta linha de exemplo';

export const cheatsheet: CheatGroup[] = [
  {
    id: 'modos',
    title: 'Modos',
    items: [
      { id: 'i', keys: ['i'], label: 'inserir antes do cursor', essential: true, practice: { lines: [line], cursor: { line: 0, col: 0 } } },
      { id: 'a', keys: ['a'], label: 'inserir depois do cursor', essential: true },
      { id: 'I', keys: ['I'], label: 'inserir no primeiro caractere da linha' },
      { id: 'A', keys: ['A'], label: 'inserir no fim da linha', essential: true },
      { id: 'o', keys: ['o'], label: 'abrir uma linha abaixo' },
      { id: 'O', keys: ['O'], label: 'abrir uma linha acima' },
      { id: 'Esc', keys: ['Esc'], label: 'voltar ao modo normal', essential: true },
      { id: 'v', keys: ['v'], label: 'seleção por caractere', essential: true },
      { id: 'V', keys: ['V'], label: 'seleção por linha' },
    ],
  },
  {
    id: 'movimento',
    title: 'Movimento',
    items: [
      { id: 'hjkl', keys: ['h', 'j', 'k', 'l'], label: 'esquerda, baixo, cima, direita', essential: true },
      { id: 'w', keys: ['w'], label: 'próximo início de palavra', essential: true, practice: { lines: [line], cursor: { line: 0, col: 0 } } },
      { id: 'b', keys: ['b'], label: 'início da palavra anterior', essential: true },
      { id: 'e', keys: ['e'], label: 'fim da palavra atual ou seguinte', essential: true },
      { id: '0', keys: ['0'], label: 'primeiro caractere da linha', essential: true },
      { id: '^', keys: ['^'], label: 'primeiro caractere não vazio' },
      { id: '$', keys: ['$'], label: 'último caractere da linha', essential: true },
      { id: 'gg', keys: ['g', 'g'], label: 'primeira linha do buffer', essential: true },
      { id: 'G', keys: ['G'], label: 'última linha do buffer', essential: true },
      { id: 'countG', keys: ['{n}', 'G'], label: 'linha n do buffer' },
      { id: 'f', keys: ['f', '<char>'], label: 'pular para o próximo caractere' },
      { id: 't', keys: ['t', '<char>'], label: 'parar antes do próximo caractere' },
      { id: ';/', keys: [';', ','], label: 'repetir o último f/t para frente ou para trás' },
      { id: 'meia-tela', keys: ['Ctrl-d', 'Ctrl-u'], label: 'meia tela para baixo ou para cima' },
    ],
  },
  {
    id: 'edicao',
    title: 'Edição',
    items: [
      { id: 'x', keys: ['x'], label: 'apagar o caractere sob o cursor', essential: true },
      { id: 'r', keys: ['r', '<char>'], label: 'substituir um caractere', essential: true },
      { id: 'tilde', keys: ['~'], label: 'alternar maiúscula/minúscula' },
      { id: 'p', keys: ['p'], label: 'colar depois do cursor', essential: true },
      { id: 'P', keys: ['P'], label: 'colar antes do cursor' },
      { id: 'J', keys: ['J'], label: 'juntar a linha seguinte' },
      { id: 'dot', keys: ['.'], label: 'repetir a última alteração', essential: true },
    ],
  },
  {
    id: 'operadores',
    title: 'Operadores',
    items: [
      { id: 'd', keys: ['d'], label: 'apagar (espera um movimento)', essential: true },
      { id: 'c', keys: ['c'], label: 'alterar (apaga e entra em insert)', essential: true },
      { id: 'y', keys: ['y'], label: 'copiar', essential: true },
      { id: 'dw', keys: ['d', 'w'], label: 'apagar até a próxima palavra', essential: true },
      { id: 'dd', keys: ['d', 'd'], label: 'apagar a linha inteira', essential: true },
      { id: 'd$', keys: ['d', '$'], label: 'apagar até o fim da linha' },
      { id: 'diw', keys: ['d', 'i', 'w'], label: 'apagar a palavra sob o cursor', essential: true },
      { id: 'ciw', keys: ['c', 'i', 'w'], label: 'alterar a palavra sob o cursor', essential: true },
      { id: 'yy', keys: ['y', 'y'], label: 'copiar a linha inteira', essential: true },
    ],
  },
  {
    id: 'text-objects',
    title: 'Text objects',
    items: [
      { id: 'iw', keys: ['i', 'w'], label: 'dentro da palavra', essential: true },
      { id: 'aw', keys: ['a', 'w'], label: 'palavra e o espaço ao redor' },
      { id: 'i-quote', keys: ['i', '"'], label: 'dentro das aspas duplas', essential: true },
      { id: 'a-quote', keys: ['a', '"'], label: 'aspas duplas incluídas' },
      { id: 'i-paren', keys: ['i', '('], label: 'dentro dos parênteses', essential: true },
      { id: 'a-paren', keys: ['a', '('], label: 'parênteses incluídos' },
      { id: 'i-single', keys: ['i', "'"], label: 'dentro das aspas simples' },
      { id: 'a-single', keys: ['a', "'"], label: 'aspas simples incluídas' },
    ],
  },
  {
    id: 'busca',
    title: 'Busca',
    items: [
      { id: '/', keys: ['/texto'], label: 'buscar para frente', essential: true },
      { id: '?', keys: ['?texto'], label: 'buscar para trás' },
      { id: 'n', keys: ['n'], label: 'próxima ocorrência', essential: true },
      { id: 'N', keys: ['N'], label: 'ocorrência anterior' },
      { id: 'star', keys: ['*'], label: 'buscar a palavra sob o cursor' },
      { id: 'hash', keys: ['#'], label: 'buscar a palavra sob o cursor para trás' },
    ],
  },
  {
    id: 'arquivo',
    title: 'Arquivo e comandos',
    items: [
      { id: 'w', keys: [':w'], label: 'escrever o buffer', essential: true },
      { id: 'q', keys: [':q'], label: 'fechar (bloqueia se houver alterações)' },
      { id: 'qbang', keys: [':q!'], label: 'fechar descartando alterações' },
      { id: 'wq', keys: [':wq'], label: 'escrever e fechar', essential: true },
      { id: 'x', keys: [':x'], label: 'escrever e fechar (atalho)' },
      { id: 'number', keys: [':set number'], label: 'mostrar números de linha' },
      { id: 'goto', keys: [':{n}'], label: 'ir para a linha n' },
    ],
  },
  {
    id: 'historico',
    title: 'Histórico',
    items: [
      { id: 'u', keys: ['u'], label: 'desfazer', essential: true },
      { id: 'redo', keys: ['Ctrl-r'], label: 'refazer', essential: true },
    ],
  },
];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function filterCheatsheet(query: string): CheatGroup[] {
  const needle = normalize(query.trim());
  if (!needle) return cheatsheet;

  return cheatsheet
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        normalize(
          `${item.keys.join(' ')} ${item.keys.join('')} ${item.label} ${group.title}`,
        ).includes(needle),
      ),
    }))
    .filter((group) => group.items.length > 0);
}
