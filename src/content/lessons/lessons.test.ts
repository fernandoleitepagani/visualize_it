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
    ['bucket', [0.5, 0.2, 0.9, 0.1, 0.7]],
    ['radix', [5, 2, 9, 1, 7]],
  ];

  it.each(cases)('%s ends fully sorted', (slug, input) => {
    const steps = lessons[slug].steps([...input]);
    const lastWithArray = [...steps].reverse().find((step) => step.arr);
    expect(lastWithArray?.arr).toEqual(sortedCopy(input));
  });
});

describe.each(['selecao', 'insercao', 'bolha', 'counting', 'bucket'] as const)(
  '%s — variantes de implementação',
  (slug) => {
    const input = lessons[slug].initial ?? [5, 2, 9, 1, 7];
    const approaches = ['iterativo', 'recursivo'] as const;

    it.each(approaches)('%s termina com o vetor ordenado', (approach) => {
      const steps = lessons[slug].steps([...input], approach);
      const lastWithArray = [...steps].reverse().find((step) => step.arr);
      expect(lastWithArray?.arr).toEqual(sortedCopy(input));
    });

    it.each(approaches)('%s destaca apenas linhas existentes no código', (approach) => {
      const lesson = lessons[slug];
      const listing = lesson.codeVariants?.[approach] ?? lesson.code;
      const steps = lesson.steps([...input], approach);
      const languages = lesson.languages ?? (['java', 'c'] as const);

      for (const language of languages) {
        const code = listing[language];
        expect(code).toBeDefined();
        for (const step of steps) {
          expect(step.line).toBeGreaterThanOrEqual(0);
          expect(step.line).toBeLessThan(code!.length);
        }
      }
    });

    it('tem as duas análises de complexidade preenchidas', () => {
      expect(lessons[slug].complexityAnalysis?.comparisons).toBeTruthy();
      expect(lessons[slug].complexityAnalysis?.movements).toBeTruthy();
    });
  },
);

describe('sorting lessons — complexity analysis placeholder', () => {
  const sortingLessons = [
    'selecao',
    'insercao',
    'bolha',
    'shellsort',
    'quicksort',
    'mergesort',
    'heapsort',
    'counting',
    'bucket',
    'radix',
  ] as const;

  it.each(sortingLessons)('%s reserves the analysis card', (slug) => {
    expect(lessons[slug].complexityAnalysis).toBeDefined();
  });
});

describe('linked-list lesson', () => {
  it('lista-dupla exposes prev/next so the nodes view can draw both directions', () => {
    const steps = lessons['lista-dupla'].steps([10, 20, 30]);
    const last = steps[steps.length - 1];
    const nodes = last.nodes ?? [];

    expect(nodes.length).toBeGreaterThan(1);
    expect(nodes[0].prev ?? null).toBeNull();
    expect(nodes[1].prev).toBe(nodes[0].id);
    expect(nodes[0].next).toBe(nodes[1].id);
    expect(nodes.every((node) => 'prev' in node && 'next' in node)).toBe(true);
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

describe('summation lesson', () => {
  it('accumulates the total and ends on the last term', () => {
    const steps = lessons.soma.steps([3, 5, 2]);
    const last = steps[steps.length - 1];

    expect(last.plot?.points.map((point) => point.value)).toEqual([3, 5, 2]);
    expect(last.plot?.total).toBe(10);
    expect(last.plot?.current).toBe(2);
  });

  it('never decreases the running total', () => {
    const steps = lessons.soma.steps([3, 5, 2]);
    const totals = steps.map((step) => step.plot?.total ?? 0);

    expect(totals).toEqual([...totals].sort((a, b) => a - b));
    expect(totals[0]).toBe(0);
  });
});
