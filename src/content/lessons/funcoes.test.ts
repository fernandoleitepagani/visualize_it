import { describe, expect, it } from 'vitest';
import { lesson } from './funcoes';

const code = lesson.code.c ?? [];
const steps = lesson.steps([]);
const framesAt = (index: number) => steps[index]?.callstack?.frames ?? [];
const frameAt = (index: number, id: string) => framesAt(index).find((frame) => frame.id === id);
const varAt = (index: number, frameId: string, name: string) =>
  frameAt(index, frameId)?.vars.find((variable) => variable.name === name);

describe('funcoes lesson', () => {
  it('declares the expected metadata', () => {
    expect(lesson.id).toBe('funcoes');
    expect(lesson.view).toBe('callstack');
    expect(lesson.languages).toEqual(['c']);
    expect(lesson.inputless).toBe(true);
    expect(lesson.code.java).toBeUndefined();
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

  it('starts in main with locals and always keeps main at the base', () => {
    expect(framesAt(0)).toHaveLength(1);
    expect(frameAt(0, 'main')?.state).toBe('active');
    expect(varAt(0, 'main', 'x')?.value).toBe(3);

    for (const step of steps) {
      const frames = step.callstack?.frames ?? [];
      expect(frames[0]?.id).toBe('main');
      expect(new Set(frames.map((frame) => frame.id)).size).toBe(frames.length);
    }
  });

  it('passes arguments by value when calling soma', () => {
    const step = steps[2];
    const main = frameAt(2, 'main');
    const soma = frameAt(2, 'soma');

    expect(step.line).toBe(code.findIndex((line) => line.includes('int z = soma')));
    expect(main?.state).toBe('waiting');
    expect(soma?.state).toBe('active');
    expect(varAt(2, 'soma', 'a')?.value).toBe(3);
    expect(varAt(2, 'soma', 'b')?.value).toBe(4);
    expect(varAt(2, 'soma', 'a')?.kind).toBe('param');
  });

  it('copies a into n before changing only the copy', () => {
    expect(frameAt(4, 'dobro')?.state).toBe('active');
    expect(varAt(4, 'dobro', 'n')?.value).toBe(3);
    expect(varAt(4, 'soma', 'a')?.value).toBe(3);

    expect(varAt(5, 'dobro', 'n')?.value).toBe(6);
    expect(varAt(5, 'soma', 'a')?.value).toBe(3);
    expect(varAt(5, 'main', 'x')?.value).toBe(3);
  });

  it('returns 6 from dobro and destroys its frame', () => {
    expect(frameAt(6, 'dobro')?.state).toBe('returning');
    expect(frameAt(6, 'dobro')?.returns).toBe('6');

    expect(framesAt(7).map((frame) => frame.id)).toEqual(['main', 'soma']);
    expect(frameAt(7, 'soma')?.state).toBe('active');
    expect(varAt(7, 'soma', 'd')?.value).toBe(6);
  });

  it('returns 13 from soma and assigns it to z in main', () => {
    expect(frameAt(8, 'soma')?.state).toBe('returning');
    expect(frameAt(8, 'soma')?.returns).toBe('13');

    expect(framesAt(9).map((frame) => frame.id)).toEqual(['main']);
    expect(varAt(9, 'main', 'z')?.value).toBe(13);
    expect(frameAt(9, 'main')?.state).toBe('active');
  });

  it('keeps the final state and the output on screen', () => {
    const last = steps[11];

    expect(frameAt(11, 'main')?.state).toBe('done');
    expect(varAt(11, 'main', 'z')?.value).toBe(13);
    expect(last.callstack?.result).toEqual({ label: 'saída', value: '13' });
  });

  it('ignores the input and is deterministic', () => {
    expect(lesson.steps([])).toEqual(lesson.steps([1, 2, 3]));
  });
});
