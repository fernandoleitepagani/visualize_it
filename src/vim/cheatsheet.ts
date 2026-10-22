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
}

export interface CheatGroup {
  id: string;
  title: string;
  /** Snippet loaded by the "praticar" action in the group header. */
  practice: CheatPractice;
  items: CheatItem[];
}

const line = 'mova o cursor buffer até a palavra alvo';

export const cheatsheet: CheatGroup[] = [
  {
    id: 'modos',
    title: 'Modos',
    practice: { lines: ['escreva algo aqui, saia com Esc e volte com i'], cursor: { line: 0, col: 0 } },
    items: [
      { id: 'i', keys: ['i'], label: 'inserir antes do cursor', essential: true },
      { id: 'a', keys: ['a'], label: 'inserir depois do cursor', essential: true },
      { id: 'I', keys: ['I'], label: 'inserir no primeiro caractere da linha' },
      { id: 'A', keys: ['A'], label: 'inserir no fim da linha', essential: true },
      { id: 'o', keys: ['o'], label: 'abrir uma linha abaixo' },
      { id: 'O', keys: ['O'], label: 'abrir uma linha acima' },
      { id: 'Esc', keys: ['Esc'], label: 'voltar ao modo normal', essential: true },
      { id: 'ctrl-bracket', keys: ['Ctrl-['], label: 'voltar ao normal (alias de Esc)' },
      { id: 'v', keys: ['v'], label: 'selecionar por caractere', essential: true },
      { id: 'V', keys: ['V'], label: 'selecionar por linha' },
    ],
  },
  {
    id: 'movimento',
    title: 'Movimento',
    practice: { lines: [line], cursor: { line: 0, col: 0 } },
    items: [
      { id: 'hjkl', keys: ['h', 'j', 'k', 'l'], label: 'esquerda, baixo, cima, direita', essential: true },
      { id: 'w', keys: ['w'], label: 'ir ao próximo início de palavra', essential: true },
      { id: 'b', keys: ['b'], label: 'ir ao início da palavra anterior', essential: true },
      { id: 'e', keys: ['e'], label: 'ir ao fim da palavra atual ou seguinte', essential: true },
      { id: '0', keys: ['0'], label: 'ir ao primeiro caractere da linha', essential: true },
      { id: '^', keys: ['^'], label: 'ir ao primeiro caractere não vazio' },
      { id: '$', keys: ['$'], label: 'ir ao último caractere da linha', essential: true },
      { id: 'gg', keys: ['g', 'g'], label: 'ir à primeira linha do buffer', essential: true },
      { id: 'G', keys: ['G'], label: 'ir à última linha do buffer', essential: true },
      { id: 'countG', keys: ['{n}', 'G'], label: 'ir à linha n do buffer' },
      { id: 'f', keys: ['f', '<char>'], label: 'pular para o próximo caractere' },
      { id: 't', keys: ['t', '<char>'], label: 'parar antes do próximo caractere' },
      { id: 'repeat-find', keys: [';', ','], label: 'repetir o último f/t para frente ou para trás' },
      { id: 'half-screen', keys: ['Ctrl-d', 'Ctrl-u'], label: 'meia tela para baixo ou para cima' },
      { id: 'full-screen', keys: ['Ctrl-f', 'Ctrl-b'], label: 'uma tela para baixo ou para cima' },
      { id: 'bracket', keys: ['%'], label: 'ir ao bracket correspondente' },
      { id: 'paragraph', keys: ['{', '}'], label: 'parágrafo anterior ou seguinte' },
      { id: 'underscore', keys: ['_'], label: 'primeiro caractere não vazio (com contagem, desce linhas)' },
      { id: 'plus-minus', keys: ['+', '-'], label: 'primeiro caractere da linha seguinte ou anterior' },
      { id: 'column', keys: ['|'], label: 'ir para a coluna n' },
      { id: 'screen', keys: ['H', 'M', 'L'], label: 'topo, meio e fim da tela' },
      { id: 'sentence', keys: ['(', ')'], label: 'início da frase anterior ou seguinte' },
      { id: 'ge', keys: ['g', 'e'], label: 'fim da palavra anterior' },
      { id: 'g-line', keys: ['g', '_'], label: 'último caractere não vazio da linha' },
      { id: 'scroll', keys: ['z', 'z'], label: 'centralizar a linha atual' },
      { id: 'scroll-top', keys: ['z', 't'], label: 'linha atual no topo' },
      { id: 'scroll-bottom', keys: ['z', 'b'], label: 'linha atual no rodapé' },
      { id: 'scroll-lines', keys: ['Ctrl-e', 'Ctrl-y'], label: 'rolar uma linha' },
    ],
  },
  {
    id: 'edicao',
    title: 'Edição',
    practice: { lines: ['const buffer = 3;'], cursor: { line: 0, col: 6 } },
    items: [
      { id: 'x', keys: ['x'], label: 'apagar o caractere sob o cursor', essential: true },
      { id: 'r', keys: ['r', '<char>'], label: 'substituir um caractere', essential: true },
      { id: 'tilde', keys: ['~'], label: 'alternar maiúscula e minúscula' },
      { id: 'p', keys: ['p'], label: 'colar depois do cursor', essential: true },
      { id: 'P', keys: ['P'], label: 'colar antes do cursor' },
      { id: 'J', keys: ['J'], label: 'juntar a linha seguinte' },
      { id: 'dot', keys: ['.'], label: 'repetir a última alteração', essential: true },
      { id: 'D', keys: ['D'], label: 'apagar até o fim da linha (= d$)', essential: true },
      { id: 'C', keys: ['C'], label: 'alterar até o fim da linha (= c$)' },
      { id: 'Y', keys: ['Y'], label: 'copiar até o fim da linha (= y$)' },
      { id: 'R', keys: ['R'], label: 'modo replace (sobrescrever)', essential: true },
      { id: 'gJ', keys: ['g', 'J'], label: 'juntar linhas sem espaço' },
      { id: 'U', keys: ['U'], label: 'desfazer a última alteração da linha' },
      { id: 'ZZ', keys: ['Z', 'Z'], label: 'salvar e sair' },
      { id: 'ZQ', keys: ['Z', 'Q'], label: 'sair sem salvar' },
      { id: 'indent', keys: ['>>'], label: 'indentar a linha', essential: true },
      { id: 'dedent', keys: ['<<'], label: 'dedententar a linha' },
      { id: 'increment', keys: ['Ctrl-a'], label: 'incrementar o número sob o cursor' },
      { id: 'decrement', keys: ['Ctrl-x'], label: 'decrementar o número sob o cursor' },
    ],
  },
  {
    id: 'operadores',
    title: 'Operadores',
    practice: { lines: ['foo bar baz'], cursor: { line: 0, col: 0 } },
    items: [
      { id: 'd', keys: ['d'], label: 'apagar (espera um movimento)', essential: true },
      { id: 'c', keys: ['c'], label: 'alterar e entrar no modo insert', essential: true },
      { id: 'y', keys: ['y'], label: 'copiar', essential: true },
      { id: 'dw', keys: ['d', 'w'], label: 'apagar até a próxima palavra', essential: true },
      { id: 'dd', keys: ['d', 'd'], label: 'apagar a linha inteira', essential: true },
      { id: 'd$', keys: ['d', '$'], label: 'apagar até o fim da linha' },
      { id: 'diw', keys: ['d', 'i', 'w'], label: 'apagar a palavra sob o cursor', essential: true },
      { id: 'ciw', keys: ['c', 'i', 'w'], label: 'alterar a palavra sob o cursor', essential: true },
      { id: 'yy', keys: ['y', 'y'], label: 'copiar a linha inteira', essential: true },
      { id: 'shift-op', keys: ['>', '<'], label: 'indentar ou dedententar com um movimento (ex.: >j)' },
      { id: 'g-case', keys: ['g', '~'], label: 'alternar maiúsculas com um movimento' },
      { id: 'gu', keys: ['g', 'u'], label: 'minúsculas com um movimento' },
      { id: 'gU', keys: ['g', 'U'], label: 'maiúsculas com um movimento' },
    ],
  },
  {
    id: 'text-objects',
    title: 'Text objects',
    practice: { lines: ['const name = "antigo";'], cursor: { line: 0, col: 14 } },
    items: [
      { id: 'iw', keys: ['i', 'w'], label: 'dentro da palavra', essential: true },
      { id: 'aw', keys: ['a', 'w'], label: 'palavra e o espaço ao redor' },
      { id: 'i-quote', keys: ['i', '"'], label: 'dentro das aspas duplas', essential: true },
      { id: 'a-quote', keys: ['a', '"'], label: 'aspas duplas incluídas' },
      { id: 'i-paren', keys: ['i', '('], label: 'dentro dos parênteses', essential: true },
      { id: 'a-paren', keys: ['a', '('], label: 'parênteses incluídos' },
      { id: 'i-single', keys: ['i', "'"], label: 'dentro das aspas simples' },
      { id: 'a-single', keys: ['a', "'"], label: 'aspas simples incluídas' },
      { id: 'i-backtick', keys: ['i', '`'], label: 'dentro das crases' },
      { id: 'a-backtick', keys: ['a', '`'], label: 'crases incluídas' },
      { id: 'i-bracket', keys: ['i', '['], label: 'dentro dos colchetes' },
      { id: 'a-bracket', keys: ['a', '['], label: 'colchetes incluídos' },
      { id: 'i-brace', keys: ['i', '{'], label: 'dentro das chaves' },
      { id: 'a-brace', keys: ['a', '{'], label: 'chaves incluídas' },
      { id: 'i-paragraph', keys: ['i', 'p'], label: 'dentro do parágrafo' },
      { id: 'a-paragraph', keys: ['a', 'p'], label: 'parágrafo e a linha em branco' },
    ],
  },
  {
    id: 'busca',
    title: 'Busca',
    practice: {
      lines: ['const total = 0;', 'function soma() {', '  return total + 1;', '}'],
      cursor: { line: 0, col: 0 },
    },
    items: [
      { id: '/', keys: ['/texto'], label: 'buscar para frente', essential: true },
      { id: '?', keys: ['?texto'], label: 'buscar para trás' },
      { id: 'n', keys: ['n'], label: 'ir à próxima ocorrência', essential: true },
      { id: 'N', keys: ['N'], label: 'ir à ocorrência anterior' },
      { id: 'star', keys: ['*'], label: 'buscar a palavra sob o cursor' },
      { id: 'hash', keys: ['#'], label: 'buscar a palavra sob o cursor para trás' },
      { id: 'noh', keys: [':noh'], label: 'limpar o destaque da busca' },
      { id: 'gstar', keys: ['g', '*'], label: 'buscar a palavra sob o cursor' },
      { id: 'ghash', keys: ['g', '#'], label: 'buscar a palavra sob o cursor para trás' },
    ],
  },
  {
    id: 'visual',
    title: 'Visual',
    practice: { lines: ['linha um', 'linha dois', 'linha três'], cursor: { line: 0, col: 0 } },
    items: [
      { id: 'visual-char', keys: ['v', '<mov>'], label: 'selecionar caracteres', essential: true },
      { id: 'visual-line', keys: ['V', '<mov>'], label: 'selecionar linhas', essential: true },
      { id: 'visual-delete', keys: ['d'], label: 'apagar a seleção', essential: true },
      { id: 'visual-yank', keys: ['y'], label: 'copiar a seleção' },
      { id: 'visual-change', keys: ['c'], label: 'alterar a seleção' },
      { id: 'visual-indent', keys: ['>', '<'], label: 'indentar ou dedententar a seleção' },
      { id: 'visual-swap', keys: ['o'], label: 'trocar a âncora da seleção' },
      { id: 'visual-case', keys: ['u', 'U', '~'], label: 'minúsculas, maiúsculas ou alternar caixa' },
      { id: 'visual-paste', keys: ['p'], label: 'substituir a seleção pelo registrador' },
      { id: 'visual-join', keys: ['J'], label: 'juntar as linhas selecionadas' },
    ],
  },
  {
    id: 'marcas',
    title: 'Marcas e saltos',
    practice: { lines: ['linha um', 'linha dois', 'linha três', 'linha quatro'], cursor: { line: 0, col: 0 } },
    items: [
      { id: 'mark-set', keys: ['m', 'a'], label: 'definir a marca a', essential: true },
      { id: 'mark-jump-line', keys: ["'", 'a'], label: 'ir à linha da marca a' },
      { id: 'mark-jump-exact', keys: ['`', 'a'], label: 'ir à posição exata da marca a' },
      { id: 'last-position', keys: ["'", "'"], label: 'voltar à última posição' },
      { id: 'jump-back', keys: ['Ctrl-o', 'Ctrl-i'], label: 'voltar ou avançar no histórico de saltos', essential: true },
      { id: 'marks', keys: [':marks'], label: 'listar as marcas' },
    ],
  },
  {
    id: 'macros',
    title: 'Macros',
    practice: { lines: ['linha para gravar uma macro'], cursor: { line: 0, col: 0 } },
    items: [
      { id: 'record', keys: ['q', 'a'], label: 'gravar a macro no registrador a', essential: true },
      { id: 'stop-record', keys: ['q'], label: 'parar a gravação' },
      { id: 'play', keys: ['@', 'a'], label: 'executar a macro a', essential: true },
      { id: 'play-last', keys: ['@', '@'], label: 'repetir a última macro' },
      { id: 'registers', keys: [':reg'], label: 'ver registradores e macros' },
    ],
  },
  {
    id: 'arquivo',
    title: 'Arquivo e comandos',
    practice: { lines: ['# rascunho'], cursor: { line: 0, col: 0 } },
    items: [
      { id: 'w', keys: [':w'], label: 'escrever o buffer', essential: true },
      { id: 'q', keys: [':q'], label: 'fechar (bloqueia se houver alterações)' },
      { id: 'qbang', keys: [':q!'], label: 'fechar descartando alterações' },
      { id: 'wq', keys: [':wq'], label: 'escrever e fechar', essential: true },
      { id: 'x', keys: [':x'], label: 'escrever e fechar (atalho)' },
      { id: 'number', keys: [':set number'], label: 'mostrar números de linha' },
      { id: 'goto', keys: [':{n}'], label: 'ir para a linha n' },
      { id: 'substitute', keys: [':s/antigo/novo/g'], label: 'substituir na linha atual' },
      { id: 'substitute-all', keys: [':%s/antigo/novo/g'], label: 'substituir no buffer inteiro' },
      { id: 'sort', keys: [':sort'], label: 'ordenar as linhas' },
      { id: 'ignorecase', keys: [':set ignorecase'], label: 'busca sem diferenciar maiúsculas' },
      { id: 'relativenumber', keys: [':set relativenumber'], label: 'números de linha relativos' },
    ],
  },
  {
    id: 'historico',
    title: 'Histórico',
    practice: { lines: ['linha para editar e desfazer'], cursor: { line: 0, col: 0 } },
    items: [
      { id: 'u', keys: ['u'], label: 'desfazer', essential: true },
      { id: 'redo', keys: ['C-r'], label: 'refazer', essential: true },
    ],
  },
];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function filterCheatsheet(query: string, essentialsOnly = false): CheatGroup[] {
  const needle = normalize(query.trim());

  return cheatsheet
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (essentialsOnly && !item.essential) return false;
        if (!needle) return true;
        return normalize(
          `${item.keys.join(' ')} ${item.keys.join('')} ${item.label} ${group.title}`,
        ).includes(needle);
      }),
    }))
    .filter((group) => group.items.length > 0);
}

export const cheatTotals = {
  commands: cheatsheet.reduce((total, group) => total + group.items.length, 0),
  essentials: cheatsheet.reduce(
    (total, group) => total + group.items.filter((item) => item.essential).length,
    0,
  ),
};
