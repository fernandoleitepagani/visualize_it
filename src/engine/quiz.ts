import type { Step } from './types';

export interface QuizQuestion {
  /** The array produced by the next step. */
  correct: number[];
  /** Shuffled options; exactly one equals `correct`. */
  options: number[][];
}

/** Compares two numeric arrays by value. */
export function sameArray(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Builds a multiple-choice question about the next frame of a bars lesson.
 *
 * Distractors are produced by swapping two positions of the current array, so
 * they stay plausible. Returns `null` when the lesson has no array payload,
 * there is no next step, or no distinct wrong answer could be generated.
 *
 * `random` is injectable so tests can be deterministic.
 */
export function buildQuizQuestion(
  steps: Step[],
  index: number,
  random: () => number = Math.random,
): QuizQuestion | null {
  const current = steps[index]?.arr;
  const correct = steps[index + 1]?.arr;
  if (!current || !correct || current.length < 2) return null;

  const options: number[][] = [correct];
  let attempts = 0;

  while (options.length < 3 && attempts < 50) {
    attempts += 1;

    const a = Math.floor(random() * current.length);
    let b = Math.floor(random() * current.length);
    if (a === b) b = (b + 1) % current.length;

    const candidate = [...current];
    [candidate[a], candidate[b]] = [candidate[b], candidate[a]];

    if (!options.some((option) => sameArray(option, candidate))) {
      options.push(candidate);
    }
  }

  if (options.length < 3) return null;

  return { correct, options: shuffle(options, random) };
}
