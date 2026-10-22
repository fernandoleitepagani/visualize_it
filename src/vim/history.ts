import { clampCursor } from './buffer';
import type { VimState } from './types';

const LIMIT = 100;

/** Snapshots the current buffer before a change. */
export function pushUndo(state: VimState): VimState {
  return {
    ...state,
    undo: [...state.undo, state.lines].slice(-LIMIT),
    redo: [],
  };
}

export function undo(state: VimState): VimState {
  if (!state.undo.length) {
    return { ...state, message: 'já está no início do histórico' };
  }
  const previous = state.undo[state.undo.length - 1];
  return {
    ...state,
    lines: previous,
    cursor: clampCursor(previous, state.cursor),
    undo: state.undo.slice(0, -1),
    redo: [...state.redo, state.lines].slice(-LIMIT),
    dirty: true,
    mode: 'normal',
    anchor: null,
    pending: '',
    message: 'desfazendo',
  };
}

export function redo(state: VimState): VimState {
  if (!state.redo.length) {
    return { ...state, message: 'nada para refazer' };
  }
  const next = state.redo[state.redo.length - 1];
  return {
    ...state,
    lines: next,
    cursor: clampCursor(next, state.cursor),
    undo: [...state.undo, state.lines].slice(-LIMIT),
    redo: state.redo.slice(0, -1),
    dirty: true,
    mode: 'normal',
    anchor: null,
    pending: '',
    message: 'refazendo',
  };
}
