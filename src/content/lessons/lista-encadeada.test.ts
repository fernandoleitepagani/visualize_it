import { describe, expect, it } from 'vitest';
import { lesson, operationsGroup } from './lista-encadeada';
import { resolveStepLine } from '@/engine/types';

describe('lista-encadeada — operações interativas', () => {
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
      const code = op.code([10, 20]);
      expect(code.java).toBeDefined();
      expect(code.c).toBeDefined();

      const steps = op.steps([10, 20]);
      expect(steps.length).toBeGreaterThan(0);

      for (const step of steps) {
        expect(step.desc).toBeTruthy();
        expect(step.nodes).toBeDefined();

        for (const lang of ['java', 'c'] as const) {
          const line = resolveStepLine(step.line, lang);
          expect(line).toBeDefined();
          expect(line!).toBeGreaterThanOrEqual(0);
          expect(line!).toBeLessThan(code[lang]!.length);
        }
      }
    });
  }

  it('inserir-inicio adiciona nó na frente e atualiza head', () => {
    const op = structure.operations.find((o) => o.id === 'inserir-inicio')!;
    const steps = op.steps([10, 20], { val: 5 });
    const finalStep = steps[steps.length - 1];
    expect(finalStep.nodes?.[0].val).toBe(5);
    expect(finalStep.nodes?.[0].labels).toContain('head');
    expect(finalStep.nodes?.[1].val).toBe(10);
  });

  it('inserir-fim adiciona nó no término da lista', () => {
    const op = structure.operations.find((o) => o.id === 'inserir-fim')!;
    const steps = op.steps([10, 20], { val: 40 });
    const finalStep = steps[steps.length - 1];
    const lastNode = finalStep.nodes?.[finalStep.nodes.length - 1];
    expect(lastNode?.val).toBe(40);
  });

  it('inserir-posicao insere nó no índice solicitado', () => {
    const op = structure.operations.find((o) => o.id === 'inserir-posicao')!;
    const steps = op.steps([10, 20], { pos: 1, val: 15 });
    const finalStep = steps[steps.length - 1];
    expect(finalStep.nodes?.[0].val).toBe(10);
    expect(finalStep.nodes?.[1].val).toBe(15);
    expect(finalStep.nodes?.[2].val).toBe(20);
  });

  it('remover exclui o nó com o valor solicitado', () => {
    const op = structure.operations.find((o) => o.id === 'remover')!;
    const steps = op.steps([10, 20, 30], { val: 20 });
    const finalStep = steps[steps.length - 1];
    const vals = finalStep.nodes?.map((n) => n.val);
    expect(vals).toEqual([10, 30]);
  });

  it('buscar encontra nó existente', () => {
    const op = structure.operations.find((o) => o.id === 'buscar')!;
    const steps = op.steps([10, 20], { val: 20 });
    const hasFound = steps.some((s) => s.desc.includes('encontrado'));
    expect(hasFound).toBe(true);
  });

  it('lesson.steps gera passos válidos com o código padrão da lição', () => {
    const steps = lesson.steps([10, 20]);
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      const jLine = resolveStepLine(step.line, 'java')!;
      const cLine = resolveStepLine(step.line, 'c')!;
      expect(jLine).toBeLessThan(lesson.code.java!.length);
      expect(cLine).toBeLessThan(lesson.code.c!.length);
    }
  });
});
