# Ponteiros: básico e duplo — Design e plano

> **Para agentes:** este documento é a especificação e o plano das duas lições. Antes de
> implementar, leia `AGENTS.md`, `CONTEXT.md` e `docs/ui-guidelines.md`. Siga a ordem das tarefas,
> escreva o teste antes da implementação e não faça commit nem push sem autorização explícita.

**Data:** 2026-10-22
**Status:** proposta para revisão
**Branch:** `feat/ponteiros`
**Escopo:** duas lições C-only, `inputless`, no grupo **Ponteiros** de AEDS I.
**Nota:** o nome do arquivo foi mantido porque já era o link compartilhado; o conteúdo agora cobre
as duas lições.

---

## 0. Cabeçalho do plano

**Goal:** adicionar as lições `ponteiros-basico` e `ponteiros-duplos`, com uma view `pointers` que
mostra caixas de memória, endereços, valores e setas de apontamento.

**Architecture:** uma view nova e aditiva (`PointersView`) lê `Step.pointers`. As lições continuam
sendo dados puros + `steps()` determinístico. A mesma view atende as duas lições: a básica usa uma
seta (`p → x`); a de ponteiros duplos usa uma cadeia (`pp → p → x`). Nenhuma lição existente muda
de comportamento.

**Tech Stack:** React 19, TypeScript 6 strict, Vite 8, Mantine 9, React Router 7, Vitest 5,
Testing Library e jsdom.

**Spec:** Partes I e II deste arquivo.

### Global Constraints

- C-only: `languages: ['c']` e `code.c` obrigatório.
- Sem entrada: `inputless: true`; `steps()` ignora o array recebido e é determinístico.
- `Step.line` é 0-based na lista produzida por `lines()` e precisa existir em `code.c`.
- Modelo didático de 32 bits: `int` e ponteiro ocupam 4 bytes; os endereços são fictícios e não
  representam uma ABI real.
- Toda cor, raio, espaço e transição vem de `@/theme` (`vizVar`, `font`, `radius`, `space`,
  `transition`). Não introduza hex, fontes ou sombras soltas no componente.
- **Não use `vizVar.green` para leitura:** no tema, `green` é um alias semântico do âmbar. Estados
  de leitura usam `vizVar.purple`/`vizVar.purpleSoft`; escrita/atividade usam
  `vizVar.accent`/`vizVar.accentSoft`. Assim leitura e escrita não ficam com a mesma cor.
- A visualização não pode depender só de cor: use estados com borda/forma, legenda e descrição
  acessível.
- `prefers-reduced-motion` desliga transições do ponteiro e das setas.
- Não altere `aritmetica` nem o comportamento de lições existentes.
- Não adicione dependências.
- Textos de UI e conteúdo em pt-BR; identificadores técnicos seguem o padrão do projeto.
- Não commite nem faça push sem pedido explícito do usuário.

### Review Focus

1. **Endereço da caixa vs. valor guardado:** o aluno precisa distinguir o endereço de `p`
   (`0x1008`) do valor que `p` guarda (`0x1000`). Um rótulo ambíguo ensina o modelo errado.
2. **Mudança de alvo:** `p = &y` e `*pp = &y` precisam mover a seta correta, sem deixar a seta
   antiga apontando para o alvo anterior.
3. **Um nível vs. dois níveis:** `*pp` é o valor de `p` (um endereço), enquanto `**pp` é o valor
   final (`42` ou `7`). Os passos e o painel de variáveis precisam deixar isso explícito.
4. **Mapeamento de linha:** as listagens têm linhas em branco; âncoras por texto e testes de limite
   evitam destacar a linha errada.
5. **C-only/inputless:** nenhuma aba Java e nenhuma toolbar de entrada podem aparecer; o link
   `?lang=java` deve ser ignorado.

---

## Parte I — Ponteiros: endereço e valor

### 1. Intenção

A lição `aritmetica` já começa com `altera(v + 1)` e pressupõe que o aluno entendeu a ligação
entre uma variável e um ponteiro. Quem ainda não entendeu por que `p` "aponta" para `x`, o que
`&x` devolve ou o que `*p` acessa chega à aritmética sem o modelo mental necessário.

Esta página vem **antes** de `aritmetica` no grupo **Ponteiros** e constrói esse modelo:
endereço, valor, variável ponteiro e desreferenciação. Ela não ensina deslocamento (`p++`,
`p += 2`), que continua sendo responsabilidade de `aritmetica`.

### 2. Objetivos, não objetivos e sucesso

**Objetivos**

- Mostrar que toda variável tem **nome, endereço e valor**.
- Mostrar que um ponteiro também é uma variável: tem seu próprio endereço e guarda o endereço de
  outra variável.
- Tornar visível a ligação `p → x` e o que acontece quando o alvo muda (`p = &y`).
- Distinguir leitura (`*p`) de escrita (`*p = 99`) através do ponteiro.
- Fazer o aluno acompanhar os `printf` e ver a saída de cada operação.
- Manter o padrão do projeto: C-only, `inputless`, `steps()` puro, linha ativa, painel de
  variáveis, legenda e acessibilidade.

**Não objetivos**

- Aritmética de ponteiros: `p++`, `p--`, `p + k`, diferença entre ponteiros.
- Vetores, decay de array, `p[i]`, ponteiro para ponteiro, função que recebe ponteiro.
- `malloc`, `free`, stack/heap, `NULL`, ponteiro dangling.
- Entrada configurável. Os valores `x = 42`, `y = 7` e os endereços fictícios são fixos.
- Alterar ou migrar a lição `aritmetica`.

**Sucesso**

O aluno termina sabendo responder, sem olhar o código: qual é o endereço de `x`, qual é o valor de
`p`, o que `*p` devolve, o que muda quando `p = &y` e por que `x` continua `99` depois disso.

### 3. Decisão de view

**Nova view `pointers`**, com o componente `PointersView`.

Alternativas descartadas:

- **`cells`**: é uma fileira de células com índices de vetor. Mostrar `x`, `y` e `p` como índices
  0, 1 e 2 sugeriria que eles são posições de um array, e a view não desenha a seta de ligação.
- **`nodes`**: desenha uma estrutura encadeada. Usar `p.next = x` para representar `p = &x`
  ensinaria a metáfora errada de lista e misturaria dois conceitos.
- **`strings`**: as fileiras e setas existem para caracteres, não para variáveis e endereços.

A view nova é justificada porque o conceito tem uma geometria própria: caixas de memória com
endereço e uma seta entre a caixa do ponteiro e a caixa apontada. A decisão fica registrada no
`CONTEXT.md` e no `AGENTS.md`.

### 4. Modelo visual

Cada variável é uma caixa:

```text
┌──────────────────────────────┐
│ int x                0x1000  │  ← endereço da própria variável
│                              │
│              42              │  ← valor guardado
└──────────────────────────────┘
```

Para um ponteiro, o corpo mostra o **valor guardado**, que é o endereço do alvo:

```text
┌──────────────────────────────┐
│ int *p               0x1008  │
│                              │
│            0x1000            │  ← valor de p: endereço de x
│        aponta para x         │
└──────────────────────────────┘
```

Regras:

- Cabeçalho: `type` + `name` à esquerda e `address` em mono à direita.
- Corpo: `value` em destaque. Para ponteiro, o valor é o endereço do alvo.
- Abaixo do valor do ponteiro, um rótulo curto `aponta para <name>` reforça o alvo sem depender só
  da seta.
- A seta sai da borda inferior da caixa do ponteiro, desce até uma pista, corre sob as caixas e
  sobe até a **borda inferior da caixa apontada**. A ponta fica no alvo. Esse trajeto em “U”
  funciona tanto para alvos à direita quanto à esquerda e não atravessa as caixas.
- Se houver mais de uma seta (necessário para ponteiros duplos), cada ligação usa uma **pista**
  vertical diferente, calculada pela ordem das ligações. Cada `path` recebe `data-lane`; o teste
  verifica que duas ligações usam pistas distintas.
- O componente desenha **uma seta por `targetId` válido**, não apenas uma. Isso deixa a view pronta
  para `pp → p → x` sem criar outra view.
- Estados: `active`/`write` em âmbar (`vizVar.accent`), `compare` (leitura) em violeta
  (`vizVar.purple`), `empty` tracejado. A legenda só mostra os estados presentes. A diferença de
  cor é reforçada pela borda e pelo rótulo da legenda; leitura e escrita nunca compartilham a
  mesma cor.
- Chip de saída: quando o passo executa um `printf`, mostra `saída` e o texto produzido. Passos sem
  `printf` não mostram chip.
- Layout horizontal com rolagem em telas estreitas; nada de quebra que separe a seta do alvo.
- `prefers-reduced-motion` desliga as transições.
- Acessibilidade: `role="img"` com `aria-label` que descreve cada caixa (nome, tipo, endereço,
  valor e alvo) e cada ligação; a descrição do passo continua no bloco `aria-live` existente.
  As setas ficam `aria-hidden`, pois a informação já está no rótulo.

### 5. Modelo de memória

Endereços fictícios, modelo didático de 32 bits (`int` e ponteiro com 4 bytes):

| Variável | Tipo | Endereço da variável | Valor inicial |
|---|---|---|---|
| `x` | `int` | `0x1000` | `42` |
| `y` | `int` | `0x1004` | `7` |
| `p` | `int *` | `0x1008` | `0x1000` (endereço de `x`) |

Depois de `p = &y`, o valor de `p` passa a `0x1004`. O endereço da variável `p` continua `0x1008`.
Essa distinção é o coração da lição e deve aparecer na descrição dos passos e no `VarsPanel`.

O `VarsPanel` recebe chaves explícitas para os dois conceitos, não só o valor:

- passo de `x`: `{ x: 42, '&x': '0x1000' }`;
- passo de `y`: `{ y: 7, '&y': '0x1004' }`;
- passo de `p`: `{ p: '0x1000', '&p': '0x1008', '*p': 42 }` (o valor de `*p` acompanha o alvo).

Isso evita que o aluno leia `p = 0x1000` e conclua que `p` mora em `0x1000`. A caixa também
mostra os dois números, mas o painel reforça a diferença em texto.

### 6. Roteiro da lição

Código C (endereços fictícios; no template literal, escape as quebras internas como `\\n`):

```c
#include <stdio.h>

int main() {
  int x = 42;
  int y = 7;
  int *p = &x;

  printf("x = %d\n", x);
  printf("&x = %p\n", (void *)&x);
  printf("p = %p\n", (void *)p);
  printf("*p = %d\n", *p);

  *p = 99;
  printf("x agora = %d\n", x);

  p = &y;
  printf("*p agora = %d\n", *p);

  return 0;
}
```

#### Mapa de linhas

Índices 0-based depois de `lines()`; as linhas em branco internas contam.

| Índice | Conteúdo |
|---:|---|
| 0 | `#include <stdio.h>` |
| 1 | *(em branco)* |
| 2 | `int main() {` |
| 3 | `int x = 42;` |
| 4 | `int y = 7;` |
| 5 | `int *p = &x;` |
| 6 | *(em branco)* |
| 7 | `printf("x = %d\n", x);` |
| 8 | `printf("&x = %p\n", (void *)&x);` |
| 9 | `printf("p = %p\n", (void *)p);` |
| 10 | `printf("*p = %d\n", *p);` |
| 11 | *(em branco)* |
| 12 | `*p = 99;` |
| 13 | `printf("x agora = %d\n", x);` |
| 14 | *(em branco)* |
| 15 | `p = &y;` |
| 16 | `printf("*p agora = %d\n", *p);` |
| 17 | *(em branco)* |
| 18 | `return 0;` |
| 19 | `}` |

Usar um `lineOf(code, texto)` local, como em `aeds1-memory.ts`, em vez de números mágicos. Os
textos dos `printf` são únicos para servir de âncora. O teste precisa garantir que todo `step.line`
está em `[0, code.length)`.

#### Passos

| # | Linha | Ação | Estado visual | Saída |
|---:|---:|---|---|---|
| 1 | 3 | `int x = 42;` | `x` nasce em `0x1000` com `42` (`write`) | — |
| 2 | 4 | `int y = 7;` | `y` nasce em `0x1004` com `7` (`write`) | — |
| 3 | 5 | `int *p = &x;` | `p` nasce em `0x1008`, guarda `0x1000`; seta `p → x` | — |
| 4 | 7 | `printf("x = %d\n", x);` | `x` em `compare` | `x = 42` |
| 5 | 8 | `printf("&x = %p\n", (void *)&x);` | `x` em `compare` | `&x = 0x1000` |
| 6 | 9 | `printf("p = %p\n", (void *)p);` | `p` em `compare` | `p = 0x1000` |
| 7 | 10 | `printf("*p = %d\n", *p);` | `p` e `x` em `compare`; seta destacada | `*p = 42` |
| 8 | 12 | `*p = 99;` | `p` ativo, `x` em `write`; `x` vira `99` | — |
| 9 | 13 | `printf("x agora = %d\n", x);` | `x` em `compare` | `x agora = 99` |
| 10 | 15 | `p = &y;` | `p` em `write`; valor `0x1004`; seta `p → y`; `x` continua `99` | — |
| 11 | 16 | `printf("*p agora = %d\n", *p);` | `p` ativo, `y` em `compare` | `*p agora = 7` |
| 12 | 18 | `return 0;` | estado final; nenhum estado ativo | — |

Cada passo carrega `vars` úteis (`x`/`&x`, `y`/`&y`, `p`/`&p`/`*p`) e `pointers.result` apenas
quando há `printf`. O último passo mantém `x = 99`, `y = 7` e `p → y`. O teste do passo 3 verifica
`vars.p = '0x1000'` e `vars['&p'] = '0x1008'` para travar a distinção endereço/valor.

### 7. Contrato de dados

```ts
export type PointerStateName = 'active' | 'compare' | 'write' | 'empty';

export interface PointerBox {
  id: string;
  name: string;
  type: string;
  address: string;
  value: string | number;
  /** Id da caixa apontada; ausente para variáveis que não são ponteiros. */
  targetId?: string;
  /** Chips curtas, por exemplo `*p` ou `**pp`. */
  labels?: string[];
  state?: PointerStateName;
}

export interface PointerState {
  boxes: PointerBox[];
  /** Saída do printf do passo; ausente quando o passo não imprime. */
  result?: { label: string; value: string };
}
```

`Step` ganha `pointers?: PointerState`; `ViewKind` ganha `'pointers'`. A mudança é aditiva.

Invariantes:

- `id` é único dentro de um `PointerState`.
- `targetId`, quando presente, referencia uma caixa do mesmo estado; não há ciclos.
- `address` é string formatada (`0x1000`), não número, para preservar a apresentação.
- `value` é número para `int` e string para ponteiro/endereço.
- A ordem de `boxes` é estável e define a ordem horizontal; a lição usa a ordem de declaração.
- A view ignora `targetId` inválido e simplesmente não desenha aquela seta; o teste da lição
  garante que os dados reais são válidos.
- O componente aceita `state` indefinido e desenha `Memória vazia`.

### 8. Conteúdo e catálogo

```ts
export const lesson: Lesson = {
  id: 'ponteiros-basico',
  title: 'Ponteiros: endereço e valor',
  subtitle: 'O que &x guarda e o que *p acessa',
  description:
    'Mostra a relação entre uma variável, seu endereço e um ponteiro: &x devolve o endereço, ' +
    'p guarda esse endereço e *p lê ou escreve o valor apontado. Endereços fictícios, modelo ' +
    'didático de 32 bits.',
  view: 'pointers',
  panelLabel: 'memória',
  languages: ['c'],
  inputless: true,
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(1)',
    note: 'Cada leitura ou escrita por ponteiro é Θ(1).',
  },
  // sem `stable`: a tabela mostra “—” para estabilidade não aplicável
  code: { c: basicCode },
  steps: () => [/* 12 passos da tabela */],
};
```

Entrada no catálogo, **antes** de `aritmetica`:

```ts
{
  kind: 'lesson',
  slug: 'ponteiros-basico',
  blurb: 'entenda &x, p e *p antes da aritmética.',
  tag: 'Θ(1)',
}
```

Insight:

- **Dica:** `&x` é o endereço de `x`; `p` guarda esse endereço; `*p` acessa o valor que está lá.
- **Curiosidade:** o tipo do ponteiro diz ao compilador como interpretar o valor apontado; o
  endereço sozinho não carrega essa informação.

### 9. Arquivos afetados

- `src/engine/types.ts` — `PointerBox`, `PointerState`, `Step.pointers`, `ViewKind`.
- `src/components/PointersView.tsx` — componente e setas.
- `src/components/PointersView.test.tsx` — testes da view.
- `src/content/lessons/ponteiros-basico.ts` — lição.
- `src/content/lessons/ponteiros-basico.test.ts` — testes da lição.
- `src/content/lessons/index.ts` — registro.
- `src/content/subjects.ts` — entrada no grupo `ponteiros`, antes de `aritmetica`.
- `src/content/insights.ts` — dica/curiosidade.
- `src/components/LessonView.tsx` — `Canvas`.
- `src/components/AlgorithmBrowser.tsx` e `src/pages/LessonPage.tsx` — rótulos.
- `src/components/ViewPreview.tsx` — miniatura.
- `src/components/ViewPreview.test.tsx` — **novo**; esse arquivo não existe hoje.
- `src/app/App.test.tsx` — rota.
- `src/components/LessonView.test.tsx` — inputless, C-only e `?lang=java`.
- `src/content/subjects.test.ts` — grupo e ordem.
- `docs/ui-guidelines.md`, `CONTEXT.md`, `AGENTS.md` — documentação.

### 10. Testes e critérios de aceite

**PointersView**

- Renderiza nome, tipo, endereço e valor de cada caixa.
- Desenha uma seta por `targetId` válido e nenhuma para alvo ausente/inválido.
- Desenha uma cadeia `pp → p → x` com duas setas (preparação para a Parte II).
- Mostra `result` e a legenda dos estados presentes.
- Mostra `Memória vazia` quando `state` é `undefined` ou `boxes` está vazio.
- O `aria-label` do `role="img"` contém as caixas, os endereços e os alvos.

**Lição básica**

- `steps()` devolve 12 passos, todos com `line` inteiro e dentro de `code.c`.
- Passo 3: `p` guarda `0x1000` e aponta para `x`.
- Passo 8: `*p = 99` altera `x` para `99`.
- Passo 10: `p = &y` move a seta para `y`; `x` permanece `99`.
- Passo 11: a saída é `*p agora = 7`.
- Passo 12: estado final com `x = 99`, `y = 7`, `p → y`.
- `steps()` é determinístico e ignora a entrada (`steps([])` e `steps([1, 2])` iguais).
- Metadados: `languages: ['c']`, `inputless: true`, `view: 'pointers'`, sem `stable`.

**Integração**

- `/algoritmos/ponteiros-basico` abre e mostra o título.
- A entrada aparece no grupo **Ponteiros** antes de `aritmetica`.
- A toolbar de entrada não aparece.
- Só a aba C aparece; `?lang=java` é ignorado.
- A miniatura da view é renderizada nos cards.

**Aceite**

- `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.
- A página funciona nos temas claro/escuro e em largura estreita.
- `CONTEXT.md` e `docs/ui-guidelines.md` refletem a nova view e a contagem de lições.

### 11. Decisões do builder

- Slug `ponteiros-basico`; título **Ponteiros: endereço e valor**.
- Endereços fictícios `0x1000`, `0x1004` e `0x1008`; modelo didático de 32 bits.
- A view se chama `pointers`; a lição usa `panelLabel: 'memória'`.
- Valores fixos, sem entrada; `NULL`, `malloc` e aritmética ficam fora.
- `printf` com textos únicos para permitir âncoras de linha sem duplicidade.
- Uma única view atende básico e duplo; não criar `double-pointers-view`.

---

## Parte II — Ponteiros duplos

### 1. Intenção

Depois de entender `p → x`, o aluno precisa entender que um ponteiro também pode ser apontado por
outro ponteiro. `int **pp = &p` cria dois níveis: `pp` guarda o endereço de `p`; `*pp` é o próprio
`p`; `**pp` chega ao valor final. Esse é o tipo usado quando uma função precisa alterar o ponteiro
do chamador, mas essa aplicação fica como curiosidade nesta lição para não misturar escopos.

### 2. Objetivos, não objetivos e sucesso

**Objetivos**

- Mostrar a cadeia `pp → p → x` com endereços e valores.
- Distinguir `pp` (endereço de `p`), `*pp` (valor de `p`, que é um endereço) e `**pp` (valor de
  `x`).
- Mostrar `*pp = &y`: muda o alvo de `p` sem alterar `x`.
- Mostrar `**pp = 99`: escreve no alvo final (`y`).
- Reutilizar a view `pointers` e o mesmo modelo de caixas/setas.

**Não objetivos**

- Função que recebe `int **` (fica como curiosidade no texto).
- Vetor de ponteiros, `char **argv`, `malloc`, `free`, `NULL`, `const`, `volatile`.
- Aritmética de ponteiros e diferença entre ponteiros.
- Entrada configurável.

**Sucesso**

O aluno consegue dizer, sem executar: qual é o valor de `pp`, o que `*pp` devolve, o que `**pp`
devolve, o que muda com `*pp = &y` e o que muda com `**pp = 99`.

### 3. Posição no catálogo

Ordem no grupo **Ponteiros**:

1. `ponteiros-basico` — endereço, valor, `&` e `*`.
2. `aritmetica` — deslocamento e vetor (lição existente, sem alteração).
3. `ponteiros-duplos` — dois níveis de indireção.

A posição depois de `aritmetica` preserva o arco atual de vetores e evita interromper a sequência
básica → aritmética. Se a intenção pedagógica for apresentar `**` antes de qualquer função, basta
mover a entrada para antes de `aritmetica`; o conteúdo da lição não muda.

### 4. Decisão de view

**Reutilizar `pointers`.** Nenhuma nova view, nenhum novo `ViewKind`.

O contrato `PointerBox.targetId` já representa uma cadeia. A única mudança necessária é a view
desenhar **todas** as ligações, com pistas separadas. Essa capacidade é implementada na Parte I
para não deixar a view específica de uma lição.

### 5. Modelo visual

Cadeia inicial:

```text
x  (int, 0x1000) = 42
p  (int *, 0x1008) = 0x1000  → x
pp (int **, 0x100c) = 0x1008 → p
```

- `pp` é uma caixa com tipo `int **`, endereço `0x100c` e valor `0x1008`.
- A seta `pp → p` e a seta `p → x` usam pistas diferentes abaixo das caixas.
- Quando `*pp = &y`, o valor de `p` vira `0x1004` e a seta `p → y` substitui `p → x`.
- Quando `**pp = 99`, a caixa `y` recebe `write`; `pp` e `p` mostram o caminho percorrido com
  `active`/`compare`.
- Um rótulo curto no corpo de `pp` pode dizer `aponta para p`; o `VarsPanel` mostra `pp`, `&pp`,
  `*pp`, `**pp` (e `p`/`&p` quando útil) para reforçar os níveis e o endereço da própria variável.
- O callout da lição (texto, não código) explica: “é o tipo usado quando uma função precisa mudar
  o ponteiro do chamador”.

### 6. Roteiro da lição

Código C (mesmo modelo de 32 bits; no template literal, escape as quebras internas como `\\n`):

```c
#include <stdio.h>

int main() {
  int x = 42;
  int y = 7;
  int *p = &x;
  int **pp = &p;

  printf("pp = %p\n", (void *)pp);
  printf("*pp = %p\n", (void *)*pp);
  printf("**pp = %d\n", **pp);

  *pp = &y;
  printf("p agora = %p\n", (void *)p);
  printf("**pp agora = %d\n", **pp);

  **pp = 99;
  printf("y agora = %d\n", y);

  return 0;
}
```

#### Mapa de linhas

| Índice | Conteúdo |
|---:|---|
| 0 | `#include <stdio.h>` |
| 1 | *(em branco)* |
| 2 | `int main() {` |
| 3 | `int x = 42;` |
| 4 | `int y = 7;` |
| 5 | `int *p = &x;` |
| 6 | `int **pp = &p;` |
| 7 | *(em branco)* |
| 8 | `printf("pp = %p\n", (void *)pp);` |
| 9 | `printf("*pp = %p\n", (void *)*pp);` |
| 10 | `printf("**pp = %d\n", **pp);` |
| 11 | *(em branco)* |
| 12 | `*pp = &y;` |
| 13 | `printf("p agora = %p\n", (void *)p);` |
| 14 | `printf("**pp agora = %d\n", **pp);` |
| 15 | *(em branco)* |
| 16 | `**pp = 99;` |
| 17 | `printf("y agora = %d\n", y);` |
| 18 | *(em branco)* |
| 19 | `return 0;` |
| 20 | `}` |

#### Passos

| # | Linha | Ação | Estado visual | Saída |
|---:|---:|---|---|---|
| 1 | 3 | `int x = 42;` | `x` em `0x1000`, valor `42` (`write`) | — |
| 2 | 4 | `int y = 7;` | `y` em `0x1004`, valor `7` (`write`) | — |
| 3 | 5 | `int *p = &x;` | `p` em `0x1008`, valor `0x1000`, seta `p → x` | — |
| 4 | 6 | `int **pp = &p;` | `pp` em `0x100c`, valor `0x1008`, seta `pp → p`; cadeia completa | — |
| 5 | 8 | `printf("pp = %p\n", (void *)pp);` | `pp` em `compare` | `pp = 0x1008` |
| 6 | 9 | `printf("*pp = %p\n", (void *)*pp);` | `pp` ativo, `p` em `compare` | `*pp = 0x1000` |
| 7 | 10 | `printf("**pp = %d\n", **pp);` | `pp` ativo, `p` e `x` em `compare` | `**pp = 42` |
| 8 | 12 | `*pp = &y;` | `pp` ativo, `p` em `write`; valor `0x1004`; seta `p → y`; `x` continua `42` | — |
| 9 | 13 | `printf("p agora = %p\n", (void *)p);` | `p` em `compare` | `p agora = 0x1004` |
| 10 | 14 | `printf("**pp agora = %d\n", **pp);` | `pp` ativo, `p` e `y` em `compare` | `**pp agora = 7` |
| 11 | 16 | `**pp = 99;` | `pp` ativo, `p` em `compare`, `y` em `write`; `y` vira `99` | — |
| 12 | 17 | `printf("y agora = %d\n", y);` | `y` em `compare` | `y agora = 99` |
| 13 | 19 | `return 0;` | estado final; nenhum estado ativo | — |

O último passo mantém `x = 42`, `y = 99`, `p → y`, `pp → p`.

### 7. Contrato de dados

Não há tipo novo. A lição usa `PointerState` da Parte I:

- `boxes`: `x`, `y`, `p`, `pp`, na ordem de declaração.
- `pp.targetId = 'p'`, `p.targetId = 'x'` (depois `'y'`).
- `pp.value = '0x1008'`, `p.value = '0x1000'` (depois `'0x1004'`).
- `pp.address = '0x100c'`, `p.address = '0x1008'`, `x.address = '0x1000'`,
  `y.address = '0x1004'`.
- `result` apenas nos passos de `printf`.
- `labels` podem marcar `*pp` e `**pp` nas caixas correspondentes.
- `vars` do passo 4: `{ pp: '0x1008', '&pp': '0x100c', '*pp': '0x1000', p: '0x1000',
  '&p': '0x1008', '**pp': 42 }`. O teste trava `&pp ≠ pp` e `pp ≠ *pp`, que é o erro conceitual
  mais provável.

A view precisa aceitar duas setas na mesma cena, inclusive uma ligação “para trás” (`pp` está à
direita de `p`). O teste da Parte I cobre a cadeia para garantir que a Parte II não dependa de uma
mudança de view.

### 8. Conteúdo e catálogo

```ts
export const lesson: Lesson = {
  id: 'ponteiros-duplos',
  title: 'Ponteiros duplos',
  subtitle: 'Quando *pp ainda é um ponteiro',
  description:
    'Mostra um ponteiro para ponteiro: pp guarda &p, *pp é o próprio p e **pp chega ao valor ' +
    'final. *pp = &y muda o alvo de p; **pp = 99 altera y. Endereços fictícios, modelo didático ' +
    'de 32 bits.',
  view: 'pointers',
  panelLabel: 'memória',
  languages: ['c'],
  inputless: true,
  complexity: {
    time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
    space: 'Θ(1)',
    note: 'Cada desreferência é Θ(1); a lição não percorre estruturas.',
  },
  // sem `stable`: estabilidade não se aplica
  code: { c: doubleCode },
  steps: () => [/* 13 passos da tabela */],
};
```

Entrada no catálogo, **depois** de `aritmetica`:

```ts
{
  kind: 'lesson',
  slug: 'ponteiros-duplos',
  blurb: 'um ponteiro que aponta para outro ponteiro.',
  tag: 'Θ(1)',
}
```

Insight:

- **Dica:** `*pp` não é o valor final; é o ponteiro `p`. Para chegar ao `int`, use `**pp`.
- **Curiosidade:** funções que precisam trocar o ponteiro do chamador recebem `int **`; elas
  alteram `*param`, não apenas o parâmetro local.

### 9. Arquivos afetados

- `src/content/lessons/ponteiros-duplos.ts` — lição.
- `src/content/lessons/ponteiros-duplos.test.ts` — testes.
- `src/content/lessons/index.ts` — registro.
- `src/content/subjects.ts` — entrada depois de `aritmetica`.
- `src/content/insights.ts` — dica/curiosidade.
- `src/app/App.test.tsx` — rota.
- `src/content/subjects.test.ts` — grupo e ordem.
- `CONTEXT.md` — contagem final e grupo.
- `docs/ui-guidelines.md` — nota sobre cadeia de setas.
- `src/components/PointersView.test.tsx` — já cobre múltiplas setas na Parte I; não duplicar a
  implementação.
- Nenhuma alteração em `src/engine/types.ts` além da Parte I.

### 10. Testes e critérios de aceite

**Lição de ponteiros duplos**

- `steps()` devolve 13 passos, todos com `line` dentro de `code.c`.
- Passo 4: `pp` guarda `0x1008` e aponta para `p`; `p` guarda `0x1000` e aponta para `x`.
- Passo 7: `**pp` é `42`.
- Passo 8: `*pp = &y` muda `p` para `0x1004` e `p → y`; `x` permanece `42`.
- Passo 10: `**pp` agora é `7`.
- Passo 11: `**pp = 99` altera `y` para `99`.
- Passo 12: a saída é `y agora = 99`.
- Passo 13: estado final `x = 42`, `y = 99`, `p → y`, `pp → p`.
- Metadados: C-only, `inputless`, `view: 'pointers'`, sem `stable`.
- `steps()` é determinístico e ignora a entrada.

**Integração**

- `/algoritmos/ponteiros-duplos` abre e mostra o título.
- A entrada aparece no grupo **Ponteiros**, depois de `aritmetica`.
- A toolbar de entrada não aparece; só C.
- A view mostra duas setas (cadeia) sem sobreposição.
- `subjects.test.ts` continua garantindo que catálogo e registro são iguais nos dois sentidos.

**Aceite**

- `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.
- A página funciona nos temas claro/escuro e em largura estreita.
- `CONTEXT.md` atualiza a contagem para 47 lições, 7 views e 3 lições no grupo **Ponteiros**.

### 11. Decisões do builder

- Slug `ponteiros-duplos`; título **Ponteiros duplos**.
- Posição depois de `aritmetica`; se o usuário preferir antes, é uma troca de ordem no catálogo.
- Sem função no código; a aplicação em funções fica na curiosidade, para não misturar escopo.
- Endereços `x=0x1000`, `y=0x1004`, `p=0x1008`, `pp=0x100c`; modelo didático de 32 bits.
- Reutiliza `PointersView`; nenhuma nova view.
- Não altera `aritmetica`.

---

## Parte III — Planos de implementação

> Executar em TDD. Cada tarefa termina com um entregável testável. Não commitar sem autorização.

### Plano A — Ponteiros básico

#### Task 1: Contrato e `PointersView`

**Files:**
- Modify: `src/engine/types.ts`
- Create: `src/components/PointersView.tsx`
- Create: `src/components/PointersView.test.tsx`

**Interfaces:**
- Consumes: `Step`, `Cell`/`ViewLegend` patterns.
- Produces: `PointerBox`, `PointerState`, `ViewKind` com `'pointers'`, `Step.pointers`, e
  `PointersView({ state }: { state: PointerState | undefined })`.

- [ ] **Step 1: Escrever o teste da view**

Cobrir: caixas com nome/tipo/endereço/valor; uma seta para `targetId` válido; nenhuma seta para
alvo ausente; cadeia com duas setas e `data-lane` distintos; resultado; legenda; `Memória vazia`;
`aria-label`; e estilos visuais distintos para leitura e escrita.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- src/components/PointersView.test.tsx`
Expected: FAIL porque `PointersView` e os tipos ainda não existem.

- [ ] **Step 3: Implementar os tipos e a view**

Adicionar `PointerStateName`, `PointerBox`, `PointerState`, `Step.pointers` e `ViewKind`.
Implementar caixas, setas SVG com pistas, resultado, legenda e estado vazio usando tokens. Leitura
usa `vizVar.purple`; escrita/atividade usa `vizVar.accent`; não usar `vizVar.green`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- src/components/PointersView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Verificar tipos e lint**

Run: `npm run typecheck && npm run lint`
Expected: sem erros.

#### Task 2: Lição `ponteiros-basico`

**Files:**
- Create: `src/content/lessons/ponteiros-basico.ts`
- Create: `src/content/lessons/ponteiros-basico.test.ts`
- Modify: `src/content/lessons/index.ts`

**Interfaces:**
- Consumes: `PointerBox`, `PointerState`, `Step`.
- Produces: `export const lesson: Lesson` com `id: 'ponteiros-basico'`, `view: 'pointers'`,
  `languages: ['c']`, `inputless: true`.

- [ ] **Step 1: Escrever o teste da lição**

Asserts: 12 passos; todo `line` dentro de `code.c`; passo 3 `p → x` com `vars.p = '0x1000'` e
`vars['&p'] = '0x1008'`; passo 8 `x = 99`; passo 10 `p → y`; passo 11 saída `7`; passo 12 estado
final; `steps([])` e `steps([1,2])` iguais; metadados.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- src/content/lessons/ponteiros-basico.test.ts`
Expected: FAIL porque a lição não existe.

- [ ] **Step 3: Implementar a lição**

Usar o código, o mapa de linhas e a tabela de passos da Parte I. `steps()` ignora `_input`.
Construir caixas com IDs `x`, `y`, `p`; `targetId` válido; `result` só nos `printf`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- src/content/lessons/ponteiros-basico.test.ts`
Expected: PASS.

- [ ] **Step 5: Verificar a suíte de lições**

Run: `npm test -- src/content/lessons/lessons.test.ts`
Expected: PASS; a nova lição entra no teste genérico sem quebrar as existentes.

#### Task 3: Catálogo, rota, toolbar e miniatura

**Files:**
- Modify: `src/content/subjects.ts`
- Modify: `src/components/LessonView.tsx`
- Modify: `src/components/AlgorithmBrowser.tsx`
- Modify: `src/pages/LessonPage.tsx`
- Modify: `src/components/ViewPreview.tsx`
- Modify: `src/content/subjects.test.ts`
- Modify: `src/app/App.test.tsx`
- Modify: `src/components/LessonView.test.tsx`
- Create: `src/components/ViewPreview.test.tsx`

**Interfaces:**
- Consumes: `lesson` da Task 2, `PointersView` da Task 1.
- Produces: entrada `ponteiros-basico` no grupo `ponteiros`, renderização no `Canvas`, rótulos e
  preview.

- [ ] **Step 1: Escrever os testes de integração**

Asserts: `getEntryLocation('ponteiros-basico')?.group.id === 'ponteiros'`; a entrada vem antes de
`aritmetica`; `/algoritmos/ponteiros-basico` mostra o título; `LessonView` não mostra toolbar de
entrada e só oferece C; `ViewPreview` renderiza o branch `pointers`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- src/content/subjects.test.ts src/app/App.test.tsx src/components/LessonView.test.tsx src/components/ViewPreview.test.tsx`
Expected: FAIL pelos novos casos.

- [ ] **Step 3: Implementar a integração**

Adicionar o case `pointers` no `Canvas`; `pointers: 'Ponteiros'` e `pointers: 'ponteiros'` nos
mapas; entrada no catálogo; branch de preview; testes.

- [ ] **Step 4: Rodar e ver passar**

Run: o mesmo comando do Step 2.
Expected: PASS.

- [ ] **Step 5: Verificar tipos e lint**

Run: `npm run typecheck && npm run lint`
Expected: sem erros.

#### Task 4: Insights, documentação e validação

**Files:**
- Modify: `src/content/insights.ts`
- Modify: `docs/ui-guidelines.md`
- Modify: `CONTEXT.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Adicionar o insight e a documentação**

Adicionar dica/curiosidade; linha `PointersView` no guia; `pointers` na lista de views do
`CONTEXT.md`/`AGENTS.md`; atualizar contagem para 46 lições e a contagem real de testes/arquivos
após esta entrega.

- [ ] **Step 2: Rodar a validação completa**

Run: `npm test && npm run lint && npm run typecheck && npm run build`
Expected: tudo passa; o build pode manter o aviso já conhecido de chunk acima de 500 kB.

- [ ] **Step 3: Commit (somente com autorização explícita)**

```bash
git add src/engine/types.ts src/components/PointersView.tsx \
  src/components/PointersView.test.tsx \
  src/content/lessons/ponteiros-basico.ts \
  src/content/lessons/ponteiros-basico.test.ts \
  src/content/lessons/index.ts src/content/subjects.ts src/content/insights.ts \
  src/components/LessonView.tsx src/components/AlgorithmBrowser.tsx \
  src/pages/LessonPage.tsx src/components/ViewPreview.tsx \
  src/components/ViewPreview.test.tsx src/app/App.test.tsx \
  src/components/LessonView.test.tsx src/content/subjects.test.ts \
  docs/ui-guidelines.md CONTEXT.md AGENTS.md
git commit -m "feat: add basic pointers lesson"
```

### Plano B — Ponteiros duplos

#### Task 5: Lição `ponteiros-duplos`

**Files:**
- Create: `src/content/lessons/ponteiros-duplos.ts`
- Create: `src/content/lessons/ponteiros-duplos.test.ts`
- Modify: `src/content/lessons/index.ts`

**Interfaces:**
- Consumes: `PointersView` e `PointerState` da Parte I.
- Produces: `export const lesson: Lesson` com `id: 'ponteiros-duplos'`, `view: 'pointers'`,
  `languages: ['c']`, `inputless: true`.

- [ ] **Step 1: Escrever o teste da lição**

Asserts: 13 passos; todo `line` dentro de `code.c`; passo 4 cadeia `pp → p → x` com
`vars.pp = '0x1008'`, `vars['&pp'] = '0x100c'`, `vars['*pp'] = '0x1000'` e `vars['**pp'] = 42`;
passo 7 `**pp = 42`; passo 8 `p → y` e `x = 42`; passo 10 `**pp = 7`; passo 11 `y = 99`; passo 12
saída `y agora = 99`; passo 13 estado final; metadados; determinismo.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- src/content/lessons/ponteiros-duplos.test.ts`
Expected: FAIL porque a lição não existe.

- [ ] **Step 3: Implementar a lição**

Usar o código, o mapa de linhas e a tabela de passos da Parte II. IDs `x`, `y`, `p`, `pp`.
Cadeia com `targetId`; `result` só nos `printf`; `labels` para `*pp`/`**pp` quando ajudarem.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- src/content/lessons/ponteiros-duplos.test.ts`
Expected: PASS.

- [ ] **Step 5: Verificar a cadeia na view**

Run: `npm test -- src/components/PointersView.test.tsx src/content/lessons/ponteiros-duplos.test.ts`
Expected: PASS; duas setas desenhadas sem sobreposição.

#### Task 6: Catálogo, rota, insights e documentação

**Files:**
- Modify: `src/content/subjects.ts`
- Modify: `src/content/insights.ts`
- Modify: `src/content/subjects.test.ts`
- Modify: `src/app/App.test.tsx`
- Modify: `CONTEXT.md`
- Modify: `docs/ui-guidelines.md`

**Interfaces:**
- Consumes: `lesson` da Task 5.
- Produces: entrada `ponteiros-duplos` depois de `aritmetica`, rota ativa e documentação.

- [ ] **Step 1: Escrever os testes de integração**

Asserts: grupo `ponteiros`; `ponteiros-basico`, `aritmetica`, `ponteiros-duplos` nessa ordem;
`/algoritmos/ponteiros-duplos` mostra o título; inputless e C-only; `subjects.test.ts` continua
comparando catálogo e registro nos dois sentidos.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- src/content/subjects.test.ts src/app/App.test.tsx`
Expected: FAIL pelos novos casos.

- [ ] **Step 3: Implementar a integração e a documentação**

Adicionar entrada no catálogo, insight, contagem final (47 lições, 7 views, 3 no grupo
**Ponteiros**), contagem real de testes/arquivos e nota sobre cadeia de setas no guia de UI.

- [ ] **Step 4: Rodar a validação completa**

Run: `npm test && npm run lint && npm run typecheck && npm run build`
Expected: tudo passa; o build pode manter o aviso já conhecido de chunk acima de 500 kB.

- [ ] **Step 5: Commit (somente com autorização explícita)**

```bash
git add src/content/lessons/ponteiros-duplos.ts \
  src/content/lessons/ponteiros-duplos.test.ts \
  src/content/lessons/index.ts src/content/subjects.ts src/content/insights.ts \
  src/content/subjects.test.ts src/app/App.test.tsx CONTEXT.md docs/ui-guidelines.md
git commit -m "feat: add double pointers lesson"
```

---

## 12. Revisão independente

Uma leitura independente do documento levantou três dúvidas; todas foram fechadas aqui:

1. **Cor de leitura:** `vizVar.green` é alias do âmbar. A view usa `vizVar.purple` para leitura e
   `vizVar.accent` para escrita/atividade, sem criar token novo.
2. **Entrada da seta:** todas as setas saem e entram pela borda inferior das caixas, com trajeto em
   “U” sob as caixas. Isso funciona para alvos à esquerda e à direita e evita a ambiguidade de
   “sobe no alvo”. Cada ligação tem `data-lane` distinto.
3. **Endereço no `VarsPanel`:** os passos incluem chaves explícitas `&x`, `&y`, `&p`, `&pp` além de
   `x`, `y`, `p`, `pp`, `*p`, `*pp` e `**pp`. O teste trava a diferença entre o endereço da
   variável e o valor guardado.

## 13. Self-review do plano

- **Cobertura da spec:** a Parte I cobre intenção, view, modelo visual, memória, roteiro, contrato,
  conteúdo, arquivos, testes e critérios; a Parte II cobre o mesmo para ponteiros duplos.
- **Lacunas fechadas:** endereço vs. valor, modelo de 32 bits, múltiplas setas, mapa de linhas,
  metadados, catálogo, insights, testes de inputless/C-only e documentação.
- **Consistência de tipos:** `PointerBox`, `PointerState`, `Step.pointers` e `PointersView` são
  definidos uma vez e reutilizados nas duas lições.
- **Review Focus:** cada um dos cinco riscos tem teste na tarefa correspondente.
- **Proporção:** o plano descreve decisões e testes; não transcreve a implementação inteira.
