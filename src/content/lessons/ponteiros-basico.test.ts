import { describe, expect, it } from 'vitest';
import { lesson } from './ponteiros-basico';

const code = lesson.code.c ?? [];
const lineOf = (text: string) => {
  const index = code.findIndex((line) => line.includes(text));
  expect(index).toBeGreaterThanOrEqual(0);
  return index;
};
const steps = lesson.steps([]);
const stepAt = (text: string) => {
  const line = lineOf(text);
  const step = steps.find((candidate) => candidate.line === line);
  expect(step).toBeDefined();
  return step!;
};
const boxAt = (text: string, id: string) =>
  stepAt(text).pointers?.boxes.find((box) => box.id === id);

describe('ponteiros-basico lesson', () => {
  it('declares the expected metadata', () => {
    expect(lesson.id).toBe('ponteiros-basico');
    expect(lesson.view).toBe('pointers');
    expect(lesson.languages).toEqual(['c']);
    expect(lesson.inputless).toBe(true);
    expect(lesson.code.java).toBeUndefined();
    expect(lesson.complexity.stable).toBeUndefined();
  });

  it('produces 12 well-formed steps inside the C listing', () => {
    expect(steps).toHaveLength(12);
    for (const step of steps) {
      expect(Number.isInteger(step.line)).toBe(true);
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
      expect(step.desc.length).toBeGreaterThan(0);
    }
  });

  it('points p at x and exposes both addresses in the variables panel', () => {
    const step = stepAt('int *p = &x');
    const p = boxAt('int *p = &x', 'p');

    expect(p?.value).toBe('0x1000');
    expect(p?.targetId).toBe('x');
    expect(step.vars?.p).toBe('0x1000');
    expect(step.vars?.['&p']).toBe('0x1008');
    expect(step.vars?.['*p']).toBe(42);
  });

  it('writes 99 through p', () => {
    const step = stepAt('*p = 99');
    const x = boxAt('*p = 99', 'x');
    const p = boxAt('*p = 99', 'p');

    expect(x?.value).toBe(99);
    expect(x?.state).toBe('write');
    expect(p?.state).toBe('active');
    expect(step.vars?.['*p']).toBe(99);
  });

  it('moves p to y without changing x', () => {
    const step = stepAt('p = &y');
    const x = boxAt('p = &y', 'x');
    const p = boxAt('p = &y', 'p');
    const y = boxAt('p = &y', 'y');

    expect(x?.value).toBe(99);
    expect(p?.value).toBe('0x1004');
    expect(p?.targetId).toBe('y');
    expect(y?.state).toBeUndefined();
    expect(step.vars?.['&p']).toBe('0x1008');
  });

  it('reads y through p after the reassignment', () => {
    const step = stepAt('*p agora');
    const y = boxAt('*p agora', 'y');

    expect(y?.state).toBe('compare');
    expect(step.pointers?.result).toEqual({ label: 'saída', value: '*p agora = 7' });
    expect(step.vars?.['*p']).toBe(7);
  });

  it('keeps the final state on screen', () => {
    const step = stepAt('return 0');

    expect(boxAt('return 0', 'x')?.value).toBe(99);
    expect(boxAt('return 0', 'y')?.value).toBe(7);
    expect(boxAt('return 0', 'p')?.targetId).toBe('y');
    expect(step.pointers?.boxes.every((box) => !box.state)).toBe(true);
  });

  it('ignores the input and is deterministic', () => {
    expect(lesson.steps([])).toEqual(lesson.steps([1, 2, 3]));
  });

  it('keeps ids unique and every target valid', () => {
    for (const step of steps) {
      const boxes = step.pointers?.boxes ?? [];
      const ids = new Set(boxes.map((box) => box.id));
      expect(ids.size).toBe(boxes.length);
      for (const box of boxes) {
        if (box.targetId) expect(ids.has(box.targetId)).toBe(true);
      }
    }
  });
});
