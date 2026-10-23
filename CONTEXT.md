# CONTEXT.md — contexto vivo do Visualize It

> **Documento de leitura obrigatória para todos os agentes e modelos.** O `AGENTS.md` na raiz
> determina que este arquivo seja lido por inteiro antes de qualquer alteração. Se você é um agente
> que não lê `AGENTS.md` automaticamente, leia os dois arquivos no início da sessão.
>
> Este documento descreve o estado atual do projeto, a arquitetura, os bugs conhecidos, as dívidas
> técnicas e o roadmap. Ele deve ser atualizado junto com o código quando o estado mudar.

**Última atualização:** 2026-10-22

---

## 1. Resumo

O **Visualize It** é um site acadêmico que ensina algoritmos, estruturas de dados e análise de
complexidade por meio de visualizações passo a passo. Cada lição combina:

- uma estrutura animada (`bars`, `cells`, `nodes`, `plot`, `matrix`, `strings`, `pointers`,
  `object`, `loop` ou `callstack`);
- o código em **Java ou C**, com a linha executada destacada;
- as variáveis do passo atual;
- uma descrição do que acabou de acontecer;
- a tabela de complexidade (melhor, médio, pior, espaço e estabilidade).

O público é formado por estudantes de AEDS I/II. A interface e o conteúdo didático são em
português (pt-BR). O site é publicado no Vercel como SPA.

---

## 2. Estado atual

| Item | Estado |
|---|---|
| Lições registradas | 49 (`src/content/lessons/index.ts`) |
| Views | 10 (`bars`, `cells`, `nodes`, `plot`, `matrix`, `strings`, `pointers`, `object`, `loop`, `callstack`) |
| Seção Vim | 12 desafios, cheatsheet essencial e motor puro em `src/vim/` |
| Artigos de teoria | 2 (`complexidade`, `inducao`) |
| Rotas | `/`, `/materias/:subjectId`, `/algoritmos/:slug`, `/teoria/:slug`, `/playground`, `/comparar`, `/vim`, `/vim/desafios/:slug`, `*` (404) |
| Testes | 523 testes em 52 arquivos, passando |
| Lint | Limpo |
| Typecheck | Limpo |
| Deploy | Vercel, rewrite de SPA + redirects 301 das URLs antigas |
| Node | 20.19+ ou 22.12+ |

### Lições existentes

- **AEDS I (30):** `for`, `while`, `do-while`; o grupo **Funções e recursão** com `funcoes` e
  `recursao` (view `callstack`); depois `ponteiros-basico` (view `pointers`), `aritmetica`,
  `ponteiros-duplos` (view `pointers`), `soma` (view `plot`); o grupo
  **String** com `strings`, `strlen`, `strcpy`, `strcat`, `strcmp`, `busca-string`, `strtok`
  (view `strings`); depois `structs`, `alocacao-memoria`, `arquivos`, `vetores-matrizes`,
  `classes-vetores-matrizes` (C) e, por último, `oop`, `abstracao`, `classes`, `construtores`,
  `encapsulamento`, `heranca`, `polimorfismo`, `metodos-acessores`, `excecoes` (C++).
- **AEDS II (19):**
  - **Ordenação:** `selecao`, `insercao`, `bolha`, `shellsort`, `quicksort`, `mergesort`,
    `heapsort`, `counting`, `bucket`, `radix`.
  - **Busca:** `busca-sequencial`, `busca-binaria`.
  - **Estruturas lineares:** `lista-sequencial`, `lista-encadeada`, `lista-dupla`,
    `pilha-sequencial`, `pilha-encadeada`, `fila-circular`, `fila-encadeada`.
- **Análise (2):** `complexidade`, `inducao`.

### Estado do worktree no momento desta atualização

A interface organizada por matéria e o refactor de tema foram integrados ao `dev` e mesclados com a
linha que trouxe quiz, playground, storybook e a lição `soma`. O estado agora inclui:

- `src/content/subjects.ts`, páginas de matéria, busca global, controles sticky e testes;
- tokens centralizados em `src/theme/tokens.ts`, com o shim `src/theme.ts` mantido por
  compatibilidade;
- melhorias visuais do visualizador: escala zero-ancorada em `BarsView`, hierarquia tipográfica dos
  painéis, deck de controles com ação primária destacada, toolbar de entrada compacta, grid 56/44 e
  correção do `ComplexityTable` para estabilidade indefinida;
- quiz no player, URL compartilhável (`arr`/`step`), entrada persistida por lição, playground,
  alternância de tema claro/escuro, view `plot` e view `strings` (grupo String em AEDS I);
- view `pointers` com caixas de memória endereçadas, setas por `targetId` e leitura/escrita
  diferenciadas, usada por `ponteiros-basico` e `ponteiros-duplos`; a lição dupla acrescenta a
  cadeia `pp → p → x`;
- view `callstack` com quadros empilhados (parâmetros, locais, retorno e escopo), usada por
  `funcoes` e `recursao`; a primeira mostra `main → soma → dobro` e a passagem por valor, e a
  segunda mostra `fatorial(4)` descendo até o caso base e desenrolando 2 → 6 → 24;
- view bidimensional `matrix` com realce cruzado de coordenadas $(i, j)$ e suporte a matrizes 2D reais
  em `vetores-matrizes` e `classes-vetores-matrizes` (Issue #49);
- separação interativa de vetores e matrizes em `vetores-matrizes` (Issue #51), com seleção entre
  `Vetor (1D)` e `Matriz (2D)`, 4 operações (`preencher`, `limpar`, `buscar`, `somar`), entradas dinâmicas
  (vetor proporcional à quantidade de valores; matriz com campos de linha empilhados até 10x10) e sincronização
  completa com o código C e o `VarsPanel`;
- nova view `object` (`ObjectView.tsx`) e reformulação completa das 9 lições de POO em C++ (Issue #53),
  eliminando caixas indexadas de array e introduzindo moldes de classe (blueprints) com membros públicos/privados,
  instâncias concretas na memória com realce de escrita em tempo real, hierarquias de herança com resolução
  na classe base, despacho dinâmico polimórfico via ponteiro base com indicação de vtable, e fluxo interativo de
  exceções (`try` -> `throw` -> `catch`).

---

## 3. Stack e comandos

| Camada | Tecnologia |
|---|---|
| Framework | React 19 |
| Linguagem | TypeScript 6 (`strict`, `noUnusedLocals`, `noUnusedParameters`) |
| Build | Vite 8 |
| UI | Mantine 9 (tema dark + âmbar) |
| Rotas | React Router 7 |
| Testes | Vitest 5 + Testing Library + jsdom |
| Lint | ESLint 10 (flat config) |
| Fonte | Pilha do sistema (sans/mono), sem fontes customizadas |
| Deploy | Vercel |

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b + vite build
npm run lint
npm run typecheck
npm test
npm run test:watch
npm run preview
```

O alias `@/` aponta para `src/` e está configurado em `vite.config.ts` e `tsconfig.app.json`.

---

## 4. Arquitetura

### 4.1 Modelo de dados (`src/engine/types.ts`)

Uma lição é **dado puro + uma função pura**:

```ts
export interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  view?: ViewKind;                   // bars | cells | nodes | plot | matrix | strings | pointers | callstack; padrão: bars
  linked?: 'singly' | 'doubly';      // só para nodes
  panelLabel?: string;
  initial?: number[];                // padrão: DEFAULT_INPUT
  randomInput?: () => number[];      // gerador do botão "Sortear"
  inputFormat?: 'integers' | 'unit-interval'; // padrão: inteiros
  complexity: Complexity;
  code: { java: string[]; c: string[] };
  steps: (input: number[]) => Step[];
}
```

Cada `Step` contém:

- `line`: índice 0-based na listagem de código;
- `desc`: descrição do passo;
- `vars?`: variáveis nomeadas;
- campos de `bars`: `arr`, `cmp`, `swap`, `pivot`, `sorted`, `dim`;
- `cells?`: células de estruturas em vetor;
- `nodes?`: nós de estruturas encadeadas;
- `plot?`: pontos e total acumulado do somatório;
- `matrix?`: grade 2D com coordenadas ativas e rótulos de linha/coluna;
- `strings?`: fileiras de caracteres, ponteiros nas células, setas de cópia/concatenação e resultado;
- `pointers?`: caixas de memória com tipo, nome, endereço, valor, alvo e resultado;
- `object?`: moldes de classe, instâncias, ponteiros, chamadas e exceções;
- `loop?`: fase do laço, iteração, condição e acumulador;
- `callstack?`: quadros de chamada da base ao topo, com parâmetros, locais, valor de retorno e valor recebido.

`steps()` não toca no DOM e pode ser testada sem navegador. O player só percorre a lista pronta.

### 4.2 Fluxo de renderização

```
LessonPage (breadcrumb + LessonPager)
  └─ LessonView (key={lesson.id})
       ├─ useMemo: lesson.steps(input, approach)
       ├─ usePlayback(steps, { initialIndex })
       ├─ toolbar de entrada (valores, Aplicar, Sortear, presets)
       ├─ useMemo: assignElementIds(steps)  // só para bars
       ├─ Canvas → BarsView | CellsView | NodesView | PlotView | MatrixView | StringsView
       │            | PointersView | ObjectView | LoopView | CallStackView
       ├─ CodePanel (Java/C, iterativo/recursivo, linha ativa com rolagem automática)
       ├─ PlayerControls abaixo do grid (timeline de passos, transporte, progresso,
       │   velocidade, quiz, copiar link)
       ├─ VarsPanel
       ├─ ComplexityAnalysisCard (lições de ordenação)
       └─ painéis Sobre + Complexidade
```

No desktop, visualização e código ficam lado a lado em um grid 1.14/0.86; no mobile, viram abas.
Os controles de reprodução ficam logo abaixo do grid, antes dos painéis Sobre/Complexidade e,
abaixo de 62em, o deck vira uma barra sticky no rodapé da viewport. O cabeçalho do painel de
visualização mostra o passo atual, a narração fica em um bloco destacado logo abaixo do canvas e as
variáveis ficam em um rodapé próprio. Os painéis compartilham header, ícone e sombra via `Panel`;
`src/components/icons.tsx` concentra os SVGs inline, `SectionHeading`/`MetaPill` padronizam
títulos e metadados e `ViewLegend` padroniza a legenda das views. O player combina o `TimelineBar`
(marcadores clicáveis com preview da operação) com o slider acessível. `usePlayback` mantém o
cursor, o estado de play/pause, a velocidade, `initialIndex`, `loop` e o callback `onStepChange`.
Quando a lista de `Step` muda de identidade (nova lição ou nova entrada), o cursor reinicia durante
o render.

O par `arr`/`step` é espelhado na query string (`replace: true`) e a última entrada aplicada fica
persistida por lição em `localStorage` (`src/lib/persistedInput.ts`). Lições com `codeVariants`
oferecem o seletor iterativo/recursivo, e lições `bars` habilitam o quiz (`QuizPanel`). O cabeçalho
tem alternância de tema claro/escuro (`ThemeToggle`) e a paleta das views usa as variáveis CSS
`--viz-*` para acompanhar o esquema de cores.

`assignElementIds` dá identidade estável aos elementos de `arr` para que a troca de barras seja
animada como deslocamento, não como teletransporte. O `CodePanel` usa o tokenizer de
`src/lib/highlight.tsx`, que carrega o estado de comentários de bloco entre linhas e reconhece
strings; os blocos `Pre` da teoria reutilizam o mesmo highlighter.

`BarsView` usa `getBarScale` (`src/components/barScale.ts`) para mapear valores em uma escala que
sempre inclui o zero. A view desenha grade discreta, linha de base, valores acima das barras,
índices abaixo e uma legenda apenas com os estados presentes no passo. Valores negativos crescem
para baixo a partir da mesma linha de base; zeros aparecem como um traço fino. `NodesView` desenha
conectores curvos em SVG, converte ids de `prev`/`next` em valores e mostra o terminal `∅`;
`PlotView` usa área/linha apenas até o termo atual, para não sugerir uma soma que ainda não existe.

### 4.3 Views

| `view` | Usada por | Campos lidos |
|---|---|---|
| `bars` | ordenação e busca | `arr`, `cmp`, `swap`, `pivot`, `sorted`, `dim` (escala zero-ancorada, grade, base, valores, índices e legenda) |
| `cells` | vetores, pilhas, filas, listas e laços | `cells: [{ val, labels, state }]` |
| `nodes` | listas/pilhas/filas encadeadas | `nodes: [{ id, val, prev, next, labels, state }]` |
| `plot` | somatório (`soma`) | `plot: { points, current, total }` |
| `matrix` | vetores e matrizes 2D | `matrix: { rows, cols, grid, activeRow?, activeCol?, rowLabels?, colLabels? }` |
| `strings` | funções de string em C | `strings: { rows: [{ label, cells }], links?, result? }` |
| `pointers` | endereços e ponteiros em C | `pointers: { boxes: [{ id, name, type, address, value, targetId?, labels?, state? }], result? }` |
| `object` | lições de POO em C++ | `object: { blueprints?, instances?, pointer?, call?, exception?, explanationNote? }` |
| `loop` | `for`, `while`, `do-while` | `loop: { phase?, iteration?, innerIteration?, condition?, accumulator? }` |
| `callstack` | funções e recursão em C | `callstack: { frames: [{ id, fn, call?, vars: [{ name, value, kind?, state? }], state?, returns?, received? }], result? }` |

As views são apresentacionais: não calculam o algoritmo, apenas desenham o `Step` atual.
`MatrixView` desenha a grade 2D com realce cruzado de linha/coluna, coordenadas e rótulos;
`StringsView` desenha fileiras de caracteres com índices, ponteiros nas células, terminador `\0`
destacado e setas SVG para cópia/concatenação; `PointersView` desenha caixas de memória com
tipo/nome/endereço/valor, setas por `targetId` e estados separados de leitura e escrita;
`ObjectView` desenha moldes de classe, instâncias, herança, ponteiro base e fluxo de exceções;
`LoopView` combina tracker de iterações, condição e acumulador;
`CallStackView` empilha quadros do topo para a base, separa parâmetros de locais, destaca o retorno
antes de o quadro desaparecer e mostra `recebeu X` no quadro que aguardava a chamada; a legenda e a
descrição do passo continuam sendo a fonte textual do estado.

### 4.4 Tema

A fonte única de tokens é `src/theme/tokens.ts`:

- `palette`/`lightPalette` (cores escuras e de papel), `space`, `radius`, `font`, `sans`, `mono`,
  `shadow` (incluindo `panel`, `deck` e `primary`), `transition`, `vizVar` (aliases `--viz-*`) e
  `tint` (mistura translúcida);
- `theme` (Mantine `createTheme`, dark + âmbar, com `primaryShade` por esquema de cor,
  `respectReducedMotion` e defaults de `Button`/`Paper`/`TextInput`/`Modal`);
- `cssVariablesResolver`, que emite as variáveis dos dois esquemas a partir dos tokens;
- `subjectAccent` (`blue`, `teal`, `violet`) e as variáveis `--viz-subject-*`: cada matéria tem
  sua própria cor, aplicada no cabeçalho, filtros, cards, painéis e controles da página. A home
  continua usando o âmbar global.

`src/theme.ts` é um shim que re-exporta os tokens e mantém o alias deprecated `viz`. As variáveis
`--viz-*` dos esquemas dark e light são emitidas por `cssVariablesResolver` (em `tokens.ts`) e
consumidas por `src/styles/index.css`; o stylesheet não mantém uma segunda cópia da paleta.

**Atenção:** o alias `@/theme` hoje resolve para o **arquivo** `src/theme.ts`, não para o diretório
`src/theme/`. Não existe `src/theme/index.ts`. Apagar o shim sem criar um índice ou trocar os
imports quebra o build. Veja BUG-06.

O guia completo de uso (temas, variáveis, acentos por matéria, componentes e anti-padrões) está em
`docs/ui-guidelines.md`.

### 4.5 Rotas e catálogo

- `src/app/App.tsx` define as rotas: home, matéria, lição, teoria, playground, comparar e Vim.
- `src/content/subjects.ts` é a fonte única das matérias, grupos e entradas do catálogo.
- `src/content/catalog.ts` é um re-export de compatibilidade de `subjects.ts`.
- `src/content/lessons/index.ts` registra as lições por slug.
- `src/content/theory/index.ts` registra os artigos de teoria.

Cada matéria tem uma rota `/materias/:subjectId` com busca local, filtros por grupo e por view,
contagem e estado na URL (`q`, `grupo`, `view`). A home lista as três matérias, três frentes de
aprendizado, destaques, um recorte de código e as duas ferramentas (Vim e Playground). A busca do
header abre um painel agrupado por matéria. A navegação primária é `Início`, menu `Matérias`,
`Vim` e `Playground`; no mobile, o drawer repete os mesmos grupos com rótulos e o acento de cada
matéria. O título dos cards de lição vem do
próprio `Lesson`; `subjects.ts` guarda apenas slug, descrição curta e tag de complexidade.

### 4.6 Seção Vim

`/vim` e `/vim/desafios/:slug` são uma seção própria, **fora** do catálogo de matérias. O desenho
segue o mesmo princípio das lições: o motor em `src/vim/keymap.ts` é puro (`reduce(state, key)`), não
toca o DOM e é coberto por testes de tabela. `buffer`, `motions`, `operators`, `history` e `commands`
são módulos puros reutilizados pelo editor. `challenges.ts` guarda as 12 missões e suas soluções de
referência (executadas no teste), `cheatsheet.ts` guarda os comandos essenciais e `progress.ts`
persiste o progresso em `localStorage` (`visualize-it:vim-progress`). O editor (`VimEditor`) usa um
`textarea` invisível para IME/mobile, mantém o foco no buffer, expõe `role="application"` e anuncia
modo/cursor/mensagem em uma statusline `aria-live`. `Tab` sai do editor e `prefers-reduced-motion`
desliga o cursor piscante.

### 4.7 Conteúdo e código

O código exibido é escrito em blocos template e passa por `lines()` (`src/lib/lines.ts`), que faz
`trim()` e separa por `\n`. Isso significa que o índice 0 é a primeira linha **após** o `trim`.
Os índices de `Step.line` são contados nessa lista.

---

## 5. Bugs conhecidos

Severidade: **Alta** = quebra ou engana o aprendizado; **Média** = UX/robustez; **Baixa** =
polimento.

| ID | Sev. | Achado | Evidência | Impacto | Correção sugerida |
|---|---|---|---|---|---|
| BUG-01 | Resolvido | Destaque da linha ativa agora suporta mapeamento por linguagem em AEDS II | `StepLine` suporta `{ java: number, c: number }`; 10 lições com listagens desalinhadas foram calibradas e `lessons.test.ts` valida limites para todas as linguagens suportadas | — | Coberto por `lessons.test.ts` em todas as linguagens |
| BUG-02 | Resolvido | Loop Tracker desacoplado de células e correção do somatório em `for.ts` | Issue #57 resolvida: `for`, `while` e `do-while` migrados para `LoopView` com alternância entre Quadrados de Iteração (1D e 2D triangular) e Dashboard analítico; variáveis locais no `VarsPanel`; código C de `for.ts` simplificado para somatório aninhado didático ($j \le i$) com exata correspondência | — | Coberto por `LoopView.test.tsx` e `lessons.test.ts` |
| BUG-03 | Resolvido | Lista dupla mostrava `∅` em todos os ponteiros anteriores/próximos | `lista-dupla.ts` agora mapeia `prev: nd.ant` e `next: nd.prox`; `NodesView` resolve os ids para os valores e desenha conectores curvos | — | Coberto por `lessons.test.ts`; a view também exibe o terminal `∅` |
| BUG-04 | Resolvido | Validação de entrada por schema e prevenção de estouro de memória | Módulo `inputValidation.ts` introduzido com `InputSchema` (`min`, `max`, `integerOnly`, `unit-interval`), limites estritos e mensagens claras em pt-BR; counting sort protegido em 0..30 | — | Coberto por `inputValidation.test.ts`, `LessonView.test.tsx` e `ComparePage.tsx` |
| BUG-05 | Resolvido | Busca com alvo configurável e cenários de sucesso/falha | Issue #56 resolvida: suporte a alvo explícito (`hasTarget`, `defaultTarget`), campo `alvo = ` no toolbar com sincronização de URL (`?target=`), sorteio inteligente (50% presente / 50% ausente), badge de presença (Presente/Ausente) e presets de cenários rápidos (`Início`, `Meio`, `Fim`, `Ausente`). Animação cobre hit (destaque do índice encontrado) e miss (varredura completa e retorno -1). Variáveis locais populadas no `VarsPanel`. | — | Coberto por `busca.test.ts` e `LessonView.test.tsx` |
| BUG-06 | Resolvido | Refactor de tema incompleto e com armadilha de resolução | `src/theme/tokens.ts` está rastreado e é a fonte única; `src/theme.ts` permanece como shim que re-exporta tokens, `vizVar` e `tint`, com `viz` deprecated para compatibilidade | — | A migração foi concluída mantendo o shim; criar `src/theme/index.ts` e remover `viz` quando todos os imports migrarem |
| BUG-07 | Resolvido | Tabela de complexidade mostrava “Estável: Não” quando o valor era indefinido | `ComplexityTable.tsx` agora distingue `stable === undefined` e exibe “—” | — | Coberto por `ComplexityTable.test.tsx` |
| BUG-08 | Resolvido | Acessibilidade e semântica | Home com um único `h1`; views com `role="img"` e `aria-label`; descrição do passo com `aria-live="polite"`; atalhos ignoram foco em campos, botões e links; skip link e breadcrumbs adicionados | — | Mantido coberto por revisão manual e testes de rota |
| BUG-09 | Baixa | Higiene do repositório | `dump.txt` (328 KB) e `criar-issues.sh` não rastreados; o script referencia caminhos antigos (`src/lessons/selection-sort/algorithm.ts`, `ArrayView`) e Tailwind/Prettier | Risco de commit acidental de dump e de automação obsoleta | Remover ou ignorar `dump.txt`; atualizar ou remover `criar-issues.sh`; manter `dist/` fora do git |
| BUG-10 | Resolvido | Testes, documentação e CI defasados | 18 arquivos e 144 testes, incluindo playback, quiz, parsed input, catálogo, busca local/global, escala das barras e complexidade; workflow de CI em `.github/workflows/ci.yml` cobre lint, typecheck, test e build | — | Manter os testes e o workflow atualizados a cada mudança |
| BUG-11 | Resolvido | Atalho de espaço no fim da animação | `usePlayback.toggle()` reinicia no passo 0 quando `atEnd`, e o botão passa a exibir “Recomeçar” | — | Coberto por `usePlayback.test.ts` |
| BUG-12 | Resolvido | Highlighter não cobria comentários de bloco nem strings | `src/lib/highlight.tsx` reconhece `//`, `/* ... */` (com estado entre linhas), strings, números e palavras-chave; `CodePanel` e `Pre` da teoria reutilizam o tokenizer | — | Coberto por `highlight.test.tsx` |
| BUG-13 | Resolvido | Dependência não utilizada | `@mantine/hooks` passou a ser usado por `useDisclosure` (busca/drawer) e `useMediaQuery` (layout responsivo) | — | Mantido; a dependência agora tem uso real |

### Observações que não são bugs

- A lista encadeada inicial é montada por inserção no início, então `initial: [10, 20]` aparece como
  `20 → 10`. Isso é intencional para a pilha; para a lista, pode surpreender. Se virar problema de
  UX, documentar no card.
- `assignElementIds` é O(n²) por quadro, mas `n ≤ 12` na prática.
- `usePlayback` chama `setCursor` durante o render para resetar quando `steps` muda. É o padrão
  recomendado pelo React para “ajustar estado quando uma prop muda”; não troque por efeito sem
  motivo.
- O `CodePanel` usa um highlighter mínimo de propósito; não é um parser.

---

## 6. Dívidas técnicas e riscos

1. **Contrato de linha frágil.** O maior risco do projeto: qualquer alteração de código pode
   desalinhar a animação sem nenhum teste falhar.
2. **Conteúdo duplicado.** As versões Java e C são mantidas manualmente; elas já divergem em
   `for.ts` e têm contagens de linha diferentes em 12 lições.
3. **Tema em transição.** Shim + diretório + alias deprecated convivem; é fácil importar do lugar
   errado. A paleta dos dois esquemas agora é emitida por `cssVariablesResolver` e o stylesheet não
   guarda uma segunda cópia, mas o shim `src/theme.ts` e o alias `viz` continuam por compatibilidade.
4. **Validação de entrada centralizada e frouxa.** Cada lição assume um formato diferente (vetor,
   N único, vetor + alvo), mas a UI oferece o mesmo campo para todas.
5. **Contrato de linha frágil em lições sem variantes.** Há testes de playback, entrada e catálogo,
   mas ainda falta validar o destaque de linha nas duas linguagens.
6. **Acessibilidade incompleta.** As visualizações são predominantemente visuais e mudam sem
   anúncio para tecnologias assistivas.
7. **CI cobre o básico.** O workflow roda lint, typecheck, test e build; ainda não há checagem de
   links, bundle ou deploy preview.
8. **Artefatos locais.** `dump.txt`, `dist/` e scripts antigos podem ser confundidos com fonte.
9. **Sem `engines`.** A versão mínima de Node está só no README.

---

## 7. Melhorias futuras

### Curto prazo (próximas entregas)

- Alvo configurável nas lições de busca (Issue #56).
- Visualização de chamada recursiva (Call Stack) em Quicksort e Mergesort (Issue #59).
- Visualização de Árvore Binária para Heapsort (Issue #60).
- FileView: disco vs RAM com cursor sequencial (Issue #54).
- Operações interativas em listas encadeadas (Issue #58).
- Remover o shim/alias `viz` depois de migrar os imports restantes.

### Médio prazo

- Alvo configurável nas lições de busca.
- Timeline/lista de passos clicável, além de anterior/próximo.
- Histórico de variáveis e destaque de mudanças entre passos.
- Metadados por rota (título do documento, descrição, Open Graph).
- Acessibilidade das views, com rótulos e anúncio do passo.
- Testes de propriedade para ordenações com entradas aleatórias (seed fixa).
- Adicionar `engines` ao `package.json`.

### Longo prazo

- Pilha de chamadas nas ordenações recursivas (quicksort, mergesort, heapsort), além da lição
  introdutória de recursão.
- Novas views para árvores e grafos.
- Modo de comparação entre algoritmos ou entre Java e C.
- Internacionalização (pt-BR/en) e refinamento do tema claro.
- Migração do conteúdo para um formato com âncoras de linha declarativas, eliminando números
  mágicos.

---

## 8. Como validar

### Automático

```bash
npm install
npm run lint
npm test
npm run typecheck
npm run build
```

### Manual

1. Abra `/` e confira os três cards de matéria e os destaques.
2. Abra `/materias/aeds-ii`, busque, filtre por grupo/view e confira o estado na URL.
3. Abra uma lição de cada view: `selecao` (bars), `pilha-sequencial` (cells), `lista-encadeada`
   (nodes), `soma` (plot), `vetores-matrizes` (matrix), `strlen` (strings), `ponteiros-basico` e
   `ponteiros-duplos` (pointers), `oop` (object), `while` (loop), `funcoes` e `recursao`
   (callstack).
4. Use “Executar”, “Pausar”, “Anterior”, “Próximo”, “Recomeçar”, o slider de passo e a velocidade.
5. Alterne Java/C e confira o destaque da linha.
6. Aplique uma entrada válida e uma inválida; teste também “Sortear” e os presets.
7. Teste os atalhos `←`, `→`, espaço, `Home` e `End`.
8. Abra `/teoria/complexidade` e `/teoria/inducao`.
9. Use a busca do header e confira o agrupamento por matéria.
10. Abra `/playground` e execute o sandbox.
11. Alterne o tema claro/escuro e confira as dez views (inclusive `soma`, view `plot`, `vetores-matrizes`, view `matrix`, `strlen`, view `strings`, `ponteiros-basico`/`ponteiros-duplos`, view `pointers`, `oop`, view `object`, `while`, view `loop`, e `funcoes`/`recursao`, view `callstack`).
12. Ative o quiz em uma lição de `bars` e responda uma pergunta.
13. Abra uma URL inexistente e confira o 404.

---

## 9. Histórico de decisões

| Data | Decisão | Motivo |
|---|---|---|
| — | Migração do site estático para React + Vite + TypeScript | Tipagem, componentização e testes |
| — | Lições como dados puros + `steps()` | Testabilidade sem navegador e player simples |
| — | Três views reutilizando o mesmo motor | Evitar duplicação de lógica de animação |
| — | Remoção do Tailwind em favor do Mantine | Componentes acessíveis e tema consistente |
| — | Remoção do Prettier | Menos ferramentas; estilo mantido manualmente + ESLint |
| — | Fonte JetBrains Mono self-hosted | Consistência visual e independência de CDN |
| — | Tokens centralizados em `src/theme/tokens.ts` | Fonte única para cores, espaçamento e tipografia |
| — | SPA com rewrites no Vercel + redirects 301 | Preservar URLs antigas do site estático |
| 2026-10-20 | Interface organizada por matéria (`/materias/:subjectId`), busca global e controles sticky | Facilitar a escolha do algoritmo sem criar um catálogo global concorrente |
| 2026-10-20 | Escala zero-ancorada, grade, base, rótulos e legenda em `BarsView`; hierarquia tipográfica e controles compactos | Tornar a animação legível e comparável, inclusive com zeros/negativos e em telas estreitas |
| 2026-10-20 | Deck de controles com ação primária, toolbar de entrada, grid 56/44, painéis Sobre/Complexidade, ícones SVG e legenda compartilhada | Dar hierarquia aos controles e posicionar a animação como elemento central, mantendo o tema dark + âmbar |
| 2026-10-20 | Limpeza visual geral e animações didáticas (curvas spring, sincronização de rótulos em BarsView, elevação e ponteiros em Cells/NodesView, detecção de mutação em VarsPanel, toolbar em linha única e LessonPager integrado) | Reduzir ruído visual de bordas/cabeçalhos e fornecer feedback físico imediato das mudanças de estado algorítmico |
| 2026-10-20 | Merge da linha de interface por matéria com quiz, playground, view `plot`, tema claro/escuro e Storybook | Unificar as duas frentes mantendo `subjects.ts` como catálogo, o grid 56/44 e os tokens compartilhados |
| 2026-10-20 | Deck de controles empilha abaixo de 1216px e os atalhos não ocupam mais a linha do player | Impedir que velocidade/copiar link vazem para fora do painel em telas médias e no container máximo |
| 2026-10-21 | Refatoração visual “Living Graph Paper”: tipografia do sistema (sans para leitura, mono para código), `cssVariablesResolver` como fonte única, grade de papel, herói com figura matemática, catálogo editorial, cockpit com timeline, views com curvas/área, editor do playground e 404 | Modernizar a interface mantendo a identidade de código/matemática e paridade entre tema claro e escuro |
| 2026-10-21 | `TimelineBar` integrado ao player, `Panel` com corpo flex, highlighter extraído para `lib/highlight` e ponteiros da lista dupla corrigidos | Aproveitar o componente já testado, eliminar espaços vazios nos painéis e fechar BUG-03/BUG-12 |
| 2026-10-21 | Cores por matéria (`blue` para AEDS I, `teal` para AEDS II, `violet` para Análise) via `--subject-accent`; a home mantém o âmbar | Dar identidade a cada matéria e manter o âmbar como assinatura da home |
| 2026-10-21 | Tema escuro em preto puro (`#000`), superfícies neutras e remoção de glows/gradientes decorativos | Reduzir ruído visual, melhorar contraste e afastar a interface de um visual genérico |
| 2026-10-21 | Nav com indicador inferior e hover centralizado; links do drawer em largura total; timeline monocromática | Corrigir desalinhamento de ícones/texto e diminuir a poluição visual do player |
| 2026-10-21 | `testTimeout` de 20s no Vitest | Renderizações do Mantine em jsdom passam dos 5s padrão em máquinas mais lentas |
| 2026-10-21 | Remoção de `@fontsource`; UI e código usam pilhas do sistema (sans/mono), sem arquivos de fonte | Eliminar fontes customizadas/hardcoded e reduzir o bundle |
| 2026-10-20 | Integração das lições `counting` e `bucket` com a linha principal (`main`) | Trazer as variantes iterativa/recursiva e a análise de complexidade; `inputFormat` permite valores em [0, 1) no formulário |
| 2026-10-21 | AEDS I somente em C; `Lesson.languages`, listagens parciais e linhas recalibradas | Remover ambiguidade Java/C nas lições introdutórias e evitar código não utilizado |
| 2026-10-21 | Comparação determinística em `/comparar`, dicas/curiosidades em `content/insights.ts`, copiar/baixar código, atalhos com modal e link de reportar problema | Aproveitar ideias do SortVision sem copiar a arquitetura imperativa nem métricas de tempo de animação |
| 2026-10-21 | 15 novos módulos de AEDS I: OOP (C++) e dados/memória (C), com `inputless` e `languages` | Cobrir os tópicos das notas sem duplicar a toolbar de entrada e mantendo uma única linguagem por módulo |
| 2026-10-21 | Grupo **String** com 7 páginas e view `strings` (fileiras, ponteiros, terminador e setas) | Ensinar as funções de `<string.h>` com o código em C e uma animação fiel à operação de cópia/concatenação |
| 2026-10-22 | Separação interativa de vetores e matrizes em `vetores-matrizes` com entradas dinâmicas e 4 operações (preencher, limpar, buscar, somar) | Facilitar a compreensão de vetores 1D e matrizes 2D isoladamente com código C dedicado e dimensionamento flexível até 10x10 (Issue #51) |
| 2026-10-22 | Seção `/vim` com motor puro, 12 desafios e cheatsheet essencial, fora do catálogo de matérias | Ensinar Vim com prática real mantendo o mesmo contrato testável das lições e sem dependências novas |
| 2026-10-22 | Lição `ponteiros-basico` e view `pointers` (caixas endereçadas, setas por `targetId`, leitura em violeta e escrita em âmbar) | Separar endereço de valor antes da aritmética de ponteiros, com um modelo de memória explícito e acessível |
| 2026-10-22 | Lição `ponteiros-duplos` com a cadeia `pp → p → x`, `*pp = &y` e `**pp = 99`; grupo **Ponteiros** com 3 lições | Fechar a progressão básico → aritmética → duplo sem criar uma segunda view |
| 2026-10-22 | View `callstack` e lições `funcoes` e `recursao` (quadros com parâmetros/locais, passagem por valor, caso base e desenrolar) | Ensinar o mecanismo de chamada e o retorno recursivo com um modelo explícito de pilha, sem nova dependência |

---

## 10. Referências

- `README.md` — visão geral, scripts e instruções de deploy.
- `docs/ui-guidelines.md` — guia de UI, temas, tokens, acentos por matéria e receitas.
- `AGENTS.md` — contrato operacional para agentes.
- `src/engine/types.ts` — contrato de `Lesson` e `Step`.
- `src/content/lessons/index.ts` — registro de lições.
- `src/content/subjects.ts` — matérias, grupos, entradas e helpers de busca.
- `src/content/catalog.ts` — re-export de compatibilidade.
- `src/components/AlgorithmBrowser.tsx` — busca e filtros de uma matéria.
- `src/components/barScale.ts` — escala zero-ancorada usada por `BarsView`.
- `src/components/GlobalSearch.tsx` — busca global agrupada por matéria.
- `src/theme/tokens.ts` — tokens visuais.
- `vercel.json` — rewrites e redirects.

---

**Manutenção:** ao corrigir um bug, marque-o como resolvido nesta tabela (ou remova a linha) e
registre a decisão no histórico. Ao adicionar uma lição, atualize a lista da seção 2. Ao mudar a
arquitetura, atualize a seção 4 e o `AGENTS.md` se o contrato operacional mudar.
