import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const javaIterativo = lines(`
void insertionSort(int[] array){
	for(int i = 1; i < array.length; i++){
		int tmp = array[i];
		int j = i-1;
		while(j >= 0 && array[j] > tmp){
			array[j+1] = array[j];
			j--;
		}
		array[j+1] = tmp;
	}
}`);

const cIterativo = lines(`
void insertionSort(int *array, int n){
	for(int i = 1; i < n; i++){
		int tmp = array[i];
		int j = i-1;
		while(j >= 0 && array[j] > tmp){
			array[j+1] = array[j];
			j--;
		}
		array[j+1] = tmp;
	}
}`);

const javaRecursivo = lines(`
void insertionSort(int[] array, int i){
	if(i >= array.length) return ;
	
	int tmp = array[i];
	int j = i-1;
	while(j >= 0 && array[j] > tmp){
		array[j+1] = array[j];
		j--;
	}
	array[j+1] = tmp;
	
	insertionSort(array, i+1);
}`);

const cRecursivo = lines(`
void insertionSort(int *array, int i, int n){
	if(i >= n) return ;
	
	int tmp = array[i];
	int j = i-1;
	while(j >= 0 && array[j] > tmp){
		array[j+1] = array[j];
		j--;
	}
	array[j+1] = tmp;
	
	insertionSort(array, i+1, n);
}`);

/** 0-based line indices for each listing. */
const LINES = {
  iterativo: {
    start: 0,
    baseCheck: 1,
    baseReturn: 1,
    round: 1,
    tmp: 2,
    j: 3,
    compare: 4,
    shift: 5,
    decrement: 6,
    assign: 8,
    iterationEnd: 9,
    recurse: 11,
    end: 10,
  },
  recursivo: {
    start: 0,
    baseCheck: 1,
    baseReturn: 1,
    round: 3,
    tmp: 3,
    j: 4,
    compare: 5,
    shift: 6,
    decrement: 7,
    assign: 9,
    iterationEnd: 9,
    recurse: 11,
    end: 12,
  },
} as const;

export const lesson: Lesson = {
  id: 'insercao',
  title: 'Insertion Sort',
  subtitle: 'Ordenação por Inserção',
  description: 'Empurra cada elemento para trás até achar o lugar certo na parte já ordenada.',
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n²)', worst: 'Θ(n²)' },
    space: 'Θ(1)',
    stable: true,
    note: 'Melhor caso Θ(n) com vetor já ordenado; pior caso Θ(n²) com vetor inversamente ordenado.',
  },
  complexityAnalysis: {
    comparisons: `C(n) = comparações entre a chave tmp e os elementos à esquerda.

Melhor caso (vetor já ordenado):
o while falha na 1ª verificação em cada rodada.
C(n) = n − 1 = Θ(n)

Caso médio:
em média, metade dos elementos à esquerda é maior que tmp.
C(n) ≈ n(n − 1) / 4 = Θ(n²)

Pior caso (vetor inversamente ordenado):
na rodada i, todas as i comparações são feitas.
C(n) = 1 + 2 + ... + (n − 1)
     = n(n − 1) / 2 = Θ(n²)`,
    movements: `Cada rodada faz 2 movimentações fixas:
tmp = array[i]
array[j+1] = tmp
e mais 1 movimentação por deslocamento:
array[j+1] = array[j]

Melhor caso (já ordenado): sem deslocamentos.
M(n) = 2(n − 1) = Θ(n)

Caso médio: cerca de n(n − 1)/4 deslocamentos.
M(n) ≈ 2(n − 1) + n(n − 1)/4
     = (n² + 7n − 8) / 4 = Θ(n²)

Pior caso (inversamente ordenado):
M(n) = 2(n − 1) + n(n − 1)/2
     = (n² + 3n − 4) / 2 = Θ(n²)`,
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
    const sorted: number[] = n > 0 ? [0] : [];
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

    push(
      L.start,
      `Início: ${n} elemento${n === 1 ? '' : 's'}.${n > 0 ? ' O primeiro já conta como ordenado.' : ''}`,
    );

    if (n <= 1) {
      if (recursive) {
        i = 1;
        push(L.baseCheck, 'Chamada insertionSort(i = 1): caso base (i ≥ n).');
      }
      push(L.end, n === 0 ? 'Vetor vazio — nada a ordenar.' : 'Vetor já ordenado (1 elemento).');
      return out;
    }

    for (i = 1; i < n; i++) {
      if (recursive) {
        push(L.baseCheck, `Chamada insertionSort(i = ${i}): i < ${n}, continua.`, {
          pivot: [i],
        });
      } else {
        push(L.round, `Inserindo v[${i}] = ${v[i]}.`, { pivot: [i] });
      }

      tmp = v[i];
      push(
        L.tmp,
        recursive ? `Inserindo v[${i}] = ${tmp}: tmp = ${tmp}.` : `tmp = ${tmp}.`,
        { pivot: [i] },
      );

      j = i - 1;
      push(L.j, `j = i − 1 = ${j}.`, { pivot: [i] });

      while (j >= 0 && v[j] > tmp) {
        const value = v[j];

        push(L.compare, `v[${j}] = ${value} > ${tmp} → desloca.`, {
          pivot: [i],
          cmp: [j],
        });

        v[j + 1] = value;
        push(L.shift, `v[${j + 1}] = v[${j}] = ${value}.`, {
          pivot: [i],
          cmp: [j, j + 1],
        });

        j--;
        push(L.decrement, `j = ${j}.`, { pivot: [i] });
      }

      push(
        L.compare,
        j >= 0
          ? `v[${j}] = ${v[j]} ≤ ${tmp} → achou o lugar.`
          : `j < 0 → ${tmp} é o menor até agora.`,
        j >= 0 ? { cmp: [j], pivot: [i] } : { pivot: [i] },
      );

      v[j + 1] = tmp;
      push(L.assign, `v[${j + 1}] = tmp = ${tmp}.`, { pivot: [j + 1] });

      tmp = null;
      sorted.push(i);

      if (recursive) {
        push(L.recurse, `insertionSort(array, ${i + 1}) — próxima chamada.`, {
          pivot: i + 1 < n ? [i + 1] : undefined,
        });
      } else {
        push(L.iterationEnd, `Rodada ${i} concluída: v[0..${i}] está ordenado.`, {
          pivot: [i],
        });
      }
    }

    if (recursive) {
      i = n;
      push(L.baseCheck, `Chamada insertionSort(i = ${n}): caso base (i ≥ n) → return.`);
    }

    push(L.end, `Vetor ordenado: [${v.join(', ')}].`);

    return out;
  },
};
