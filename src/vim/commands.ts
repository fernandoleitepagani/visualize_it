import { clamp, firstNonBlank, lineAt } from './buffer';
import type { VimState } from './types';

function substitute(state: VimState, command: string): VimState | null {
  const parsed = command.match(/^(%?)s\/(.*?)\/(.*?)\/([a-z]*)$/);
  if (!parsed) return null;

  const [, whole, rawPattern, rawReplacement, flags] = parsed;
  const pattern = rawPattern.replace(/\\\//g, '/');
  const replacement = rawReplacement.replace(/\\\//g, '/');
  const global = flags.includes('g');

  try {
    const probe = new RegExp(pattern, global ? 'g' : '');
    let count = 0;
    const lines = state.lines.map((line, index) => {
      if (!whole && index !== state.cursor.line) return line;
      count += line.match(probe)?.length ?? 0;
      return line.replace(probe, replacement);
    });

    return {
      ...state,
      lines,
      dirty: count > 0 ? true : state.dirty,
      mode: 'normal',
      command: '',
      anchor: null,
      pending: '',
      message:
        count > 0 ? `${count} substituição(ões)` : `E486: padrão não encontrado: ${pattern}`,
    };
  } catch {
    return {
      ...state,
      mode: 'normal',
      command: '',
      message: 'E54: padrão inválido',
    };
  }
}

/** Executes the `:` command line. Quitting is simulated, never destructive. */
export function executeCommand(state: VimState): VimState {
  const command = state.command.trim();
  const base: VimState = {
    ...state,
    command: '',
    mode: 'normal',
    anchor: null,
    pending: '',
  };

  if (!command) return { ...base, message: '' };

  if (command === 'w') {
    return { ...base, dirty: false, message: '"vim-pratica.txt" escrito' };
  }

  const writeTo = command.match(/^w\s+(.+)$/);
  if (writeTo) {
    return { ...base, dirty: false, message: `"${writeTo[1]}" escrito` };
  }

  if (command === 'q') {
    if (state.dirty) {
      return { ...base, message: 'E37: buffer modificado (use :q! para forçar)' };
    }
    return { ...base, message: 'fechado' };
  }

  if (command === 'q!') {
    return { ...base, message: 'fechado sem salvar' };
  }

  if (command === 'wq' || command === 'x') {
    return { ...base, dirty: false, message: 'escrito e fechado' };
  }

  if (command === 'noh' || command === 'nohlsearch') {
    return { ...base, lastSearch: null, message: '' };
  }

  if (command === 'set number' || command === 'set nu') {
    return { ...base, showNumbers: true, relativeNumbers: false, message: '' };
  }

  if (command === 'set nonumber' || command === 'set nonu') {
    return { ...base, showNumbers: false, relativeNumbers: false, message: '' };
  }

  if (command === 'set relativenumber' || command === 'set rnu') {
    return { ...base, showNumbers: true, relativeNumbers: true, message: '' };
  }

  if (command === 'set norelativenumber' || command === 'set nornu') {
    return { ...base, relativeNumbers: false, message: '' };
  }

  if (command === 'set ignorecase' || command === 'set ic') {
    return { ...base, ignoreCase: true, message: '' };
  }

  if (command === 'set noignorecase' || command === 'set noic') {
    return { ...base, ignoreCase: false, message: '' };
  }

  if (command === 'set wrap' || command === 'set nowrap') {
    return { ...base, message: 'quebra de linha visual já é automática' };
  }

  if (command === 'set spell' || command === 'set nospell') {
    return { ...base, message: 'corretor ortográfico indisponível' };
  }

  if (command === 'sort') {
    const lines = [...state.lines].sort((a, b) => a.localeCompare(b));
    return {
      ...base,
      lines,
      cursor: { line: 0, col: firstNonBlank(lineAt(lines, 0)) },
      desiredCol: 0,
      dirty: true,
      message: 'linhas ordenadas',
    };
  }

  const substituted = substitute(state, command);
  if (substituted) return substituted;

  if (command === 'reg' || command === 'registers') {
    const macros = Object.keys(state.macros);
    const parts = [
      state.register ? `"${state.register}"` : '"—"',
      macros.length ? `macros: ${macros.map((key) => `@${key}`).join(' ')}` : 'sem macros',
    ];
    return { ...base, message: parts.join(' · '), mode: 'normal' };
  }

  if (command === 'marks') {
    const marks = Object.keys(state.marks);
    return {
      ...base,
      message: marks.length ? `marcas: ${marks.join(' ')}` : 'nenhuma marca definida',
    };
  }

  if (command === 'ls' || command === 'buffers') {
    return { ...base, message: '1 buffer: vim-pratica.txt' };
  }

  if (command === 'bn' || command === 'bp' || command === 'bd' || /^b\s+\d+$/.test(command)) {
    return { ...base, message: 'apenas um buffer nesta sessão' };
  }

  if (command === 'e' || command === 'edit' || command.startsWith('e ')) {
    return { ...base, message: 'buffer único: edição de arquivos indisponível' };
  }

  if (
    command === 'sp' ||
    command === 'vsp' ||
    command === 'split' ||
    command === 'vsplit' ||
    command.startsWith('tab') ||
    command === 'terminal'
  ) {
    return { ...base, message: 'janelas, abas e terminal indisponíveis neste treinador' };
  }

  if (command === 'checkhealth' || command === 'Lazy' || command === 'Mason') {
    return { ...base, message: 'recurso do Neovim indisponível neste treinador' };
  }

  if (command.startsWith('verbose map')) {
    return { ...base, message: 'mapeamentos fixos; consulte o cheatsheet' };
  }

  if (command.startsWith('!') || command.startsWith('r !')) {
    return { ...base, message: 'comandos de shell indisponíveis neste treinador' };
  }

  if (/^\d+$/.test(command)) {
    const line = clamp(Number(command) - 1, 0, state.lines.length - 1);
    return {
      ...base,
      cursor: { line, col: firstNonBlank(lineAt(state.lines, line)) },
      desiredCol: 0,
      lastPosition: state.cursor,
      message: '',
    };
  }

  if (command === '$') {
    const line = state.lines.length - 1;
    return {
      ...base,
      cursor: { line, col: firstNonBlank(lineAt(state.lines, line)) },
      desiredCol: 0,
      lastPosition: state.cursor,
      message: '',
    };
  }

  return { ...base, message: `E492: comando desconhecido: ${command}` };
}
