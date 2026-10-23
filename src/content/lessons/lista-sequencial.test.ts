import { describe, expect, it } from 'vitest';
import { lesson, operationsGroup } from './lista-sequencial';
import { resolveStepLine } from '@/engine/types';

describe('lista-sequencial — operações interativas', () => {
  it('declara grupo de operações com as 5 operações', () => {
    expect(operationsGroup.structures).toHaveLength(1);
    const ops = operationsGroup.structures[0].operations;
    expect(ops.map((o) => o.id)).toEqual([
      'inserir-inicio',
      'inserir-fim',
      'inserir-posicao',
      'remover',
      'buscar',
    ]);
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

  it('inserir-inicio desloca elementos e insere na posição 0', () => {
    const op = structure.operations.find((o) => o.id === 'inserir-inicio')!;
    const steps = op.steps([10, 20, 30], { val: 5 });
    const finalStep = steps[steps.length - 1];
    expect(finalStep.cells?.[0].val).toBe(5);
    expect(finalStep.cells?.[1].val).toBe(10);
    expect(finalStep.cells?.[2].val).toBe(20);
    expect(finalStep.cells?.[3].val).toBe(30);
  });

  it('inserir-fim insere na última posição ocupada', () => {
    const op = structure.operations.find((o) => o.id === 'inserir-fim')!;
    const steps = op.steps([10, 20, 30], { val: 40 });
    const finalStep = steps[steps.length - 1];
    expect(finalStep.cells?.[3].val).toBe(40);
  });

  it('inserir-posicao insere no índice solicitado', () => {
    const op = structure.operations.find((o) => o.id === 'inserir-posicao')!;
    const steps = op.steps([10, 20, 30], { pos: 1, val: 15 });
    const finalStep = steps[steps.length - 1];
    expect(finalStep.cells?.[0].val).toBe(10);
    expect(finalStep.cells?.[1].val).toBe(15);
    expect(finalStep.cells?.[2].val).toBe(20);
    expect(finalStep.cells?.[3].val).toBe(30);
  });

  it('remover exclui o índice solicitado e desloca para esquerda', () => {
    const op = structure.operations.find((o) => o.id === 'remover')!;
    const steps = op.steps([10, 20, 30], { pos: 1 });
    const finalStep = steps[steps.length - 1];
    expect(finalStep.cells?.[0].val).toBe(10);
    expect(finalStep.cells?.[1].val).toBe(30);
    expect(finalStep.cells?.[2].val).toBeNull();
  });

  it('buscar encontra elemento existente', () => {
    const op = structure.operations.find((o) => o.id === 'buscar')!;
    const steps = op.steps([10, 20, 30], { val: 20 });
    const hasFound = steps.some((s) => s.desc.includes('encontrado no índice 1'));
    expect(hasFound).toBe(true);
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
