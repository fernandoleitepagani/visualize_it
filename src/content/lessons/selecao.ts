import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const javaIterativo = lines(`
void selectionSort(int[] array) {
  for (int i = 0; i < array.length - 1; i++) {
    int menor = i;
    for (int j = i + 1; j < array.length; j++) {
      if (array[j] < array[menor]) menor = j;
    }
    int tmp = array[i]; 
    array[i] = array[menor]; 
    array[menor] = tmp;
  }
}`);

const cIterativo = lines(`
void selectionSort(int *array, int n) {
  for (int i = 0; i < n - 1; i++) {
    int menor = i;
    for (int j = i + 1; j < n; j++) {
      if (array[j] < array[menor]) menor = j;
    }
    int tmp = array[i]; 
    array[i] = array[menor]; 
    array[menor] = tmp;
  }
}`);

const javaRecursivo = lines(`
void selectionSort(int[] array, int i){
	if(i >= (array.length - 1)){
		return ;
	}
	
	int menor = i;
	for(int j = i+1; j < array.length; j++){
		if(array[j] < array[menor]){
			menor = j;
		}
	}
	int tmp = array[i];
	array[i] = array[menor];
	array[menor] = tmp;
	
	selectionSort(array, i+1);
}`);

const cRecursivo = lines(`
void selectionSort(int *array, int i, int n){
	if(i >= (n-1)){
		return ;
	}
	
	int menor = i;
	for(int j = i+1; j < n; j++){
		if(array[j] < array[menor]){
			menor = j;
		}
	}
	int tmp = array[i];
	array[i] = array[menor];
	array[menor] = tmp;
	
	selectionSort(array, i+1, n);
}`);

/**
 * 0-based line indices for each listing. Keeping them together makes it easy
 * to check that the highlighted line still points at the right statement.
 */
const LINES = {
  iterativo: {
    start: 0,
    baseCheck: 1,
    baseReturn: 2,
    round: 1,
    initMenor: 2,
    compare: 4,
    updateMenor: 4,
    tmp: 6,
    assignI: 7,
    assignMenor: 8,
    iterationEnd: 9,
    recurse: 9,
    end: 10,
  },
  recursivo: {
    start: 0,
    baseCheck: 1,
    baseReturn: 2,
    round: 5,
    initMenor: 5,
    compare: 7,
    updateMenor: 8,
    tmp: 11,
    assignI: 12,
    assignMenor: 13,
    iterationEnd: 10,
    recurse: 15,
    end: 16,
  },
} as const;

export const lesson: Lesson = {
  id: 'selecao',
  title: 'Selection Sort',
  subtitle: 'Ordenação por Seleção',
  description:
    'Selection Sort (ordenação por seleção) é um algoritmo que ordena um vetor procurando repetidamente o menor elemento da parte não ordenada e colocando-o na posição correta.',
  complexity: {
    time: { best: 'Θ(n²)', avg: 'Θ(n²)', worst: 'Θ(n²)' },
    space: 'Θ(1)',
    stable: false,
    note: 'Sempre faz ~n²/2 comparações, mas no máximo n−1 trocas.',
  },
  complexityAnalysis: {
    comparisons: `Para todos os casos, o laço interno compara o menor atual com cada elemento restante.

Na rodada i, são feitas n − i − 1 comparações:
i = 0  →  n − 1
i = 1  →  n − 2
...
i = n − 2  →  1

C(n) = (n − 1) + (n − 2) + ... + 1
     = n(n − 1) / 2

Complexidade: Θ(n²)`,
    movements: `Para todos os casos, a troca é executada uma vez por rodada do laço externo. O laço externo repete n − 1 vezes e cada troca faz 3 movimentações:

M(n) = 3 · (n − 1) = 3n − 3

As 3 movimentações vêm de:
tmp = array[i]
array[i] = array[menor]
array[menor] = tmp

Complexidade: Θ(n)

Observação: se o código só trocar quando menor ≠ i, o total varia entre 0 e 3(n − 1).`,
  },
  code: {
    java: javaIterativo,
    c: cIterativo,
  },
  codeVariants: {
    iterativo: { java: javaIterativo, c: cIterativo },
    recursivo: { java: javaRecursivo, c: cRecursivo },
  },
  steps(arr, approach = 'iterativo') {
    const v = arr.slice();
    const n = v.length;
    const out: Step[] = [];
    const sorted: number[] = [];
    const recursive = approach === 'recursivo';
    const L = LINES[approach];

    let i = -1,
      j = -1,
      menor = -1,
      tmp: number | null = null;

    const push = (line: number, desc: string, extra: Partial<Step> = {}) =>
      out.push({
        line,
        desc,
        arr: v.slice(),
        sorted: [...sorted],
        vars: {
          i: i >= 0 ? i : null,
          j: j >= 0 ? j : null,
          menor: menor >= 0 ? menor : null,
          tmp,
        },
        ...extra,
      });

    push(L.start, `Início: ${n} elemento${n === 1 ? '' : 's'}.`);

    if (n <= 1) {
      if (n === 1) sorted.push(0);
      if (recursive) {
        i = 0;
        push(L.baseCheck, 'Chamada selectionSort(i = 0): caso base (i ≥ n − 1).', {
          pivot: [0],
        });
        push(L.baseReturn, 'return — não há o que ordenar.');
      }
      push(L.end, n === 0 ? 'Vetor vazio — nada a ordenar.' : 'Vetor já ordenado (1 elemento).');
      return out;
    }

    for (i = 0; i < n - 1; i++) {
      j = -1;
      tmp = null;

      if (recursive) {
        push(L.baseCheck, `Chamada selectionSort(i = ${i}): i < ${n - 1}, continua.`, {
          pivot: [i],
        });
      } else {
        push(L.round, `Rodada ${i + 1}: i = ${i}. Buscando o menor em [${i}..${n - 1}].`, {
          pivot: [i],
        });
      }

      menor = i;
      push(L.initMenor, `menor = i = ${menor} → v[${menor}] = ${v[menor]}.`, {
        pivot: [i],
        cmp: [menor],
      });

      for (j = i + 1; j < n; j++) {
        const vj = v[j];
        const oldMenor = menor;
        const vm = v[oldMenor];

        push(L.compare, `j = ${j}: v[${j}] = ${vj} vs v[${oldMenor}] = ${vm}.`, {
          pivot: [i],
          cmp: [j, oldMenor],
        });

        if (vj < vm) {
          menor = j;
          push(L.updateMenor, `Sim — ${vj} < ${vm}. Novo menor: índice ${menor} (v[${menor}] = ${vj}).`, {
            pivot: [i],
            cmp: [menor],
          });
        }
      }

      j = -1;

      if (recursive) {
        push(
          L.iterationEnd,
          `Menor do trecho: v[${menor}] = ${v[menor]} (índice ${menor}).`,
          { pivot: [i], cmp: [menor] },
        );
      }

      if (menor !== i) {
        tmp = v[i];
        push(L.tmp, `tmp = v[${i}] = ${tmp}.`, { pivot: [i], swap: [i, menor] });

        const smallest = v[menor];
        push(L.assignI, `v[${i}] recebe o menor: v[${menor}] = ${smallest}.`, {
          pivot: [i],
          swap: [i, menor],
        });

        // Apply the whole swap before publishing the next frame. Publishing the
        // intermediate duplicate value (`v[i] = v[menor]`) made assignElementIds
        // lose the bars' identity, so they jumped instead of gliding.
        v[i] = smallest;
        v[menor] = tmp;
        push(L.assignMenor, `v[${menor}] = tmp = ${tmp}. Trocado: v[${i}] ↔ v[${menor}].`, {
          swap: [i, menor],
        });

        tmp = null;
      }

      sorted.push(i);

      if (recursive) {
        push(
          L.recurse,
          menor === i
            ? `v[${i}] já era o menor — sem troca. selectionSort(array, ${i + 1}).`
            : `selectionSort(array, ${i + 1}) — próxima chamada.`,
          { pivot: i + 1 < n ? [i + 1] : undefined },
        );
      } else {
        push(
          L.iterationEnd,
          menor === i
            ? `v[${i}] = ${v[i]} já é o menor do trecho — sem troca. Posição ${i} definida.`
            : `Posição ${i} definida: v[${i}] = ${v[i]}.`,
          { pivot: [i] },
        );
      }
    }

    if (recursive) {
      i = n - 1;
      push(L.baseCheck, `Chamada selectionSort(i = ${i}): caso base (i ≥ n − 1).`, {
        pivot: [i],
      });
      push(L.baseReturn, 'return — fim da recursão.');
    }

    sorted.push(n - 1);
    push(L.end, `Vetor ordenado: [${v.join(', ')}].`);

    return out;
  },
};
