import type {
  Cell,
  Complexity,
  Lesson,
  LessonOperationsGroup,
  MatrixState,
  Step,
} from '@/engine/types';
import { lines } from '@/lib/lines';

const c = (val: Cell['val'], labels: string[] = [], state = ''): Cell => ({ val, labels, state });

const sm = (
  line: number,
  desc: string,
  matrix: MatrixState,
  vars?: Record<string, string | number | null>,
): Step => ({
  line,
  desc,
  matrix,
  vars,
});

function lineOf(code: string[], text: string): number {
  const index = code.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada no código: "${text}"`);
  return index;
}

export function normalizeVetorInput(input?: number[] | number[][]): number[] {
  if (!input || !Array.isArray(input)) return [10, 20, 30, 40, 50];
  if (Array.isArray(input[0])) {
    const flat = (input as number[][]).flat();
    return flat.length > 0 ? flat.slice(0, 10) : [10, 20, 30, 40, 50];
  }
  const arr = (input as number[]).filter((x) => typeof x === 'number' && Number.isFinite(x));
  return arr.length > 0 ? arr.slice(0, 10) : [10, 20, 30, 40, 50];
}

export function normalizeMatrizInput(input?: number[] | number[][]): number[][] {
  if (!input || !Array.isArray(input)) {
    return [
      [1, 2, 3],
      [4, 5, 6],
    ];
  }
  if (!Array.isArray(input[0])) {
    const arr = normalizeVetorInput(input as number[]);
    const mid = Math.ceil(arr.length / 2);
    return [arr.slice(0, mid), arr.slice(mid)];
  }
  const matrix = (input as number[][])
    .slice(0, 10)
    .map((row) => (Array.isArray(row) ? row.slice(0, 10) : []))
    .filter((row) => row.length > 0);

  if (matrix.length === 0) {
    return [
      [1, 2, 3],
      [4, 5, 6],
    ];
  }

  // Ensure uniform column count
  const maxCols = Math.min(10, Math.max(...matrix.map((r) => r.length)));
  return matrix.map((row) => {
    const padded = [...row];
    while (padded.length < maxCols) {
      padded.push(0);
    }
    return padded.slice(0, maxCols);
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 1. Operações de Vetor (1D)
 * ────────────────────────────────────────────────────────────────────────── */

export function getVetorPreencherCode(v: number[]) {
  const N = v.length;
  return lines(`
#include <stdio.h>

int main() {
  int v[${N}];
  int valores[${N}] = {${v.join(', ')}};

  for (int i = 0; i < ${N}; i++) {
    v[i] = valores[i];
  }

  return 0;
}`);
}

export function generateVetorPreencherSteps(v: number[]): Step[] {
  const code = getVetorPreencherCode(v);
  const N = v.length;
  const colLabels = Array.from({ length: N }, (_, i) => `[${i}]`);
  const steps: Step[] = [];

  const lDecl = lineOf(code, `int v[${N}];`);
  const lLoop = lineOf(code, `for (int i = 0; i < ${N}; i++)`);
  const lAssign = lineOf(code, 'v[i] = valores[i];');
  const lReturn = lineOf(code, 'return 0;');

  const currentCells: Cell[] = Array.from({ length: N }, () => c(null, [], 'empty'));

  // Step 0: declaração
  steps.push(
    sm(
      lDecl,
      `Declaração de int v[${N}]: ${N} posições contíguas de memória alocadas para o vetor.`,
      {
        rows: 1,
        cols: N,
        rowLabels: ['v'],
        colLabels,
        grid: [[...currentCells]],
      },
      { N },
    ),
  );

  // Iterações
  for (let i = 0; i < N; i++) {
    // Verificação de laço
    steps.push(
      sm(
        lLoop,
        `Laço for: índice i = ${i}. Condição ${i} < ${N} é verdadeira.`,
        {
          rows: 1,
          cols: N,
          rowLabels: ['v'],
          colLabels,
          activeCol: i,
          grid: [[...currentCells]],
        },
        { i, N },
      ),
    );

    // Atribuição
    currentCells[i] = c(v[i], [], 'write');
    steps.push(
      sm(
        lAssign,
        `Atribuição: v[${i}] recebe ${v[i]}.`,
        {
          rows: 1,
          cols: N,
          rowLabels: ['v'],
          colLabels,
          activeCol: i,
          grid: [[...currentCells]],
        },
        { i, [`v[${i}]`]: v[i] },
      ),
    );
  }

  // Fim do laço
  steps.push(
    sm(
      lReturn,
      `i atingiu ${N} (${N} < ${N} é falso). Laço finalizado! O vetor está preenchido.`,
      {
        rows: 1,
        cols: N,
        rowLabels: ['v'],
        colLabels,
        grid: [[...currentCells]],
      },
      { i: N, N },
    ),
  );

  return steps;
}

export function getVetorLimparCode(v: number[]) {
  const N = v.length;
  return lines(`
#include <stdio.h>

int main() {
  int v[${N}] = {${v.join(', ')}};

  for (int i = 0; i < ${N}; i++) {
    v[i] = 0;
  }

  return 0;
}`);
}

export function generateVetorLimparSteps(v: number[]): Step[] {
  const code = getVetorLimparCode(v);
  const N = v.length;
  const colLabels = Array.from({ length: N }, (_, i) => `[${i}]`);
  const steps: Step[] = [];

  const lDecl = lineOf(code, `int v[${N}] = {`);
  const lLoop = lineOf(code, `for (int i = 0; i < ${N}; i++)`);
  const lClear = lineOf(code, 'v[i] = 0;');
  const lReturn = lineOf(code, 'return 0;');

  const currentCells: Cell[] = v.map((val) => c(val, [], ''));

  steps.push(
    sm(
      lDecl,
      `Vetor inicializado com ${N} elementos fornecidos: [${v.join(', ')}].`,
      {
        rows: 1,
        cols: N,
        rowLabels: ['v'],
        colLabels,
        grid: [[...currentCells]],
      },
      { N },
    ),
  );

  for (let i = 0; i < N; i++) {
    steps.push(
      sm(
        lLoop,
        `Laço for: índice i = ${i} (condição ${i} < ${N} válida).`,
        {
          rows: 1,
          cols: N,
          rowLabels: ['v'],
          colLabels,
          activeCol: i,
          grid: [[...currentCells]],
        },
        { i, N },
      ),
    );

    currentCells[i] = c(0, ['zerado'], 'write');
    steps.push(
      sm(
        lClear,
        `v[${i}] é redefinido para 0 (posição limpa).`,
        {
          rows: 1,
          cols: N,
          rowLabels: ['v'],
          colLabels,
          activeCol: i,
          grid: [[...currentCells]],
        },
        { i, [`v[${i}]`]: 0 },
      ),
    );
  }

  steps.push(
    sm(
      lReturn,
      `Laço concluído. Todas as ${N} posições do vetor foram limpas (zeradas).`,
      {
        rows: 1,
        cols: N,
        rowLabels: ['v'],
        colLabels,
        grid: [[...currentCells]],
      },
      { i: N, N },
    ),
  );

  return steps;
}

export function getVetorBuscarCode(v: number[], alvo: number) {
  const N = v.length;
  return lines(`
#include <stdio.h>

int main() {
  int v[${N}] = {${v.join(', ')}};
  int alvo = ${alvo};
  int pos = -1;

  for (int i = 0; i < ${N}; i++) {
    if (v[i] == alvo) {
      pos = i;
      break;
    }
  }

  return 0;
}`);
}

export function generateVetorBuscarSteps(v: number[]): Step[] {
  const N = v.length;
  const alvo = v[Math.floor(N / 2)] ?? 0;
  const code = getVetorBuscarCode(v, alvo);
  const colLabels = Array.from({ length: N }, (_, i) => `[${i}]`);
  const steps: Step[] = [];

  const lAlvo = lineOf(code, `int alvo = ${alvo};`);
  const lLoop = lineOf(code, `for (int i = 0; i < ${N}; i++)`);
  const lIf = lineOf(code, 'if (v[i] == alvo)');
  const lPos = lineOf(code, 'pos = i;');
  const lBreak = lineOf(code, 'break;');
  const lReturn = lineOf(code, 'return 0;');

  const currentCells: Cell[] = v.map((val) => c(val, [], ''));

  steps.push(
    sm(
      lAlvo,
      `Busca linear: procurando o valor alvo = ${alvo} no vetor de ${N} elementos.`,
      {
        rows: 1,
        cols: N,
        rowLabels: ['v'],
        colLabels,
        grid: [[...currentCells]],
      },
      { alvo, pos: -1 },
    ),
  );

  let found = false;
  let foundIndex = -1;

  for (let i = 0; i < N; i++) {
    steps.push(
      sm(
        lLoop,
        `Verificação do laço: índice i = ${i}.`,
        {
          rows: 1,
          cols: N,
          rowLabels: ['v'],
          colLabels,
          activeCol: i,
          grid: [[...currentCells]],
        },
        { i, alvo, pos: -1 },
      ),
    );

    if (v[i] === alvo) {
      currentCells[i] = c(v[i], ['alvo'], 'active');
      steps.push(
        sm(
          lIf,
          `Comparação: v[${i}] (${v[i]}) == ${alvo}? Verdadeiro! Alvo localizado.`,
          {
            rows: 1,
            cols: N,
            rowLabels: ['v'],
            colLabels,
            activeCol: i,
            grid: [[...currentCells]],
          },
          { i, [`v[${i}]`]: v[i], alvo, pos: -1 },
        ),
      );

      found = true;
      foundIndex = i;

      steps.push(
        sm(
          lPos,
          `Registrando a posição encontrada: pos = ${i}.`,
          {
            rows: 1,
            cols: N,
            rowLabels: ['v'],
            colLabels,
            activeCol: i,
            grid: [[...currentCells]],
          },
          { i, [`v[${i}]`]: v[i], alvo, pos: i },
        ),
      );

      steps.push(
        sm(
          lBreak,
          `Comando break acionado: encerra o laço antecipadamente pois o alvo já foi encontrado.`,
          {
            rows: 1,
            cols: N,
            rowLabels: ['v'],
            colLabels,
            activeCol: i,
            grid: [[...currentCells]],
          },
          { i, alvo, pos: i },
        ),
      );
      break;
    } else {
      currentCells[i] = c(v[i], [], 'compare');
      steps.push(
        sm(
          lIf,
          `Comparação: v[${i}] (${v[i]}) == ${alvo}? Falso, segue para a próxima posição.`,
          {
            rows: 1,
            cols: N,
            rowLabels: ['v'],
            colLabels,
            activeCol: i,
            grid: [[...currentCells]],
          },
          { i, [`v[${i}]`]: v[i], alvo, pos: -1 },
        ),
      );
      // Volta para neutro
      currentCells[i] = c(v[i], [], '');
    }
  }

  steps.push(
    sm(
      lReturn,
      found
        ? `Busca concluída com sucesso: o valor ${alvo} foi encontrado no índice ${foundIndex}.`
        : `Fim do laço. O valor ${alvo} não foi encontrado no vetor (pos = -1).`,
      {
        rows: 1,
        cols: N,
        rowLabels: ['v'],
        colLabels,
        grid: [[...currentCells]],
      },
      { alvo, pos: foundIndex },
    ),
  );

  return steps;
}

export function getVetorSomarCode(v: number[]) {
  const N = v.length;
  return lines(`
#include <stdio.h>

int main() {
  int v[${N}] = {${v.join(', ')}};
  int soma = 0;

  for (int i = 0; i < ${N}; i++) {
    soma += v[i];
  }

  return 0;
}`);
}

export function generateVetorSomarSteps(v: number[]): Step[] {
  const N = v.length;
  const code = getVetorSomarCode(v);
  const colLabels = Array.from({ length: N }, (_, i) => `[${i}]`);
  const steps: Step[] = [];

  const lSoma = lineOf(code, 'int soma = 0;');
  const lLoop = lineOf(code, `for (int i = 0; i < ${N}; i++)`);
  const lAdd = lineOf(code, 'soma += v[i];');
  const lReturn = lineOf(code, 'return 0;');

  const currentCells: Cell[] = v.map((val) => c(val, [], ''));
  let soma = 0;

  steps.push(
    sm(
      lSoma,
      'Variável acumuladora soma inicializada com 0.',
      {
        rows: 1,
        cols: N,
        rowLabels: ['v'],
        colLabels,
        grid: [[...currentCells]],
      },
      { soma: 0 },
    ),
  );

  for (let i = 0; i < N; i++) {
    steps.push(
      sm(
        lLoop,
        `Laço no elemento i = ${i} (condição ${i} < ${N} válida).`,
        {
          rows: 1,
          cols: N,
          rowLabels: ['v'],
          colLabels,
          activeCol: i,
          grid: [[...currentCells]],
        },
        { i, soma },
      ),
    );

    const prevSoma = soma;
    soma += v[i];
    currentCells[i] = c(v[i], [`+${v[i]}`], 'active');

    steps.push(
      sm(
        lAdd,
        `Somando v[${i}] (${v[i]}): ${prevSoma} + ${v[i]} = ${soma}.`,
        {
          rows: 1,
          cols: N,
          rowLabels: ['v'],
          colLabels,
          activeCol: i,
          grid: [[...currentCells]],
        },
        { i, [`v[${i}]`]: v[i], soma },
      ),
    );

    currentCells[i] = c(v[i], [], '');
  }

  steps.push(
    sm(
      lReturn,
      `Laço concluído. A soma de todos os ${N} elementos do vetor é igual a ${soma}.`,
      {
        rows: 1,
        cols: N,
        rowLabels: ['v'],
        colLabels,
        grid: [[...currentCells]],
      },
      { soma },
    ),
  );

  return steps;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 2. Operações de Matriz (2D)
 * ────────────────────────────────────────────────────────────────────────── */

export function getMatrizPreencherCode(m: number[][]) {
  const L = m.length;
  const C = m[0]?.length ?? 0;
  const formattedRows = m.map((r) => `{${r.join(', ')}}`).join(',\n    ');

  return lines(`
#include <stdio.h>

int main() {
  int m[${L}][${C}];
  int valores[${L}][${C}] = {
    ${formattedRows}
  };

  for (int i = 0; i < ${L}; i++) {
    for (int j = 0; j < ${C}; j++) {
      m[i][j] = valores[i][j];
    }
  }

  return 0;
}`);
}

export function generateMatrizPreencherSteps(m: number[][]): Step[] {
  const L = m.length;
  const C = m[0]?.length ?? 0;
  const code = getMatrizPreencherCode(m);
  const rowLabels = Array.from({ length: L }, (_, i) => `lin ${i}`);
  const colLabels = Array.from({ length: C }, (_, j) => `col ${j}`);
  const steps: Step[] = [];

  const lDecl = lineOf(code, `int m[${L}][${C}];`);
  const lOuter = lineOf(code, `for (int i = 0; i < ${L}; i++)`);
  const lInner = lineOf(code, `for (int j = 0; j < ${C}; j++)`);
  const lAssign = lineOf(code, 'm[i][j] = valores[i][j];');
  const lReturn = lineOf(code, 'return 0;');

  const currentGrid: Cell[][] = Array.from({ length: L }, () =>
    Array.from({ length: C }, () => c(null, [], 'empty')),
  );

  steps.push(
    sm(
      lDecl,
      `Declaração de int m[${L}][${C}]: ${L * C} posições organizadas em ${L} linhas e ${C} colunas.`,
      {
        rows: L,
        cols: C,
        rowLabels,
        colLabels,
        grid: currentGrid.map((r) => [...r]),
      },
      { L, C },
    ),
  );

  for (let i = 0; i < L; i++) {
    steps.push(
      sm(
        lOuter,
        `Laço externo: linha i = ${i} (i < ${L} é verdadeiro).`,
        {
          rows: L,
          cols: C,
          rowLabels,
          colLabels,
          activeRow: i,
          grid: currentGrid.map((r) => [...r]),
        },
        { i, L },
      ),
    );

    for (let j = 0; j < C; j++) {
      steps.push(
        sm(
          lInner,
          `Laço interno: coluna j = ${j} na linha ${i} (j < ${C} é verdadeiro).`,
          {
            rows: L,
            cols: C,
            rowLabels,
            colLabels,
            activeRow: i,
            activeCol: j,
            grid: currentGrid.map((r) => [...r]),
          },
          { i, j, C },
        ),
      );

      const val = m[i][j];
      currentGrid[i][j] = c(val, [], 'write');

      steps.push(
        sm(
          lAssign,
          `Atribuição: m[${i}][${j}] recebe ${val}.`,
          {
            rows: L,
            cols: C,
            rowLabels,
            colLabels,
            activeRow: i,
            activeCol: j,
            grid: currentGrid.map((r) => [...r]),
          },
          { i, j, [`m[${i}][${j}]`]: val },
        ),
      );
    }
  }

  steps.push(
    sm(
      lReturn,
      `Preenchimento concluído! Todas as ${L * C} posições da matriz ${L}x${C} foram preenchidas.`,
      {
        rows: L,
        cols: C,
        rowLabels,
        colLabels,
        grid: currentGrid.map((r) => [...r]),
      },
      { L, C },
    ),
  );

  return steps;
}

export function getMatrizLimparCode(m: number[][]) {
  const L = m.length;
  const C = m[0]?.length ?? 0;
  const formattedRows = m.map((r) => `{${r.join(', ')}}`).join(',\n    ');

  return lines(`
#include <stdio.h>

int main() {
  int m[${L}][${C}] = {
    ${formattedRows}
  };

  for (int i = 0; i < ${L}; i++) {
    for (int j = 0; j < ${C}; j++) {
      m[i][j] = 0;
    }
  }

  return 0;
}`);
}

export function generateMatrizLimparSteps(m: number[][]): Step[] {
  const L = m.length;
  const C = m[0]?.length ?? 0;
  const code = getMatrizLimparCode(m);
  const rowLabels = Array.from({ length: L }, (_, i) => `lin ${i}`);
  const colLabels = Array.from({ length: C }, (_, j) => `col ${j}`);
  const steps: Step[] = [];

  const lDecl = lineOf(code, `int m[${L}][${C}] = {`);
  const lOuter = lineOf(code, `for (int i = 0; i < ${L}; i++)`);
  const lInner = lineOf(code, `for (int j = 0; j < ${C}; j++)`);
  const lClear = lineOf(code, 'm[i][j] = 0;');
  const lReturn = lineOf(code, 'return 0;');

  const currentGrid: Cell[][] = m.map((row) => row.map((val) => c(val, [], '')));

  steps.push(
    sm(
      lDecl,
      `Matriz ${L}x${C} inicializada com os ${L * C} valores originais.`,
      {
        rows: L,
        cols: C,
        rowLabels,
        colLabels,
        grid: currentGrid.map((r) => [...r]),
      },
      { L, C },
    ),
  );

  for (let i = 0; i < L; i++) {
    steps.push(
      sm(
        lOuter,
        `Laço externo: linha i = ${i}.`,
        {
          rows: L,
          cols: C,
          rowLabels,
          colLabels,
          activeRow: i,
          grid: currentGrid.map((r) => [...r]),
        },
        { i },
      ),
    );

    for (let j = 0; j < C; j++) {
      steps.push(
        sm(
          lInner,
          `Laço interno: coluna j = ${j}.`,
          {
            rows: L,
            cols: C,
            rowLabels,
            colLabels,
            activeRow: i,
            activeCol: j,
            grid: currentGrid.map((r) => [...r]),
          },
          { i, j },
        ),
      );

      currentGrid[i][j] = c(0, ['0'], 'write');

      steps.push(
        sm(
          lClear,
          `Posição m[${i}][${j}] foi zerada (limpa).`,
          {
            rows: L,
            cols: C,
            rowLabels,
            colLabels,
            activeRow: i,
            activeCol: j,
            grid: currentGrid.map((r) => [...r]),
          },
          { i, j, [`m[${i}][${j}]`]: 0 },
        ),
      );
    }
  }

  steps.push(
    sm(
      lReturn,
      `Todas as ${L * C} posições da matriz ${L}x${C} foram limpas (zeradas).`,
      {
        rows: L,
        cols: C,
        rowLabels,
        colLabels,
        grid: currentGrid.map((r) => [...r]),
      },
      { L, C },
    ),
  );

  return steps;
}

export function getMatrizBuscarCode(m: number[][], alvo: number) {
  const L = m.length;
  const C = m[0]?.length ?? 0;
  const formattedRows = m.map((r) => `{${r.join(', ')}}`).join(',\n    ');

  return lines(`
#include <stdio.h>

int main() {
  int m[${L}][${C}] = {
    ${formattedRows}
  };
  int alvo = ${alvo};
  int lin = -1, col = -1;

  for (int i = 0; i < ${L}; i++) {
    for (int j = 0; j < ${C}; j++) {
      if (m[i][j] == alvo) {
        lin = i;
        col = j;
        break;
      }
    }
    if (lin != -1) break;
  }

  return 0;
}`);
}

export function generateMatrizBuscarSteps(m: number[][]): Step[] {
  const L = m.length;
  const C = m[0]?.length ?? 0;
  const midL = Math.floor(L / 2);
  const midC = Math.floor(C / 2);
  const alvo = m[midL]?.[midC] ?? 0;
  const code = getMatrizBuscarCode(m, alvo);
  const rowLabels = Array.from({ length: L }, (_, i) => `lin ${i}`);
  const colLabels = Array.from({ length: C }, (_, j) => `col ${j}`);
  const steps: Step[] = [];

  const lAlvo = lineOf(code, `int alvo = ${alvo};`);
  const lOuter = lineOf(code, `for (int i = 0; i < ${L}; i++)`);
  const lInner = lineOf(code, `for (int j = 0; j < ${C}; j++)`);
  const lIf = lineOf(code, 'if (m[i][j] == alvo)');
  const lLin = lineOf(code, 'lin = i;');
  const lBreakInner = lineOf(code, 'break;');
  const lBreakOuter = lineOf(code, 'if (lin != -1) break;');
  const lReturn = lineOf(code, 'return 0;');

  const currentGrid: Cell[][] = m.map((row) => row.map((val) => c(val, [], '')));

  steps.push(
    sm(
      lAlvo,
      `Buscando o valor alvo = ${alvo} na matriz ${L}x${C}.`,
      {
        rows: L,
        cols: C,
        rowLabels,
        colLabels,
        grid: currentGrid.map((r) => [...r]),
      },
      { alvo, lin: -1, col: -1 },
    ),
  );

  let found = false;
  let foundLin = -1;
  let foundCol = -1;

  for (let i = 0; i < L; i++) {
    steps.push(
      sm(
        lOuter,
        `Laço externo: verificando linha i = ${i}.`,
        {
          rows: L,
          cols: C,
          rowLabels,
          colLabels,
          activeRow: i,
          grid: currentGrid.map((r) => [...r]),
        },
        { i, alvo, lin: -1, col: -1 },
      ),
    );

    for (let j = 0; j < C; j++) {
      steps.push(
        sm(
          lInner,
          `Laço interno: verificando coluna j = ${j}.`,
          {
            rows: L,
            cols: C,
            rowLabels,
            colLabels,
            activeRow: i,
            activeCol: j,
            grid: currentGrid.map((r) => [...r]),
          },
          { i, j, alvo, lin: -1, col: -1 },
        ),
      );

      const val = m[i][j];

      if (val === alvo) {
        currentGrid[i][j] = c(val, ['alvo'], 'active');
        steps.push(
          sm(
            lIf,
            `m[${i}][${j}] (${val}) == ${alvo}? Verdadeiro! Alvo localizado.`,
            {
              rows: L,
              cols: C,
              rowLabels,
              colLabels,
              activeRow: i,
              activeCol: j,
              grid: currentGrid.map((r) => [...r]),
            },
            { i, j, [`m[${i}][${j}]`]: val, alvo, lin: -1, col: -1 },
          ),
        );

        found = true;
        foundLin = i;
        foundCol = j;

        steps.push(
          sm(
            lLin,
            `Salva coordenadas: lin = ${i}, col = ${j}.`,
            {
              rows: L,
              cols: C,
              rowLabels,
              colLabels,
              activeRow: i,
              activeCol: j,
              grid: currentGrid.map((r) => [...r]),
            },
            { i, j, alvo, lin: i, col: j },
          ),
        );

        steps.push(
          sm(
            lBreakInner,
            'Break interno interrompe a iteração pelas colunas da linha atual.',
            {
              rows: L,
              cols: C,
              rowLabels,
              colLabels,
              activeRow: i,
              activeCol: j,
              grid: currentGrid.map((r) => [...r]),
            },
            { i, j, alvo, lin: i, col: j },
          ),
        );
        break;
      } else {
        currentGrid[i][j] = c(val, [], 'compare');
        steps.push(
          sm(
            lIf,
            `m[${i}][${j}] (${val}) == ${alvo}? Falso, segue para a próxima coluna.`,
            {
              rows: L,
              cols: C,
              rowLabels,
              colLabels,
              activeRow: i,
              activeCol: j,
              grid: currentGrid.map((r) => [...r]),
            },
            { i, j, [`m[${i}][${j}]`]: val, alvo, lin: -1, col: -1 },
          ),
        );
        currentGrid[i][j] = c(val, [], '');
      }
    }

    if (found) {
      steps.push(
        sm(
          lBreakOuter,
          'lin != -1 detectado: break externo interrompe o laço das linhas.',
          {
            rows: L,
            cols: C,
            rowLabels,
            colLabels,
            activeRow: foundLin,
            activeCol: foundCol,
            grid: currentGrid.map((r) => [...r]),
          },
          { alvo, lin: foundLin, col: foundCol },
        ),
      );
      break;
    }
  }

  steps.push(
    sm(
      lReturn,
      found
        ? `Busca concluída: o valor ${alvo} foi encontrado nas coordenadas [${foundLin}][${foundCol}].`
        : `Fim da busca: o valor ${alvo} não foi encontrado na matriz.`,
      {
        rows: L,
        cols: C,
        rowLabels,
        colLabels,
        grid: currentGrid.map((r) => [...r]),
      },
      { alvo, lin: foundLin, col: foundCol },
    ),
  );

  return steps;
}

export function getMatrizSomarCode(m: number[][]) {
  const L = m.length;
  const C = m[0]?.length ?? 0;
  const formattedRows = m.map((r) => `{${r.join(', ')}}`).join(',\n    ');

  return lines(`
#include <stdio.h>

int main() {
  int m[${L}][${C}] = {
    ${formattedRows}
  };
  int soma = 0;

  for (int i = 0; i < ${L}; i++) {
    for (int j = 0; j < ${C}; j++) {
      soma += m[i][j];
    }
  }

  return 0;
}`);
}

export function generateMatrizSomarSteps(m: number[][]): Step[] {
  const L = m.length;
  const C = m[0]?.length ?? 0;
  const code = getMatrizSomarCode(m);
  const rowLabels = Array.from({ length: L }, (_, i) => `lin ${i}`);
  const colLabels = Array.from({ length: C }, (_, j) => `col ${j}`);
  const steps: Step[] = [];

  const lSoma = lineOf(code, 'int soma = 0;');
  const lOuter = lineOf(code, `for (int i = 0; i < ${L}; i++)`);
  const lInner = lineOf(code, `for (int j = 0; j < ${C}; j++)`);
  const lAdd = lineOf(code, 'soma += m[i][j];');
  const lReturn = lineOf(code, 'return 0;');

  const currentGrid: Cell[][] = m.map((row) => row.map((val) => c(val, [], '')));
  let soma = 0;

  steps.push(
    sm(
      lSoma,
      'Acumulador soma inicializado com 0.',
      {
        rows: L,
        cols: C,
        rowLabels,
        colLabels,
        grid: currentGrid.map((r) => [...r]),
      },
      { soma: 0 },
    ),
  );

  for (let i = 0; i < L; i++) {
    steps.push(
      sm(
        lOuter,
        `Linha i = ${i}.`,
        {
          rows: L,
          cols: C,
          rowLabels,
          colLabels,
          activeRow: i,
          grid: currentGrid.map((r) => [...r]),
        },
        { i, soma },
      ),
    );

    for (let j = 0; j < C; j++) {
      steps.push(
        sm(
          lInner,
          `Coluna j = ${j}.`,
          {
            rows: L,
            cols: C,
            rowLabels,
            colLabels,
            activeRow: i,
            activeCol: j,
            grid: currentGrid.map((r) => [...r]),
          },
          { i, j, soma },
        ),
      );

      const val = m[i][j];
      const prevSoma = soma;
      soma += val;

      currentGrid[i][j] = c(val, [`+${val}`], 'active');

      steps.push(
        sm(
          lAdd,
          `Somando m[${i}][${j}] (${val}): ${prevSoma} + ${val} = ${soma}.`,
          {
            rows: L,
            cols: C,
            rowLabels,
            colLabels,
            activeRow: i,
            activeCol: j,
            grid: currentGrid.map((r) => [...r]),
          },
          { i, j, [`m[${i}][${j}]`]: val, soma },
        ),
      );

      currentGrid[i][j] = c(val, [], '');
    }
  }

  steps.push(
    sm(
      lReturn,
      `Soma total de todos os ${L * C} elementos da matriz: ${soma}.`,
      {
        rows: L,
        cols: C,
        rowLabels,
        colLabels,
        grid: currentGrid.map((r) => [...r]),
      },
      { soma },
    ),
  );

  return steps;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Grupo de Operações e Definição da Lição
 * ────────────────────────────────────────────────────────────────────────── */

const DEFAULT_VETOR = [10, 20, 30, 40, 50];
const DEFAULT_MATRIZ = [
  [1, 2, 3],
  [4, 5, 6],
];

export const operationsGroup: LessonOperationsGroup = {
  structures: [
    {
      id: 'vetor',
      label: 'Vetor (1D)',
      defaultInput: DEFAULT_VETOR,
      operations: [
        {
          id: 'preencher',
          label: 'Preencher',
          panelLabel: 'vetor (1D)',
          complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(n)' },
          code: (input) => ({ c: getVetorPreencherCode(normalizeVetorInput(input)) }),
          steps: (input) => generateVetorPreencherSteps(normalizeVetorInput(input)),
        },
        {
          id: 'limpar',
          label: 'Limpar',
          panelLabel: 'vetor (1D)',
          complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          code: (input) => ({ c: getVetorLimparCode(normalizeVetorInput(input)) }),
          steps: (input) => generateVetorLimparSteps(normalizeVetorInput(input)),
        },
        {
          id: 'buscar',
          label: 'Buscar',
          panelLabel: 'vetor (1D)',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          code: (input) => {
            const v = normalizeVetorInput(input);
            const alvo = v[Math.floor(v.length / 2)] ?? 0;
            return { c: getVetorBuscarCode(v, alvo) };
          },
          steps: (input) => generateVetorBuscarSteps(normalizeVetorInput(input)),
        },
        {
          id: 'somar',
          label: 'Somar',
          panelLabel: 'vetor (1D)',
          complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
          code: (input) => ({ c: getVetorSomarCode(normalizeVetorInput(input)) }),
          steps: (input) => generateVetorSomarSteps(normalizeVetorInput(input)),
        },
      ],
    },
    {
      id: 'matriz',
      label: 'Matriz (2D)',
      defaultInput: DEFAULT_MATRIZ,
      operations: [
        {
          id: 'preencher',
          label: 'Preencher',
          panelLabel: 'matriz (2D)',
          complexity: { time: { best: 'Θ(n·m)', avg: 'Θ(n·m)', worst: 'Θ(n·m)' }, space: 'Θ(n·m)' },
          code: (input) => ({ c: getMatrizPreencherCode(normalizeMatrizInput(input)) }),
          steps: (input) => generateMatrizPreencherSteps(normalizeMatrizInput(input)),
        },
        {
          id: 'limpar',
          label: 'Limpar',
          panelLabel: 'matriz (2D)',
          complexity: { time: { best: 'Θ(n·m)', avg: 'Θ(n·m)', worst: 'Θ(n·m)' }, space: 'Θ(1)' },
          code: (input) => ({ c: getMatrizLimparCode(normalizeMatrizInput(input)) }),
          steps: (input) => generateMatrizLimparSteps(normalizeMatrizInput(input)),
        },
        {
          id: 'buscar',
          label: 'Buscar',
          panelLabel: 'matriz (2D)',
          complexity: { time: { best: 'Θ(1)', avg: 'Θ(n·m)', worst: 'Θ(n·m)' }, space: 'Θ(1)' },
          code: (input) => {
            const m = normalizeMatrizInput(input);
            const midL = Math.floor(m.length / 2);
            const midC = Math.floor((m[0]?.length ?? 1) / 2);
            const alvo = m[midL]?.[midC] ?? 0;
            return { c: getMatrizBuscarCode(m, alvo) };
          },
          steps: (input) => generateMatrizBuscarSteps(normalizeMatrizInput(input)),
        },
        {
          id: 'somar',
          label: 'Somar',
          panelLabel: 'matriz (2D)',
          complexity: { time: { best: 'Θ(n·m)', avg: 'Θ(n·m)', worst: 'Θ(n·m)' }, space: 'Θ(1)' },
          code: (input) => ({ c: getMatrizSomarCode(normalizeMatrizInput(input)) }),
          steps: (input) => generateMatrizSomarSteps(normalizeMatrizInput(input)),
        },
      ],
    },
  ],
};

export const lessonVetoresMatrizes: Lesson = {
  id: 'vetores-matrizes',
  title: 'Vetores e matrizes',
  subtitle: 'Estruturas e operações fundamentais',
  description:
    'Um vetor armazena dados contíguos em 1 dimensão acessados por um único índice a partir de zero. Uma matriz expande esse modelo para 2 dimensões (linhas e colunas), manipuladas por laços aninhados. Experimente operações como preencher, limpar, buscar e somar em vetores e matrizes com entradas dinâmicas.',
  view: 'matrix',
  panelLabel: 'vetor (1D)',
  languages: ['c'],
  initial: DEFAULT_VETOR,
  complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(n)' },
  code: { c: getVetorPreencherCode(DEFAULT_VETOR) },
  operationsGroup,
  steps: (input) => generateVetorPreencherSteps(normalizeVetorInput(input)),
};
