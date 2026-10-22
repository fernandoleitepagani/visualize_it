import { clamp, firstNonBlank, lineAt } from './buffer';
import type { VimState } from './types';

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

  if (command === 'set number' || command === 'set nu') {
    return { ...base, showNumbers: true, message: '' };
  }

  if (command === 'set nonumber' || command === 'set nonu') {
    return { ...base, showNumbers: false, message: '' };
  }

  if (/^\d+$/.test(command)) {
    const line = clamp(Number(command) - 1, 0, state.lines.length - 1);
    return {
      ...base,
      cursor: { line, col: firstNonBlank(lineAt(state.lines, line)) },
      desiredCol: 0,
      message: '',
    };
  }

  if (command === '$') {
    const line = state.lines.length - 1;
    return {
      ...base,
      cursor: { line, col: firstNonBlank(lineAt(state.lines, line)) },
      desiredCol: 0,
      message: '',
    };
  }

  return { ...base, message: `E492: comando desconhecido: ${command}` };
}
