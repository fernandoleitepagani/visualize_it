import { describe, expect, it } from 'vitest';
import { lesson } from './ponteiros-duplos';

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

describe('ponteiros-duplos lesson', () => {
  it('declares the expected metadata', () => {
    expect(lesson.id).toBe('ponteiros-duplos');
    expect(lesson.view).toBe('pointers');
    expect(lesson.languages).toEqual(['c']);
    expect(lesson.inputless).toBe(true);
    expect(lesson.code.java).toBeUndefined();
    expect(lesson.complexity.stable).toBeUndefined();
  });

  it('produces 13 well-formed steps inside the C listing', () => {
    expect(steps).toHaveLength(13);
    for (const step of steps) {
      expect(Number.isInteger(step.line)).toBe(true);
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
      expect(step.desc.length).toBeGreaterThan(0);
    }
  });

  it('builds the pp -> p -> x chain with all value levels in vars', () => {
    const step = stepAt('int **pp = &p');
    const pp = boxAt('int **pp = &p', 'pp');
    const p = boxAt('int **pp = &p', 'p');
    const x = boxAt('int **pp = &p', 'x');

    expect(pp?.value).toBe('0x1008');
    expect(pp?.targetId).toBe('p');
    expect(p?.value).toBe('0x1000');
    expect(p?.targetId).toBe('x');
    expect(x?.value).toBe(42);
    expect(step.vars?.pp).toBe('0x1008');
    expect(step.vars?.['&pp']).toBe('0x100c');
    expect(step.vars?.['*pp']).toBe('0x1000');
    expect(step.vars?.['**pp']).toBe(42);
  });

  it('reads the final value through two dereferences', () => {
    const step = stepAt('printf("**pp = %d');
    const x = boxAt('printf("**pp = %d', 'x');

    expect(x?.state).toBe('compare');
    expect(step.pointers?.result).toEqual({ label: 'saída', value: '**pp = 42' });
    expect(step.vars?.['**pp']).toBe(42);
  });

  it('moves p to y through *pp without changing x', () => {
    const step = stepAt('*pp = &y');
    const p = boxAt('*pp = &y', 'p');
    const x = boxAt('*pp = &y', 'x');

    expect(p?.value).toBe('0x1004');
    expect(p?.targetId).toBe('y');
    expect(x?.value).toBe(42);
    expect(step.vars?.['*pp']).toBe('0x1004');
    expect(step.vars?.['**pp']).toBe(7);
  });

  it('reads y through pp after the reassignment', () => {
    const step = stepAt('printf("**pp agora');
    const y = boxAt('printf("**pp agora', 'y');

    expect(y?.state).toBe('compare');
    expect(step.pointers?.result).toEqual({ label: 'saída', value: '**pp agora = 7' });
    expect(step.vars?.['**pp']).toBe(7);
  });

  it('writes 99 into y through **pp', () => {
    const step = stepAt('**pp = 99');
    const y = boxAt('**pp = 99', 'y');
    const p = boxAt('**pp = 99', 'p');

    expect(y?.value).toBe(99);
    expect(y?.state).toBe('write');
    expect(p?.targetId).toBe('y');
    expect(step.vars?.['**pp']).toBe(99);
  });

  it('keeps the final state on screen', () => {
    const step = stepAt('return 0');

    expect(boxAt('return 0', 'x')?.value).toBe(42);
    expect(boxAt('return 0', 'y')?.value).toBe(99);
    expect(boxAt('return 0', 'p')?.targetId).toBe('y');
    expect(boxAt('return 0', 'pp')?.targetId).toBe('p');
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
