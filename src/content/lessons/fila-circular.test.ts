import { describe, expect, it } from 'vitest';
import { lesson, operationsGroup } from './fila-circular';
import { resolveStepLine } from '@/engine/types';

describe('fila-circular — operações interativas', () => {
  it('declara grupo de operações com as 3 operações', () => {
    expect(operationsGroup.structures).toHaveLength(1);
    const ops = operationsGroup.structures[0].operations;
    expect(ops.map((o) => o.id)).toEqual(['enqueue', 'dequeue', 'front']);
  });

  const structure = operationsGroup.structures[0];

  for (const op of structure.operations) {
    it(`operação ${op.id} gera passos bem formados e linhas alinhadas com Java e C`, () => {
      const code = op.code([10, 20, 30]);
      expect(code.java).toBeDefined();
      expect(code.c).toBeDefined();

      const steps = op.steps([10, 20, 30]);
      expect(steps.length).toBeGreaterThan(0);

      for (const step of steps) {
        expect(step.desc).toBeTruthy();
        expect(step.cells).toBeDefined();

        for (const lang of ['java', 'c'] as const) {
          const line = resolveStepLine(step.line, lang);
          expect(line).toBeDefined();
          expect(line!).toBeGreaterThanOrEqual(0);
          expect(line!).toBeLessThan(code[lang]!.length);
        }
      }
    });
  }

  it('enqueue adiciona elemento no índice ult e avança circularmente', () => {
    const op = structure.operations.find((o) => o.id === 'enqueue')!;
    const steps = op.steps([10, 20, 30], { val: 40 });
    const finalStep = steps[steps.length - 1];
    expect(finalStep.cells?.[3].val).toBe(40);
  });

  it('dequeue retira elemento de pri e avança circularmente', () => {
    const op = structure.operations.find((o) => o.id === 'dequeue')!;
    const steps = op.steps([10, 20, 30]);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.cells?.[0].val).toBeNull();
    expect(finalStep.cells?.[1].labels).toContain('pri');
  });

  it('front consulta elemento em pri sem desenfileirar', () => {
    const op = structure.operations.find((o) => o.id === 'front')!;
    const steps = op.steps([10, 20, 30]);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.cells?.[0].val).toBe(10);
    expect(finalStep.cells?.[0].labels).toContain('pri');
  });

  it('lesson.steps gera passos válidos com o código padrão da lição', () => {
    const steps = lesson.steps([10, 20, 30]);
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      const jLine = resolveStepLine(step.line, 'java')!;
      const cLine = resolveStepLine(step.line, 'c')!;
      expect(jLine).toBeLessThan(lesson.code.java!.length);
      expect(cLine).toBeLessThan(lesson.code.c!.length);
    }
  });
});
