import { describe, expect, it } from 'vitest';
import { countRunMetrics } from './runMetrics';

describe('countRunMetrics', () => {
  it('handles an empty run', () => {
    expect(countRunMetrics([])).toEqual({ steps: 0, comparisons: 0, swaps: 0 });
  });

  it('counts comparison and swap frames', () => {
    expect(
      countRunMetrics([
        { line: 0, desc: 'início' },
        { line: 1, desc: 'compara', cmp: [0, 1] },
        { line: 1, desc: 'compara de novo', cmp: [1, 2] },
        { line: 2, desc: 'troca', swap: [0, 1] },
      ]),
    ).toEqual({ steps: 4, comparisons: 2, swaps: 1 });
  });
});
