import {
  chars,
  clamp,
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
  shiftLines,
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
    relativeNumbers: false,
    ignoreCase: false,
    marks: {},
    macros: {},
    recording: null,
    macroDepth: 0,
    lastMacro: null,
    lastPosition: null,
    jumpBack: [],
    jumpForward: [],
    overwrite: false,
    lastVisual: null,
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
    if (input.key === '[') return 'Escape';
    const lower = input.key.toLowerCase();
    return [
      'r', 'd', 'u', 'a', 'x', 'f', 'b', 'o', 'i', 'e', 'y', 'w', 'l', 'g', 'v', 't',
    ].includes(
      lower,
    )
      ? `C-${lower}`
      : null;
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
  if (state.recording && key !== 'q') {
    const current = state.macros[state.recording] ?? [];
    state = {
      ...state,
      macros: { ...state.macros, [state.recording]: [...current, key] },
    };
  }

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
    case 'D':
      return deleteToEnd(state, ['D']);
    case 'C':
      return changeToEnd(state, ['C']);
    case 'Y':
      return yankToEnd(state, ['Y']);
    case '>':
    case '<':
      return { ...state, pending: mapped, message: '' };
    case 'C-a':
      return adjustNumber(state, 1, ['C-a']);
    case 'C-x':
      return adjustNumber(state, -1, ['C-x']);
    case 'm':
    case "'":
    case '`':
    case '@':
    case 'Z':
    case 'z':
    case '"':
    case '[':
    case ']':
      return { ...state, pending: mapped, message: '' };
    case 'C-v':
      return {
        ...startVisual(state, 'visual'),
        message: '-- VISUAL -- (bloco aproximado como seleção por caractere)',
      };
    case 'C-w':
      return { ...state, message: 'divisão de janelas indisponível neste treinador' };
    case 'C-l':
      return { ...state, message: 'tela redesenhada' };
    case 'C-g':
      return {
        ...state,
        message: `vim-pratica.txt · ${state.lines.length} linhas · ${state.dirty ? 'modificado' : 'salvo'}`,
      };
    case 'q':
      return state.recording ? stopRecording(state) : { ...state, pending: 'q', message: '' };
    case 'R': {
      const started = startInsert(state, state.cursor, ['R']);
      return { ...started, overwrite: true, message: '-- REPLACE --' };
    }
    case 'U':
      return undo(state);
    case 'C-o':
      return jumpBackward(state);
    case 'C-i':
      return jumpForwardState(state);
    case 'C-e':
      return scrollLines(state, 1);
    case 'C-y':
      return scrollLines(state, -1);
    case '!':
    case '=':
      return { ...state, pending: mapped, message: '' };
    case '\\':
      return { ...state, message: 'atalho de leader não configurado neste treinador' };
    case '&':
      return { ...state, message: 'repetição de substituição indisponível' };
    case 'Q':
      return { ...state, message: 'modo Ex indisponível; use : para comandos' };
    case 'K':
      return { ...state, message: 'LSP indisponível neste treinador' };
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
      return { ...state, message: `comando Vim indisponível: ${mapped}` };
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

    if (
      mapped === 'd' ||
      mapped === 'c' ||
      mapped === 'y' ||
      mapped === '>' ||
      mapped === '<'
    ) {
      return { ...state, pending: pending + mapped };
    }

    if (mapped === 'x' || mapped === 'p' || mapped === 'P' || mapped === 'J' || mapped === '~') {
      return repeatAction(state, mapped, count);
    }

    return { ...state, pending: '', message: `comando incompleto: ${pending}${mapped}` };
  }

  const gMatch = pending.match(/^(\d*)g$/);
  if (gMatch) {
    const count = Number(gMatch[1]) || 1;
    const keys = [...Array.from(pending), mapped];

    if (mapped === 'g') {
      const motion = applyMotion(state.lines, state.cursor, 'gg', count, state.desiredCol);
      return motion ? applyMotionResult(state, motion) : { ...state, pending: '' };
    }

    if (mapped === 'J') return joinLines(state, count, keys, true);
    if (mapped === 'v') return restoreVisual(state);
    if (mapped === '*' || mapped === '#') return searchWord(state, mapped === '*' ? 1 : -1);
    if (mapped === '~' || mapped === 'u' || mapped === 'U') {
      return { ...state, pending: `g${mapped}`, message: '' };
    }
    if (['_', '0', 'm', 'e', 'E'].includes(mapped)) {
      const motion = applyMotion(state.lines, state.cursor, `g${mapped}`, count, state.desiredCol);
      return motion
        ? applyMotionResult(state, motion)
        : { ...state, pending: '', message: `movimento g${mapped} indisponível` };
    }

    const notes: Record<string, string> = {
      q: 'formatação indisponível',
      w: 'formatação indisponível',
      d: 'LSP indisponível neste treinador',
      r: 'LSP indisponível neste treinador',
      O: 'LSP indisponível neste treinador',
      i: 'inserção no último local ainda não é suportada',
      ';': 'change list indisponível',
      ',': 'change list indisponível',
    };
    return {
      ...state,
      pending: '',
      message: notes[mapped] ?? `g${mapped} indisponível neste treinador`,
    };
  }

  const shift = pending.match(/^(\d*)([<>])$/);
  if (shift) {
    const delta = shift[2] === '>' ? 1 : -1;
    const count = Number(shift[1]) || 1;
    const keys = [...Array.from(pending), mapped];

    if (mapped === shift[2]) {
      return shiftRange(state, lineRange(state.cursor, count), delta, keys);
    }

    const motion = applyMotion(state.lines, state.cursor, mapped, count, state.desiredCol);
    if (motion) return shiftRange(state, motionRange(state.cursor, motion), delta, keys);

    return { ...state, pending: '', message: `comando incompleto: ${pending}${mapped}` };
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

  if (pending === '=' || pending === '!') {
    return {
      ...state,
      pending: '',
      message:
        pending === '='
          ? 'auto-indentação indisponível neste treinador'
          : 'filtro de shell indisponível neste treinador',
    };
  }

  if (pending === 'm') {
    if (/^[a-zA-Z]$/.test(mapped)) {
      return {
        ...state,
        marks: { ...state.marks, [mapped]: state.cursor },
        pending: '',
        message: `marca '${mapped}' definida`,
      };
    }
    return { ...state, pending: '', message: 'marca inválida' };
  }

  if (pending === "'" || pending === '`') {
    return gotoMark(state, mapped, pending === '`');
  }

  if (pending === 'q') {
    if (/^[a-z]$/.test(mapped)) {
      return { ...state, recording: mapped, pending: '', message: `gravando @${mapped}` };
    }
    return { ...state, pending: '', message: 'registrador de macro inválido' };
  }

  if (pending === '@') return runMacro(state, mapped);

  if (pending === 'Z') {
    if (mapped === 'Z') return executeCommand({ ...state, command: 'wq' });
    if (mapped === 'Q') return executeCommand({ ...state, command: 'q!' });
    return { ...state, pending: '', message: `ZZ ou ZQ esperado, veio Z${mapped}` };
  }

  if (pending === 'z') return scrollCommand(state, mapped);

  if (pending === '"') {
    return {
      ...state,
      pending: '',
      message: 'registradores nomeados indisponíveis; use o registrador sem nome',
    };
  }

  if (pending === '[' || pending === ']') {
    return { ...state, pending: '', message: 'diagnósticos LSP indisponíveis neste treinador' };
  }

  const caseOperator = pending.match(/^g([~uU])$/);
  if (caseOperator) {
    const motion = applyMotion(state.lines, state.cursor, mapped, 1, state.desiredCol);
    if (!motion) return { ...state, pending: '', message: `movimento indisponível: g${caseOperator[1]}${mapped}` };
    return caseRange(
      state,
      motionRange(state.cursor, motion),
      caseOperator[1] as 'u' | 'U' | '~',
      [...Array.from(pending), mapped],
    );
  }

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

  // Vim quirk: `cw` behaves like `ce`, keeping the trailing space.
  const motionKey = op === 'c' && mapped === 'w' ? 'e' : op === 'c' && mapped === 'W' ? 'E' : mapped;
  const motion = applyMotion(state.lines, state.cursor, motionKey, count, state.desiredCol);
  if (motion) return operate(state, op as Op, motionRange(state.cursor, motion), keys);

  return { ...state, pending: '', message: `comando incompleto: ${pending}${mapped}` };
}

function applyMotionResult(state: VimState, motion: MotionResult): VimState {
  const jumped = Math.abs(motion.cursor.line - state.cursor.line) > 1;
  const base = jumped
    ? { ...pushJumpState(state), lastPosition: state.cursor }
    : state;
  return {
    ...base,
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
    overwrite: false,
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
    clampToBuffer(deleted.lines, range.start),
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

function joinLines(state: VimState, count: number, keys: string[], noSpace = false): VimState {
  const line = state.cursor.line;
  const end = Math.min(state.lines.length - 1, line + Math.max(1, count));
  if (end === line) return state;

  let merged = state.lines[line];
  for (let index = line + 1; index <= end; index += 1) {
    const part = state.lines[index].trimStart();
    merged += noSpace || merged.endsWith(' ') || part.startsWith(' ') || !part ? '' : ' ';
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

function shiftRange(
  state: VimState,
  range: TextRange,
  delta: 1 | -1,
  keys: string[],
): VimState {
  const base = pushUndo(state);
  const shifted = shiftLines(state.lines, range.start.line, range.end.line, delta);
  return {
    ...base,
    lines: shifted.lines,
    cursor: shifted.cursor,
    desiredCol: shifted.cursor.col,
    dirty: true,
    pending: '',
    mode: 'normal',
    anchor: null,
    lastChange: keys,
    message: '',
  };
}

function endOfLineRange(state: VimState): TextRange | null {
  const cells = chars(lineAt(state.lines, state.cursor.line));
  if (!cells.length) return null;
  return {
    start: state.cursor,
    end: { line: state.cursor.line, col: cells.length - 1 },
    linewise: false,
    inclusive: true,
  };
}

function deleteToEnd(state: VimState, keys: string[]): VimState {
  const range = endOfLineRange(state);
  return range ? operate(state, 'd', range, keys) : state;
}

function changeToEnd(state: VimState, keys: string[]): VimState {
  const range = endOfLineRange(state);
  return range ? operate(state, 'c', range, keys) : state;
}

function yankToEnd(state: VimState, keys: string[]): VimState {
  const range = endOfLineRange(state);
  return range ? operate(state, 'y', range, keys) : state;
}

function adjustNumber(state: VimState, delta: 1 | -1, keys: string[]): VimState {
  const line = lineAt(state.lines, state.cursor.line);
  const pattern = /\d+/g;
  let match: RegExpExecArray | null = pattern.exec(line);

  while (match) {
    const start = Array.from(line.slice(0, match.index)).length;
    const end = start + Array.from(match[0]).length;
    if (end > state.cursor.col) {
      const value = Number(match[0]) + delta;
      const nextLine =
        line.slice(0, match.index) + String(value) + line.slice(match.index + match[0].length);
      const base = pushUndo(state);
      return {
        ...base,
        lines: replaceLine(state.lines, state.cursor.line, nextLine),
        cursor: { line: state.cursor.line, col: start },
        desiredCol: start,
        dirty: true,
        lastChange: keys,
        message: '',
      };
    }
    match = pattern.exec(line);
  }

  return { ...state, message: 'nenhum número na linha' };
}

function stopRecording(state: VimState): VimState {
  const register = state.recording;
  return {
    ...state,
    recording: null,
    lastMacro: register ?? state.lastMacro,
    pending: '',
    message: register ? `macro @${register} gravada` : '',
  };
}

function runMacro(state: VimState, key: string): VimState {
  const register = key === '@' ? state.lastMacro : key;
  if (!register) return { ...state, pending: '', message: 'nenhuma macro anterior' };

  const keys = state.macros[register];
  if (!keys?.length) {
    return { ...state, pending: '', message: `macro @${register} vazia` };
  }
  if (state.macroDepth > 10) {
    return { ...state, pending: '', message: 'macros aninhadas demais' };
  }

  const seeded: VimState = {
    ...state,
    macroDepth: state.macroDepth + 1,
    lastMacro: register,
    pending: '',
    message: `@${register}`,
  };
  const next = keys.slice(0, 500).reduce(reduce, seeded);
  return { ...next, macroDepth: state.macroDepth };
}

function pushJumpState(state: VimState): VimState {
  return {
    ...state,
    jumpBack: [...state.jumpBack, state.cursor].slice(-100),
    jumpForward: [],
  };
}

function gotoMark(state: VimState, key: string, exact: boolean): VimState {
  const target =
    key === "'" || key === '`' ? state.lastPosition : state.marks[key];
  if (!target) {
    return { ...state, pending: '', message: `marca '${key}' não definida` };
  }

  const base = pushJumpState(state);
  const cursor = exact
    ? target
    : { line: target.line, col: firstNonBlank(lineAt(state.lines, target.line)) };
  return {
    ...base,
    cursor,
    desiredCol: cursor.col,
    lastPosition: state.cursor,
    pending: '',
    message: '',
  };
}

function jumpBackward(state: VimState): VimState {
  if (!state.jumpBack.length) return { ...state, message: 'sem salto anterior' };
  const target = state.jumpBack[state.jumpBack.length - 1];
  return {
    ...state,
    cursor: target,
    desiredCol: target.col,
    jumpBack: state.jumpBack.slice(0, -1),
    jumpForward: [...state.jumpForward, state.cursor].slice(-100),
    lastPosition: state.cursor,
    message: '',
  };
}

function jumpForwardState(state: VimState): VimState {
  if (!state.jumpForward.length) return { ...state, message: 'sem salto seguinte' };
  const target = state.jumpForward[state.jumpForward.length - 1];
  return {
    ...state,
    cursor: target,
    desiredCol: target.col,
    jumpForward: state.jumpForward.slice(0, -1),
    jumpBack: [...state.jumpBack, state.cursor].slice(-100),
    lastPosition: state.cursor,
    message: '',
  };
}

function scrollLines(state: VimState, delta: number): VimState {
  const max = Math.max(0, (state.lines.length - 1) * 22);
  return {
    ...state,
    scrollTop: clamp(state.scrollTop + delta * 22, 0, max),
    message: '',
  };
}

function scrollCommand(state: VimState, key: string): VimState {
  const max = Math.max(0, (state.lines.length - 1) * 22);
  const lineTop = state.cursor.line * 22;
  if (key === 't' || key === 'z' || key === 'b') {
    const top = key === 't' ? lineTop : key === 'b' ? lineTop - 418 : lineTop - 110;
    return { ...state, scrollTop: clamp(top, 0, max), pending: '', message: '' };
  }
  return {
    ...state,
    pending: '',
    message: `folds e z${key} indisponíveis neste treinador`,
  };
}

function restoreVisual(state: VimState): VimState {
  if (!state.lastVisual) return { ...state, message: 'nenhuma seleção anterior' };
  return {
    ...state,
    mode: 'visual',
    anchor: state.lastVisual.anchor,
    cursor: state.lastVisual.cursor,
    desiredCol: state.lastVisual.cursor.col,
    pending: '',
    message: '-- VISUAL --',
  };
}

function caseRange(
  state: VimState,
  range: TextRange,
  mode: 'u' | 'U' | '~',
  keys: string[],
): VimState {
  const base = pushUndo(state);
  const next = state.lines.slice();

  for (let lineIndex = range.start.line; lineIndex <= range.end.line; lineIndex += 1) {
    const cells = chars(lineAt(state.lines, lineIndex));
    if (!cells.length) continue;

    let from = 0;
    let to = cells.length - 1;
    if (!range.linewise) {
      if (lineIndex === range.start.line) from = range.start.col;
      if (lineIndex === range.end.line) {
        to = range.end.col - (range.inclusive ? 0 : 1);
      }
    }

    for (let index = Math.max(0, from); index <= Math.min(cells.length - 1, to); index += 1) {
      const char = cells[index];
      cells[index] =
        mode === 'u'
          ? char.toLowerCase()
          : mode === 'U'
            ? char.toUpperCase()
            : char === char.toLowerCase()
              ? char.toUpperCase()
              : char.toLowerCase();
    }
    next[lineIndex] = cells.join('');
  }

  return {
    ...base,
    lines: next,
    cursor: range.start,
    desiredCol: range.start.col,
    dirty: true,
    mode: 'normal',
    anchor: null,
    pending: '',
    lastChange: keys,
    message: '',
  };
}

function pasteOverSelection(state: VimState): VimState {
  if (!state.anchor) return state;
  if (!state.register) return { ...state, message: 'registrador vazio' };

  const range = rangeBetween(state.anchor, state.cursor, true, state.mode === 'visual-line');
  const base = pushUndo(state);
  const deleted = deleteRange(state.lines, range);
  const pasted = paste(deleted.lines, deleted.cursor, state.register, state.registerLinewise, false);
  return {
    ...base,
    lines: pasted.lines,
    cursor: clampCursor(pasted.lines, pasted.cursor),
    dirty: true,
    mode: 'normal',
    anchor: null,
    pending: '',
    lastChange: ['p'],
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
  if (key === 'C-w') return insertDeleteWord(state);
  if (key === 'C-u') return insertDeleteToStart(state);
  if (key === 'C-t' || key === 'C-d') {
    const shifted = shiftLines(state.lines, state.cursor.line, state.cursor.line, key === 'C-t' ? 1 : -1);
    return {
      ...state,
      lines: shifted.lines,
      cursor: {
        line: state.cursor.line,
        col: Math.min(
          state.cursor.col + (key === 'C-t' ? 2 : -2),
          Math.max(0, Array.from(shifted.lines[state.cursor.line]).length),
        ),
      },
      dirty: true,
      message: '',
    };
  }
  if (key === 'C-r' || key === 'C-n' || key === 'C-p' || key === 'C-o') {
    return { ...state, message: 'atalho de insert indisponível neste treinador' };
  }
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

  const line = lineAt(state.lines, state.cursor.line);
  const cells = chars(line);
  const nextLine =
    state.overwrite && state.cursor.col < cells.length
      ? replaceLine(state.lines, state.cursor.line, [
          ...cells.slice(0, state.cursor.col),
          key,
          ...cells.slice(state.cursor.col + 1),
        ].join(''))
      : replaceLine(
          state.lines,
          state.cursor.line,
          insertChar(line, state.cursor.col, key),
        );

  return {
    ...state,
    lines: nextLine,
    cursor: { line: state.cursor.line, col: state.cursor.col + 1 },
    desiredCol: state.cursor.col + 1,
    insertKeys: [...state.insertKeys, key],
    dirty: true,
  };
}

function insertDeleteWord(state: VimState): VimState {
  const cells = chars(lineAt(state.lines, state.cursor.line));
  let col = state.cursor.col;
  while (col > 0 && /\s/.test(cells[col - 1])) col -= 1;
  while (col > 0 && !/\s/.test(cells[col - 1])) col -= 1;
  return {
    ...state,
    lines: replaceLine(
      state.lines,
      state.cursor.line,
      [...cells.slice(0, col), ...cells.slice(state.cursor.col)].join(''),
    ),
    cursor: { line: state.cursor.line, col },
    desiredCol: col,
    insertKeys: [...state.insertKeys, 'C-w'],
    dirty: true,
  };
}

function insertDeleteToStart(state: VimState): VimState {
  const cells = chars(lineAt(state.lines, state.cursor.line));
  return {
    ...state,
    lines: replaceLine(
      state.lines,
      state.cursor.line,
      cells.slice(state.cursor.col).join(''),
    ),
    cursor: { line: state.cursor.line, col: 0 },
    desiredCol: 0,
    insertKeys: [...state.insertKeys, 'C-u'],
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
    overwrite: false,
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
  const target = findMatch(
    state.lines,
    needle,
    state.cursor,
    state.searchDirection,
    true,
    state.ignoreCase,
  );
  return {
    ...(target ? pushJumpState(state) : state),
    mode: 'normal',
    search: '',
    lastSearch: needle,
    cursor: target ?? state.cursor,
    lastPosition: target ? state.cursor : state.lastPosition,
    desiredCol: target?.col ?? state.desiredCol,
    message: target
      ? `${state.searchDirection === 1 ? '/' : '?'}${needle}`
      : `E486: padrão não encontrado: ${needle}`,
  };
}

function repeatSearch(state: VimState, direction: 1 | -1): VimState {
  if (!state.lastSearch) return { ...state, message: 'nenhuma busca anterior' };
  const target = findMatch(
    state.lines,
    state.lastSearch,
    state.cursor,
    direction,
    false,
    state.ignoreCase,
  );
  if (!target) return { ...state, message: `E486: padrão não encontrado: ${state.lastSearch}` };
  return {
    ...pushJumpState(state),
    cursor: target,
    lastPosition: state.cursor,
    desiredCol: target.col,
    searchDirection: direction,
    message: `${direction === 1 ? '/' : '?'}${state.lastSearch}`,
  };
}

function searchWord(state: VimState, direction: 1 | -1): VimState {
  const word = wordUnderCursor(state.lines, state.cursor);
  if (!word) return { ...state, message: 'nenhuma palavra sob o cursor' };
  const target = findMatch(
    state.lines,
    word,
    state.cursor,
    direction,
    false,
    state.ignoreCase,
  );
  return {
    ...(target ? pushJumpState(state) : state),
    lastSearch: word,
    lastPosition: target ? state.cursor : state.lastPosition,
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
  ignoreCase = false,
): VimCursor | null {
  const lowerNeedle = ignoreCase ? needle.toLowerCase() : needle;
  const hits: SearchHit[] = [];

  lines.forEach((line, lineIndex) => {
    const lower = ignoreCase ? line.toLowerCase() : line;
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
  if (state.anchor) {
    state = { ...state, lastVisual: { anchor: state.anchor, cursor: state.cursor } };
  }

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

  if (key === '>' || key === '<') {
    if (!state.anchor) return state;
    const range = rangeBetween(state.anchor, state.cursor, true, state.mode === 'visual-line');
    return shiftRange(state, range, key === '>' ? 1 : -1, [key]);
  }

  if (state.pending === 'g') {
    if (key === 'u' || key === 'U' || key === '~') {
      if (!state.anchor) return state;
      const range = rangeBetween(state.anchor, state.cursor, true, state.mode === 'visual-line');
      return caseRange(state, { ...range, inclusive: true }, key, ['g', key]);
    }
    return { ...state, pending: '', message: `g${key} indisponível na seleção` };
  }

  if (key === 'u' || key === 'U' || key === '~') {
    if (!state.anchor) return state;
    const range = rangeBetween(state.anchor, state.cursor, true, state.mode === 'visual-line');
    return caseRange(state, { ...range, inclusive: true }, key, [key]);
  }

  if (key === 'g') return { ...state, pending: 'g', message: '' };
  if (key === 'p') return pasteOverSelection(state);

  if (key === 'x' || key === 'X' || key === 'D') {
    if (!state.anchor) return state;
    const range = rangeBetween(state.anchor, state.cursor, true, state.mode === 'visual-line');
    return operate(state, 'd', { ...range, inclusive: true }, [key]);
  }

  if (key === 's' || key === 'S' || key === 'C') {
    if (!state.anchor) return state;
    const range = rangeBetween(state.anchor, state.cursor, true, state.mode === 'visual-line');
    return operate(state, 'c', { ...range, inclusive: true }, [key]);
  }

  if (key === 'Y') {
    if (!state.anchor) return state;
    const range = rangeBetween(state.anchor, state.cursor, true, state.mode === 'visual-line');
    return operate(state, 'y', { ...range, inclusive: true }, [key]);
  }

  if (key === ':') {
    return { ...state, message: 'comandos sobre a seleção ainda não são suportados' };
  }

  if (key === 'J') {
    if (!state.anchor) return state;
    const first = Math.min(state.anchor.line, state.cursor.line);
    const last = Math.max(state.anchor.line, state.cursor.line);
    let merged = state.lines[first];
    for (let index = first + 1; index <= last; index += 1) {
      const part = state.lines[index].trimStart();
      merged += merged.endsWith(' ') || part.startsWith(' ') || !part ? '' : ' ';
      merged += part;
    }
    const base = pushUndo(state);
    return {
      ...base,
      lines: [...state.lines.slice(0, first), merged, ...state.lines.slice(last + 1)],
      cursor: { line: first, col: 0 },
      desiredCol: 0,
      dirty: true,
      mode: 'normal',
      anchor: null,
      pending: '',
      lastChange: ['J'],
      message: '',
    };
  }

  if (/^[1-9]$/.test(key)) return { ...state, pending: key };

  const count = /^\d+$/.test(state.pending) ? Number(state.pending) : 1;
  const mapped = ARROWS[key] ?? key;
  const motion = applyMotion(state.lines, state.cursor, mapped, count, state.desiredCol);
  if (!motion) return { ...state, pending: '', message: `comando de seleção indisponível: ${key}` };

  return {
    ...state,
    cursor: motion.cursor,
    desiredCol: motion.desiredCol,
    pending: '',
    message: state.mode === 'visual' ? '-- VISUAL --' : '-- VISUAL LINE --',
  };
}

/* Exportado para testes e para o painel de desafios. */
