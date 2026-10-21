import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const javaIterativo = lines(`
void countingSort(int[] array){
  int maior = 0;
  for(int i = 0; i < array.length; i++){
    if(array[i] > maior) 
      maior = array[i];
  }
  
  int[] count = new int[maior+1];
  int k = 0;
  for(int i = 0; i < count.length; i++){
    count[i] = 0;
    k++;
  }
  
  for(int i = (array.length-1); i >= 0; i--){
    count[array[i]]++;
  }
  
  for(int i = 1; i < k; i++){
    count[i] += count[i-1];
  }
  
  int[] ordenado = new int[array.length];
  for(int i = (ordenado.length-1); i >= 0; i--){
    ordenado[count[array[i]]-1] = array[i];
    count[array[i]]--;
  }
  
  for(int i = 0; i < array.length; i++){
    array[i] = ordenado[i];
  }
}`);

const cIterativo = lines(`
void countingSort(int *array, int n){
  int maior = 0;
  for(int i = 0; i < n; i++){
    if(array[i] > maior) 
      maior = array[i];
  }
  
  int count[maior+1];
  int k = 0;
  for(int i = 0; i < maior+1; i++){
    count[i] = 0;
    k++;
  }
  
  for(int i = (n-1); i >= 0; i--){
    count[array[i]]++;
  }
  
  for(int i = 1; i < k; i++){
    count[i] += count[i-1];
  }
  
  int ordenado[n];
  for(int i = (n-1); i >= 0; i--){
    ordenado[count[array[i]]-1] = array[i];
    count[array[i]]--;
  }
  
  for(int i = 0; i < n; i++){
    array[i] = ordenado[i];
  }
}`);

const javaRecursivo = lines(`
int findMaior(int[] array, int i){
  if(i == array.length - 1) return array[i];
  
  int maiorResto = findMaior(array, i + 1);
  if(array[i] > maiorResto) return array[i];
  else return maiorResto;
}

void iniciaCount(int[] count, int i){
  if(i >= count.length) return;
  count[i] = 0;
  iniciaCount(count, i + 1);
}

void contaArray(int[] count, int[] array, int i){
  if(i < 0) return;
  count[array[i]]++;
  contaArray(count, array, i - 1);
}

void finalizaCount(int[] count, int i){
  if(i >= count.length) return;
  count[i] += count[i - 1];
  finalizaCount(count, i + 1);
}

void ordena(int[] ordenado, int[] count, int[] array, int i){
  if(i < 0) return;
  ordenado[count[array[i]] - 1] = array[i];
  count[array[i]]--;
  ordena(ordenado, count, array, i - 1);
}

void copia(int[] ordenado, int[] array, int i){
  if(i >= array.length) return;
  array[i] = ordenado[i];
  copia(ordenado, array, i + 1);
}

void countingSort(int[] array){
  int maior = findMaior(array, 0);
  int k = maior + 1;
  
  int[] count = new int[k];
  iniciaCount(count, 0);
  
  contaArray(count, array, array.length - 1);
  
  finalizaCount(count, 1);
  
  int[] ordenado = new int[array.length];
  ordena(ordenado, count, array, array.length - 1);
  
  copia(ordenado, array, 0);
}`);

const cRecursivo = lines(`
int findMaior(int *array, int i, int n){
  if(i == n - 1) return array[i];
  
  int maiorResto = findMaior(array, i + 1, n);
  if(array[i] > maiorResto) return array[i];
  return maiorResto;
}

void iniciaCount(int *count, int i, int n){
  if(i >= n) return;
  count[i] = 0;
  iniciaCount(count, i + 1, n);
}

void contaArray(int *count, int *array, int i){
  if(i < 0) return;
  count[array[i]]++;
  contaArray(count, array, i - 1);
}

void finalizaCount(int *count, int i, int k){
  if(i >= k) return;
  count[i] += count[i - 1];
  finalizaCount(count, i + 1, k);
}

void ordena(int *ordenado, int *count, int *array, int i){
  if(i < 0) return;
  ordenado[count[array[i]] - 1] = array[i];
  count[array[i]]--;
  ordena(ordenado, count, array, i - 1);
}

void copia(int *ordenado, int *array, int i, int n){
  if(i >= n) return;
  array[i] = ordenado[i];
  copia(ordenado, array, i + 1, n);
}

void countingSort(int *array, int n){
  int maior = findMaior(array, 0, n);
  int k = maior + 1;
  
  int count[k];
  iniciaCount(count, 0, k);
  
  contaArray(count, array, n - 1);
  
  finalizaCount(count, 1, k);
  
  int ordenado[n];
  ordena(ordenado, count, array, n - 1);
  
  copia(ordenado, array, 0, n);
}`);

/**
 * 0-based line indices for each listing. The Java and C versions of a given
 * approach are structurally identical, so one index is correct in both.
 */
const LINES = {
  iterativo: {
    start: 0,
    maxInit: 1,
    maxCompare: 3,
    maxUpdate: 4,
    countAlloc: 7,
    kInit: 8,
    zeroLoop: 9,
    zero: 10,
    countLoop: 14,
    count: 15,
    prefixLoop: 18,
    prefix: 19,
    allocOut: 22,
    distributeLoop: 23,
    distribute: 24,
    decrement: 25,
    copyLoop: 28,
    copy: 29,
    end: 31,
  },
  recursivo: {
    start: 39,
    maxCall: 40,
    maxBase: 1,
    maxCompare: 4,
    countAlloc: 43,
    initCall: 44,
    zero: 10,
    countCall: 46,
    count: 16,
    prefixCall: 48,
    prefix: 22,
    allocOut: 50,
    distributeCall: 51,
    distribute: 28,
    decrement: 29,
    copyCall: 53,
    copy: 35,
    end: 54,
  },
} as const;

type LineMap = Record<
  keyof (typeof LINES)['iterativo'] | keyof (typeof LINES)['recursivo'],
  number
>;

export const lesson: Lesson = {
  id: 'counting',
  title: 'Counting Sort',
  subtitle: 'Ordenação por Contagem',
  description: 'Conta ocorrências de cada valor e distribui direto na posição final.',
  complexity: {
    time: { best: 'Θ(n + k)', avg: 'Θ(n + k)', worst: 'Θ(n + k)' },
    space: 'Θ(n + k)',
    stable: true,
    note: 'k = maior valor + 1. Tempo linear, mas exige chaves inteiras em faixa pequena.',
  },
  initial: [4, 2, 2, 8, 3, 3, 1],
  complexityAnalysis: {
    comparisons: `Counting sort não compara elementos entre si para ordenar.

A única comparação entre valores é a busca do máximo:
iterativo: n comparações (o laço começa em i = 0)
recursivo: n − 1 comparações

Nos dois casos, Θ(n).

Os outros laços apenas verificam limites (zerar, contar, somar prefixos,
distribuir e copiar), o que custa Θ(n + k).

Complexidade: Θ(n + k), com k = maior + 1.`,
    movements: `As versões iterativa e recursiva fazem exatamente as mesmas escritas.

Movimentações de elementos:
n escritas em ordenado (distribuição) + n escritas de volta em array = 2n.

Atualizações do vetor count:
k inicializações + n incrementos + (k − 1) somas de prefixo + n decrementos
= 2n + 2k − 1.

Total de escritas: 4n + 2k − 1 = Θ(n + k).

Complexidade: Θ(n + k). A recursão adiciona Θ(n) chamadas, mas não muda
a ordem de grandeza.`,
  },
  code: { java: javaIterativo, c: cIterativo },
  codeVariants: {
    iterativo: { java: javaIterativo, c: cIterativo },
    recursivo: { java: javaRecursivo, c: cRecursivo },
  },
  steps(arr, approach = 'iterativo') {
    const v = arr.map((x) => Math.max(0, Math.floor(x)));
    const n = v.length;
    const L = LINES[approach] as LineMap;
    if (n === 0) return [{ line: L.start, desc: 'Vetor vazio.', arr: [] }];

    const steps: Step[] = [];
    const max = Math.max(...v);
    const count = new Array<number>(max + 1).fill(0);
    const out = new Array<number>(n).fill(0);
    const push = (line: number, desc: string, extra: Partial<Step> = {}) =>
      steps.push({ line, desc, arr: v.slice(), ...extra });

    push(L.start, `Início: ${n} elementos.`);

    if (approach === 'iterativo') {
      let currentMax = 0;
      push(L.maxInit, 'maior = 0.', { vars: { maior: 0 } });
      for (let i = 0; i < n; i++) {
        push(L.maxCompare, `Compara array[${i}] = ${v[i]} com maior = ${currentMax}.`, {
          cmp: [i],
          vars: { i, maior: currentMax },
        });
        if (v[i] > currentMax) {
          currentMax = v[i];
          push(L.maxUpdate, `maior = ${currentMax}.`, {
            cmp: [i],
            vars: { maior: currentMax },
          });
        }
      }
    } else {
      push(L.maxCall, 'maior = findMaior(array, 0).');
      let currentMax = v[n - 1];
      push(L.maxBase, `Caso base: array[${n - 1}] = ${currentMax}.`, {
        cmp: [n - 1],
        vars: { i: n - 1, maior: currentMax },
      });
      for (let i = n - 2; i >= 0; i--) {
        const before = currentMax;
        const bigger = v[i] > before;
        if (bigger) currentMax = v[i];
        push(
          L.maxCompare,
          bigger
            ? `array[${i}] = ${v[i]} > ${before} → maior = ${currentMax}.`
            : `array[${i}] = ${v[i]} <= ${before} → mantém ${currentMax}.`,
          { cmp: [i], vars: { i, maior: currentMax } },
        );
      }
    }

    push(L.countAlloc, `count[0..${max}] criado.`, {
      arr: count.slice(),
      vars: { k: max + 1 },
    });

    if (approach === 'iterativo') {
      push(L.kInit, 'k = 0.', { arr: count.slice() });
      push(L.zeroLoop, `Zera count[0..${max}].`, { arr: count.slice() });
    } else {
      push(L.initCall, 'iniciaCount(count, 0).', { arr: count.slice() });
    }
    for (let i = 0; i <= max; i++) {
      count[i] = 0;
      push(L.zero, `count[${i}] = 0.`, {
        arr: count.slice(),
        cmp: [i],
        vars: { i },
      });
    }

    if (approach === 'iterativo') {
      push(L.countLoop, 'Conta as ocorrências da direita para a esquerda.', { arr: count.slice() });
    } else {
      push(L.countCall, 'contaArray(count, array, n - 1).', { arr: count.slice() });
    }
    for (let i = n - 1; i >= 0; i--) {
      count[v[i]]++;
      push(L.count, `count[${v[i]}]++ → ${count[v[i]]}.`, {
        arr: count.slice(),
        cmp: [v[i]],
        vars: { i, valor: v[i], contagem: count[v[i]] },
      });
    }

    if (approach === 'iterativo') {
      push(L.prefixLoop, 'Soma acumulada em count.', { arr: count.slice() });
    } else {
      push(L.prefixCall, 'finalizaCount(count, 1).', { arr: count.slice() });
    }
    for (let i = 1; i <= max; i++) {
      count[i] += count[i - 1];
      push(L.prefix, `count[${i}] += count[${i - 1}] → ${count[i]}.`, {
        arr: count.slice(),
        cmp: [i],
        vars: { i, acumulado: count[i] },
      });
    }

    push(L.allocOut, `ordenado[0..${n - 1}] criado.`, { arr: out.slice() });

    if (approach === 'iterativo') {
      push(L.distributeLoop, 'Distribui da direita para a esquerda.', { arr: out.slice() });
    } else {
      push(L.distributeCall, 'ordena(ordenado, count, array, n - 1).', { arr: out.slice() });
    }
    for (let i = n - 1; i >= 0; i--) {
      const valor = v[i];
      const pos = count[valor] - 1;

      out[pos] = valor;
      push(L.distribute, `ordenado[${pos}] = array[${i}] = ${valor}.`, {
        arr: out.slice(),
        swap: [pos],
        vars: { i, valor, pos },
      });

      count[valor]--;
      push(L.decrement, `count[${valor}]-- → ${count[valor]}.`, {
        arr: out.slice(),
        vars: { valor, contagem: count[valor] },
      });
    }

    if (approach === 'iterativo') {
      push(L.copyLoop, 'Copia ordenado de volta para array.');
    } else {
      push(L.copyCall, 'copia(ordenado, array, 0).');
    }
    for (let i = 0; i < n; i++) {
      v[i] = out[i];
      push(L.copy, `array[${i}] = ordenado[${i}] = ${v[i]}.`, {
        arr: v.slice(),
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
        vars: { i },
      });
    }

    push(L.end, `Vetor ordenado: [${v.join(', ')}].`, {
      arr: v.slice(),
      sorted: v.map((_, i) => i),
    });

    return steps;
  },
};
