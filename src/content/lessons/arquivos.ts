import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

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

const lineOf = (text: string, occurrence = 1): number => {
  let count = 0;
  for (let i = 0; i < arquivosCode.length; i++) {
    if (arquivosCode[i].includes(text)) {
      count++;
      if (count === occurrence) return i;
    }
  }
  throw new Error(`Linha não encontrada (ocorrência ${occurrence}): ${text}`);
};

const lineFopenW = lineOf('FILE *f = fopen');
const lineIfNull = lineOf('if (f == NULL)');
const lineFprintf10 = lineOf('fprintf(f, "10');
const lineFprintf20 = lineOf('fprintf(f, "20');
const lineFclose1 = lineOf('fclose(f);', 1);
const lineFopenR = lineOf('f = fopen');
const lineIntX = lineOf('int x;');
const lineWhileFscanf = lineOf('while (fscanf');
const linePrintfX = lineOf('printf("%d\\n", x);');
const lineFclose2 = lineOf('fclose(f);', 2);
const lineReturn = lineOf('return 0;');

export const lessonArquivos: Lesson = {
  id: 'arquivos',
  title: 'Arquivos',
  subtitle: 'Leitura e escrita sequencial com FILE*',
  description:
    'Arquivos são fluxos de bytes persistidos fora da memória RAM (no disco rígido ou SSD). O ciclo profissional de I/O em C consiste em: 1) fopen cria a estrutura de controle na RAM e associa ao arquivo físico com modo ("w" para escrita, "r" para leitura); 2) verificação de erro contra NULL; 3) escrita ou leitura sequencial controlada por cursor (seek head); 4) fclose descarrega os buffers de memória para o disco (flush) e libera o recurso do sistema operacional.',
  panelLabel: 'arquivos',
  view: 'file',
  inputless: true,
  initial: [1],
  languages: ['c'],
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(n)', worst: 'Θ(n)' },
    space: 'Θ(1)',
    note: 'O tempo depende do número de linhas/bytes processados sequencialmente (n); o espaço na RAM é O(1) com buffer fixo.',
  },
  code: { c: arquivosCode },
  steps: (): Step[] => {
    const stepsList: Step[] = [];

    // Passo 0: fopen("dados.txt", "w")
    stepsList.push({
      line: lineFopenW,
      desc: 'fopen("dados.txt", "w") cria a estrutura FILE na memória RAM e inicializa o arquivo "dados.txt" no disco em modo de escrita ("w"). O cursor fica na posição inicial (linha 1).',
      vars: { f: '0x7ffe', 'dados.txt': 'criado (modo w)', cursor: 'L1' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'w',
            status: 'open',
            state: 'write',
          },
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [],
          cursorLine: 1,
          eofReached: false,
        },
        stdout: [],
      },
    });

    // Passo 1: if (f == NULL)
    stepsList.push({
      line: lineIfNull,
      desc: 'Verifica se a abertura falhou. Como f aponta para 0x7ffe na RAM (diferente de NULL), a criação do arquivo no disco foi bem-sucedida.',
      vars: { f: '0x7ffe', 'f == NULL': 'false' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'w',
            status: 'open',
            state: 'active',
          },
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [],
          cursorLine: 1,
          eofReached: false,
        },
        stdout: [],
      },
    });

    // Passo 2: fprintf(f, "10\n");
    stepsList.push({
      line: lineFprintf10,
      desc: 'fprintf(f, "10\\n") formata a string, passa pelo buffer de E/S na RAM e grava "10" na linha 1 do arquivo. O cursor do fluxo avança para a linha 2.',
      vars: { f: '0x7ffe', gravado: '10\\n', cursor: 'L2' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'w',
            status: 'open',
            state: 'write',
          },
          buffer: '10\\n',
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [{ number: 1, text: '10', state: 'write' }],
          cursorLine: 2,
          eofReached: false,
        },
        stdout: [],
      },
    });

    // Passo 3: fprintf(f, "20\n");
    stepsList.push({
      line: lineFprintf20,
      desc: 'fprintf(f, "20\\n") grava a segunda linha "20" no arquivo em disco na posição do cursor. O cursor avança para o fim.',
      vars: { f: '0x7ffe', gravado: '20\\n', cursor: 'L3' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'w',
            status: 'open',
            state: 'write',
          },
          buffer: '20\\n',
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'default' },
            { number: 2, text: '20', state: 'write' },
          ],
          cursorLine: 3,
          eofReached: false,
        },
        stdout: [],
      },
    });

    // Passo 4: fclose(f); (primeiro)
    stepsList.push({
      line: lineFclose1,
      desc: 'fclose(f) descarrega qualquer buffer restante na RAM para o disco (flush), encerra a escrita e libera a estrutura FILE*. Os dados agora estão persistidos permanentemente no disco.',
      vars: { f: 'fechado', buffer: 'descarregado (flush)', disco: 'persistido' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            status: 'closed',
            state: 'default',
          },
          buffer: null,
          flushing: true,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'default' },
            { number: 2, text: '20', state: 'default' },
          ],
          cursorLine: null,
          eofReached: false,
        },
        stdout: [],
      },
    });

    // Passo 5: f = fopen("dados.txt", "r");
    stepsList.push({
      line: lineFopenR,
      desc: 'f = fopen("dados.txt", "r") reabre o arquivo existente em modo de leitura ("r"). Um novo fluxo é configurado na RAM com o cursor de leitura apontando para a linha 1.',
      vars: { f: '0x7ffe', modo: 'r (leitura)', cursor: 'L1' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'r',
            status: 'open',
            state: 'active',
          },
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'default' },
            { number: 2, text: '20', state: 'default' },
          ],
          cursorLine: 1,
          eofReached: false,
        },
        stdout: [],
      },
    });

    // Passo 6: int x;
    stepsList.push({
      line: lineIntX,
      desc: 'Declara a variável receptora inteira "x" na pilha (RAM). Ela conterá os valores extraídos pelo fscanf.',
      vars: { f: '0x7ffe', x: '?' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'r',
            status: 'open',
            state: 'default',
          },
          variables: [{ name: 'x', type: 'int', value: '?', state: 'default' }],
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'default' },
            { number: 2, text: '20', state: 'default' },
          ],
          cursorLine: 1,
          eofReached: false,
        },
        stdout: [],
      },
    });

    // Passo 7: while (fscanf(f, "%d", &x) != EOF) - 1ª leitura
    stepsList.push({
      line: lineWhileFscanf,
      desc: 'fscanf lê o valor inteiro 10 da linha 1 para o endereço de x na RAM. Retorna 1 (1 item lido, != EOF). A condição é verdadeira e o cursor avança para a linha 2.',
      vars: { x: 10, 'fscanf retorno': 1, '!= EOF': 'true' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'r',
            status: 'open',
            state: 'read',
          },
          variables: [{ name: 'x', type: 'int', value: 10, state: 'write' }],
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'read' },
            { number: 2, text: '20', state: 'default' },
          ],
          cursorLine: 2,
          eofReached: false,
        },
        stdout: [],
      },
    });

    // Passo 8: printf("%d\n", x); - 1ª impressão
    stepsList.push({
      line: linePrintfX,
      desc: 'printf("%d\\n", x) lê o valor 10 da RAM e envia para a saída padrão (Terminal / stdout).',
      vars: { x: 10, stdout: '10' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'r',
            status: 'open',
            state: 'default',
          },
          variables: [{ name: 'x', type: 'int', value: 10, state: 'read' }],
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'default' },
            { number: 2, text: '20', state: 'default' },
          ],
          cursorLine: 2,
          eofReached: false,
        },
        stdout: ['10'],
      },
    });

    // Passo 9: while (fscanf(f, "%d", &x) != EOF) - 2ª leitura
    stepsList.push({
      line: lineWhileFscanf,
      desc: 'Segunda iteração: fscanf lê o valor 20 da linha 2 para x na RAM. Retorna 1 (!= EOF). A condição é verdadeira e o cursor atinge o fim do arquivo (EOF).',
      vars: { x: 20, 'fscanf retorno': 1, '!= EOF': 'true' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'r',
            status: 'open',
            state: 'read',
          },
          variables: [{ name: 'x', type: 'int', value: 20, state: 'write' }],
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'default' },
            { number: 2, text: '20', state: 'read' },
          ],
          cursorLine: 3,
          eofReached: true,
        },
        stdout: ['10'],
      },
    });

    // Passo 10: printf("%d\n", x); - 2ª impressão
    stepsList.push({
      line: linePrintfX,
      desc: 'printf("%d\\n", x) imprime 20 no terminal. A saída padrão agora contém 10 e 20.',
      vars: { x: 20, stdout: '20' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'r',
            status: 'open',
            state: 'default',
          },
          variables: [{ name: 'x', type: 'int', value: 20, state: 'read' }],
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'default' },
            { number: 2, text: '20', state: 'default' },
          ],
          cursorLine: 3,
          eofReached: true,
        },
        stdout: ['10', '20'],
      },
    });

    // Passo 11: while (fscanf(f, "%d", &x) != EOF) - EOF alcançado
    stepsList.push({
      line: lineWhileFscanf,
      desc: 'Terceira iteração: fscanf tenta ler após a linha 2, mas encontra o fim de arquivo e retorna a constante EOF (-1). A condição (EOF != EOF) é falsa e o laço while termina.',
      vars: { 'fscanf retorno': 'EOF (-1)', '!= EOF': 'false' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'r',
            status: 'open',
            state: 'active',
          },
          variables: [{ name: 'x', type: 'int', value: 20, state: 'default' }],
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'default' },
            { number: 2, text: '20', state: 'default' },
          ],
          cursorLine: 3,
          eofReached: true,
        },
        stdout: ['10', '20'],
      },
    });

    // Passo 12: fclose(f); (segundo)
    stepsList.push({
      line: lineFclose2,
      desc: 'fclose(f) fecha o fluxo de leitura e libera o manipulador f na memória RAM.',
      vars: { f: 'fechado', status: 'recurso liberado' },
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            status: 'closed',
            state: 'default',
          },
          variables: [{ name: 'x', type: 'int', value: 20, state: 'default' }],
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'default' },
            { number: 2, text: '20', state: 'default' },
          ],
          cursorLine: null,
          eofReached: true,
        },
        stdout: ['10', '20'],
      },
    });

    // Passo 13: return 0;
    stepsList.push({
      line: lineReturn,
      desc: 'return 0 finaliza o programa com código de encerramento sem erros.',
      vars: { 'código de retorno': 0 },
      file: {
        ram: {
          handle: {
            name: 'f',
            status: 'closed',
            state: 'default',
          },
          variables: [{ name: 'x', type: 'int', value: 20, state: 'default' }],
          buffer: null,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10', state: 'default' },
            { number: 2, text: '20', state: 'default' },
          ],
          cursorLine: null,
          eofReached: true,
        },
        stdout: ['10', '20'],
      },
    });

    return stepsList;
  },
};

export const lesson = lessonArquivos;
