import { describe, expect, it } from 'vitest';
import { lesson as buscaBinaria } from './busca-binaria';
import { lesson as buscaSequencial } from './busca-sequencial';

describe('busca-sequencial', () => {
  const v = [10, 25, 30, 45, 55, 60, 75, 88];

  it('encontra elemento no início (melhor caso: 1 iteração)', () => {
    const steps = buscaSequencial.steps(v, undefined, 10);
    const last = steps[steps.length - 1];
    expect(last.vars?.retorno).toBe(0);
    expect(last.vars?.alvo).toBe(10);
    expect(last.desc).toMatch(/encontrado na posição v\[0\]/);
  });

  it('encontra elemento no final (pior caso: n iterações)', () => {
    const steps = buscaSequencial.steps(v, undefined, 88);
    const last = steps[steps.length - 1];
    expect(last.vars?.retorno).toBe(v.length - 1);
    expect(last.vars?.alvo).toBe(88);
    expect(last.desc).toMatch(/encontrado na posição v\[7\]/);
  });

  it('retorna -1 quando o alvo não está no vetor (caso de falha)', () => {
    const steps = buscaSequencial.steps(v, undefined, 999);
    const last = steps[steps.length - 1];
    expect(last.vars?.retorno).toBe(-1);
    expect(last.vars?.alvo).toBe(999);
    expect(last.desc).toMatch(/não encontrado.*Retorno: -1/);
  });

  it('usa alvo padrão quando nenhum é informado', () => {
    const steps = buscaSequencial.steps(v);
    const last = steps[steps.length - 1];
    expect(last.vars?.alvo).toBe(55);
    expect(last.vars?.retorno).toBe(4);
  });

  it('respeita os limites de linha do código', () => {
    const steps = buscaSequencial.steps(v, undefined, 999);
    const maxLineJava = buscaSequencial.code.java?.length ?? 0;
    const maxLineC = buscaSequencial.code.c?.length ?? 0;

    for (const step of steps) {
      const line = typeof step.line === 'number' ? step.line : 0;
      expect(line).toBeGreaterThanOrEqual(0);
      expect(line).toBeLessThan(maxLineJava);
      expect(line).toBeLessThan(maxLineC);
    }
  });
});

describe('busca-binaria', () => {
  const v = [10, 25, 30, 45, 55, 60, 75, 88];

  it('encontra elemento central na 1ª tentativa (melhor caso)', () => {
    // Para v com 8 elementos, meio inicial = floor(7/2) = 3 (valor 45)
    const steps = buscaBinaria.steps(v, undefined, 45);
    const last = steps[steps.length - 1];
    expect(last.vars?.retorno).toBe(3);
    expect(last.vars?.alvo).toBe(45);
    expect(last.desc).toMatch(/encontrado na posição v\[3\]/);
  });

  it('encontra elemento nos extremos', () => {
    const stepsStart = buscaBinaria.steps(v, undefined, 10);
    expect(stepsStart[stepsStart.length - 1].vars?.retorno).toBe(0);

    const stepsEnd = buscaBinaria.steps(v, undefined, 88);
    expect(stepsEnd[stepsEnd.length - 1].vars?.retorno).toBe(7);
  });

  it('retorna -1 quando o alvo não está no vetor (caso de falha)', () => {
    const steps = buscaBinaria.steps(v, undefined, 42);
    const last = steps[steps.length - 1];
    expect(last.vars?.retorno).toBe(-1);
    expect(last.vars?.alvo).toBe(42);
    expect(last.desc).toMatch(/não encontrado.*Retorno: -1/);
  });

  it('ordena automaticamente o vetor caso venha desordenado', () => {
    const unsorted = [88, 10, 55, 30];
    const steps = buscaBinaria.steps(unsorted, undefined, 30);
    const last = steps[steps.length - 1];
    // Vetor ordenado: [10, 30, 55, 88], 30 está na posição 1
    expect(last.vars?.retorno).toBe(1);
    expect(last.arr).toEqual([10, 30, 55, 88]);
  });

  it('respeita os limites de linha do código', () => {
    const steps = buscaBinaria.steps(v, undefined, 999);
    const maxLineJava = buscaBinaria.code.java?.length ?? 0;
    const maxLineC = buscaBinaria.code.c?.length ?? 0;

    for (const step of steps) {
      const line = typeof step.line === 'number' ? step.line : 0;
      expect(line).toBeGreaterThanOrEqual(0);
      expect(line).toBeLessThan(maxLineJava);
      expect(line).toBeLessThan(maxLineC);
    }
  });
});
