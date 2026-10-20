/** Geometry for one bar, measured as percentages from the bottom of the plot. */
export interface BarMetrics {
  bottomPercent: number;
  heightPercent: number;
  negative: boolean;
  zero: boolean;
}

export interface BarScale {
  /** Position of the zero line, as a percentage from the bottom. */
  zeroPercent: number;
  bars: BarMetrics[];
  hasNegatives: boolean;
  hasPositives: boolean;
}

/**
 * Maps array values to a zero-anchored chart.
 *
 * Zero is always part of the domain, so positive and negative values grow from
 * the same baseline. The domain is padded to include zero instead of starting
 * at the smallest value, which keeps magnitudes comparable across steps.
 */
export function getBarScale(values: number[]): BarScale {
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min;
  const zeroPercent = span === 0 ? 0 : ((0 - min) / span) * 100;

  return {
    zeroPercent,
    hasNegatives: min < 0,
    hasPositives: max > 0,
    bars: values.map((value) => {
      if (span === 0) {
        return { bottomPercent: 0, heightPercent: 0, negative: false, zero: true };
      }

      const valuePercent = ((value - min) / span) * 100;
      if (value >= 0) {
        return {
          bottomPercent: zeroPercent,
          heightPercent: Math.max(valuePercent - zeroPercent, 0),
          negative: false,
          zero: value === 0,
        };
      }

      return {
        bottomPercent: valuePercent,
        heightPercent: Math.max(zeroPercent - valuePercent, 0),
        negative: true,
        zero: false,
      };
    }),
  };
}
