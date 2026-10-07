viz.register('fila-circular', {
  title: 'Fila Circular',
  subtitle: 'FIFO em vetor circular',
  description: 'Usa índices primeiro e ultimo que dão a volta no vetor — nada de deslocar elementos.',
  view: 'cells',
  panelLabel: 'fila',
  initial: [10, 20, 30],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(n)', stable: true,
    note: 'Enfileirar e desenfileirar mexem só em primeiro/ultimo, com módulo pelo tamanho. Θ(1) sempre.'
  },
  code: {
    java: `
class Fila {
  int[] v = new int[7];   // 6 + 1 de folga
  int pri = 0, ult = 0;
  void enqueue(int x) {
    if ((ult + 1) % v.length == pri) return;
    v[ult] = x;
    ult = (ult + 1) % v.length;
  }
  int dequeue() {
    if (pri == ult) throw new RuntimeException("vazia");
    int r = v[pri];
    pri = (pri + 1) % v.length;
    return r;
  }
}`.trim().split('\n'),
    c: `
#define MAX 7
int v[MAX], pri = 0, ult = 0;
void enqueue(int x) {
  if ((ult + 1) % MAX == pri) return;
  v[ult] = x;
  ult = (ult + 1) % MAX;
}
int dequeue() {
  if (pri == ult) return -1;
  int r = v[pri];
  pri = (pri + 1) % MAX;
  return r;
}`.trim().split('\n')
  },
  steps(initial) {
    const MAX = 7;
    const v = new Array(MAX).fill(null);
    let pri = 0, ult = 0;
    for (let i = 0; i < Math.min(initial.length, MAX - 1); i++) {
      v[ult] = initial[i]; ult = (ult + 1) % MAX;
    }
    const out = [];

    const snap = (desc, states = {}, labels = {}, line = 0) => {
      out.push({
        line, desc,
        cells: v.map((val, i) => {
          const lbls = [].concat(labels[i] || []);
          if (i === pri) lbls.unshift('pri');
          if (i === ult) lbls.push('ult');
          return {
            val,
            labels: lbls,
            state: states[i] || (val === null ? 'empty' : '')
          };
        })
      });
    };

    snap(`Início: pri=${pri}, ult=${ult}.`, {}, {}, 0);

    function enqueue(x) {
      if ((ult + 1) % MAX === pri) { snap('Fila cheia.', {}, {}, 3); return; }
      snap(`enqueue(${x}) → v[${ult}].`, {}, { [ult]: ['novo'] }, 3);
      v[ult] = x;
      ult = (ult + 1) % MAX;
      snap(`v[${(ult - 1 + MAX) % MAX}] = ${x}; ult = ${ult}.`, { [(ult - 1 + MAX) % MAX]: 'write' }, {}, 5);
    }

    function dequeue() {
      if (pri === ult) { snap('Fila vazia.', {}, {}, 7); return; }
      const r = v[pri];
      snap(`dequeue() retorna v[${pri}] = ${r}.`, { [pri]: 'active' }, {}, 7);
      v[pri] = null;
      pri = (pri + 1) % MAX;
      snap(`pri = ${pri}.`, {}, {}, 9);
    }

    enqueue(40);
    enqueue(50);
    dequeue();
    enqueue(60);   // dá a volta
    dequeue();
    snap('Fim.');
    return out;
  }
});