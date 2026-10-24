import { describe, expect, it } from 'vitest';
import { lesson } from './if-else';

const code = lesson.code.c ?? [];
const steps = lesson.steps([]);

const flow = (step: number) => steps[step]?.flow;
const branch = (step: number, id: string) =>
  flow(step)?.branches.find((item) => item.id === id);

describe('if-else lesson', () => {
  it('declares the expected metadata', () => {
    expect(lesson.id).toBe('if-else');
    expect(lesson.view).toBe('flow');
    expect(lesson.languages).toEqual(['c']);
    expect(lesson.inputless).toBe(true);
    expect(lesson.code.java).toBeUndefined();
  });

  it('produces eight well-formed steps inside the C listing', () => {
    expect(steps).toHaveLength(8);
    for (const step of steps) {
      expect(Number.isInteger(step.line)).toBe(true);
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
      expect(step.desc.length).toBeGreaterThan(0);
      expect(step.flow?.branches.length).toBe(3);
    }
  });

  it('starts with every branch idle and no output', () => {
    expect(flow(0)?.kind).toBe('if');
    expect(flow(0)?.branches.map((item) => [item.id, item.state])).toEqual([
      ['if', 'idle'],
      ['else-if', 'idle'],
      ['else', 'idle'],
    ]);
    expect(flow(0)?.result).toBeUndefined();
  });

  it('evaluates nota >= 9 as false and skips the first branch', () => {
    expect(flow(1)?.selector).toBe('nota >= 9');
    expect(branch(1, 'if')).toMatchObject({
      condition: 'nota >= 9',
      evaluation: '7 >= 9',
      result: false,
      state: 'skipped',
    });
    expect(branch(1, 'else-if')?.state).toBe('idle');
  });

  it('evaluates nota >= 6 as true and activates the else-if branch', () => {
    expect(flow(3)?.selector).toBe('nota >= 6');
    expect(branch(3, 'if')).toMatchObject({ state: 'skipped' });
    expect(branch(3, 'else-if')).toMatchObject({
      condition: 'nota >= 6',
      evaluation: '7 >= 6',
      result: true,
      state: 'active',
    });
    expect(branch(3, 'else')?.state).toBe('idle');
  });

  it('executes the else-if block and shows Aprovado as the output', () => {
    expect(branch(4, 'else-if')).toMatchObject({
      state: 'done',
      statements: ['printf("Aprovado")'],
    });
    expect(branch(4, 'else')).toMatchObject({ state: 'skipped' });
    expect(flow(4)?.result).toEqual({ label: 'saída', value: 'Aprovado' });
    expect(steps[4]?.vars).toMatchObject({ nota: 7, saida: 'Aprovado' });
  });

  it('keeps the skipped branches visible until the end', () => {
    for (const index of [5, 6, 7]) {
      expect(branch(index, 'if')?.state).toBe('skipped');
      expect(branch(index, 'else-if')?.state).toBe('done');
      expect(branch(index, 'else')?.state).toBe('skipped');
      expect(flow(index)?.result).toEqual({ label: 'saída', value: 'Aprovado' });
    }
  });

  it('ignores the input values', () => {
    expect(lesson.steps([])).toEqual(lesson.steps([1, 2, 3]));
  });
});
