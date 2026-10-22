import {
  chars,
  clampCursor,
  firstNonBlank,
  insertChar,
  lineAt,
  lineLength,
  removeChar,
  replaceLine,
  wordUnderCursor,
} from './buffer';
import { applyMotion, findChar, type MotionResult } from './motions';
import {
  clampToBuffer,
  deleteRange,
  lineRange,
  motionRange,
  paste,
  rangeBetween,
  rangeText,
  textObjectRange,
  yankRange,
  type TextRange,
} from './operators';
import { pushUndo, redo, undo } from './history';
import { executeCommand } from './commands';
import type { VimCursor, VimState } from './types';

type Op = 'd' | 'c' | 'y';

const ARROWS: Record<string, string> = {
  ArrowLeft: 'h',
  ArrowRight: 'l',
  ArrowUp: 'k',
  ArrowDown: 'j',
};

export function createState(
  lines: string[],
  cursor: VimCursor = { line: 0, col: 0 },
  options: { message?: string; showNumbers?: boolean } = {},
): VimState {
  const safeLines = lines.length ? lines.slice() : [''];
  return {
    lines: safeLines,
    cursor: clampCursor(safeLines, cursor),
    mode: 'normal',
    pending: '',
    anchor: null,
    register: '',
    registerLinewise: false,
    undo: [],
    redo: [],
    command: '',
    search: '',
    lastSearch: null,
    searchDirection: 1,
    message: options.message ?? '',
    dirty: false,
    desiredCol: cursor.col,
    scrollTop: 0,
    lastChange: null,
    lastFind: null,
    showNumbers: options.showNumbers ?? false,
    insertKeys: [],
    changeKeys: null,
  };
}

/** Canonical key for the engine. Returns `null` for keys we do not handle. */
export function normalizeKey(input: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}): string | null {
  if (input.metaKey || input.altKey) return null;

  if (input.ctrlKey) {
    const lower = input.key.toLowerCase();
    return lower === 'r' || lower === 'd' || lower === 'u' ? `C-${lower}` : null;
  }

  switch (input.key) {
    case 'Enter':
    case 'Escape':
    case 'Backspace':
    case 'Delete':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowUp':
    case 'ArrowDown':
      return input.key;
    case 'Tab':
      return null;
    default:
      return Array.from(input.key).length === 1 ? input.key : null;
  }
}

export function isPrintable(key: string): boolean {
  return Array.from(key).length === 1;
}

export function applyKeys(state: VimState, keys: string[]): VimState {
  return keys.reduce(reduce, state);
}

/** Feeds composed text (mobile/IME) into the buffer one character at a time. */
export function applyText(state: VimState, text: string): VimState {
  if (state.mode !== 'insert') return state;
  let next = state;
  for (const char of Array.from(text)) next = reduce(next, char);
  return next;
}

export function reduce(state: VimState, key: string): VimState {
  switch (state.mode) {
    case 'insert':
      return insertKey(state, key);
    case 'command':
      return commandKey(state, key);
    case 'search':
      return searchKey(state, key);
    case 'visual':
    case 'visual-line':
      return visualKey(state, key);
    default:
      return normalKey(state, key);
  }
}

/* ------------------------------------------------------------------ normal */

function normalKey(state: VimState, key: string): VimState {
  if (state.pending) return pendingKey(state, key);

  const mapped = key === ' ' ? 'l' : (ARROWS[key] ?? key);
  const motion = applyMotion(state.lines, state.cursor, mapped, 1, state.desiredCol);
  if (motion) return applyMotionResult(state, motion);

  if (/^[1-9]$/.test(mapped)) return { ...state, pending: mapped, message: '' };

  switch (mapped) {
    case 'g':
    case 'd':
    case 'c':
    case 'y':
    case 'f':
    case 'F':
    case 't':
    case 'T':
    case 'r':
      return { ...state, pending: mapped, message: '' };
    case 'i':
      return startInsert(state, state.cursor, ['i']);
    case 'I':
      return startInsert(
        state,
        { line: state.cursor.line, col: firstNonBlank(lineAt(state.lines, state.cursor.line)) },
        ['I'],
      );
    case 'a':
      return startInsert(
        state,
        {
          line: state.cursor.line,
          col: Math.min(state.cursor.col + 1, lineLength(lineAt(state.lines, state.cursor.line))),
        },
        ['a'],
      );
    case 'A':
      return startInsert(
        state,
        { line: state.cursor.line, col: lineLength(lineAt(state.lines, state.cursor.line)) },
        ['A'],
      );
    case 'o':
      return openLine(state, true);
    case 'O':
      return openLine(state, false);
    case 'x':
      return deleteChars(state, 1, ['x']);
    case 'X':
      return deleteBefore(state, 1, ['X']);
    case 's':
      return changeChars(state, 1, ['s']);
    case 'S':
      return changeRange(state, lineRange(state.cursor, 1), ['S']);
    case 'p':
      return pasteRegister(state, true, ['p']);
    case 'P':
      return pasteRegister(state, false, ['P']);
    case 'J':
      return joinLines(state, 1, ['J']);
    case '~':
      return toggleCase(state, 1, ['~']);
    case 'u':
      return undo(state);
    case 'C-r':
      return redo(state);
    case '.':
      return repeatLastChange(state);
    case 'v':
      return startVisual(state, 'visual');
    case 'V':
      return startVisual(state, 'visual-line');
    case ':':
      return { ...state, mode: 'command', command: '', message: '', pending: '' };
    case '/':
      return startSearch(state, 1);
    case '?':
      return startSearch(state, -1);
    case 'n':
      return repeatSearch(state, state.searchDirection);
    case 'N':
      return repeatSearch(state, state.searchDirection === 1 ? -1 : 1);
    case '*':
      return searchWord(state, 1);
    case '#':
      return searchWord(state, -1);
    case ';':
      return repeatFind(state, false);
    case ',':
      return repeatFind(state, true);
    case 'Escape':
      return { ...state, pending: '', anchor: null, message: '' };
    default:
      return { ...state, message: `tecla não mapeada: ${mapped}` };
  }
}

function pendingKey(state: VimState, key: string): VimState {
  if (key === 'Escape') return { ...state, pending: '', message: '' };

  const pending = state.pending;
  const mapped = ARROWS[key] ?? key;

  if (/^\d+$/.test(pending)) {
    if (/^\d$/.test(mapped)) return { ...state, pending: (pending + mapped).slice(-3) };

    if (mapped === 'g') return { ...state, pending: pending + 'g' };

    const count = Number(pending);
    const motion = applyMotion(state.lines, state.cursor, mapped, count, state.desiredCol);
    if (motion) return applyMotionResult(state, motion);

    if (mapped === 'd' || mapped === 'c' || mapped === 'y') {
      return { ...state, pending: pending + mapped };
    }

    if (mapped === 'x' || mapped === 'p' || mapped === 'P' || mapped === 'J' || mapped === '~') {
      return repeatAction(state, mapped, count);
    }

    return { ...state, pending: '', message: `comando incompleto: ${pending}${mapped}` };
  }

  const gMatch = pending.match(/^(\d*)g$/);
  if (gMatch) {
    if (mapped !== 'g') return { ...state, pending: '', message: `comando incompleto: ${pending}${mapped}` };
    const count = Number(gMatch[1]) || 1;
    const motion = applyMotion(state.lines, state.cursor, 'gg', count, state.desiredCol);
    return motion ? applyMotionResult(state, motion) : { ...state, pending: '' };
  }

  if (/^[fFtT]$/.test(pending)) {
    const command = pending as 'f' | 'F' | 't' | 'T';
    const target = findChar(state.lines, state.cursor, command, mapped);
    if (!target) {
      return { ...state, pending: '', message: `caractere não encontrado: ${mapped}` };
    }
    return {
      ...state,
      pending: '',
      cursor: target,
      desiredCol: target.col,
      lastFind: { command, char: mapped },
      message: '',
    };
  }

  if (pending === 'r') return replaceChar(state, mapped);

  const operator = pending.match(/^(\d*)([dcy])(\d*)([ia])?$/);
  if (!operator) return { ...state, pending: '', message: `comando incompleto: ${pending}${mapped}` };

  const [, countBefore, op, countAfter, textPrefix] = operator;
  const count = (Number(countBefore) || 1) * (Number(countAfter) || 1);
  const keys = [...Array.from(pending), mapped];

  if (textPrefix) {
    const range = textObjectRange(state.lines, state.cursor, mapped, textPrefix === 'a');
    if (!range) return { ...state, pending: '', message: `text object inválido: ${textPrefix}${mapped}` };
    return operate(state, op as Op, range, keys);
  }

  if (mapped === 'i' || mapped === 'a') return { ...state, pending: pending + mapped };
  if (/^[1-9]$/.test(mapped)) return { ...state, pending: pending + mapped };
  if (mapped === pending[pending.length - 1]) {
    return operate(state, op as Op, lineRange(state.cursor, count), keys);
  }

  const motion = applyMotion(state.lines, state.cursor, mapped, count, state.desiredCol);
  if (motion) return operate(state, op as Op, motionRange(state.cursor, motion), keys);

  return { ...state, pending: '', message: `comando incompleto: ${pending}${mapped}` };
}

function applyMotionResult(state: VimState, motion: MotionResult): VimState {
  return {
    ...state,
    cursor: motion.cursor,
    desiredCol: motion.desiredCol,
    pending: '',
    message: '',
  };
}

function repeatAction(state: VimState, key: string, count: number): VimState {
  const keys = [...Array.from(state.pending), key];
  let next = state;
  switch (key) {
    case 'x':
      next = deleteChars(state, count, keys);
      break;
    case 'X':
      next = deleteBefore(state, count, keys);
      break;
    case 'p':
      next = pasteRegister(state, true, keys);
      break;
    case 'P':
      next = pasteRegister(state, false, keys);
      break;
    case 'J':
      next = joinLines(state, count, keys);
      break;
    case '~':
      next = toggleCase(state, count, keys);
      break;
    default:
      break;
  }
  return { ...next, pending: '' };
}

/* -------------------------------------------------------------------- edits */

function startInsert(
  state: VimState,
  cursor: VimCursor,
  changeKeys: string[],
  record = true,
): VimState {
  const base = record ? pushUndo(state) : state;
  return {
    ...base,
    mode: 'insert',
    cursor: clampToBuffer(base.lines, cursor),
    anchor: null,
    pending: '',
    insertKeys: [],
    changeKeys,
    message: '-- INSERT --',
  };
}

function openLine(state: VimState, below: boolean): VimState {
  const at = state.cursor.line + (below ? 1 : 0);
  const next = [...state.lines.slice(0, at), '', ...state.lines.slice(at)];
  const base = pushUndo(state);
  return startInsert({ ...base, lines: next, dirty: true }, { line: at, col: 0 }, [below ? 'o' : 'O'], false);
}

function deleteChars(state: VimState, count: number, keys: string[]): VimState {
  const cells = chars(lineAt(state.lines, state.cursor.line));
  if (!cells.length) return { ...state, lastChange: keys };

  const from = state.cursor.col;
  const to = Math.min(cells.length - 1, from + Math.max(1, count) - 1);
  const range: TextRange = {
    start: { line: state.cursor.line, col: from },
    end: { line: state.cursor.line, col: to },
    linewise: false,
    inclusive: true,
  };
  const base = pushUndo(state);
  const deleted = deleteRange(state.lines, range);
  return {
    ...base,
    lines: deleted.lines,
    cursor: clampCursor(deleted.lines, deleted.cursor),
    dirty: true,
    register: rangeText(state.lines, range),
    registerLinewise: false,
    lastChange: keys,
    message: '',
  };
}

function deleteBefore(state: VimState, count: number, keys: string[]): VimState {
  if (state.cursor.col === 0) {
    if (state.cursor.line === 0) return state;
    const base = pushUndo(state);
    const previous = state.lines[state.cursor.line - 1];
    const current = state.lines[state.cursor.line];
    const next = [
      ...state.lines.slice(0, state.cursor.line - 1),
      previous + current,
      ...state.lines.slice(state.cursor.line + 1),
    ];
    return {
      ...base,
      lines: next,
      cursor: { line: state.cursor.line - 1, col: Math.max(0, lineLength(previous) - 1) },
      dirty: true,
      lastChange: keys,
      register: '',
      message: '',
    };
  }

  const from = Math.max(0, state.cursor.col - Math.max(1, count));
  const range: TextRange = {
    start: { line: state.cursor.line, col: from },
    end: { line: state.cursor.line, col: state.cursor.col - 1 },
    linewise: false,
    inclusive: true,
  };
  const base = pushUndo(state);
  const deleted = deleteRange(state.lines, range);
  return {
    ...base,
    lines: deleted.lines,
    cursor: clampCursor(deleted.lines, deleted.cursor),
    dirty: true,
    register: rangeText(state.lines, range),
    registerLinewise: false,
    lastChange: keys,
    message: '',
  };
}

function changeChars(state: VimState, count: number, keys: string[]): VimState {
  const cells = chars(lineAt(state.lines, state.cursor.line));
  if (!cells.length) return startInsert(state, state.cursor, keys);
  const to = Math.min(cells.length - 1, state.cursor.col + Math.max(1, count) - 1);
  return changeRange(
    state,
    {
      start: state.cursor,
      end: { line: state.cursor.line, col: to },
      linewise: false,
      inclusive: true,
    },
    keys,
  );
}

function changeRange(state: VimState, range: TextRange, keys: string[]): VimState {
  const base = pushUndo(state);
  const deleted = deleteRange(state.lines, range);
  return startInsert(
    { ...base, lines: deleted.lines, dirty: true },
    clampToBuffer(deleted.lines, deleted.cursor),
    keys,
    false,
  );
}

function replaceChar(state: VimState, key: string): VimState {
  if (Array.from(key).length !== 1 || key === 'Escape') {
    return { ...state, pending: '', message: 'substituição cancelada' };
  }
  const line = lineAt(state.lines, state.cursor.line);
  if (!line.length) return { ...state, pending: '', message: '' };
  const cells = chars(line);
  cells[state.cursor.col] = key;
  const base = pushUndo(state);
  return {
    ...base,
    lines: replaceLine(state.lines, state.cursor.line, cells.join('')),
    pending: '',
    dirty: true,
    lastChange: ['r', key],
    message: '',
  };
}

function pasteRegister(state: VimState, after: boolean, keys: string[]): VimState {
  if (!state.register) return { ...state, message: 'registrador vazio' };
  const base = pushUndo(state);
  const result = paste(state.lines, state.cursor, state.register, state.registerLinewise, after);
  return {
    ...base,
    lines: result.lines,
    cursor: clampCursor(result.lines, result.cursor),
    dirty: true,
    lastChange: keys,
    message: '',
  };
}

function joinLines(state: VimState, count: number, keys: string[]): VimState {
  const line = state.cursor.line;
  const end = Math.min(state.lines.length - 1, line + Math.max(1, count));
  if (end === line) return state;

  let merged = state.lines[line];
  for (let index = line + 1; index <= end; index += 1) {
    const part = state.lines[index].trimStart();
    merged += merged.endsWith(' ') || part.startsWith(' ') || !part ? '' : ' ';
    merged += part;
  }

  const next = [...state.lines.slice(0, line), merged, ...state.lines.slice(end + 1)];
  const base = pushUndo(state);
  return {
    ...base,
    lines: next,
    cursor: {
      line,
      col: Math.min(lineLength(state.lines[line]), Math.max(0, lineLength(merged) - 1)),
    },
    dirty: true,
    lastChange: keys,
    message: '',
  };
}

function toggleCase(state: VimState, count: number, keys: string[]): VimState {
  const cells = chars(lineAt(state.lines, state.cursor.line));
  if (!cells.length) return state;
  const end = Math.min(cells.length - 1, state.cursor.col + Math.max(1, count) - 1);
  for (let index = state.cursor.col; index <= end; index += 1) {
    const char = cells[index];
    cells[index] = char === char.toLowerCase() ? char.toUpperCase() : char.toLowerCase();
  }
  const base = pushUndo(state);
  return {
    ...base,
    lines: replaceLine(state.lines, state.cursor.line, cells.join('')),
    cursor: { line: state.cursor.line, col: Math.min(end + 1, cells.length - 1) },
    desiredCol: Math.min(end + 1, cells.length - 1),
    dirty: true,
    lastChange: keys,
    message: '',
  };
}

function operate(state: VimState, op: Op, range: TextRange, keys: string[]): VimState {
  if (op === 'y') {
    const { text, linewise } = yankRange(state.lines, range);
    return {
      ...state,
      pending: '',
      mode: 'normal',
      anchor: null,
      register: text,
      registerLinewise: linewise,
      lastChange: keys,
      message: text ? `${text.split('\n').length} linha(s) copiada(s)` : 'nada para copiar',
    };
  }

  if (op === 'c') return changeRange(state, range, keys);

  const base = pushUndo(state);
  const deleted = deleteRange(state.lines, range);
  return {
    ...base,
    lines: deleted.lines,
    cursor: clampCursor(deleted.lines, deleted.cursor),
    dirty: true,
    pending: '',
    mode: 'normal',
    anchor: null,
    register: rangeText(state.lines, range),
    registerLinewise: range.linewise,
    lastChange: keys,
    message: '',
  };
}

function repeatLastChange(state: VimState): VimState {
  if (!state.lastChange) return { ...state, message: 'nada para repetir' };
  return applyKeys(state, state.lastChange);
}

/* --------------------------------------------------------------- insert mode */

function insertKey(state: VimState, key: string): VimState {
  if (key === 'Escape') return finishInsert(state);
  if (key === 'Enter') return insertNewline(state);
  if (key === 'Backspace') return insertBackspace(state);
  if (key === 'Delete') return insertDelete(state);

  if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
    const cursor = { ...state.cursor };
    if (key === 'ArrowLeft') cursor.col -= 1;
    if (key === 'ArrowRight') cursor.col += 1;
    if (key === 'ArrowUp') cursor.line -= 1;
    if (key === 'ArrowDown') cursor.line += 1;
    return { ...state, cursor: clampToBuffer(state.lines, cursor) };
  }

  if (!isPrintable(key)) return state;

  return {
    ...state,
    lines: replaceLine(
      state.lines,
      state.cursor.line,
      insertChar(lineAt(state.lines, state.cursor.line), state.cursor.col, key),
    ),
    cursor: { line: state.cursor.line, col: state.cursor.col + 1 },
    desiredCol: state.cursor.col + 1,
    insertKeys: [...state.insertKeys, key],
    dirty: true,
  };
}

function insertNewline(state: VimState): VimState {
  const line = lineAt(state.lines, state.cursor.line);
  const cells = chars(line);
  const head = cells.slice(0, state.cursor.col).join('');
  const tail = cells.slice(state.cursor.col).join('');
  const next = [
    ...state.lines.slice(0, state.cursor.line),
    head,
    tail,
    ...state.lines.slice(state.cursor.line + 1),
  ];
  return {
    ...state,
    lines: next,
    cursor: { line: state.cursor.line + 1, col: 0 },
    desiredCol: 0,
    insertKeys: [...state.insertKeys, 'Enter'],
    dirty: true,
  };
}

function insertBackspace(state: VimState): VimState {
  const line = lineAt(state.lines, state.cursor.line);
  if (state.cursor.col > 0) {
    return {
      ...state,
      lines: replaceLine(state.lines, state.cursor.line, removeChar(line, state.cursor.col - 1)),
      cursor: { line: state.cursor.line, col: state.cursor.col - 1 },
      desiredCol: state.cursor.col - 1,
      insertKeys: [...state.insertKeys, 'Backspace'],
      dirty: true,
    };
  }
  if (state.cursor.line === 0) return state;

  const previous = lineAt(state.lines, state.cursor.line - 1);
  const next = [
    ...state.lines.slice(0, state.cursor.line - 1),
    previous + line,
    ...state.lines.slice(state.cursor.line + 1),
  ];
  return {
    ...state,
    lines: next,
    cursor: { line: state.cursor.line - 1, col: lineLength(previous) },
    desiredCol: lineLength(previous),
    insertKeys: [...state.insertKeys, 'Backspace'],
    dirty: true,
  };
}

function insertDelete(state: VimState): VimState {
  const line = lineAt(state.lines, state.cursor.line);
  if (state.cursor.col < lineLength(line)) {
    return {
      ...state,
      lines: replaceLine(state.lines, state.cursor.line, removeChar(line, state.cursor.col)),
      insertKeys: [...state.insertKeys, 'Delete'],
      dirty: true,
    };
  }
  if (state.cursor.line >= state.lines.length - 1) return state;
  const next = [
    ...state.lines.slice(0, state.cursor.line),
    line + lineAt(state.lines, state.cursor.line + 1),
    ...state.lines.slice(state.cursor.line + 2),
  ];
  return {
    ...state,
    lines: next,
    insertKeys: [...state.insertKeys, 'Delete'],
    dirty: true,
  };
}

function finishInsert(state: VimState): VimState {
  const cursor = clampCursor(state.lines, {
    line: state.cursor.line,
    col: Math.max(0, state.cursor.col - 1),
  });
  const keys = [...(state.changeKeys ?? []), ...state.insertKeys, 'Escape'];
  return {
    ...state,
    mode: 'normal',
    cursor,
    desiredCol: cursor.col,
    anchor: null,
    pending: '',
    insertKeys: [],
    changeKeys: null,
    lastChange: keys,
    message: '',
  };
}

/* -------------------------------------------------------------- command mode */

function commandKey(state: VimState, key: string): VimState {
  if (key === 'Escape') return { ...state, mode: 'normal', command: '', message: '' };
  if (key === 'Enter') return executeCommand(state);
  if (key === 'Backspace') return { ...state, command: state.command.slice(0, -1) };
  if (isPrintable(key)) return { ...state, command: state.command + key };
  return state;
}

function repeatFind(state: VimState, reverse: boolean): VimState {
  if (!state.lastFind) return { ...state, message: 'nenhum f/t anterior' };
  const command = state.lastFind.command;
  const flipped: Record<string, 'f' | 'F' | 't' | 'T'> = {
    f: 'F',
    F: 'f',
    t: 'T',
    T: 't',
  };
  const next = reverse ? flipped[command] : command;
  const target = findChar(state.lines, state.cursor, next, state.lastFind.char);
  if (!target) return { ...state, message: `caractere não encontrado: ${state.lastFind.char}` };
  return { ...state, cursor: target, desiredCol: target.col, message: '' };
}

/* --------------------------------------------------------------- search mode */

function startSearch(state: VimState, direction: 1 | -1): VimState {
  return {
    ...state,
    mode: 'search',
    search: '',
    searchDirection: direction,
    pending: '',
    message: '',
  };
}

function searchKey(state: VimState, key: string): VimState {
  if (key === 'Escape') return { ...state, mode: 'normal', search: '', message: '' };
  if (key === 'Backspace') return { ...state, search: state.search.slice(0, -1) };
  if (key === 'Enter') return commitSearch(state);
  if (isPrintable(key)) return { ...state, search: state.search + key };
  return state;
}

function commitSearch(state: VimState): VimState {
  const needle = state.search;
  if (!needle) return { ...state, mode: 'normal', search: '', message: '' };
  const target = findMatch(state.lines, needle, state.cursor, state.searchDirection, true);
  return {
    ...state,
    mode: 'normal',
    search: '',
    lastSearch: needle,
    cursor: target ?? state.cursor,
    desiredCol: target?.col ?? state.desiredCol,
    message: target
      ? `${state.searchDirection === 1 ? '/' : '?'}${needle}`
      : `E486: padrão não encontrado: ${needle}`,
  };
}

function repeatSearch(state: VimState, direction: 1 | -1): VimState {
  if (!state.lastSearch) return { ...state, message: 'nenhuma busca anterior' };
  const target = findMatch(state.lines, state.lastSearch, state.cursor, direction, false);
  if (!target) return { ...state, message: `E486: padrão não encontrado: ${state.lastSearch}` };
  return {
    ...state,
    cursor: target,
    desiredCol: target.col,
    searchDirection: direction,
    message: `${direction === 1 ? '/' : '?'}${state.lastSearch}`,
  };
}

function searchWord(state: VimState, direction: 1 | -1): VimState {
  const word = wordUnderCursor(state.lines, state.cursor);
  if (!word) return { ...state, message: 'nenhuma palavra sob o cursor' };
  const target = findMatch(state.lines, word, state.cursor, direction, false);
  return {
    ...state,
    lastSearch: word,
    searchDirection: direction,
    cursor: target ?? state.cursor,
    desiredCol: target?.col ?? state.desiredCol,
    message: `${direction === 1 ? '/' : '?'}${word}`,
  };
}

interface SearchHit {
  line: number;
  col: number;
}

function findMatch(
  lines: string[],
  needle: string,
  from: VimCursor,
  direction: 1 | -1,
  includeCurrent: boolean,
): VimCursor | null {
  const lowerNeedle = needle.toLowerCase();
  const hits: SearchHit[] = [];

  lines.forEach((line, lineIndex) => {
    const lower = line.toLowerCase();
    let offset = 0;
    for (;;) {
      const index = lower.indexOf(lowerNeedle, offset);
      if (index < 0) break;
      hits.push({ line: lineIndex, col: Array.from(line.slice(0, index)).length });
      offset = index + Math.max(1, lowerNeedle.length);
    }
  });

  if (!hits.length) return null;

  if (direction === 1) {
    return (
      hits.find(
        (hit) =>
          hit.line > from.line ||
          (hit.line === from.line && (includeCurrent ? hit.col >= from.col : hit.col > from.col)),
      ) ?? hits[0]
    );
  }

  const before = hits.filter(
    (hit) =>
      hit.line < from.line ||
      (hit.line === from.line && (includeCurrent ? hit.col <= from.col : hit.col < from.col)),
  );
  return before.length ? before[before.length - 1] : hits[hits.length - 1];
}

/* --------------------------------------------------------------- visual mode */

function startVisual(state: VimState, mode: 'visual' | 'visual-line'): VimState {
  return {
    ...state,
    mode,
    anchor: state.cursor,
    pending: '',
    message: mode === 'visual' ? '-- VISUAL --' : '-- VISUAL LINE --',
  };
}

function exitVisual(state: VimState): VimState {
  return { ...state, mode: 'normal', anchor: null, pending: '', message: '' };
}

function visualKey(state: VimState, key: string): VimState {
  if (key === 'Escape') return exitVisual(state);

  if (key === 'v') {
    if (state.mode === 'visual') return exitVisual(state);
    return { ...state, mode: 'visual', message: '-- VISUAL --' };
  }

  if (key === 'V') {
    if (state.mode === 'visual-line') return exitVisual(state);
    return { ...state, mode: 'visual-line', message: '-- VISUAL LINE --' };
  }

  if (key === 'o') {
    return {
      ...state,
      cursor: state.anchor ?? state.cursor,
      anchor: state.cursor,
      desiredCol: (state.anchor ?? state.cursor).col,
    };
  }

  if (key === 'd' || key === 'c' || key === 'y') {
    if (!state.anchor) return state;
    const range = rangeBetween(state.anchor, state.cursor, true, state.mode === 'visual-line');
    return operate(state, key, { ...range, inclusive: true }, [key]);
  }

  if (/^[1-9]$/.test(key)) return { ...state, pending: key };

  const count = /^\d+$/.test(state.pending) ? Number(state.pending) : 1;
  const mapped = ARROWS[key] ?? key;
  const motion = applyMotion(state.lines, state.cursor, mapped, count, state.desiredCol);
  if (!motion) return { ...state, pending: '', message: `tecla não mapeada: ${key}` };

  return {
    ...state,
    cursor: motion.cursor,
    desiredCol: motion.desiredCol,
    pending: '',
    message: state.mode === 'visual' ? '-- VISUAL --' : '-- VISUAL LINE --',
  };
}

/* Exportado para testes e para o painel de desafios. */
