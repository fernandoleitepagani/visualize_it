import type { Lesson, Step, VarValue } from '@/engine/types';
import { lines } from '@/lib/lines';

const INT_SIZE = 4;
const BASE_ADDRESS = 0x1000;

/** Endereços fictícios: cada int ocupa 4 bytes a partir de 0x1000. */
const address = (index: number) => `0x${(BASE_ADDRESS + index * INT_SIZE).toString(16)}`;

export const lesson: Lesson = {
  id: 'aritmetica',
  title: 'Aritmética de ponteiros',
  subtitle: 'Percorrendo e alterando um vetor com um ponteiro p',
  description:
    'Mostra como um ponteiro p percorre e altera um vetor usando aritmética de ' +
    'ponteiros em C. A seta ▼ marca a posição atual de p, e o painel de variáveis ' +
    'mostra o endereço apontado (endereços fictícios, com int de 4 bytes). Java não ' +
    'tem aritmética de ponteiros.',
  view: 'cells',
  panelLabel: 'vetor',
  initial: [2, 4, 6, 8, 10],

  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(1)',
    stable: true,
    note: 'Cada operação de aritmética de ponteiros (p++, p--, p += k) é Θ(1).',
  },

  code: {
    java: lines(`
// Aviso: Java não tem aritmética de ponteiros.
// Não existem p++, p-- nem p += k sobre endereços.
// A mesma caminhada usaria índices: i++, i += 2, i-- e v[i].`),
    c: lines(`
void altera(int *p){
	*p += 5;
	p += 2;
	*p = *(p-1) + *(p+1);
	p--;
	*(p+2) = *p;
}

int main(){
	int v[5];

	altera(v + 1);

	for(int i = 0; i < 5; i++){
		printf("%d ", v[i]);
	}
	return 0;
}`),
  },

  steps(initial) {
    // Garante 5 posições (o roteiro usa índices fixos 0..4)
    const v = [0, 1, 2, 3, 4].map((i) => (Number.isFinite(initial[i]) ? initial[i] : (i + 1) * 10));
    const out: Step[] = [];

    interface Mark {
      /** Posição atual de p. */
      p?: number;
      /** Células lidas nesta linha. */
      read?: number[];
      /** Célula escrita nesta linha. */
      write?: number[];
      /** Rótulos extras por índice (ex.: p-1, p+1). */
      labels?: Record<number, string[]>;
      vars?: Record<string, VarValue>;
    }

    const snap = (line: number, desc: string, mark: Mark = {}) => {
      const vars: Record<string, VarValue> = { ...mark.vars };
      if (mark.p !== undefined) {
        vars.p = address(mark.p);
        vars['*p'] = v[mark.p];
      }

      out.push({
        line,
        desc,
        vars: Object.keys(vars).length > 0 ? vars : undefined,
        cells: v.map((val, i) => {
          const labels = [...(mark.labels?.[i] ?? [])];
          if (i === mark.p) labels.unshift('▼ p');

          const state = mark.write?.includes(i)
            ? 'write'
            : mark.read?.includes(i)
              ? 'compare'
              : i === mark.p
                ? 'active'
                : '';

          return { val, labels, state };
        }),
      });
    };

    snap(8, 'main() inicia a execução.');
    snap(9, `int v[5] = {${v.join(', ')}} — vetor inicial.`);

    snap(11, `altera(v + 1): p recebe o endereço de v[1] (${address(1)}).`, { p: 1 });

    const antes = v[1];
    v[1] += 5;
    snap(1, `*p += 5: v[1] passa de ${antes} para ${v[1]}.`, {
      p: 1,
      write: [1],
      vars: { 'v[1] (antes)': antes },
    });

    snap(2, 'p += 2: o ponteiro avança dois ints e passa a apontar para v[3].', {
      p: 3,
      vars: { deslocamento: '+2 ints' },
    });

    const esquerda = v[2];
    const direita = v[4];
    const soma = esquerda + direita;
    v[3] = soma;
    snap(3, `*p = *(p-1) + *(p+1): v[3] = v[2] + v[4] = ${esquerda} + ${direita} = ${soma}.`, {
      p: 3,
      read: [2, 4],
      write: [3],
      labels: { 2: ['p-1'], 4: ['p+1'] },
      vars: { '*(p-1)': esquerda, '*(p+1)': direita, resultado: soma },
    });

    snap(4, 'p--: o ponteiro volta um int e passa a apontar para v[2].', {
      p: 2,
      vars: { deslocamento: '−1 int' },
    });

    const valor = v[2];
    v[4] = valor;
    snap(5, `*(p+2) = *p: v[4] recebe v[2] = ${valor}.`, {
      p: 2,
      read: [2],
      write: [4],
      labels: { 4: ['p+2'] },
      vars: { alvo: 'v[4]', valor },
    });

    snap(6, `altera retorna. Vetor final: [${v.join(', ')}].`);

    snap(13, 'main percorre o vetor para imprimir.', { vars: { i: '0..4' } });
    snap(14, `printf imprime: ${v.join(' ')}.`, { vars: { saída: v.join(' ') } });
    snap(16, 'return 0: fim do programa.');

    return out;
  },
};
