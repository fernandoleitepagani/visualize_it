import { describe, expect, it } from 'vitest';
import type { Step } from './types';
import { buildQuizQuestion, sameArray } from './quiz';

const steps: Step[] = [
  { line: 0, desc: 'a', arr: [3, 1, 2] },
  { line: 1, desc: 'b', arr: [1, 3, 2] },
  { line: 2, desc: 'c', arr: [1, 2, 3] },
];

/** Deterministic RNG so the option set is reproducible. */
function rng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe('buildQuizQuestion', () => {
  it('returns three options including the correct next array', () => {
    const question = buildQuizQuestion(steps, 0, rng(42));

    expect(question).not.toBeNull();
    expect(question?.options).toHaveLength(3);
    expect(question?.correct).toEqual([1, 3, 2]);
    expect(question?.options.some((option) => sameArray(option, question.correct))).toBe(true);
  });

  it('never repeats an option', () => {
    const question = buildQuizQuestion(steps, 0, rng(7));
    const unique = new Set(question?.options.map((option) => option.join(',')));

    expect(unique.size).toBe(3);
  });

  it('returns null at the last step', () => {
    expect(buildQuizQuestion(steps, steps.length - 1)).toBeNull();
  });

  it('returns null without an array payload', () => {
    expect(buildQuizQuestion([{ line: 0, desc: 'sem vetor' }], 0)).toBeNull();
  });
});
