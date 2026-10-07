viz.register('lista-sequencial', {
  title: 'Lista Sequencial',
  subtitle: 'Vetor + contador n',
  description: 'Lista em vetor de capacidade fixa. Inserir no meio empurra os elementos à direita; remover, à esquerda.',
  view: 'cells',
  panelLabel: 'lista',
  initial: [10, 20, 30],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(n)', stable: true,
    note: 'Inserir/remover no fim é Θ(1); no início ou no meio, Θ(n) por causa do deslocamento.'
  },
  code: {
    java: `
class Lista {
  int[] v = new int[8];
  int n = 0;
  void inserir(int pos, int x) {
    if (n >= v.length) return;
    for (int i = n; i > pos; i--) v[i] = v[i - 1];
    v[pos] = x; n++;
  }
  int remover(int pos) {
    int r = v[pos];
    for (int i = pos; i < n - 1; i++) v[i] = v[i + 1];
    n--; return r;
  }
}`.trim().split('\n'),
    c: `
#define MAX 8
int v[MAX], n = 0;
void inserir(int pos, int x) {
  if (n >= MAX) return;
  for (int i = n; i > pos; i--) v[i] = v[i - 1];
  v[pos] = x; n++;
}
int remover(int pos) {
  int r = v[pos];
  for (int i = pos; i < n - 1; i++) v[i] = v[i + 1];
  n--; return r;
}`.trim().split('\n')
  },
  steps(initial) {
    const MAX = 8;
    const v = new Array(MAX).fill(null);
    let n = 0;
    for (let i = 0; i < Math.min(initial.length, MAX); i++) { v[i] = initial[i]; n++; }
    const out = [];

    const snap = (desc, states = {}, labels = {}, line = 0) => {
      out.push({
        line, desc,
        cells: v.map((val, i) => ({
          val,
          labels: labels[i] || [],
          state: states[i] || (val === null ? 'empty' : '')
        }))
      });
    };

    snap(`Início: [${v.slice(0, n).join(', ')}], n = ${n}.`);

    function inserir(pos, val) {
      if (n >= MAX) { snap('Lista cheia.', {}, { [pos]: ['!'] }); return; }
      snap(`Inserir ${val} na posição ${pos}.`, { [pos]: 'active' }, { [pos]: ['pos'] }, 2);
      for (let i = n; i > pos; i--) {
        v[i] = v[i - 1];
        snap(`Desloca v[${i}] ← v[${i - 1}] = ${v[i]}.`, { [i]: 'write', [i - 1]: 'active' }, {}, 3);
      }
      v[pos] = val; n++;
      snap(`v[${pos}] = ${val}, n = ${n}.`, { [pos]: 'write' }, {}, 4);
    }

    function remover(pos) {
      if (pos >= n) { snap('Posição inválida.'); return; }
      const r = v[pos];
      snap(`Remover v[${pos}] = ${r}.`, { [pos]: 'active' }, {}, 7);
      for (let i = pos; i < n - 1; i++) {
        v[i] = v[i + 1];
        snap(`Desloca v[${i}] ← v[${i + 1}] = ${v[i]}.`, { [i]: 'write', [i + 1]: 'active' }, {}, 8);
      }
      v[n - 1] = null; n--;
      snap(`Removido ${r}. n = ${n}.`, {}, {}, 8);
    }

    inserir(2, 15);
    inserir(0, 5);
    inserir(n, 40);
    remover(1);
    remover(0);
    snap('Fim.');
    return out;
  }
});