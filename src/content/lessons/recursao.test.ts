import { describe, expect, it } from 'vitest';
import { lesson } from './recursao';

const code = lesson.code.c ?? [];
const steps = lesson.steps([]);
const framesAt = (index: number) => steps[index]?.callstack?.frames ?? [];
const frameAt = (index: number, id: string) => framesAt(index).find((frame) => frame.id === id);
const varAt = (index: number, frameId: string, name: string) =>
  frameAt(index, frameId)?.vars.find((variable) => variable.name === name);

describe('recursao lesson', () => {
  it('declares the expected metadata', () => {
    expect(lesson.id).toBe('recursao');
    expect(lesson.view).toBe('callstack');
    expect(lesson.languages).toEqual(['c']);
    expect(lesson.inputless).toBe(true);
    expect(lesson.code.java).toBeUndefined();
    expect(lesson.complexity.time?.worst).toBe('Θ(n)');
    expect(lesson.complexity.space).toBe('Θ(n)');
  });

  it('produces 18 well-formed steps inside the C listing', () => {
    expect(steps).toHaveLength(18);
    for (const step of steps) {
      expect(Number.isInteger(step.line)).toBe(true);
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
      expect(step.desc.length).toBeGreaterThan(0);
    }
  });

  it('keeps main at the base and ids unique in every step', () => {
    for (const step of steps) {
      const frames = step.callstack?.frames ?? [];
      expect(frames[0]?.id).toBe('main');
      expect(new Set(frames.map((frame) => frame.id)).size).toBe(frames.length);
      expect(frames.length).toBeLessThanOrEqual(5);
    }
  });

  it('stacks fatorial(4), (3), (2) and (1) down to the base case', () => {
    const deepest = framesAt(7);

    expect(deepest.map((frame) => frame.id)).toEqual([
      'main',
      'fatorial-4',
      'fatorial-3',
      'fatorial-2',
      'fatorial-1',
    ]);
    expect(deepest.map((frame) => varAt(7, frame.id, 'n')?.value)).toEqual([
      undefined,
      4,
      3,
      2,
      1,
    ]);
    expect(frameAt(7, 'fatorial-1')?.state).toBe('active');
    expect(frameAt(7, 'main')?.state).toBe('waiting');
  });

  it('returns 1 from the base case and unwinds 2, 6 and 24', () => {
    expect(frameAt(8, 'fatorial-1')?.state).toBe('returning');
    expect(frameAt(8, 'fatorial-1')?.returns).toBe('1');

    const returns = steps.flatMap((step) =>
      (step.callstack?.frames ?? [])
        .filter((frame) => frame.fn === 'fatorial' && frame.state === 'returning')
        .map((frame) => frame.returns),
    );
    expect(returns).toEqual(['1', '2', '6', '24']);
  });

  it('shows each caller receiving the child value before returning', () => {
    expect(framesAt(9).map((frame) => frame.id)).toEqual([
      'main',
      'fatorial-4',
      'fatorial-3',
      'fatorial-2',
    ]);
    expect(frameAt(9, 'fatorial-2')?.state).toBe('active');
    expect(frameAt(9, 'fatorial-2')?.returns).toBeUndefined();
    expect(steps[9].vars?.['expressão']).toBe('2 * 1');

    expect(frameAt(11, 'fatorial-3')?.state).toBe('active');
    expect(steps[11].vars?.['expressão']).toBe('3 * 2');
    expect(frameAt(13, 'fatorial-4')?.state).toBe('active');
    expect(steps[13].vars?.['expressão']).toBe('4 * 6');
  });

  it('shows in the caller frame the value that just came back', () => {
    expect(frameAt(9, 'fatorial-2')?.state).toBe('active');
    expect(frameAt(9, 'fatorial-2')?.received).toBe('1');
    expect(frameAt(11, 'fatorial-3')?.received).toBe('2');
    expect(frameAt(13, 'fatorial-4')?.received).toBe('6');
  });

  it('assigns 24 to r in main and keeps the output on screen', () => {
    expect(framesAt(15).map((frame) => frame.id)).toEqual(['main']);
    expect(varAt(15, 'main', 'r')?.value).toBe(24);
    expect(frameAt(15, 'main')?.state).toBe('active');

    expect(steps[17].callstack?.result).toEqual({ label: 'saída', value: '24' });
    expect(frameAt(17, 'main')?.state).toBe('done');
    expect(varAt(17, 'main', 'r')?.value).toBe(24);
  });

  it('ignores the input and is deterministic', () => {
    expect(lesson.steps([])).toEqual(lesson.steps([9, 9]));
  });
});
