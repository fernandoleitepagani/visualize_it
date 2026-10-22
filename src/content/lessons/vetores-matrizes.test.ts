import { describe, expect, it } from 'vitest';
import {
  generateMatrizBuscarSteps,
  generateMatrizLimparSteps,
  generateMatrizPreencherSteps,
  generateMatrizSomarSteps,
  generateVetorBuscarSteps,
  generateVetorLimparSteps,
  generateVetorPreencherSteps,
  generateVetorSomarSteps,
  getMatrizBuscarCode,
  getMatrizLimparCode,
  getMatrizPreencherCode,
  getMatrizSomarCode,
  getVetorBuscarCode,
  getVetorLimparCode,
  getVetorPreencherCode,
  getVetorSomarCode,
  lessonVetoresMatrizes,
  normalizeMatrizInput,
  normalizeVetorInput,
  operationsGroup,
} from './vetores-matrizes';

describe('vetores-matrizes — normalização de entradas', () => {
  it('normaliza vetor com limite de 10 elementos e fallback para vazios', () => {
    expect(normalizeVetorInput([])).toEqual([10, 20, 30, 40, 50]);
    expect(normalizeVetorInput([1, 2, 3])).toEqual([1, 2, 3]);
    expect(
      normalizeVetorInput([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('normaliza matriz com limite de 10x10 e preenchimento uniforme de colunas', () => {
    const raw = [
      [1, 2],
      [3, 4, 5],
    ];
    const normalized = normalizeMatrizInput(raw);
    expect(normalized).toEqual([
      [1, 2, 0],
      [3, 4, 5],
    ]);
    expect(normalized.length).toBe(2);
    expect(normalized[0].length).toBe(3);
  });
});

describe('vetores-matrizes — operações de Vetor (1D)', () => {
  const v = [10, 25, 30, 45, 50];

  it('preencher: gera passos válidos com linhas dentro do código e vetor final preenchido', () => {
    const code = getVetorPreencherCode(v);
    const steps = generateVetorPreencherSteps(v);

    expect(steps.length).toBeGreaterThan(v.length * 2);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
      expect(step.desc).toBeTruthy();
    }

    const last = steps[steps.length - 1];
    expect(last.matrix?.grid[0].map((cell) => cell.val)).toEqual(v);
  });

  it('limpar: zera todas as posições do vetor', () => {
    const code = getVetorLimparCode(v);
    const steps = generateVetorLimparSteps(v);

    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
    }

    const last = steps[steps.length - 1];
    expect(last.matrix?.grid[0].every((cell) => cell.val === 0)).toBe(true);
  });

  it('buscar: localiza o elemento alvo e registra a posição com break', () => {
    const alvo = v[2]; // 30
    const code = getVetorBuscarCode(v, alvo);
    const steps = generateVetorBuscarSteps(v);

    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
    }

    const last = steps[steps.length - 1];
    expect(last.vars?.pos).toBe(2);
    expect(last.desc).toContain('índice 2');
  });

  it('somar: calcula a soma exata de todos os elementos', () => {
    const code = getVetorSomarCode(v);
    const steps = generateVetorSomarSteps(v);

    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
    }

    const expectedSum = v.reduce((a, b) => a + b, 0);
    const last = steps[steps.length - 1];
    expect(last.vars?.soma).toBe(expectedSum);
  });
});

describe('vetores-matrizes — operações de Matriz (2D)', () => {
  const m = [
    [1, 2, 3],
    [4, 5, 6],
  ];

  it('preencher: gera passos com coordenadas ativas e matriz preenchida', () => {
    const code = getMatrizPreencherCode(m);
    const steps = generateMatrizPreencherSteps(m);

    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
    }

    const last = steps[steps.length - 1];
    expect(last.matrix?.rows).toBe(2);
    expect(last.matrix?.cols).toBe(3);
    const values = last.matrix?.grid.map((row) => row.map((cell) => cell.val));
    expect(values).toEqual(m);
  });

  it('limpar: zera todas as posições da matriz', () => {
    const code = getMatrizLimparCode(m);
    const steps = generateMatrizLimparSteps(m);

    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
    }

    const last = steps[steps.length - 1];
    expect(
      last.matrix?.grid.every((row) => row.every((cell) => cell.val === 0)),
    ).toBe(true);
  });

  it('buscar: localiza o elemento na matriz e salva as coordenadas lin e col', () => {
    const midL = Math.floor(m.length / 2);
    const midC = Math.floor((m[0]?.length ?? 1) / 2);
    const alvo = m[midL][midC];
    const code = getMatrizBuscarCode(m, alvo);
    const steps = generateMatrizBuscarSteps(m);

    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
    }

    const last = steps[steps.length - 1];
    expect(last.vars?.lin).toBe(midL);
    expect(last.vars?.col).toBe(midC);
  });

  it('somar: calcula a soma correta de todos os elementos da matriz', () => {
    const code = getMatrizSomarCode(m);
    const steps = generateMatrizSomarSteps(m);

    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(0);
      expect(step.line).toBeLessThan(code.length);
    }

    const expectedSum = m.flat().reduce((a, b) => a + b, 0);
    const last = steps[steps.length - 1];
    expect(last.vars?.soma).toBe(expectedSum);
  });
});

describe('vetores-matrizes — operações configuradas no Lesson', () => {
  it('declara grupo de operações com as estruturas vetor e matriz', () => {
    expect(lessonVetoresMatrizes.operationsGroup).toBeDefined();
    expect(operationsGroup.structures.map((s) => s.id)).toEqual(['vetor', 'matriz']);

    const vetor = operationsGroup.structures[0];
    const matriz = operationsGroup.structures[1];

    expect(vetor.operations.map((o) => o.id)).toEqual(['preencher', 'limpar', 'buscar', 'somar']);
    expect(matriz.operations.map((o) => o.id)).toEqual(['preencher', 'limpar', 'buscar', 'somar']);
  });
});
