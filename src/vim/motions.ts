import { chars, firstNonBlank, clamp, clampCursor, lineAt, lineLength } from './buffer';
import type { VimCursor } from './types';

export interface MotionResult {
  cursor: VimCursor;
  /** True when the motion lands on the last character (e, $). */
  inclusive: boolean;
  /** Operator applied to lines rather than characters (j, k, G, gg). */
  linewise: boolean;
  desiredCol: number;
}

type CharClass = 'space' | 'word' | 'punct';

function classOf(char: string, bigWord = false): CharClass {
  if (/\s/.test(char)) return 'space';
  if (bigWord || /[A-Za-z0-9_]/.test(char)) return 'word';
  return 'punct';
}

function stepLeft(lines: string[], cursor: VimCursor): VimCursor | null {
  if (cursor.col > 0) return { line: cursor.line, col: cursor.col - 1 };
  if (cursor.line > 0) {
    const line = cursor.line - 1;
    return { line, col: Math.max(0, lineLength(lineAt(lines, line)) - 1) };
  }
  return null;
}

function stepRight(lines: string[], cursor: VimCursor): VimCursor | null {
  const length = lineLength(lineAt(lines, cursor.line));
  if (cursor.col < length - 1) return { line: cursor.line, col: cursor.col + 1 };
  if (cursor.line < lines.length - 1) {
    return { line: cursor.line + 1, col: 0 };
  }
  return null;
}

/** Start of the next word/WORD, crossing lines and landing on blank lines. */
function nextWordStart(lines: string[], from: VimCursor, bigWord: boolean): VimCursor {
  let cursor = { ...from };
  const cells = chars(lineAt(lines, cursor.line));

  if (cursor.col >= cells.length) {
    if (cursor.line >= lines.length - 1) return cursor;
    const line = cursor.line + 1;
    return { line, col: firstNonBlank(lineAt(lines, line)) };
  }

  const cls = classOf(cells[cursor.col], bigWord);
  if (cls !== 'space') {
    while (
      cursor.col < cells.length &&
      classOf(cells[cursor.col], bigWord) === cls &&
      classOf(cells[cursor.col], bigWord) !== 'space'
    ) {
      cursor.col += 1;
    }
  }

  for (;;) {
    const line = lineAt(lines, cursor.line);
    const charsInLine = chars(line);
    if (cursor.col < charsInLine.length) {
      if (classOf(charsInLine[cursor.col], bigWord) !== 'space') return cursor;
      cursor.col += 1;
      continue;
    }
    if (cursor.line >= lines.length - 1) {
      return { line: cursor.line, col: Math.max(0, charsInLine.length - 1) };
    }
    cursor = { line: cursor.line + 1, col: 0 };
    // A blank line is a word stop in Vim.
    if (lineLength(lineAt(lines, cursor.line)) === 0) return cursor;
  }
}

/** Start of the current or previous word/WORD. */
function prevWordStart(lines: string[], from: VimCursor, bigWord: boolean): VimCursor {
  let cursor = stepLeft(lines, from);
  if (!cursor) return { line: 0, col: 0 };

  for (;;) {
    const cells = chars(lineAt(lines, cursor.line));
    if (!cells.length) {
      const prev = stepLeft(lines, { line: cursor.line, col: 0 });
      if (!prev) return { line: 0, col: 0 };
      cursor = prev;
      continue;
    }
    if (classOf(cells[cursor.col], bigWord) !== 'space') break;
    const prev = stepLeft(lines, cursor);
    if (!prev) return { line: 0, col: 0 };
    cursor = prev;
  }

  const cells = chars(lineAt(lines, cursor.line));
  const cls = classOf(cells[cursor.col], bigWord);
  while (
    cursor.col > 0 &&
    classOf(cells[cursor.col - 1], bigWord) === cls &&
    classOf(cells[cursor.col - 1], bigWord) !== 'space'
  ) {
    cursor.col -= 1;
  }
  return cursor;
}

/** End of the current or next word/WORD, inclusive. */
function wordEnd(lines: string[], from: VimCursor, bigWord: boolean): VimCursor {
  let cursor = stepRight(lines, from);
  if (!cursor) return from;

  for (;;) {
    const cells = chars(lineAt(lines, cursor.line));
    if (!cells.length) {
      const next = stepRight(lines, { line: cursor.line, col: 0 });
      if (!next) return cursor;
      cursor = next;
      continue;
    }
    if (classOf(cells[cursor.col], bigWord) !== 'space') break;
    const next = stepRight(lines, cursor);
    if (!next) return cursor;
    cursor = next;
  }

  const cells = chars(lineAt(lines, cursor.line));
  const cls = classOf(cells[cursor.col], bigWord);
  while (
    cursor.col + 1 < cells.length &&
    classOf(cells[cursor.col + 1], bigWord) === cls
  ) {
    cursor.col += 1;
  }
  return cursor;
}

function vertical(lines: string[], cursor: VimCursor, delta: number, desiredCol: number): VimCursor {
  const line = clamp(cursor.line + delta, 0, lines.length - 1);
  const length = lineLength(lineAt(lines, line));
  return { line, col: clamp(desiredCol, 0, Math.max(0, length - 1)) };
}

function horizontal(lines: string[], cursor: VimCursor, delta: number): VimCursor {
  let next = cursor;
  const step = delta > 0 ? 1 : -1;
  for (let index = 0; index < Math.abs(delta); index += 1) {
    const moved = step > 0 ? stepRight(lines, next) : stepLeft(lines, next);
    if (!moved) break;
    next = moved;
  }
  return clampCursor(lines, next);
}

/**
 * Resolves a motion key to a cursor. Returns `null` when the key is not a
 * motion, so callers can keep counting pending keys.
 */
export function applyMotion(
  lines: string[],
  cursor: VimCursor,
  key: string,
  count: number,
  desiredCol = cursor.col,
): MotionResult | null {
  const times = Math.max(1, count);
  let next = cursor;
  let inclusive = false;
  let linewise = false;

  switch (key) {
    case 'h':
      next = horizontal(lines, cursor, -times);
      break;
    case 'l':
      next = horizontal(lines, cursor, times);
      break;
    case 'j':
      next = vertical(lines, cursor, times, desiredCol);
      linewise = true;
      break;
    case 'k':
      next = vertical(lines, cursor, -times, desiredCol);
      linewise = true;
      break;
    case 'w':
    case 'W': {
      const big = key === 'W';
      for (let index = 0; index < times; index += 1) next = nextWordStart(lines, next, big);
      // `dw` on the last word must consume it: Vim deletes to the end of the line.
      inclusive =
        next.line === lines.length - 1 && next.col === Math.max(0, lineLength(lineAt(lines, next.line)) - 1);
      break;
    }
    case 'b':
    case 'B': {
      const big = key === 'B';
      for (let index = 0; index < times; index += 1) next = prevWordStart(lines, next, big);
      break;
    }
    case 'e':
    case 'E': {
      const big = key === 'E';
      for (let index = 0; index < times; index += 1) next = wordEnd(lines, next, big);
      inclusive = true;
      break;
    }
    case '0':
      next = { line: cursor.line, col: 0 };
      break;
    case '^':
      next = { line: cursor.line, col: firstNonBlank(lineAt(lines, cursor.line)) };
      break;
    case '$':
      next = {
        line: cursor.line,
        col: Math.max(0, lineLength(lineAt(lines, cursor.line)) - 1),
      };
      inclusive = true;
      break;
    case 'gg':
      next = {
        line: Math.max(0, times > 1 ? times - 1 : 0),
        col: 0,
      };
      next.col = firstNonBlank(lineAt(lines, next.line));
      linewise = true;
      break;
    case 'G':
      next = { line: times > 1 ? Math.min(lines.length - 1, times - 1) : lines.length - 1, col: 0 };
      next.col = firstNonBlank(lineAt(lines, next.line));
      linewise = true;
      break;
    case 'C-d':
      next = vertical(lines, cursor, 10, desiredCol);
      linewise = true;
      break;
    case 'C-u':
      next = vertical(lines, cursor, -10, desiredCol);
      linewise = true;
      break;
    default:
      return null;
  }

  return {
    cursor: clampCursor(lines, next),
    inclusive,
    linewise,
    desiredCol: key === 'j' || key === 'k' ? desiredCol : next.col,
  };
}

/** `f`/`F`/`t`/`T`: character search on the current line. */
export function findChar(
  lines: string[],
  cursor: VimCursor,
  command: 'f' | 'F' | 't' | 'T',
  char: string,
  count = 1,
): VimCursor | null {
  const cells = chars(lineAt(lines, cursor.line));
  const step = command === 'f' || command === 't' ? 1 : -1;
  let position = cursor.col;
  let found = 0;

  for (;;) {
    position += step;
    if (position < 0 || position >= cells.length) return null;
    if (cells[position] === char) {
      found += 1;
      if (found === count) {
        if (command === 't' || command === 'T') position -= step;
        return { line: cursor.line, col: position };
      }
    }
  }
}
