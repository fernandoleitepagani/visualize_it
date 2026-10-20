import { describe, expect, it } from 'vitest';
import { parseInput } from './parseInput';

describe('parseInput', () => {
  it('accepts commas, semicolons, spaces and newlines', () => {
    expect(parseInput('5,2,9')).toEqual([5, 2, 9]);
    expect(parseInput('5; 2; 9')).toEqual([5, 2, 9]);
    expect(parseInput('5 2\n9')).toEqual([5, 2, 9]);
  });

  it('rejects empty, non-numeric and out-of-bounds input', () => {
    expect(parseInput('')).toBeNull();
    expect(parseInput('5, x')).toBeNull();
    expect(parseInput('1,2,3,4,5,6,7,8,9,10,11,12,13')).toBeNull();
  });

  it('accepts the boundaries', () => {
    expect(parseInput('7')).toEqual([7]);
    expect(parseInput('1,2,3,4,5,6,7,8,9,10,11,12')).toHaveLength(12);
  });
});
