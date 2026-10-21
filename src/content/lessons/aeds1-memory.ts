import type { Cell, Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const c = (val: Cell['val'], labels: string[], state = ''): Cell => ({ val, labels, state });
const s = (line: number, desc: string, cells: Cell[]): Step => ({ line, desc, cells });

const base = {
  view: 'cells' as const,
  inputless: true,
  initial: [1],
  complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
};

export const lessonStructs: Lesson = {
  ...base,
  id: 'structs',
  title: 'Structs',
  subtitle: 'Agrupando dados',
  description: 'Uma struct cria um tipo com vários campos. O acesso usa ponto: p.x, p.y.',
  panelLabel: 'struct',
  languages: ['c'],
  code: {
    c: lines(`
struct Ponto { int x; int y; };
struct Ponto p = {3, 4};
p.x = 10;
printf("%d %d", p.x, p.y);`),
  },
  steps: () => [
    s(0, 'Definir a struct Ponto.', [c('Ponto', ['tipo'])]),
    s(1, 'Criar p com x=3 e y=4.', [c(3, ['x'], 'write'), c(4, ['y'], 'write')]),
    s(2, 'Alterar o campo x.', [c(10, ['x'], 'write'), c(4, ['y'])]),
    s(3, 'Ler os dois campos.', [c(10, ['x']), c(4, ['y'])]),
  ],
};

export const lessonMemoria: Lesson = {
  ...base,
  id: 'alocacao-memoria',
  title: 'Alocação de memória',
  subtitle: 'malloc e free',
  description: 'malloc reserva memória no heap; free devolve a reserva. O ponteiro guarda o endereço do bloco.',
  panelLabel: 'heap',
  languages: ['c'],
  code: {
    c: lines(`
int *v = malloc(3 * sizeof(int));
v[0] = 10; v[1] = 20;
printf("%d", v[0]);
free(v);`),
  },
  steps: () => [
    s(0, 'Reservar espaço para 3 inteiros.', [c('v', ['ponteiro'], 'active')]),
    s(1, 'Escrever nos índices 0 e 1.', [c(10, ['v[0]'], 'write'), c(20, ['v[1]'], 'write')]),
    s(2, 'Ler o primeiro valor.', [c(10, ['v[0]']), c(20, ['v[1]'])]),
    s(3, 'Liberar o bloco.', [c('livre', ['heap'], 'write')]),
  ],
};

export const lessonStrings: Lesson = {
  ...base,
  id: 'strings',
  title: 'Strings',
  subtitle: 'Texto em C',
  description: 'Em C, uma string é um vetor de char terminado em \'\\0\'. strlen percorre até o terminador.',
  panelLabel: 'string',
  languages: ['c'],
  complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
  code: {
    c: lines(`
char nome[20] = "Ana";
printf("%s", nome);
printf("%zu", strlen(nome));`),
  },
  steps: () => [
    s(0, 'Guardar Ana no vetor de char.', [c('A', ['0'], 'write'), c('n', ['1'], 'write'), c('a', ['2'], 'write'), c('\\0', ['3'], 'write')]),
    s(1, 'printf imprime até o terminador.', [c('Ana', ['texto'], 'active')]),
    s(2, 'strlen conta os caracteres antes de \\0.', [c(3, ['tamanho'], 'active')]),
  ],
};

export const lessonArquivos: Lesson = {
  ...base,
  id: 'arquivos',
  title: 'Arquivos',
  subtitle: 'Leitura e escrita',
  description: 'fopen abre um arquivo em um modo; fprintf escreve; fclose libera o recurso.',
  panelLabel: 'arquivo',
  languages: ['c'],
  code: {
    c: lines(`
FILE *f = fopen("dados.txt", "w");
fprintf(f, "Ana 20\\n");
fclose(f);`),
  },
  steps: () => [
    s(0, 'Abrir dados.txt para escrita.', [c('dados.txt', ['arquivo'], 'active'), c('w', ['modo'])]),
    s(1, 'Escrever uma linha.', [c('Ana 20', ['conteúdo'], 'write')]),
    s(2, 'Fechar o arquivo.', [c('fechado', ['estado'], 'write')]),
  ],
};

export const lessonVetoresMatrizes: Lesson = {
  ...base,
  id: 'vetores-matrizes',
  title: 'Vetores e matrizes',
  subtitle: 'Índices e dimensões',
  description: 'Vetores usam um índice; matrizes usam linha e coluna. O acesso é feito por colchetes.',
  panelLabel: 'vetor',
  complexity: { time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(n)' },
  languages: ['c'],
  code: {
    c: lines(`
int v[3] = {10, 20, 30};
int m[2][2] = {{1, 2}, {3, 4}};
printf("%d", v[1]);
printf("%d", m[1][0]);`),
  },
  steps: () => [
    s(0, 'Criar o vetor v.', [c(10, ['v[0]'], 'write'), c(20, ['v[1]'], 'write'), c(30, ['v[2]'], 'write')]),
    s(1, 'Criar a matriz 2x2.', [c(1, ['m[0][0]']), c(2, ['m[0][1]']), c(3, ['m[1][0]']), c(4, ['m[1][1]'])]),
    s(2, 'Ler v[1].', [c(20, ['v[1]'], 'active')]),
    s(3, 'Ler m[1][0].', [c(3, ['m[1][0]'], 'active')]),
  ],
};

export const lessonClassesVetores: Lesson = {
  ...base,
  id: 'classes-vetores-matrizes',
  title: 'Classes com vetores e matrizes',
  subtitle: 'Coleções dentro de objetos',
  description: 'Uma classe pode guardar vetores ou matrizes como atributos e oferecer métodos para acessá-los.',
  panelLabel: 'turma',
  languages: ['cpp'],
  code: {
    cpp: lines(`
class Turma {
public:
  int notas[3];
  void setNota(int i, int v) { notas[i] = v; }
};
Turma t;
t.setNota(0, 10);`),
  },
  steps: () => [
    s(0, 'Definir a classe Turma.', [c('Turma', ['classe'])]),
    s(2, 'notas é um vetor de 3 inteiros.', [c(0, ['notas[0]']), c(0, ['notas[1]']), c(0, ['notas[2]'])]),
    s(5, 'Criar a turma t.', [c('t', ['objeto'], 'write')]),
    s(6, 'Gravar a primeira nota.', [c(10, ['notas[0]'], 'write'), c(0, ['notas[1]']), c(0, ['notas[2]'])]),
  ],
};
