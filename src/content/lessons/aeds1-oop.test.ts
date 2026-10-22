import { describe, expect, it } from 'vitest';
import {
  lessonAbstracao,
  lessonAcessores,
  lessonClasses,
  lessonConstrutores,
  lessonEncapsulamento,
  lessonExcecoes,
  lessonHeranca,
  lessonOop,
  lessonPolimorfismo,
} from './aeds1-oop';

const oopLessons = [
  lessonOop,
  lessonAbstracao,
  lessonClasses,
  lessonConstrutores,
  lessonEncapsulamento,
  lessonHeranca,
  lessonPolimorfismo,
  lessonAcessores,
  lessonExcecoes,
];

describe('OOP Lessons (AEDS I)', () => {
  it('all 9 lessons use view: "object"', () => {
    expect(oopLessons).toHaveLength(9);
    for (const lesson of oopLessons) {
      expect(lesson.view).toBe('object');
      expect(lesson.inputless).toBe(true);
      expect(lesson.languages).toContain('cpp');
    }
  });

  it('every lesson produces granular pedagogical steps (at least 8-14 steps)', () => {
    for (const lesson of oopLessons) {
      const steps = lesson.steps([1]);
      expect(
        steps.length,
        `Lesson ${lesson.id} should have at least 8 steps, but had ${steps.length}`,
      ).toBeGreaterThanOrEqual(8);

      const codeLines = lesson.code.cpp ?? [];
      expect(codeLines.length).toBeGreaterThan(0);

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        expect(step.desc, `Step ${i} of ${lesson.id} has empty desc`).toBeTruthy();
        expect(step.line, `Step ${i} of ${lesson.id} has invalid line index`).toBeGreaterThanOrEqual(0);
        expect(
          step.line,
          `Step ${i} line index (${step.line}) exceeds code lines (${codeLines.length}) in ${lesson.id}`,
        ).toBeLessThan(codeLines.length);

        // Every step must carry an object state
        expect(step.object, `Step ${i} of ${lesson.id} should contain object state`).toBeDefined();
      }
    }
  });

  it('written attributes carry sourceValue annotations for directional data-flow', () => {
    const oopSteps = lessonOop.steps([1]);
    const writtenAttrs = oopSteps.flatMap((s) => s.object?.instances?.flatMap((inst) => inst.attributes) ?? [])
      .filter((a) => a.state === 'write');
    expect(writtenAttrs.some((a) => Boolean(a.sourceValue))).toBe(true);
  });

  it('polimorfismo showcases base pointer redirection and dynamic dispatch', () => {
    const steps = lessonPolimorfismo.steps([1]);
    const pointerSteps = steps.filter((s) => s.object?.pointer);
    expect(pointerSteps.length).toBeGreaterThanOrEqual(4);

    const callSteps = steps.filter((s) => s.object?.call);
    expect(callSteps.some((s) => s.object?.call?.dispatchedTo?.includes('Cachorro'))).toBe(true);
    expect(callSteps.some((s) => s.object?.call?.dispatchedTo?.includes('Gato'))).toBe(true);
  });

  it('excecoes tracks try, throw, and catch stages', () => {
    const steps = lessonExcecoes.steps([1]);
    const stages = steps.map((s) => s.object?.exception?.stage).filter(Boolean);
    expect(stages).toContain('try');
    expect(stages).toContain('throw');
    expect(stages).toContain('catch');
    expect(stages).toContain('handled');
  });

  it('heranca demonstrates inheritance hierarchy and resolution in base class', () => {
    const steps = lessonHeranca.steps([1]);
    const inheritedCall = steps.find((s) => s.object?.call?.dispatchedTo?.includes('Veiculo::ligar'));
    expect(inheritedCall).toBeDefined();
  });
});
