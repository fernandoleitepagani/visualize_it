import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const NBALDES = 10;

const javaIterativo = lines(`
void insertionSort(float[] array, int n){
  for(int i = 1; i < n; i++){
    float tmp = array[i];
    int j = i-1;
    while(j >= 0 && array[j] > tmp){
      array[j+1] = array[j];
      j--;
    }
    array[j+1] = tmp;
  }
}

void bucketSort(float[] array, int nBaldes){
  int[] count = new int[nBaldes];
  float[][] buckets = new float[nBaldes][array.length];
  for(int i = 0; i < nBaldes; i++){
    count[i] = 0;
  }
  for(int i = 0; i < array.length; i++){
    int x = (int)Math.floor(array[i]*nBaldes);
    buckets[x][count[x]] = array[i];
    count[x]++;
  }
  for(int i = 0; i < nBaldes; i++){
    insertionSort(buckets[i], count[i]);
  }
  int k = 0;
  for(int i = 0; i < nBaldes; i++){
    for(int j = 0; j < count[i]; j++){
      array[k] = buckets[i][j];
      k++;
    }
  }
}`);

const cIterativo = lines(`
void insertionSort(float *array, int n){
  for(int i = 1; i < n; i++){
    float tmp = array[i];
    int j = i-1;
    while(j >= 0 && array[j] > tmp){
      array[j+1] = array[j];
      j--;
    }
    array[j+1] = tmp;
  }
}

void bucketSort(float *array, int n, int nBaldes){
  int count[nBaldes];
  float buckets[nBaldes][n];
  for(int i = 0; i < nBaldes; i++){
    count[i] = 0;
  }
  for(int i = 0; i < n; i++){
    int x = (int)floor(array[i]*nBaldes);
    buckets[x][count[x]] = array[i];
    count[x]++;
  }
  for(int i = 0; i < nBaldes; i++){
    insertionSort(buckets[i], count[i]);
  }
  int k = 0;
  for(int i = 0; i < nBaldes; i++){
    for(int j = 0; j < count[i]; j++){
      array[k] = buckets[i][j];
      k++;
    }
  }
}`);

const javaRecursivo = lines(`
void insertionSort(float[] array, int n){
  for(int i = 1; i < n; i++){
    float tmp = array[i];
    int j = i-1;
    while(j >= 0 && array[j] > tmp){
      array[j+1] = array[j];
      j--;
    }
    array[j+1] = tmp;
  }
}

void separa(float[][] buckets, int[] count, float[] array, int i, int n, int nBaldes){
  if(i >= n) return ;
  else {
    int x = (int)Math.floor(array[i]*nBaldes);
    buckets[x][count[x]] = array[i];
    count[x]++;
    separa(buckets, count, array, i+1, n, nBaldes);
  }
}

void ordena(float[][] buckets, int[] count, int i, int nBaldes){
  if(i >= nBaldes) return ;
  else {
    insertionSort(buckets[i], count[i]);
    ordena(buckets, count, i+1, nBaldes);
  }
}

void copia(float[][] buckets, int[] count, float[] array, int i, int nBaldes, int k){
  if(i >= nBaldes) return ;
  else {
    for(int j = 0; j < count[i]; j++){
      array[k] = buckets[i][j];
      k++;
    }
    copia(buckets, count, array, i+1, nBaldes, k);
  }
}

void bucketSort(float[] array, int nBaldes){
  int[] count = new int[nBaldes];
  float[][] buckets = new float[nBaldes][array.length];
  for(int i = 0; i < nBaldes; i++){
    count[i] = 0;
  }
  separa(buckets, count, array, 0, array.length, nBaldes);
  ordena(buckets, count, 0, nBaldes);
  int k = 0;
  copia(buckets, count, array, 0, nBaldes, k);
}`);

const cRecursivo = lines(`
void insertionSort(float *array, int n){
  for(int i = 1; i < n; i++){
    float tmp = array[i];
    int j = i-1;
    while(j >= 0 && array[j] > tmp){
      array[j+1] = array[j];
      j--;
    }
    array[j+1] = tmp;
  }
}

void separa(int n, float (*buckets)[n], int *count, float *array, int i, int nBaldes){
  if(i >= n) return ;
  else {
    int x = (int)floor(array[i]*nBaldes);
    buckets[x][count[x]] = array[i];
    count[x]++;
    separa(n, buckets, count, array, i+1, nBaldes);
  }
}

void ordena(int n, float (*buckets)[n], int *count, int i, int nBaldes){
  if(i >= nBaldes) return ;
  else {
    insertionSort(buckets[i], count[i]);
    ordena(n, buckets, count, i+1, nBaldes);
  }
}

void copia(int n, float (*buckets)[n], int *count, float *array, int i, int nBaldes, int k){
  if(i >= nBaldes) return ;
  else {
    for(int j = 0; j < count[i]; j++){
      array[k] = buckets[i][j];
      k++;
    }
    copia(n, buckets, count, array, i+1, nBaldes, k);
  }
}

void bucketSort(float *array, int n, int nBaldes){
  int count[nBaldes];
  float buckets[nBaldes][n];
  for(int i = 0; i < nBaldes; i++){
    count[i] = 0;
  }
  separa(n, buckets, count, array, 0, nBaldes);
  ordena(n, buckets, count, 0, nBaldes);
  int k = 0;
  copia(n, buckets, count, array, 0, nBaldes, k);
}`);

/**
 * 0-based line indices for each listing. The insertion sort is shared by both
 * approaches (lines 0–10); only the bucket orchestration differs.
 */
const LINES = {
  iterativo: {
    start: 12,
    countAlloc: 13,
    bucketsAlloc: 14,
    zeroLoop: 15,
    zero: 16,
    distributeLoop: 18,
    bucketIndex: 19,
    bucketWrite: 20,
    countIncrement: 21,
    sortLoop: 23,
    sortCall: 24,
    insertLoop: 1,
    key: 2,
    initJ: 3,
    whileLoop: 4,
    shift: 5,
    decrementJ: 6,
    insertKey: 8,
    k: 26,
    concatLoop: 27,
    concatInner: 28,
    concatWrite: 29,
    concatK: 30,
    end: 33,
  },
  recursivo: {
    start: 41,
    countAlloc: 42,
    bucketsAlloc: 43,
    zeroLoop: 44,
    zero: 45,
    distributeLoop: 47,
    bucketIndex: 15,
    bucketWrite: 16,
    countIncrement: 17,
    sortLoop: 48,
    sortCall: 25,
    insertLoop: 1,
    key: 2,
    initJ: 3,
    whileLoop: 4,
    shift: 5,
    decrementJ: 6,
    insertKey: 8,
    k: 49,
    concatLoop: 50,
    concatInner: 33,
    concatWrite: 34,
    concatK: 35,
    end: 51,
  },
} as const;

export const lesson: Lesson = {
  id: 'bucket',
  title: 'Bucket Sort',
  subtitle: 'Ordenação por Baldes',
  description:
    'Distribui valores em [0, 1) por faixas, ordena cada balde com inserção e concatena os baldes.',
  view: 'bars',
  panelLabel: 'vetor / baldes',
  initial: [0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.68, 0.55],
  inputFormat: 'unit-interval',
  randomInput: () =>
    Array.from({ length: 4 + Math.floor(Math.random() * 5) }, () =>
      Math.round(Math.random() * 100) / 100,
    ),
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n + n²/B)', worst: 'Θ(n²)' },
    space: 'Θ(n + B)',
    stable: true,
    note: `B = nBaldes = ${NBALDES} nesta lição. A distribuição usa floor(valor·B), então os valores devem estar em [0, 1). Com B ≈ n e distribuição uniforme, a média é Θ(n); com B fixo, o pior caso concentra tudo em um balde e vira Θ(n²).`,
  },
  complexityAnalysis: {
    comparisons: `A distribuição não compara elementos.

Cada balde é ordenado por inserção. Para um balde de tamanho b:
  melhor: b − 1 comparações
  pior: b(b − 1)/2 comparações

Somando os B' baldes não vazios:
melhor: C(n) = n − B' = Θ(n)
pior: C(n) = Σ b_i(b_i − 1)/2

Se tudo cai em um balde:
C(n) = n(n − 1)/2 = Θ(n²)

Com B baldes equilibrados:
C(n) ≈ n²/(2B) = Θ(n²/B)

As versões iterativa e recursiva fazem as mesmas comparações; a recursão
adiciona Θ(n) chamadas, mas não muda a ordem de grandeza.`,
    movements: `Inicialização de count: B escritas.
Distribuição: n escritas nos baldes + n incrementos de count = 2n.
Inserção, por balde de tamanho b:
  b − 1 escritas da chave + deslocamentos.
  Melhor caso: 0 deslocamentos.
  Pior caso: b(b − 1)/2 deslocamentos.
Concatenação: n escritas de volta em array.

Total:
M(n) = B + 2n + (n − B') + n + Σ b_i(b_i − 1)/2
     = 4n + B − B' + Σ b_i(b_i − 1)/2

onde B' é o número de baldes não vazios.

Melhor (baldes já ordenados): 4n + B − B' = Θ(n)
Pior (tudo em um balde, B' = 1):
M(n) = 4n + B − 1 + n(n − 1)/2 = Θ(n²)

Com B baldes equilibrados:
M(n) = 4n + n²/(2B) = Θ(n + n²/B)`,
  },
  code: { java: javaIterativo, c: cIterativo },
  codeVariants: {
    iterativo: { java: javaIterativo, c: cIterativo },
    recursivo: { java: javaRecursivo, c: cRecursivo },
  },
  steps(arr, approach = 'iterativo') {
    const v = arr.slice();
    const n = v.length;
    const L = LINES[approach];
    if (n === 0) return [{ line: L.start, desc: 'Vetor vazio.', arr: [] }];

    const steps: Step[] = [];
    const count = new Array<number>(NBALDES).fill(0);
    const buckets: number[][] = Array.from({ length: NBALDES }, () => []);
    const result = new Array<number>(n).fill(0);
    const bucketOf = (value: number) =>
      Math.min(NBALDES - 1, Math.max(0, Math.floor(value * NBALDES)));
    const push = (line: number, desc: string, extra: Partial<Step> = {}) =>
      steps.push({ line, desc, arr: v.slice(), ...extra });

    push(L.start, `Início: ${n} elementos em ${NBALDES} baldes.`);

    push(L.countAlloc, `count[0..${NBALDES - 1}] criado.`, { arr: count.slice() });
    push(L.bucketsAlloc, `${NBALDES} baldes de até ${n} posições.`);

    push(L.zeroLoop, `Zera count[0..${NBALDES - 1}].`, { arr: count.slice() });
    for (let i = 0; i < NBALDES; i++) {
      count[i] = 0;
      push(L.zero, `count[${i}] = 0.`, {
        arr: count.slice(),
        cmp: [i],
        vars: { i },
      });
    }

    push(L.distributeLoop, 'Distribui os valores nos baldes.');
    for (let i = 0; i < n; i++) {
      const valor = v[i];
      const b = bucketOf(valor);

      push(L.bucketIndex, `balde = floor(${valor} · ${NBALDES}) = ${b}.`, {
        cmp: [i],
        vars: { i, valor, balde: b },
      });

      const pos = count[b];
      buckets[b][pos] = valor;
      push(L.bucketWrite, `baldes[${b}][${pos}] = ${valor}.`, {
        cmp: [i],
        vars: { valor, balde: b, pos },
      });

      count[b]++;
      push(L.countIncrement, `count[${b}]++ → ${count[b]}.`, {
        cmp: [i],
        vars: { balde: b, tamanho: count[b] },
      });
    }

    push(L.sortLoop, 'Ordena cada balde com inserção.');
    for (let b = 0; b < NBALDES; b++) {
      const bucket = buckets[b];
      if (bucket.length === 0) continue;

      push(L.sortCall, `Ordena o balde ${b} (${bucket.length} elementos).`, {
        arr: bucket.slice(),
        vars: { balde: b, tamanho: bucket.length },
      });

      for (let i = 1; i < bucket.length; i++) {
        const key = bucket[i];
        push(L.insertLoop, `i = ${i}: insere ${key}.`, {
          arr: bucket.slice(),
          cmp: [i],
          vars: { i },
        });
        push(L.key, `tmp = ${key}.`, {
          arr: bucket.slice(),
          cmp: [i],
          vars: { tmp: key },
        });

        let j = i - 1;
        push(L.initJ, `j = ${j}.`, { arr: bucket.slice(), vars: { j } });

        while (true) {
          const within = j >= 0;
          const greater = within && bucket[j] > key;

          push(
            L.whileLoop,
            within
              ? greater
                ? `${bucket[j]} > ${key} → continua.`
                : `${bucket[j]} <= ${key} → para.`
              : 'j < 0 → para.',
            {
              arr: bucket.slice(),
              cmp: within ? [j] : [],
              vars: { j, tmp: key },
            },
          );

          if (!greater) break;

          bucket[j + 1] = bucket[j];
          push(L.shift, `Move ${bucket[j]} para a posição ${j + 1}.`, {
            arr: bucket.slice(),
            swap: [j + 1],
            vars: { j },
          });

          j--;
          push(L.decrementJ, `j-- → ${j}.`, { arr: bucket.slice(), vars: { j } });
        }

        bucket[j + 1] = key;
        push(L.insertKey, `array[${j + 1}] = ${key}.`, {
          arr: bucket.slice(),
          swap: [j + 1],
          vars: { tmp: key },
        });
      }
    }

    push(L.k, 'k = 0.', { arr: result.slice() });
    push(L.concatLoop, 'Concatena os baldes de volta em array.', { arr: result.slice() });

    let k = 0;
    for (let b = 0; b < NBALDES; b++) {
      const bucket = buckets[b];
      if (bucket.length === 0) continue;

      for (let j = 0; j < bucket.length; j++) {
        push(L.concatInner, `balde ${b}, j = ${j}.`, {
          arr: result.slice(),
          vars: { balde: b, j },
        });

        result[k] = bucket[j];
        push(L.concatWrite, `array[${k}] = ${bucket[j]}.`, {
          arr: result.slice(),
          swap: [k],
          vars: { balde: b, valor: bucket[j] },
        });

        k++;
        push(L.concatK, `k++ → ${k}.`, { arr: result.slice(), vars: { k } });
      }
    }

    push(L.end, `Vetor ordenado: [${result.join(', ')}].`, {
      arr: result.slice(),
      sorted: result.map((_, i) => i),
    });

    return steps;
  },
};
