import type { VimCursor } from './types';

/** Character-aware helpers. Columns are code-point indexes, not UTF-16 units. */
export function chars(line: string): string[] {
  return Array.from(line);
}

export function lineLength(line: string): number {
  return chars(line).length;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lineAt(lines: string[], index: number): string {
  return lines[clamp(index, 0, lines.length - 1)] ?? '';
}

/** Keeps a cursor inside the buffer. Normal mode never sits past the last char. */
export function clampCursor(
  lines: string[],
  cursor: VimCursor,
  allowEndOfLine = false,
): VimCursor {
  const line = clamp(cursor.line, 0, Math.max(0, lines.length - 1));
  const length = lineLength(lineAt(lines, line));
  const max = allowEndOfLine ? length : Math.max(0, length - 1);
  return { line, col: clamp(cursor.col, 0, max) };
}

export function firstNonBlank(line: string): number {
  const cells = chars(line);
  let index = 0;
  while (index < cells.length && /\s/.test(cells[index])) index += 1;
  return index;
}

export function replaceLine(lines: string[], index: number, value: string): string[] {
  const next = lines.slice();
  next[index] = value;
  return next;
}

export function insertChar(line: string, col: number, char: string): string {
  const cells = chars(line);
  cells.splice(clamp(col, 0, cells.length), 0, char);
  return cells.join('');
}

export function insertText(line: string, col: number, text: string): string {
  const cells = chars(line);
  cells.splice(clamp(col, 0, cells.length), 0, ...chars(text));
  return cells.join('');
}

export function removeChar(line: string, col: number): string {
  const cells = chars(line);
  cells.splice(col, 1);
  return cells.join('');
}

export function wordUnderCursor(lines: string[], cursor: VimCursor): string | null {
  const cells = chars(lineAt(lines, cursor.line));
  if (!cells.length) return null;
  const isWord = (char: string) => /[A-Za-z0-9_]/.test(char);
  if (!isWord(cells[cursor.col])) return null;
  let start = cursor.col;
  let end = cursor.col;
  while (start > 0 && isWord(cells[start - 1])) start -= 1;
  while (end + 1 < cells.length && isWord(cells[end + 1])) end += 1;
  return cells.slice(start, end + 1).join('');
}
