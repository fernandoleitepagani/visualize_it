import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const javaIterativo = lines(`
void bubbleSort(int[] array){
	for(int i = 0; i < (array.length-1); i++){
		for(int j = (array.length-1); j > i; j--){
			if(array[j] < array[j-1]){
				int tmp = array[j];
				array[j] = array[j-1];
				array[j-1] = tmp;
			}
		}
	}
}`);

const cIterativo = lines(`
void bubbleSort(int *array, int n){
	for(int i = 0; i < (n-1); i++){
		for(int j = (n-1); j > i; j--){
			if(array[j] < array[j-1]){
				int tmp = array[j];
				array[j] = array[j-1];
				array[j-1] = tmp;
			}
		}
	}
}`);

const javaRecursivo = lines(`
void bubbleSort(int[] array, int i){
	if(i >= (array.length-1)) return ;
	
	for(int j = (array.length-1); j > i; j--){
		if(array[j] < array[j-1]){
			int tmp = array[j];
			array[j] = array[j-1];
			array[j-1] = tmp;
		}
	}
	
	bubbleSort(array, i+1);
}`);

const cRecursivo = lines(`
void bubbleSort(int *array, int i, int n){
	if(i >= n-1) return ;
	
	for(int j = (n-1); j > i; j--){
		if(array[j] < array[j-1]){
			int tmp = array[j];
			array[j] = array[j-1];
			array[j-1] = tmp;
		}
	}
	
	bubbleSort(array, i+1, n);
}`);

/** 0-based line indices for each listing. */
const LINES = {
  iterativo: {
    start: 0,
    baseCheck: 1,
    baseReturn: 1,
    round: 1,
    compare: 3,
    tmp: 4,
    assignJ: 5,
    assignPrev: 6,
    iterationEnd: 8,
    recurse: 11,
    end: 10,
  },
  recursivo: {
    start: 0,
    baseCheck: 1,
    baseReturn: 1,
    round: 3,
    compare: 4,
    tmp: 5,
    assignJ: 6,
    assignPrev: 7,
    iterationEnd: 9,
    recurse: 11,
    end: 12,
  },
} as const;

export const lesson: Lesson = {
  id: 'bolha',
  title: 'Bubble Sort',
  subtitle: 'Ordenação por Bolha',
  description:
    'Compara vizinhos da direita para a esquerda e, a cada rodada, leva o menor elemento para o início.',
  complexity: {
    time: { best: 'Θ(n²)', avg: 'Θ(n²)', worst: 'Θ(n²)' },
    space: 'Θ(1)',
    stable: true,
    note: 'Sem flag de parada: faz n(n−1)/2 comparações em qualquer caso. As movimentações variam de 0 a 3n(n−1)/2.',
  },
  complexityAnalysis: {
    comparisons: `Este código não tem flag de parada: o laço externo sempre executa n − 1 rodadas.

Na rodada i, o laço interno faz n − 1 − i comparações.
C(n) = (n − 1) + (n − 2) + ... + 1
     = n(n − 1) / 2

Melhor = médio = pior caso: Θ(n²)

Mesmo com o vetor já ordenado, todas as comparações são feitas.`,
    movements: `Cada troca faz 3 movimentações:
tmp = array[j]
array[j] = array[j-1]
array[j-1] = tmp

O número de trocas é igual ao número de inversões do vetor.

Melhor caso (já ordenado): 0 inversões.
M(n) = 0 = Θ(1)

Caso médio: n(n − 1)/4 inversões esperadas.
M(n) ≈ 3n(n − 1)/4 = Θ(n²)

Pior caso (inversamente ordenado): n(n − 1)/2 inversões.
M(n) = 3n(n − 1)/2 = Θ(n²)`,
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
          tmp,
        },
        ...extra,
      });

    push(L.start, `Início: ${n} elemento${n === 1 ? '' : 's'}.`);

    if (n <= 1) {
      if (n === 1) sorted.push(0);
      if (recursive) {
        i = 0;
        push(L.baseCheck, 'Chamada bubbleSort(i = 0): caso base (i ≥ n − 1).');
      }
      push(L.end, n === 0 ? 'Vetor vazio — nada a ordenar.' : 'Vetor já ordenado (1 elemento).');
      return out;
    }

    for (i = 0; i < n - 1; i++) {
      if (recursive) {
        push(L.baseCheck, `Chamada bubbleSort(i = ${i}): i < ${n - 1}, continua.`);
        push(L.round, `Percorrendo de v[${n - 1}] até v[${i + 1}].`, { pivot: [i] });
      } else {
        push(L.round, `Rodada ${i + 1}: i = ${i}.`, { pivot: [i] });
      }

      for (j = n - 1; j > i; j--) {
        const right = v[j];
        const left = v[j - 1];

        push(L.compare, `v[${j}] = ${right} vs v[${j - 1}] = ${left}.`, {
          pivot: [i],
          cmp: [j, j - 1],
        });

        if (right < left) {
          tmp = right;
          push(L.tmp, `tmp = v[${j}] = ${tmp}.`, { pivot: [i], swap: [j, j - 1] });

          push(L.assignJ, `v[${j}] recebe v[${j - 1}] = ${left}.`, {
            pivot: [i],
            swap: [j, j - 1],
          });

          // Publish the completed swap in one frame so the bars keep their
          // identity and glide instead of jumping through a duplicate value.
          v[j] = left;
          v[j - 1] = tmp;
          push(L.assignPrev, `v[${j - 1}] = tmp = ${tmp}. Trocado: v[${j - 1}] ↔ v[${j}].`, {
            swap: [j, j - 1],
          });

          tmp = null;
        }
      }

      sorted.push(i);
      push(L.iterationEnd, `Menor do trecho em v[${i}] = ${v[i]}.`, {
        pivot: [i],
      });

      if (recursive) {
        push(L.recurse, `bubbleSort(array, ${i + 1}) — próxima chamada.`, {
          pivot: i + 1 < n ? [i + 1] : undefined,
        });
      }
    }

    if (recursive) {
      i = n - 1;
      push(L.baseCheck, `Chamada bubbleSort(i = ${n - 1}): caso base (i ≥ n − 1) → return.`);
    }

    for (let k = 0; k < n; k++) if (!sorted.includes(k)) sorted.push(k);
    push(L.end, `Vetor ordenado: [${v.join(', ')}].`);

    return out;
  },
};
