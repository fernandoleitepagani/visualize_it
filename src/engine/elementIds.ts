import type { Step } from './types';

/**
 * Gives every array element a stable identity across a whole timeline, so the
 * bars view can animate a swap as two bars sliding past each other instead of
 * the numbers teleporting between fixed columns.
 *
 * Matching is per frame: an element keeps its id when the same value is still
 * at the same index, otherwise it inherits the id of the nearest previous
 * element holding that value; genuinely new values get a fresh id. O(n²) per
 * frame, with n ≤ 12 in practice.
 */
export function assignElementIds(steps: Step[]): string[][] {
  const result: string[][] = [];
  let prevValues: number[] | null = null;
  let prevIds: string[] = [];
  let nextId = 0;

  for (const step of steps) {
    const values = step.arr;
    if (!values) {
      result.push(prevIds);
      continue;
    }

    const previous = prevValues;
    if (!previous) {
      const ids = values.map(() => `e${nextId++}`);
      prevValues = values;
      prevIds = ids;
      result.push(ids);
      continue;
    }

    const used = previous.map(() => false);
    const ids = values.map((value, i) => {
      if (!used[i] && previous[i] === value) {
        used[i] = true;
        return prevIds[i];
      }
      const match = previous.findIndex((v, j) => !used[j] && v === value);
      if (match >= 0) {
        used[match] = true;
        return prevIds[match];
      }
      return `e${nextId++}`;
    });

    prevValues = values;
    prevIds = ids;
    result.push(ids);
  }

  return result;
}
