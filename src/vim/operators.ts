import { chars, clamp, clampCursor, firstNonBlank, lineAt, lineLength } from './buffer';
import type { MotionResult } from './motions';
import type { VimCursor } from './types';

export interface TextRange {
  start: VimCursor;
  end: VimCursor;
  linewise: boolean;
  /** Include the character at `end` (only meaningful charwise). */
  inclusive: boolean;
}

function isAfter(a: VimCursor, b: VimCursor): boolean {
  return a.line > b.line || (a.line === b.line && a.col > b.col);
}

/** Builds an ordered range. Backward motions exclude the cursor character. */
export function rangeBetween(
  from: VimCursor,
  to: VimCursor,
  inclusive: boolean,
  linewise = false,
): TextRange {
  const forward = !isAfter(from, to);
  return {
    start: forward ? from : to,
    end: forward ? to : from,
    linewise,
    inclusive: forward ? inclusive : false,
  };
}

export function motionRange(from: VimCursor, motion: MotionResult): TextRange {
  const range = rangeBetween(from, motion.cursor, motion.inclusive, motion.linewise);
  return {
    ...range,
    start: range.linewise ? { line: range.start.line, col: 0 } : range.start,
  };
}

/** Whole lines covered by a linewise operator such as `dd` or `2yy`. */
export function lineRange(cursor: VimCursor, count: number): TextRange {
  return {
    start: { line: cursor.line, col: 0 },
    end: { line: cursor.line + Math.max(1, count) - 1, col: 0 },
    linewise: true,
    inclusive: true,
  };
}

function wordClass(char: string): 'space' | 'word' | 'punct' {
  if (/\s/.test(char)) return 'space';
  return /[A-Za-z0-9_]/.test(char) ? 'word' : 'punct';
}

function wordObject(lines: string[], cursor: VimCursor, around: boolean): TextRange | null {
  const cells = chars(lineAt(lines, cursor.line));
  if (!cells.length) return null;

  const cls = wordClass(cells[clamp(cursor.col, 0, cells.length - 1)]);
  let start = clamp(cursor.col, 0, cells.length - 1);
  let end = start;

  if (cls === 'space') {
    while (start > 0 && wordClass(cells[start - 1]) === 'space') start -= 1;
    while (end + 1 < cells.length && wordClass(cells[end + 1]) === 'space') end += 1;
  } else {
    while (start > 0 && wordClass(cells[start - 1]) === cls) start -= 1;
    while (end + 1 < cells.length && wordClass(cells[end + 1]) === cls) end += 1;
  }

  if (around) {
    let extended = false;
    while (end + 1 < cells.length && wordClass(cells[end + 1]) === 'space') {
      end += 1;
      extended = true;
    }
    if (!extended) {
      while (start > 0 && wordClass(cells[start - 1]) === 'space') start -= 1;
    }
  }

  return {
    start: { line: cursor.line, col: start },
    end: { line: cursor.line, col: end },
    linewise: false,
    inclusive: true,
  };
}

const PAIRS: Record<string, [string, string]> = {
  '(': ['(', ')'],
  ')': ['(', ')'],
  '{': ['{', '}'],
  '}': ['{', '}'],
  '[': ['[', ']'],
  ']': ['[', ']'],
  '"': ['"', '"'],
  "'": ["'", "'"],
  '`': ['`', '`'],
};

function delimiterObject(
  lines: string[],
  cursor: VimCursor,
  object: string,
  around: boolean,
): TextRange | null {
  const pair = PAIRS[object];
  if (!pair) return null;
  const [open, close] = pair;
  const cells = chars(lineAt(lines, cursor.line));

  let left = -1;
  for (let index = cursor.col; index >= 0; index -= 1) {
    if (cells[index] === open && (open !== close || index < cursor.col)) {
      left = index;
      break;
    }
  }
  if (left < 0 && open === close) {
    for (let index = cursor.col; index < cells.length; index += 1) {
      if (cells[index] === open) {
        left = index;
        break;
      }
    }
  }
  if (left < 0) return null;

  let right = -1;
  for (let index = Math.max(left + 1, cursor.col); index < cells.length; index += 1) {
    if (cells[index] === close) {
      right = index;
      break;
    }
  }
  if (right < 0) return null;

  return {
    start: { line: cursor.line, col: around ? left : left + 1 },
    end: { line: cursor.line, col: around ? right : right - 1 },
    linewise: false,
    inclusive: true,
  };
}

function paragraphObject(
  lines: string[],
  cursor: VimCursor,
  around: boolean,
): TextRange | null {
  let start = cursor.line;
  while (start > 0 && lineAt(lines, start - 1).trim() !== '') start -= 1;

  let end = cursor.line;
  while (end < lines.length - 1 && lineAt(lines, end + 1).trim() !== '') end += 1;

  if (around && end + 1 < lines.length && lineAt(lines, end + 1).trim() === '') end += 1;

  return {
    start: { line: start, col: 0 },
    end: { line: end, col: 0 },
    linewise: true,
    inclusive: true,
  };
}

/** `iw`, `aw`, `i"`, `a"`, `i(`, `a(`, … */
export function textObjectRange(
  lines: string[],
  cursor: VimCursor,
  object: string,
  around: boolean,
): TextRange | null {
  if (object === 'w') return wordObject(lines, cursor, around);
  if (object === 'W') return wordObject(lines, cursor, around);
  if (object === 'p') return paragraphObject(lines, cursor, around);
  return delimiterObject(lines, cursor, object, around);
}

/** Text that an operator should copy for a range. */
export function rangeText(lines: string[], range: TextRange): string {
  if (range.linewise) {
    return lines.slice(range.start.line, range.end.line + 1).join('\n');
  }

  if (range.start.line === range.end.line) {
    const cells = chars(lineAt(lines, range.start.line));
    return cells.slice(range.start.col, range.end.col + (range.inclusive ? 1 : 0)).join('');
  }

  const first = chars(lineAt(lines, range.start.line)).slice(range.start.col).join('');
  const last = chars(lineAt(lines, range.end.line))
    .slice(0, range.end.col + (range.inclusive ? 1 : 0))
    .join('');
  const middle = lines.slice(range.start.line + 1, range.end.line);
  return [first, ...middle, last].join('\n');
}

export function deleteRange(
  lines: string[],
  range: TextRange,
): { lines: string[]; cursor: VimCursor } {
  if (range.linewise) {
    const first = clamp(range.start.line, 0, lines.length - 1);
    const last = clamp(range.end.line, first, lines.length - 1);
    const next = [...lines.slice(0, first), ...lines.slice(last + 1)];
    const result = next.length ? next : [''];
    const line = clamp(first, 0, result.length - 1);
    return { lines: result, cursor: { line, col: firstNonBlank(result[line]) } };
  }

  const { start, end } = range;
  if (start.line === end.line) {
    const cells = chars(lineAt(lines, start.line));
    const from = clamp(start.col, 0, cells.length);
    const to = clamp(end.col + (range.inclusive ? 1 : 0), from, cells.length);
    const line = [...cells.slice(0, from), ...cells.slice(to)].join('');
    const next = lines.slice();
    next[start.line] = line;
    return {
      lines: next,
      cursor: { line: start.line, col: clamp(from, 0, Math.max(0, lineLength(line) - 1)) },
    };
  }

  const first = chars(lineAt(lines, start.line)).slice(0, start.col).join('');
  const last = chars(lineAt(lines, end.line))
    .slice(end.col + (range.inclusive ? 1 : 0))
    .join('');
  const joined = first + last;
  const next = [
    ...lines.slice(0, start.line),
    joined,
    ...lines.slice(end.line + 1),
  ];
  return {
    lines: next,
    cursor: { line: start.line, col: clamp(start.col, 0, Math.max(0, lineLength(joined) - 1)) },
  };
}

export function yankRange(
  lines: string[],
  range: TextRange,
): { text: string; linewise: boolean } {
  return { text: rangeText(lines, range), linewise: range.linewise };
}

/** Paste charwise or linewise text after/before the cursor. */
export function paste(
  lines: string[],
  cursor: VimCursor,
  text: string,
  linewise: boolean,
  after: boolean,
): { lines: string[]; cursor: VimCursor } {
  if (!text) return { lines, cursor };

  if (linewise) {
    const block = text.split('\n');
    const index = clamp(cursor.line + (after ? 1 : 0), 0, lines.length);
    const next = [...lines.slice(0, index), ...block, ...lines.slice(index)];
    return {
      lines: next,
      cursor: { line: index, col: firstNonBlank(lineAt(next, index)) },
    };
  }

  const parts = text.split('\n');
  const line = lineAt(lines, cursor.line);
  const cells = chars(line);
  const at = clamp(cursor.col + (after ? 1 : 0), 0, cells.length);

  if (parts.length === 1) {
    const nextLine = [...cells.slice(0, at), ...chars(parts[0]), ...cells.slice(at)].join('');
    const next = lines.slice();
    next[cursor.line] = nextLine;
    return { lines: next, cursor: { line: cursor.line, col: at } };
  }

  const head = cells.slice(0, at).join('') + parts[0];
  const tail = parts[parts.length - 1] + cells.slice(at).join('');
  const middle = parts.slice(1, -1);
  const next = [
    ...lines.slice(0, cursor.line),
    head,
    ...middle,
    tail,
    ...lines.slice(cursor.line + 1),
  ];
  return { lines: next, cursor: { line: cursor.line, col: at } };
}

/** `>>` / `<<`: shifts whole lines by two spaces. */
export function shiftLines(
  lines: string[],
  first: number,
  last: number,
  delta: 1 | -1,
): { lines: string[]; cursor: VimCursor } {
  const start = clamp(first, 0, lines.length - 1);
  const end = clamp(last, start, lines.length - 1);
  const next = lines.slice();

  for (let index = start; index <= end; index += 1) {
    if (delta > 0) {
      next[index] = `  ${next[index]}`;
      continue;
    }
    if (next[index].startsWith('\t')) {
      next[index] = next[index].slice(1);
      continue;
    }
    let remove = 0;
    while (remove < 2 && next[index][remove] === ' ') remove += 1;
    next[index] = next[index].slice(remove);
  }

  return {
    lines: next,
    cursor: { line: start, col: firstNonBlank(next[start]) },
  };
}

export function clampToBuffer(lines: string[], cursor: VimCursor): VimCursor {
  return clampCursor(lines, cursor, true);
}
