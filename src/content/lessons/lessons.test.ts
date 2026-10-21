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

describe.each(['selecao', 'insercao', 'bolha'] as const)(
  '%s — variantes de implementação',
  (slug) => {
    const input = [5, 2, 9, 1, 7];
    const approaches = ['iterativo', 'recursivo'] as const;

    it.each(approaches)('%s termina com o vetor ordenado', (approach) => {
      const steps = lessons[slug].steps([...input], approach);
      const lastWithArray = [...steps].reverse().find((step) => step.arr);
      expect(lastWithArray?.arr).toEqual(sortedCopy(input));
    });

    it.each(approaches)('%s destaca apenas linhas existentes no código', (approach) => {
      const listing = lessons[slug].codeVariants?.[approach] ?? lessons[slug].code;
      const steps = lessons[slug].steps([...input], approach);

      for (const step of steps) {
        expect(step.line).toBeGreaterThanOrEqual(0);
        expect(step.line).toBeLessThan(listing.java.length);
        expect(step.line).toBeLessThan(listing.c.length);
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
    'radix',
  ] as const;

  it.each(sortingLessons)('%s reserves the analysis card', (slug) => {
    expect(lessons[slug].complexityAnalysis).toBeDefined();
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

describe('aritmetica lesson — pointer arithmetic', () => {
  const input = lessons.aritmetica.initial ?? [];
  const steps = lessons.aritmetica.steps([...input]);

  const stepAt = (line: number) => steps.find((step) => step.line === line);
  const pointerIndex = (line: number) =>
    stepAt(line)?.cells?.findIndex((cell) => cell.labels?.includes('▼ p')) ?? -1;
  const writtenIndex = (line: number) =>
    stepAt(line)?.cells?.findIndex((cell) => cell.state === 'write') ?? -1;

  it('applies the pointer operations to the vector', () => {
    const last = [...steps].reverse().find((step) => step.cells);

    expect(last?.cells?.map((cell) => cell.val)).toEqual([2, 9, 6, 16, 6]);
  });

  it('uses the values typed by the user', () => {
    const custom = lessons.aritmetica.steps([1, 2, 3, 4, 5]);
    const last = [...custom].reverse().find((step) => step.cells);

    expect(last?.cells?.map((cell) => cell.val)).toEqual([1, 7, 3, 8, 3]);
  });

  it('moves the pointer when p changes', () => {
    expect(pointerIndex(11)).toBe(1);
    expect(pointerIndex(2)).toBe(3);
    expect(pointerIndex(4)).toBe(2);
  });

  it('shows the pointer address in the variables panel', () => {
    expect(stepAt(2)?.vars?.p).toBe('0x100c');
    expect(stepAt(2)?.vars?.['*p']).toBe(8);
  });

  it('highlights the cell written by each assignment', () => {
    expect(writtenIndex(1)).toBe(1);
    expect(writtenIndex(3)).toBe(3);
    expect(writtenIndex(5)).toBe(4);
  });

  it('keeps every highlighted line inside the C listing', () => {
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(lessons.aritmetica.code.c.length);
    }
  });

  it('points each step at the C command that performs the operation', () => {
    const commands: Array<[number, RegExp]> = [
      [9, /int v\[5\] = \{2, 4, 6, 8, 10\};/],
      [11, /altera\(v \+ 1\);/],
      [1, /\*p \+= 5;/],
      [2, /p \+= 2;/],
      [3, /\*p = \*\(p-1\) \+ \*\(p\+1\);/],
      [4, /p--;/],
      [5, /\*\(p\+2\) = \*p;/],
      [13, /for\(int i = 0; i < 5; i\+\+\)\{/],
      [14, /printf\("%d ", v\[i\]\);/],
    ];

    for (const [line, command] of commands) {
      expect(lessons.aritmetica.code.c[line]).toMatch(command);
    }
  });

  it('warns that Java has no pointer arithmetic', () => {
    expect(lessons.aritmetica.code.java.join('\n')).toMatch(/Java não tem aritmética de ponteiros/);
  });
});
