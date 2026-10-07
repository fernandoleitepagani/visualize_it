viz.register('pilha-sequencial', {
  title: 'Pilha Sequencial',
  subtitle: 'LIFO em vetor',
  description: 'Empilha e desempilha sempre no topo. O vetor tem capacidade fixa — pode estourar.',
  view: 'cells',
  panelLabel: 'pilha',
  initial: [10, 20, 30],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(n)', stable: false,
    note: 'push e pop tocam apenas a posição topo — sempre Θ(1).'
  },
  code: {
    java: `
class Pilha {
  int[] v = new int[8];
  int topo = -1;
  void push(int x) {
    if (topo + 1 >= v.length) return;
    v[++topo] = x;
  }
  int pop() {
    if (topo == -1) throw new RuntimeException("vazia");
    return v[topo--];
  }
}`.trim().split('\n'),
    c: `
#define MAX 8
int v[MAX], topo = -1;
void push(int x) {
  if (topo + 1 >= MAX) return;
  v[++topo] = x;
}
int pop() {
  if (topo == -1) return -1;
  return v[topo--];
}`.trim().split('\n')
  },
  steps(initial) {
    const MAX = 8;
    const v = new Array(MAX).fill(null);
    let topo = -1;
    for (let i = 0; i < Math.min(initial.length, MAX); i++) { v[i] = initial[i]; topo = i; }
    const out = [];

    const snap = (desc, states = {}, labels = {}, line = 0) => {
      out.push({
        line, desc,
        cells: v.map((val, i) => {
          const lbls = [].concat(labels[i] || []);
          if (i === topo && val !== null) lbls.unshift('topo');
          return {
            val,
            labels: lbls,
            state: states[i] || (val === null ? 'empty' : (i === topo ? 'active' : ''))
          };
        })
      });
    };

    snap(`Início: [${v.slice(0, topo + 1).join(', ')}], topo = ${topo}.`);

    function push(x) {
      if (topo + 1 >= MAX) { snap('Pilha cheia (overflow).', { [topo]: 'write' }, {}, 2); return; }
      snap(`push(${x})`, {}, { [topo + 1]: ['novo'] }, 2);
      v[topo + 1] = x; topo++;
      snap(`v[${topo}] = ${x}; topo = ${topo}.`, { [topo]: 'write' }, {}, 3);
    }

    function pop() {
      if (topo === -1) { snap('Pilha vazia (underflow).', {}, {}, 5); return; }
      const r = v[topo];
      snap(`pop() retorna v[${topo}] = ${r}.`, { [topo]: 'active' }, {}, 6);
      v[topo] = null; topo--;
      snap(`topo = ${topo}.`, {}, {}, 6);
    }

    push(40);
    push(50);
    pop();
    push(60);
    pop();
    pop();
    snap('Fim.');
    return out;
  }
});