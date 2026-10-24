import { describe, expect, it } from 'vitest';
import { lesson } from './ternario';

const code = lesson.code.c ?? [];
const steps = lesson.steps([]);

const flow = (step: number) => steps[step]?.flow;
const branch = (step: number, id: string) =>
  flow(step)?.branches.find((item) => item.id === id);

describe('ternario lesson', () => {
  it('declares the expected metadata', () => {
    expect(lesson.id).toBe('ternario');
    expect(lesson.view).toBe('flow');
    expect(lesson.languages).toEqual(['c']);
    expect(lesson.inputless).toBe(true);
    expect(lesson.code.java).toBeUndefined();
  });

  it('produces six well-formed steps inside the C listing', () => {
    expect(steps).toHaveLength(6);
    for (const step of steps) {
      expect(Number.isInteger(step.line)).toBe(true);
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
      expect(step.desc.length).toBeGreaterThan(0);
      expect(step.flow?.branches.length).toBe(2);
    }
  });

  it('starts with both expressions idle and no result', () => {
    expect(flow(0)?.kind).toBe('ternary');
    expect(flow(0)?.selector).toBe('a > b');
    expect(flow(0)?.branches.map((item) => item.state)).toEqual(['idle', 'idle']);
    expect(flow(0)?.result).toBeUndefined();
    expect(flow(0)?.next).toBe('printf("%d", maior);');
  });

  it('evaluates a > b as true and activates the true branch', () => {
    expect(branch(2, 'true')).toMatchObject({
      condition: 'a > b',
      evaluation: '8 > 5',
      result: true,
      state: 'active',
    });
    expect(branch(2, 'false')?.state).toBe('idle');
  });

  it('selects a, assigns maior = 8 and ignores b', () => {
    expect(branch(3, 'true')).toMatchObject({
      state: 'done',
      value: 'a = 8',
    });
    expect(branch(3, 'false')).toMatchObject({
      state: 'skipped',
      value: 'b = 5',
    });
    expect(flow(3)?.result).toEqual({ label: 'maior', value: 8 });
    expect(steps[3]?.vars).toMatchObject({ a: 8, b: 5, maior: 8 });
  });

  it('keeps the selected value on screen until the end', () => {
    for (const index of [4, 5]) {
      expect(branch(index, 'true')?.state).toBe('done');
      expect(branch(index, 'false')?.state).toBe('skipped');
      expect(flow(index)?.result).toEqual({ label: 'maior', value: 8 });
    }
    expect(steps[5]?.vars).toMatchObject({ maior: 8, saida: 8 });
  });

  it('ignores the input values', () => {
    expect(lesson.steps([])).toEqual(lesson.steps([4, 5, 6]));
  });
});
