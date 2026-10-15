import { describe, expect, it } from 'vitest';
import { lessons } from '@/content/lessons';
import { DEFAULT_INPUT } from '@/engine/types';

const sortedCopy = (xs: number[]) => [...xs].sort((a, b) => a - b);

describe('lessons — well-formed steps', () => {
  for (const [slug, lesson] of Object.entries(lessons)) {
    it(`${slug} produces non-empty, well-formed steps`, () => {
      const input = lesson.initial ?? DEFAULT_INPUT;
      const steps = lesson.steps([...input]);

      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        expect(Number.isInteger(step.line)).toBe(true);
        expect(step.line).toBeGreaterThanOrEqual(0);
        expect(typeof step.desc).toBe('string');
        expect(step.desc.length).toBeGreaterThan(0);
      }
    });
  }
});

describe('sorting invariants', () => {
  const cases: Array<[keyof typeof lessons, number[]]> = [
    ['selecao', [5, 2, 9, 1, 7]],
    ['insercao', [5, 2, 9, 1, 7]],
    ['bolha', [5, 2, 9, 1, 7]],
    ['shellsort', [5, 2, 9, 1, 7]],
    ['quicksort', [5, 2, 9, 1, 7]],
    ['mergesort', [5, 2, 9, 1, 7]],
    ['heapsort', [5, 2, 9, 1, 7]],
    ['counting', [5, 2, 9, 1, 7]],
    ['radix', [5, 2, 9, 1, 7]],
  ];

  it.each(cases)('%s ends fully sorted', (slug, input) => {
    const steps = lessons[slug].steps([...input]);
    const lastWithArray = [...steps].reverse().find((step) => step.arr);
    expect(lastWithArray?.arr).toEqual(sortedCopy(input));
  });
});

describe('loop lessons', () => {
  const sumTo = (n: number) => (n * (n + 1)) / 2;

  it.each([
    ['while', 6],
    ['do-while', 6],
  ] as const)('%s acumula 1..n', (slug, n) => {
    const steps = lessons[slug].steps([n]);
    const last = steps[steps.length - 1];
    const total = last.cells?.find((cell) => cell.labels?.includes('S'))?.val;
    expect(total).toBe(sumTo(n));
  });
});
