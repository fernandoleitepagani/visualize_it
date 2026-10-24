import { describe, expect, it } from 'vitest';
import { lesson } from './switch-case';

const code = lesson.code.c ?? [];
const steps = lesson.steps([]);

const flow = (step: number) => steps[step]?.flow;
const branch = (step: number, id: string) =>
  flow(step)?.branches.find((item) => item.id === id);

describe('switch-case lesson', () => {
  it('declares the expected metadata', () => {
    expect(lesson.id).toBe('switch-case');
    expect(lesson.view).toBe('flow');
    expect(lesson.languages).toEqual(['c']);
    expect(lesson.inputless).toBe(true);
    expect(lesson.code.java).toBeUndefined();
  });

  it('produces fourteen well-formed steps inside the C listing', () => {
    expect(steps).toHaveLength(14);
    for (const step of steps) {
      expect(Number.isInteger(step.line)).toBe(true);
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
      expect(step.desc.length).toBeGreaterThan(0);
      expect(step.flow?.branches.length).toBe(4);
    }
  });

  it('starts with all cases idle and no output', () => {
    expect(flow(0)?.kind).toBe('switch');
    expect(flow(0)?.selector).toBe('opcao');
    expect(flow(0)?.branches.map((item) => [item.id, item.state])).toEqual([
      ['case-1', 'idle'],
      ['case-2', 'idle'],
      ['case-3', 'idle'],
      ['default', 'idle'],
    ]);
    expect(flow(0)?.result).toBeUndefined();
    expect(flow(0)?.next).toBe('return 0;');
  });

  it('evaluates case 1 as false and skips it', () => {
    expect(branch(2, 'case-1')).toMatchObject({
      condition: 'opcao == 1',
      evaluation: '2 == 1',
      result: false,
      state: 'skipped',
    });
    expect(branch(2, 'case-2')?.state).toBe('idle');
  });

  it('matches case 2 and executes its printf', () => {
    expect(branch(5, 'case-2')).toMatchObject({
      condition: 'opcao == 2',
      evaluation: '2 == 2',
      result: true,
      state: 'active',
    });
    expect(branch(6, 'case-2')).toMatchObject({
      state: 'done',
      statements: ['printf("Dois")'],
    });
    expect(flow(6)?.result).toEqual({ label: 'saída', value: 'Dois' });
  });

  it('shows break and explains the fall-through risk', () => {
    expect(branch(7, 'case-2')).toMatchObject({ state: 'done', exit: 'break' });
    expect(flow(7)?.note).toMatch(/fall-through|sem break/i);
  });

  it('ignores case 3 and default after the break', () => {
    expect(branch(13, 'case-3')).toMatchObject({ state: 'skipped', result: false });
    expect(branch(13, 'default')).toMatchObject({ state: 'skipped' });
    expect(flow(13)?.result).toEqual({ label: 'saída', value: 'Dois' });
  });

  it('does not evaluate the remaining cases after the break', () => {
    for (const index of [8, 9, 10, 11, 12]) {
      expect(branch(index, 'case-3')?.state).toBe('skipped');
      expect(branch(index, 'default')?.state).toBe('skipped');
      expect(flow(index)?.note).toMatch(/fall-through|sem break/i);
    }
  });

  it('ignores the input values', () => {
    expect(lesson.steps([])).toEqual(lesson.steps([9, 8, 7]));
  });
});
