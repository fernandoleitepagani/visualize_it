import type { Cell, Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';
import { stringRow, stringStep, textWithTerminator } from './string-utils';

const c = (val: Cell['val'], labels: string[], state = ''): Cell => ({ val, labels, state });
const s = (line: number, desc: string, cells: Cell[]): Step => ({ line, desc, cells });
const lineOf = (code: string[], text: string): number => {
  const index = code.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada: ${text}`);
  return index;
};

const base = {
  view: 'cells' as const,
  inputless: true,
  initial: [1],
  complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
};

const structsCode = lines(`
#include <stdio.h>

struct Aluno {
  char nome[50];
  int idade;
  float nota;
};

int main() {
  struct Aluno turma[2];

  turma[0].idade = 20;
  turma[0].nota = 8.5;

  for (int i = 0; i < 2; i++) {
    printf("Aluno %d: %d anos, nota %.1f\\n",
           i, turma[i].idade, turma[i].nota);
  }

  return 0;
}`);

export const lessonStructs: Lesson = {
  ...base,
  id: 'structs',
  title: 'Structs',
  subtitle: 'Agrupando dados',
  description:
    'Uma struct agrupa variáveis de tipos diferentes sob um único nome. Ela não cria memória por si só: define um formato; a variável nasce quando declaramos `struct Aluno a` ou um vetor `turma[2]`. O acesso usa ponto (`a.idade`), e vetores de structs são a base de cadastros, tabelas e estruturas dinâmicas.',
  panelLabel: 'struct',
  languages: ['c'],
  complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(n)' },
  code: { c: structsCode },
  steps: () => [
    s(lineOf(structsCode, 'struct Aluno'), 'Definir o formato Aluno.', [c('Aluno', ['tipo'])]),
    s(lineOf(structsCode, 'struct Aluno turma'), 'O vetor cria dois registros.', [c('turma[0]', ['registro']), c('turma[1]', ['registro'])]),
    s(lineOf(structsCode, 'turma[0].idade'), 'O ponto acessa um campo.', [c(20, ['idade'], 'write'), c(8.5, ['nota'], 'write')]),
    s(lineOf(structsCode, 'for (int i'), 'O laço percorre os registros.', [c('i = 0', ['índice'], 'active')]),
  ],
};

const memoriaCode = lines(`
#include <stdio.h>
#include <stdlib.h>

int main() {
  int *v = (int*) malloc(3 * sizeof(int));

  if (v == NULL) {
    printf("Erro de alocacao\\n");
    return 1;
  }

  v[0] = 10;
  v[1] = 20;
  v[2] = 30;

  printf("%d %d %d\\n", v[0], v[1], v[2]);

  free(v);
  v = NULL;
  return 0;
}`);

export const lessonMemoria: Lesson = {
  ...base,
  id: 'alocacao-memoria',
  title: 'Alocação de memória',
  subtitle: 'Stack, heap e free',
  description:
    'A stack guarda variáveis locais e é gerenciada automaticamente; o heap é reservado em tempo de execução e exige controle manual. malloc devolve um bloco de bytes e pode falhar com NULL, por isso a verificação é obrigatória. free libera o bloco, e o ponteiro deve deixar de ser usado para evitar acesso inválido.',
  panelLabel: 'heap',
  languages: ['c'],
  complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(n)' },
  code: { c: memoriaCode },
  steps: () => [
    s(lineOf(memoriaCode, 'int *v ='), 'Reservar espaço para três inteiros.', [c('v', ['ponteiro'], 'active')]),
    s(lineOf(memoriaCode, 'if (v == NULL)'), 'Verificar se a alocação falhou.', [c('válido', ['heap'], 'write')]),
    s(lineOf(memoriaCode, 'v[0] = 10'), 'Escrever nos índices do bloco.', [c(10, ['v[0]'], 'write'), c(20, ['v[1]'], 'write'), c(30, ['v[2]'], 'write')]),
    s(lineOf(memoriaCode, 'free(v)'), 'Liberar o bloco e evitar dangling pointer.', [c('livre', ['heap'], 'write')]),
  ],
};

const stringsCode = lines(`
#include <stdio.h>
#include <string.h>

int main() {
  char nome[] = "Ana";
  char *p = nome;

  printf("primeiro: %c\\n", *p);
  printf("sizeof: %zu\\n", sizeof(nome));
  printf("strlen: %zu\\n", strlen(nome));
  return 0;
}`);

export const lessonStrings: Lesson = {
  ...base,
  id: 'strings',
  title: 'Strings',
  subtitle: 'Texto em C',
  description:
    'Em C, string é um vetor de char terminado pelo caractere nulo `\\0`. O terminador permite que funções como strlen e printf saibam onde o texto acaba. sizeof(nome) conta o vetor inteiro, incluindo o `\\0`; strlen(nome) conta só os caracteres antes dele. Use fgets para ler linhas com espaço, strncpy para copiar com limite e strcmp para comparar conteúdo: == compara endereços.',
  view: 'strings',
  panelLabel: 'string',
  languages: ['c'],
  complexity: { time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(n)' },
  code: { c: stringsCode },
  steps: () => [
    stringStep(
      lineOf(stringsCode, 'char nome[]'),
      'O vetor guarda A, n, a e o terminador; a string tem três caracteres.',
      [stringRow('nome', textWithTerminator('Ana'))],
      { vars: { sizeof: 4, strlen: 3 } },
    ),
    stringStep(
      lineOf(stringsCode, 'char *p = nome'),
      'p aponta para o primeiro caractere da string.',
      [stringRow('nome', textWithTerminator('Ana', { 0: 'active' }, { 0: ['p'] }))],
      { vars: { p: '&nome[0]', '*p': 'A' } },
    ),
    stringStep(
      lineOf(stringsCode, 'printf("primeiro'),
      "O primeiro caractere é 'A'; o ponteiro não cria uma cópia do texto.",
      [stringRow('nome', textWithTerminator('Ana', { 0: 'compare' }, { 0: ['p'] }))],
      { vars: { '*p': 'A' } },
    ),
    stringStep(
      lineOf(stringsCode, 'printf("sizeof'),
      'sizeof(nome) vale 4: três letras e o terminador.',
      [stringRow('nome', textWithTerminator('Ana', {}, {}, ['fim']))],
      { vars: { sizeof: 4 }, result: { label: 'sizeof(nome)', value: '4' } },
    ),
    stringStep(
      lineOf(stringsCode, 'printf("strlen'),
      'strlen(nome) vale 3: ela para antes do terminador.',
      [stringRow('nome', textWithTerminator('Ana', {}, {}, ['fim']))],
      { vars: { strlen: 3 }, result: { label: 'strlen(nome)', value: '3' } },
    ),
  ],
};

const arquivosCode = lines(`
#include <stdio.h>

int main() {
  FILE *f = fopen("dados.txt", "w");
  if (f == NULL) {
    printf("Erro ao abrir\\n");
    return 1;
  }

  fprintf(f, "10\\n");
  fprintf(f, "20\\n");
  fclose(f);

  f = fopen("dados.txt", "r");
  int x;
  while (fscanf(f, "%d", &x) != EOF) {
    printf("%d\\n", x);
  }
  fclose(f);
  return 0;
}`);

export const lessonArquivos: Lesson = {
  ...base,
  id: 'arquivos',
  title: 'Arquivos',
  subtitle: 'Leitura e escrita',
  description:
    'Arquivos são fluxos de bytes mantidos fora da memória RAM. O ciclo profissional é abrir, manipular e fechar: fopen cria o vínculo e retorna FILE*; fprintf/fscanf leem e escrevem; fclose descarrega o buffer e libera o recurso. Sempre verifique NULL e trate o fim do arquivo com EOF.',
  panelLabel: 'arquivo',
  languages: ['c'],
  code: { c: arquivosCode },
  steps: () => [
    s(lineOf(arquivosCode, 'FILE *f = fopen'), 'Abrir dados.txt para escrita.', [c('dados.txt', ['arquivo']), c('w', ['modo'], 'active')]),
    s(lineOf(arquivosCode, 'if (f == NULL)'), 'Verificar se a abertura falhou.', [c('válido', ['FILE*'], 'write')]),
    s(lineOf(arquivosCode, 'fprintf(f'), 'Escrever os valores no arquivo.', [c(10, ['linha 1'], 'write'), c(20, ['linha 2'], 'write')]),
    s(lineOf(arquivosCode, 'fscanf'), 'Ler até o fim do arquivo.', [c('EOF', ['condição'], 'active')]),
    s(lineOf(arquivosCode, 'fclose(f);'), 'Fechar libera o recurso.', [c('fechado', ['estado'], 'write')]),
  ],
};

const vetoresCode = lines(`
#include <stdio.h>

int main() {
  int v[5] = {10, 20, 30, 40, 50};
  int m[2][2] = {{1, 2}, {3, 4}};

  int soma = 0;
  for (int i = 0; i < 5; i++) {
    soma += v[i];
  }

  int traco = m[0][0] + m[1][1];

  printf("Soma: %d\\n", soma);
  printf("Traco: %d\\n", traco);
  return 0;
}`);

export const lessonVetoresMatrizes: Lesson = {
  ...base,
  id: 'vetores-matrizes',
  title: 'Vetores e matrizes',
  subtitle: 'Índices e dimensões',
  description:
    'Um vetor armazena elementos do mesmo tipo em posições consecutivas e usa um índice a partir de zero. Uma matriz é um vetor de vetores: usa linha e coluna, e operações como soma, transposição e traço percorrem essas dimensões. O tamanho é fixo na declaração, e o acesso fora dos limites é erro de programação.',
  panelLabel: 'vetor',
  languages: ['c'],
  complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(n)' },
  code: { c: vetoresCode },
  steps: () => [
    s(lineOf(vetoresCode, 'int v[5]'), 'O vetor ocupa posições consecutivas.', [c(10, ['v[0]'], 'write'), c(20, ['v[1]'], 'write'), c(30, ['v[2]'], 'write')]),
    s(lineOf(vetoresCode, 'int m[2][2]'), 'A matriz tem linhas e colunas.', [c(1, ['m[0][0]']), c(2, ['m[0][1]']), c(3, ['m[1][0]']), c(4, ['m[1][1]'])]),
    s(lineOf(vetoresCode, 'soma += v[i]'), 'O laço percorre o vetor.', [c(150, ['soma'], 'write')]),
    s(lineOf(vetoresCode, 'int traco'), 'O traço soma a diagonal principal.', [c(5, ['traço'], 'write')]),
  ],
};

const classesVetoresCode = lines(`
#include <iostream>
using namespace std;

class Vaga {
public:
  bool ocupada;
  Vaga() { ocupada = false; }
};

int main() {
  Vaga estacionamento[2][3];

  estacionamento[0][0].ocupada = true;
  estacionamento[1][2].ocupada = true;

  for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 3; j++) {
      cout << estacionamento[i][j].ocupada << " ";
    }
    cout << endl;
  }

  return 0;
}`);

export const lessonClassesVetores: Lesson = {
  ...base,
  id: 'classes-vetores-matrizes',
  title: 'Classes com vetores e matrizes',
  subtitle: 'Coleções dentro de objetos',
  description:
    'Uma classe define o formato do objeto; um vetor ou matriz define quantos objetos serão armazenados. `Vaga estacionamento[2][3]` cria seis instâncias, cada uma com seu próprio estado. O acesso combina índice e campo (`estacionamento[i][j].ocupada`), o que organiza coleções de objetos em linhas e colunas.',
  panelLabel: 'turma',
  languages: ['cpp'],
  complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(n)' },
  code: { cpp: classesVetoresCode },
  steps: () => [
    s(lineOf(classesVetoresCode, 'class Vaga'), 'Cada Vaga tem seu próprio estado.', [c('Vaga', ['classe'])]),
    s(lineOf(classesVetoresCode, 'Vaga estacionamento'), 'A matriz cria 2x3 objetos.', [c('2x3', ['dimensão'], 'write')]),
    s(lineOf(classesVetoresCode, 'estacionamento[0][0]'), 'O índice e o ponto acessam o objeto.', [c('true', ['[0][0]'], 'write'), c('true', ['[1][2]'], 'write')]),
    s(lineOf(classesVetoresCode, 'for (int i'), 'Laços percorrem linhas e colunas.', [c('i, j', ['índices'], 'active')]),
  ],
};
