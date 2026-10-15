import { describe, expect, it } from 'vitest';
import { assignElementIds } from './elementIds';
import type { Step } from './types';

const frame = (...arr: number[]): Step => ({ line: 0, desc: '', arr });

describe('assignElementIds', () => {
  it('keeps ids stable when the array is unchanged', () => {
    const ids = assignElementIds([frame(3, 1, 2), frame(3, 1, 2)]);
    expect(ids[0]).toEqual(ids[1]);
  });

  it('swaps ids when two values trade places', () => {
    const [before, after] = assignElementIds([frame(1, 2), frame(2, 1)]);
    expect(after).toEqual([before[1], before[0]]);
  });

  it('gives genuinely new values a fresh id', () => {
    const [before, after] = assignElementIds([frame(1, 2), frame(1, 2, 3)]);
    expect(after[2]).not.toBe(before[0]);
    expect(after[2]).not.toBe(before[1]);
  });

  it('carries the last known ids through frames without an array', () => {
    const ids = assignElementIds([frame(1, 2), { line: 0, desc: '' }, frame(1, 2)]);
    expect(ids[1]).toEqual(ids[0]);
    expect(ids[2]).toEqual(ids[0]);
  });
});
