import { beforeEach, describe, expect, it } from 'vitest';
import { readStoredInput, storeInput } from './persistedInput';

describe('persistedInput', () => {
  beforeEach(() => localStorage.clear());

  it('stores and reads an array per lesson', () => {
    storeInput('selecao', [5, 2, 9]);
    storeInput('bolha', [1, 2, 3]);

    expect(readStoredInput('selecao')).toEqual([5, 2, 9]);
    expect(readStoredInput('bolha')).toEqual([1, 2, 3]);
    expect(readStoredInput('quicksort')).toBeNull();
  });

  it('ignores corrupt, non-numeric or out-of-bounds values', () => {
    localStorage.setItem('visualize-it:input:selecao', 'not json');
    expect(readStoredInput('selecao')).toBeNull();

    localStorage.setItem('visualize-it:input:selecao', JSON.stringify(['x']));
    expect(readStoredInput('selecao')).toBeNull();

    localStorage.setItem(
      'visualize-it:input:selecao',
      JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]),
    );
    expect(readStoredInput('selecao')).toBeNull();
  });
});
