import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

/**
 * 0-based line indices shared by the Java and C listings. The two listings are
 * structurally identical, so a single `line` value points at the same
 * statement in both languages.
 */
const L = {
  start: 0,
  initMax: 1,
  maxLoop: 2,
  bucketsCount: 3,
  size: 4,
  allocBuckets: 5,
  allocSizes: 6,
  distributeLoop: 7,
  bucketIndex: 8,
  bucketWrite: 9,
  sortBucketLoop: 11,
  sortInnerLoop: 12,
  key: 13,
  initJ: 14,
  whileLoop: 15,
  shift: 16,
  decrementJ: 17,
  insertKey: 19,
  k: 22,
  concatBucketLoop: 23,
  concatElementLoop: 24,
  copyToV: 25,
  end: 26,
} as const;

const BUCKETS = 5;

export const lesson: Lesson = {
  id: 'bucket',
  title: 'Bucket Sort',
  subtitle: 'Ordenação por Baldes',
  description:
    'Distribui os valores em baldes por faixa, ordena cada balde com inserção e concatena os baldes.',
  view: 'bars',
  panelLabel: 'vetor / baldes',
  complexity: {
    time: { best: 'Θ(n)', avg: 'Θ(n + n²/B)', worst: 'Θ(n²)' },
    space: 'Θ(n + B)',
    stable: true,
    note: `B = ${BUCKETS} baldes. Com distribuição uniforme e B proporcional a n, a média é Θ(n); com B fixo, o pior caso concentra tudo em um balde e vira Θ(n²).`,
  },
  initial: [8, 3, 5, 1, 9, 2, 7, 4],
  complexityAnalysis: {
    comparisons: `A busca do máximo faz n − 1 comparações.
A distribuição não compara elementos.

Cada balde é ordenado por inserção. Para um balde de tamanho b:
  melhor: b − 1 comparações
  pior: b(b − 1)/2 comparações

Somando os B' baldes não vazios:
melhor: C(n) = (n − 1) + (n − B') = 2n − B' − 1 = Θ(n)
pior: C(n) = (n − 1) + Σ b_i(b_i − 1)/2

Se tudo cai em um balde:
C(n) = (n − 1) + n(n − 1)/2 = Θ(n²)

Com B baldes equilibrados:
C(n) ≈ n²/(2B) + n = Θ(n + n²/B)`,
    movements: `Distribuição: n escritas nos baldes.
Concatenação: n escritas de volta em v.
Inicialização de sizes: B escritas. k = 0: 1 escrita.

Inserção, por balde de tamanho b:
  b − 1 escritas da chave + deslocamentos.
  Melhor caso: 0 deslocamentos.
  Pior caso: b(b − 1)/2 deslocamentos.

Total:
M(n) = 2n + (n − B') + B + 1 + Σ b_i(b_i − 1)/2
     = 3n + B + 1 − B' + Σ b_i(b_i − 1)/2

onde B' é o número de baldes não vazios.

Melhor (baldes já ordenados): 3n + B + 1 − B' = Θ(n)
Pior (tudo em um balde, B' = 1):
M(n) = 3n + B + n(n − 1)/2 = Θ(n²)

Com B baldes equilibrados:
M(n) = 3n + 1 + n²/(2B) = Θ(n + n²/B)`,
  },
  code: {
    java: lines(`
void bucketSort(int[] v) {
  int max = v[0];
  for (int i = 1; i < v.length; i++) if (v[i] > max) max = v[i];
  int B = 5;
  int size = max / B + 1;
  int[][] buckets = new int[B][v.length];
  int[] sizes = new int[B];
  for (int i = 0; i < v.length; i++) {
    int b = v[i] / size;
    buckets[b][sizes[b]++] = v[i];
  }
  for (int b = 0; b < B; b++) {
    for (int i = 1; i < sizes[b]; i++) {
      int key = buckets[b][i];
      int j = i - 1;
      while (j >= 0 && buckets[b][j] > key) {
        buckets[b][j + 1] = buckets[b][j];
        j--;
      }
      buckets[b][j + 1] = key;
    }
  }
  int k = 0;
  for (int b = 0; b < B; b++)
    for (int i = 0; i < sizes[b]; i++)
      v[k++] = buckets[b][i];
}`),
    c: lines(`
void bucketSort(int v[], int n) {
  int max = v[0];
  for (int i = 1; i < n; i++) if (v[i] > max) max = v[i];
  enum { B = 5 };
  int size = max / B + 1;
  int buckets[B][n];
  int sizes[B] = {0};
  for (int i = 0; i < n; i++) {
    int b = v[i] / size;
    buckets[b][sizes[b]++] = v[i];
  }
  for (int b = 0; b < B; b++) {
    for (int i = 1; i < sizes[b]; i++) {
      int key = buckets[b][i];
      int j = i - 1;
      while (j >= 0 && buckets[b][j] > key) {
        buckets[b][j + 1] = buckets[b][j];
        j--;
      }
      buckets[b][j + 1] = key;
    }
  }
  int k = 0;
  for (int b = 0; b < B; b++)
    for (int i = 0; i < sizes[b]; i++)
      v[k++] = buckets[b][i];
}`),
  },
  steps(arr) {
    const v = arr.map((x) => Math.max(0, Math.floor(x)));
    const n = v.length;
    if (n === 0) return [{ line: L.start, desc: 'Vetor vazio.', arr: [] }];

    const steps: Step[] = [];
    const max = Math.max(...v);
    const size = Math.floor(max / BUCKETS) + 1;
    const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
    const result = new Array<number>(n).fill(0);
    const push = (line: number, desc: string, extra: Partial<Step> = {}) =>
      steps.push({ line, desc, arr: v.slice(), ...extra });

    push(L.start, `Início: ${n} elementos.`);

    let currentMax = v[0];
    push(L.initMax, `max = v[0] = ${currentMax}.`, {
      cmp: [0],
      vars: { max: currentMax },
    });
    for (let i = 1; i < n; i++) {
      if (v[i] > currentMax) currentMax = v[i];
      push(L.maxLoop, `Compara v[${i}] = ${v[i]} com max = ${currentMax}.`, {
        cmp: [i],
        vars: { i, max: currentMax },
      });
    }

    push(L.bucketsCount, `B = ${BUCKETS} baldes.`, { vars: { B: BUCKETS } });
    push(L.size, `size = max / B + 1 = ${size}.`, { vars: { size } });
    push(L.allocBuckets, `${BUCKETS} baldes de até ${n} posições.`);
    push(L.allocSizes, `sizes[0..${BUCKETS - 1}] = 0.`);

    for (let i = 0; i < n; i++) {
      const valor = v[i];
      const b = Math.floor(valor / size);

      push(L.distributeLoop, `i = ${i}: distribui v[${i}] = ${valor}.`, {
        cmp: [i],
        vars: { i, valor },
      });
      push(L.bucketIndex, `balde = ${valor} / ${size} = ${b}.`, {
        cmp: [i],
        vars: { valor, balde: b },
      });

      buckets[b].push(valor);
      push(L.bucketWrite, `baldes[${b}][${buckets[b].length - 1}] = ${valor}.`, {
        cmp: [i],
        vars: { valor, balde: b, tamanho: buckets[b].length },
      });
    }

    for (let b = 0; b < BUCKETS; b++) {
      const bucket = buckets[b];
      if (bucket.length === 0) continue;

      push(L.sortBucketLoop, `Ordena o balde ${b} (${bucket.length} elementos).`, {
        arr: bucket.slice(),
        vars: { balde: b, tamanho: bucket.length },
      });

      for (let i = 1; i < bucket.length; i++) {
        const key = bucket[i];
        push(L.sortInnerLoop, `i = ${i}: insere ${key}.`, {
          arr: bucket.slice(),
          cmp: [i],
          vars: { balde: b, i },
        });
        push(L.key, `key = ${key}.`, {
          arr: bucket.slice(),
          cmp: [i],
          vars: { chave: key },
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
              vars: { j, chave: key },
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
        push(L.insertKey, `baldes[${b}][${j + 1}] = ${key}.`, {
          arr: bucket.slice(),
          swap: [j + 1],
          vars: { chave: key },
        });
      }
    }

    let k = 0;
    push(L.k, 'k = 0.', { arr: result.slice() });
    for (let b = 0; b < BUCKETS; b++) {
      const bucket = buckets[b];
      if (bucket.length === 0) continue;

      push(L.concatBucketLoop, `Concatena o balde ${b}.`, {
        arr: result.slice(),
        vars: { balde: b },
      });

      for (let i = 0; i < bucket.length; i++) {
        push(L.concatElementLoop, `i = ${i} do balde ${b}.`, {
          arr: result.slice(),
          vars: { balde: b, i },
        });

        result[k] = bucket[i];
        push(L.copyToV, `v[${k}] = ${bucket[i]}.`, {
          arr: result.slice(),
          swap: [k],
          vars: { balde: b, valor: bucket[i] },
        });
        k++;
      }
    }

    push(L.end, `Vetor ordenado: [${result.join(', ')}].`, {
      arr: result.slice(),
      sorted: result.map((_, i) => i),
    });

    return steps;
  },
};
