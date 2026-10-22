import { describe, expect, it } from 'vitest';
import { getEntryLocation } from '@/content/subjects';
import { lessons } from '@/content/lessons';
import type { Lesson, Step } from '@/engine/types';

const stringLessons = [
  'strings',
  'strlen',
  'strcpy',
  'strcat',
  'strcmp',
  'busca-string',
  'strtok',
] as const;

const cCode = (lesson: Lesson) => lesson.code.c ?? [];
const values = (step: Step | undefined, label: string) =>
  step?.strings?.rows.find((row) => row.label === label)?.cells.map((cell) => cell.val);
const lastStep = (lesson: Lesson) => {
  const steps = lesson.steps(lesson.initial ?? [1]);
  return steps[steps.length - 1];
};

describe('string lessons — shape', () => {
  it.each(stringLessons)('%s uses the strings view and C only', (slug) => {
    const lesson = lessons[slug];

    expect(lesson.view).toBe('strings');
    expect(lesson.languages).toEqual(['c']);
    expect(lesson.code.java).toBeUndefined();
    expect(lesson.inputless).toBe(true);
  });

  it.each(stringLessons)('%s produces string frames inside its C listing', (slug) => {
    const lesson = lessons[slug];
    const code = cCode(lesson);
    const steps = lesson.steps(lesson.initial ?? [1]);

    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.strings?.rows.length).toBeGreaterThan(0);
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
    }
  });

  it.each(stringLessons)('%s belongs to the string group', (slug) => {
    expect(getEntryLocation(slug)?.group.id).toBe('string');
  });
});

describe('strlen', () => {
  it('counts the characters before the terminator', () => {
    const steps = lessons.strlen.steps([1]);
    const final = steps[steps.length - 1];

    expect(final.strings?.result?.value).toBe('6');
    expect(values(final, 's')).toEqual(['B', 'A', 'N', 'A', 'N', 'A', '\\0']);
    expect(steps.some((step) => step.vars?.n === 6)).toBe(true);
  });
});

describe('strcpy', () => {
  it('copies the whole source and its terminator', () => {
    const final = lastStep(lessons.strcpy);

    expect(values(final, 'copia1')).toEqual(['B', 'A', 'N', 'A', 'N', 'A', '\\0']);
  });

  it('starts both destinations as empty buffers', () => {
    const first = lessons.strcpy.steps([1])[0];

    expect(values(first, 'copia1')).toEqual(['\\0', null, null, null, null, null, null]);
    expect(values(first, 'copia2')).toEqual(['\\0', null, null, null, null, null, null]);
  });

  it('limits strncpy to the first three characters and leaves the terminator explicit', () => {
    const code = cCode(lessons.strcpy);
    const steps = lessons.strcpy.steps([1]);
    const copyLine = code.findIndex((line) => line.includes('strncpy(copia2'));
    const terminatorLine = code.findIndex((line) => line.includes('copia2[3]'));
    const before = steps.filter((step) => step.line === copyLine).at(-1);
    const after = steps.find((step) => step.line === terminatorLine);

    expect(values(before, 'copia2')?.slice(0, 3)).toEqual(['B', 'A', 'N']);
    expect(values(before, 'copia2')?.[3]).toBe('\\0');
    expect(values(after, 'copia2')?.[3]).toBe('\\0');
  });

  it('runs both printf calls and shows their output', () => {
    const outputs = lessons.strcpy
      .steps([1])
      .filter((step) => step.strings?.result?.label === 'saída')
      .map((step) => step.strings?.result?.value);

    expect(outputs).toEqual(['BANANA', 'BANANA · BAN']);
  });

  it('draws copy links between the source and the destination', () => {
    const steps = lessons.strcpy.steps([1]);

    expect(steps.some((step) => (step.strings?.links?.length ?? 0) > 0)).toBe(true);
  });
});

describe('strcat', () => {
  it('appends the suffix and respects the strncat limit', () => {
    const final = lastStep(lessons.strcat);

    expect(values(final, 'destino')?.slice(0, 9)).toEqual([
      'B',
      'A',
      'N',
      'A',
      'N',
      'A',
      '!',
      '!',
      '\\0',
    ]);
    expect(final.strings?.result?.value).toBe('BANANA!!');
  });

  it('marks the final destination terminator as a terminator', () => {
    const final = lastStep(lessons.strcat);
    const destino = final.strings?.rows.find((row) => row.label === 'destino');

    expect(destino?.cells[8]).toMatchObject({ val: '\\0', state: 'terminator' });
  });
});

describe('strcmp', () => {
  it('marks the first difference and stops', () => {
    const steps = lessons.strcmp.steps([1]);
    const difference = steps.find((step) =>
      step.strings?.rows.some((row) => row.cells.some((cell) => cell.state === 'diff')),
    );

    expect(difference).toBeDefined();
    expect(difference?.vars?.resultado).toMatch(/> 0/);
  });

  it('reports strncmp as equal for the first three characters', () => {
    const final = lastStep(lessons.strcmp);

    expect(final.vars?.y).toBe(0);
  });
});

describe('string search', () => {
  it('points p, q and r at the expected indexes', () => {
    const final = lastStep(lessons['busca-string']);
    const cells = final.strings?.rows[0].cells ?? [];
    const pointerIndex = (label: string) =>
      cells.findIndex((cell) => cell.labels?.includes(label));

    expect(pointerIndex('p')).toBe(2);
    expect(pointerIndex('q')).toBe(4);
    expect(pointerIndex('r')).toBe(1);
    expect(final.strings?.result?.value).toContain('p=2');
    expect(final.strings?.result?.value).toContain('q=4');
    expect(final.strings?.result?.value).toContain('r=1');
  });

  it('shows NULL when the character is absent', () => {
    const steps = lessons['busca-string'].steps([1]);

    expect(steps.some((step) => step.vars?.nulo === 'NULL')).toBe(true);
  });
});

describe('strtok', () => {
  it('keeps the commas until strtok reaches them', () => {
    const steps = lessons.strtok.steps([1]);
    const first = values(steps[0], 'frase');

    expect(first?.[2]).toBe(',');
    expect(first?.[7]).toBe(',');
  });

  it('replaces the delimiters with terminators', () => {
    const final = lastStep(lessons.strtok);
    const cells = final.strings?.rows[0].cells ?? [];

    expect(cells[2].val).toBe('\\0');
    expect(cells[7].val).toBe('\\0');
    expect(final.strings?.result?.value).toBe('um · dois · tres');
  });

  it('marks the mutated delimiters as writes', () => {
    const steps = lessons.strtok.steps([1]);
    const writes = steps.flatMap((step) =>
      (step.strings?.rows[0].cells ?? []).filter(
        (cell) => cell.state === 'write' && cell.val === '\\0',
      ),
    );

    expect(writes.length).toBeGreaterThanOrEqual(2);
  });

  it('runs printf after each token and accumulates the output', () => {
    const code = cCode(lessons.strtok);
    const printLine = code.findIndex((line) => line.includes('printf'));
    const printed = lessons.strtok
      .steps([1])
      .filter((step) => step.line === printLine)
      .map((step) => step.strings?.result?.value);

    expect(printed).toEqual(['um', 'um · dois', 'um · dois · tres']);
  });
});

describe('strings overview', () => {
  it('shows the terminator and separates sizeof from strlen', () => {
    const final = lastStep(lessons.strings);

    expect(values(final, 'nome')).toEqual(['A', 'n', 'a', '\\0']);
    expect(final.strings?.result?.value).toBe('3');
  });
});
