import type { Step } from './types';

export interface RunMetrics {
  steps: number;
  /** Frames that registered a comparison event. */
  comparisons: number;
  /** Frames that registered a swap/placement event. */
  swaps: number;
}

/**
 * Counts simulation events, not exact CPU operations or wall-clock time.
 * A frame with `cmp` counts as one comparison event, even if it highlights
 * more than one index.
 */
export function countRunMetrics(steps: Step[]): RunMetrics {
  return steps.reduce<RunMetrics>(
    (total, step) => ({
      steps: total.steps + 1,
      comparisons: total.comparisons + (step.cmp?.length ? 1 : 0),
      swaps: total.swaps + (step.swap?.length ? 1 : 0),
    }),
    { steps: 0, comparisons: 0, swaps: 0 },
  );
}
