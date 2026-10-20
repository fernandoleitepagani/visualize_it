import { describe, expect, it } from 'vitest';
import { getBarScale } from '@/components/barScale';

describe('getBarScale', () => {
  it('anchors positive values at the bottom', () => {
    const scale = getBarScale([5, 10]);

    expect(scale.zeroPercent).toBe(0);
    expect(scale.hasNegatives).toBe(false);
    expect(scale.hasPositives).toBe(true);
    expect(scale.bars).toEqual([
      { bottomPercent: 0, heightPercent: 50, negative: false, zero: false },
      { bottomPercent: 0, heightPercent: 100, negative: false, zero: false },
    ]);
  });

  it('grows negative and positive values from the same zero line', () => {
    const scale = getBarScale([-4, 6]);

    expect(scale.zeroPercent).toBe(40);
    expect(scale.bars).toEqual([
      { bottomPercent: 0, heightPercent: 40, negative: true, zero: false },
      { bottomPercent: 40, heightPercent: 60, negative: false, zero: false },
    ]);
  });

  it('puts the zero line at the top when every value is negative', () => {
    const scale = getBarScale([-4, -2]);

    expect(scale.zeroPercent).toBe(100);
    expect(scale.bars).toEqual([
      { bottomPercent: 0, heightPercent: 100, negative: true, zero: false },
      { bottomPercent: 50, heightPercent: 50, negative: true, zero: false },
    ]);
  });

  it('keeps an all-zero vector flat', () => {
    const scale = getBarScale([0, 0]);

    expect(scale.zeroPercent).toBe(0);
    expect(scale.bars.every((bar) => bar.zero && bar.heightPercent === 0)).toBe(true);
  });

  it('returns an empty series for an empty vector', () => {
    expect(getBarScale([])).toEqual({
      zeroPercent: 0,
      bars: [],
      hasNegatives: false,
      hasPositives: false,
    });
  });
});
