import { describe, expect, it } from 'vitest';
import { challenges, getChallenge, goalLabel, isSolved } from './challenges';
import { applyKeys, createState } from './keymap';

describe('challenges', () => {
  it('registers twelve unique missions', () => {
    expect(challenges).toHaveLength(12);
    expect(new Set(challenges.map((challenge) => challenge.slug)).size).toBe(12);
  });

  it('finds a mission by slug', () => {
    expect(getChallenge('hjkl')?.title).toBe('Mover sem as setas');
    expect(getChallenge('missing')).toBeUndefined();
  });

  it('describes each goal', () => {
    for (const challenge of challenges) {
      expect(goalLabel(challenge).length).toBeGreaterThan(0);
    }
  });

  it.each(challenges.map((challenge) => [challenge.slug, challenge] as const))(
    'solves %s with its reference keystrokes',
    (_slug, challenge) => {
      const state = applyKeys(createState(challenge.initialLines, challenge.start), challenge.solution);
      expect(isSolved(challenge, state)).toBe(true);
    },
  );

  it('does not report an untouched buffer as solved', () => {
    for (const challenge of challenges) {
      const state = createState(challenge.initialLines, challenge.start);
      if (challenge.goal.kind === 'text' || challenge.goal.kind === 'cursor') {
        const untouched = isSolved(challenge, state);
        expect(untouched).toBe(
          challenge.goal.kind === 'cursor' &&
            state.cursor.line === challenge.goal.at.line &&
            state.cursor.col === challenge.goal.at.col,
        );
      }
    }
  });

  it('keeps the par close to the reference solution', () => {
    for (const challenge of challenges) {
      expect(challenge.par).toBeGreaterThanOrEqual(challenge.solution.length);
    }
  });
});
