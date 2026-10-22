import { describe, expect, it } from 'vitest';
import { applyMotion, findChar } from './motions';

const lines = ['alpha beta', 'gama, delta', '   epsilon', ''];

describe('motions', () => {
  it('moves horizontally and clamps at the line edges', () => {
    expect(applyMotion(lines, { line: 0, col: 0 }, 'l', 1)?.cursor).toEqual({ line: 0, col: 1 });
    expect(applyMotion(lines, { line: 0, col: 0 }, 'h', 1)?.cursor).toEqual({ line: 0, col: 0 });
    expect(applyMotion(lines, { line: 0, col: 4 }, 'l', 5)?.cursor).toEqual({ line: 0, col: 9 });
  });

  it('moves vertically and remembers the desired column', () => {
    const result = applyMotion(lines, { line: 0, col: 8 }, 'j', 1, 8);
    expect(result?.cursor.line).toBe(1);
    expect(result?.cursor.col).toBe(8);
    expect(applyMotion(lines, { line: 0, col: 2 }, 'k', 1)?.cursor.line).toBe(0);
  });

  it('jumps by word and WORD', () => {
    expect(applyMotion(lines, { line: 1, col: 0 }, 'w', 1)?.cursor).toEqual({ line: 1, col: 4 });
    expect(applyMotion(lines, { line: 1, col: 6 }, 'b', 1)?.cursor).toEqual({ line: 1, col: 4 });
    expect(applyMotion(lines, { line: 1, col: 4 }, 'b', 1)?.cursor).toEqual({ line: 1, col: 0 });
    expect(applyMotion(lines, { line: 0, col: 0 }, 'e', 1)?.cursor).toEqual({ line: 0, col: 4 });
    expect(applyMotion(['foo.bar baz'], { line: 0, col: 0 }, 'w', 1)?.cursor).toEqual({
      line: 0,
      col: 3,
    });
    expect(applyMotion(['foo.bar baz'], { line: 0, col: 0 }, 'W', 1)?.cursor).toEqual({
      line: 0,
      col: 8,
    });
  });

  it('moves to line edges', () => {
    expect(applyMotion(lines, { line: 2, col: 5 }, '0', 1)?.cursor).toEqual({ line: 2, col: 0 });
    expect(applyMotion(lines, { line: 2, col: 0 }, '^', 1)?.cursor).toEqual({ line: 2, col: 3 });
    expect(applyMotion(lines, { line: 0, col: 0 }, '$', 1)?.cursor).toEqual({ line: 0, col: 9 });
    expect(applyMotion(lines, { line: 0, col: 0 }, '$', 1)?.inclusive).toBe(true);
  });

  it('goes to the first and last lines', () => {
    expect(applyMotion(lines, { line: 2, col: 4 }, 'gg', 1)?.cursor).toEqual({ line: 0, col: 0 });
    expect(applyMotion(lines, { line: 0, col: 0 }, 'G', 1)?.cursor).toEqual({ line: 3, col: 0 });
    expect(applyMotion(lines, { line: 0, col: 0 }, 'G', 3)?.cursor.line).toBe(2);
    expect(applyMotion(lines, { line: 3, col: 0 }, 'gg', 2)?.cursor.line).toBe(1);
  });

  it('lands on blank lines when crossing them with w', () => {
    expect(applyMotion(['a', '', 'b'], { line: 0, col: 0 }, 'w', 1)?.cursor).toEqual({
      line: 1,
      col: 0,
    });
  });

  it('finds characters forward, backward and before the target', () => {
    const text = ['abcdef'];
    expect(findChar(text, { line: 0, col: 0 }, 'f', 'd')).toEqual({ line: 0, col: 3 });
    expect(findChar(text, { line: 0, col: 5 }, 'F', 'b')).toEqual({ line: 0, col: 1 });
    expect(findChar(text, { line: 0, col: 0 }, 't', 'c')).toEqual({ line: 0, col: 1 });
    expect(findChar(text, { line: 0, col: 5 }, 'T', 'd')).toEqual({ line: 0, col: 4 });
    expect(findChar(text, { line: 0, col: 0 }, 'f', 'z')).toBeNull();
  });

  it('returns null for non-motions', () => {
    expect(applyMotion(lines, { line: 0, col: 0 }, 'z', 1)).toBeNull();
  });
});
