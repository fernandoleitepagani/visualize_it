import { describe, expect, it } from 'vitest';
import {
  chars,
  clampCursor,
  firstNonBlank,
  insertChar,
  insertText,
  lineLength,
  removeChar,
  wordUnderCursor,
} from './buffer';

describe('buffer', () => {
  it('counts code points instead of UTF-16 units', () => {
    expect(lineLength('a😀b')).toBe(3);
    expect(chars('a😀b')).toEqual(['a', '😀', 'b']);
  });

  it('clamps normal mode to the last character', () => {
    expect(clampCursor(['abc'], { line: 0, col: 99 })).toEqual({ line: 0, col: 2 });
    expect(clampCursor(['ab'], { line: 9, col: 9 })).toEqual({ line: 0, col: 1 });
  });

  it('allows the end of the line for insert mode', () => {
    expect(clampCursor(['abc'], { line: 0, col: 99 }, true)).toEqual({ line: 0, col: 3 });
  });

  it('keeps an empty buffer addressable', () => {
    expect(clampCursor([''], { line: 0, col: 4 })).toEqual({ line: 0, col: 0 });
  });

  it('finds the first non-blank column', () => {
    expect(firstNonBlank('   valor')).toBe(3);
    expect(firstNonBlank('')).toBe(0);
  });

  it('inserts and removes characters without touching the rest', () => {
    expect(insertChar('abc', 1, 'X')).toBe('aXbc');
    expect(insertText('abc', 3, '!!')).toBe('abc!!');
    expect(removeChar('abc', 1)).toBe('ac');
    expect(insertChar('a😀b', 1, 'x')).toBe('ax😀b');
  });

  it('reads the word under the cursor', () => {
    expect(wordUnderCursor(['const total = 0;'], { line: 0, col: 8 })).toBe('total');
    expect(wordUnderCursor(['const total = 0;'], { line: 0, col: 5 })).toBeNull();
  });
});
