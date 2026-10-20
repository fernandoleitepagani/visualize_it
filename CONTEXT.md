# CONTEXT.md — contexto vivo do Visualize It

> **Documento de leitura obrigatória para todos os agentes e modelos.** O `AGENTS.md` na raiz
> determina que este arquivo seja lido por inteiro antes de qualquer alteração. Se você é um agente
> que não lê `AGENTS.md` automaticamente, leia os dois arquivos no início da sessão.
>
> Este documento descreve o estado atual do projeto, a arquitetura, os bugs conhecidos, as dívidas
> técnicas e o roadmap. Ele deve ser atualizado junto com o código quando o estado mudar.

**Última atualização:** 2026-10-20

---

## 1. Resumo

O **Visualize It** é um site acadêmico que ensina algoritmos, estruturas de dados e análise de
complexidade por meio de visualizações passo a passo. Cada lição combina:

- uma estrutura animada (`bars`, `cells` ou `nodes`);
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
| Lições registradas | 22 (`src/content/lessons/index.ts`) |
| Views | 3 (`bars`, `cells`, `nodes`) |
| Artigos de teoria | 2 (`complexidade`, `inducao`) |
| Rotas | `/`, `/materias/:subjectId`, `/algoritmos/:slug`, `/teoria/:slug`, `*` (404) |
| Testes | 85 testes em 14 arquivos, passando |
| Lint | Limpo |
| Typecheck | Limpo |
| Deploy | Vercel, rewrite de SPA + redirects 301 das URLs antigas |
| Node | 20.19+ ou 22.12+ |

### Lições existentes

- **AEDS I (4):** `for`, `while`, `do-while`, `aritmetica`.
- **AEDS II (18):**
  - **Ordenação:** `selecao`, `insercao`, `bolha`, `shellsort`, `quicksort`, `mergesort`,
    `heapsort`, `counting`, `radix`.
  - **Busca:** `busca-sequencial`, `busca-binaria`.
  - **Estruturas lineares:** `lista-sequencial`, `lista-encadeada`, `lista-dupla`,
    `pilha-sequencial`, `pilha-encadeada`, `fila-circular`, `fila-encadeada`.
- **Análise (2):** `complexidade`, `inducao`.

### Estado do worktree no momento desta atualização

Há um refactor de tema em andamento, ainda não commitado:

- `src/theme/tokens.ts` é novo e não está rastreado;
- `src/theme.ts` virou um shim de re-exportação;
- 16 arquivos foram ajustados para consumir `palette`, `font`, `space`, `radius`, `transition` e
  `shadow`;
- `dump.txt` (334 KB) e `criar-issues.sh` estão na raiz sem rastreamento.

Além disso, a refatoração da interface por matéria está no worktree: `src/content/subjects.ts`,
páginas de matéria, busca global, controles sticky e novos testes. As melhorias visuais do
visualizador também estão aplicadas: escala zero-ancorada em `BarsView`, hierarquia tipográfica dos
painéis, deck de controles com ação primária destacada, toolbar de entrada compacta, grid 56/44 com
painéis alinhados e correção do `ComplexityTable` para estabilidade indefinida. Preserve mudanças
existentes que não fazem parte da sua tarefa.

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
| Fonte | JetBrains Mono self-hosted (`@fontsource`) |
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
  view?: 'bars' | 'cells' | 'nodes'; // padrão: bars
  linked?: 'singly' | 'doubly';      // só para nodes
  panelLabel?: string;
  initial?: number[];                // padrão: DEFAULT_INPUT
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
- `nodes?`: nós de estruturas encadeadas.

`steps()` não toca no DOM e pode ser testada sem navegador. O player só percorre a lista pronta.

### 4.2 Fluxo de renderização

```
LessonPage (breadcrumb + LessonPager)
  └─ LessonView (key={lesson.id})
       ├─ useMemo: lesson.steps(input)
       ├─ usePlayback(steps)
       ├─ toolbar de entrada (valores, Aplicar, Sortear, presets)
       ├─ useMemo: assignElementIds(steps)  // só para bars
       ├─ Canvas → BarsView | CellsView | NodesView
       ├─ CodePanel (Java/C + linha ativa com rolagem automática)
       ├─ PlayerControls abaixo do grid (transporte, progresso, velocidade)
       ├─ VarsPanel
       └─ painéis Sobre + Complexidade
```

No desktop, visualização e código ficam lado a lado em um grid 56/44; no mobile, viram abas. Os
controles de reprodução ficam logo abaixo do grid, antes dos painéis Sobre/Complexidade. O
cabeçalho do painel de visualização mostra um badge com o passo atual, a narração fica em um bloco
destacado logo abaixo do canvas e as variáveis ficam em um rodapé próprio. Os painéis compartilham
header, ícone e sombra sutil via `Panel`; `src/components/icons.tsx` concentra os SVGs inline e
`ViewLegend` padroniza a legenda das três views. `usePlayback` mantém o cursor, o estado de
play/pause e a velocidade; `goTo` atende o slider de passo. Quando a lista de `Step` muda de
identidade (nova lição ou nova entrada), o cursor reinicia durante o render.

`assignElementIds` dá identidade estável aos elementos de `arr` para que a troca de barras seja
animada como deslocamento, não como teletransporte.

`BarsView` usa `getBarScale` (`src/components/barScale.ts`) para mapear valores em uma escala que
sempre inclui o zero. A view desenha grade discreta, linha de base, valores acima das barras,
índices abaixo e uma legenda apenas com os estados presentes no passo. Valores negativos crescem
para baixo a partir da mesma linha de base; zeros aparecem como um traço fino.

### 4.3 Views

| `view` | Usada por | Campos lidos |
|---|---|---|
| `bars` | ordenação e busca | `arr`, `cmp`, `swap`, `pivot`, `sorted`, `dim` (escala zero-ancorada, grade, base, valores, índices e legenda) |
| `cells` | vetores, pilhas, filas, listas e laços | `cells: [{ val, labels, state }]` |
| `nodes` | listas/pilhas/filas encadeadas | `nodes: [{ id, val, prev, next, labels, state }]` |

As views são apresentacionais: não calculam o algoritmo, apenas desenham o `Step` atual.

### 4.4 Tema

A fonte única de tokens é `src/theme/tokens.ts`:

- `palette` (cores, incluindo `accentHalo`/`accentGlow`), `space`, `radius`, `font`, `mono`,
  `shadow` (incluindo `panel`, `deck` e `primary`) e `transition`;
- `theme` (Mantine `createTheme`, dark + âmbar).

`src/theme.ts` é um shim que re-exporta os tokens e mantém o alias deprecated `viz`.

**Atenção:** o alias `@/theme` hoje resolve para o **arquivo** `src/theme.ts`, não para o diretório
`src/theme/`. Não existe `src/theme/index.ts`. Apagar o shim sem criar um índice ou trocar os
imports quebra o build. Veja BUG-06.

### 4.5 Rotas e catálogo

- `src/app/App.tsx` define as rotas: home, matéria, lição e teoria.
- `src/content/subjects.ts` é a fonte única das matérias, grupos e entradas do catálogo.
- `src/content/catalog.ts` é um re-export de compatibilidade de `subjects.ts`.
- `src/content/lessons/index.ts` registra as lições por slug.
- `src/content/theory/index.ts` registra os artigos de teoria.

Cada matéria tem uma rota `/materias/:subjectId` com busca local, filtros por grupo e por view,
contagem e estado na URL (`q`, `grupo`, `view`). A home lista apenas as três matérias e alguns
destaques. A busca do header abre um painel agrupado por matéria. O título dos cards de lição vem do
próprio `Lesson`; `subjects.ts` guarda apenas slug, descrição curta e tag de complexidade.

### 4.6 Conteúdo e código

O código exibido é escrito em blocos template e passa por `lines()` (`src/lib/lines.ts`), que faz
`trim()` e separa por `\n`. Isso significa que o índice 0 é a primeira linha **após** o `trim`.
Os índices de `Step.line` são contados nessa lista.

---

## 5. Bugs conhecidos

Severidade: **Alta** = quebra ou engana o aprendizado; **Média** = UX/robustez; **Baixa** =
polimento.

| ID | Sev. | Achado | Evidência | Impacto | Correção sugerida |
|---|---|---|---|---|---|
| BUG-01 | Alta | Destaque da linha ativa desalinhado e compartilhado entre Java e C | `mergesort.ts` usa `push(16, ...)` com `code.java` de 16 linhas (índices 0–15); `for.ts` referencia as linhas 5/8/9/11/… mas o código Java está em 3/6/7/9/…; 12 lições têm listagens Java/C com tamanhos diferentes | A linha destacada às vezes não existe ou aponta para a instrução errada; a aba C fica pior | Modelar `line` por linguagem (`{ java: number; c: number }`) ou usar âncoras nomeadas; testar `0 <= line < code[lang].length` e igualdade semântica nas duas abas |
| BUG-02 | Alta | `for.ts`: Java, C e simulação calculam resultados diferentes | Java: `i <= N-1` e `p <= N`; C: `i <= N` e `p <= N-1`; simulação: `i <= N` e `p <= N-1`. Para N=3, Java ≈ 3,7 e C/simulação = 1,0 | A lição ensina um código e anima outro; o resultado exibido não corresponde ao Java | Unificar a especificação, corrigir as três versões e adicionar teste do valor final |
| BUG-03 | Alta | Lista dupla mostra `∅` em todos os ponteiros anteriores/próximos | `lista-dupla.ts` monta nós com `ant`/`prox`; `NodesView.tsx` lê `node.prev`/`node.next` | A view `doubly` não mostra os links reais; o aluno não vê a vantagem da lista dupla | Mapear `prev: nd.ant` e `next: nd.prox`; tipar o retorno como `Node` para o TS acusar propriedades fora do contrato |
| BUG-04 | Média | Entrada aceita negativos e valores enormes | `LessonView.tsx` agora exige inteiros e quantidade 1–12, mas não limita faixa; `counting.ts` faz `new Array(max + 1)` e indexa por valor; `radix.ts` e `counting.ts` convertem negativos para 0; `for`/`while` usam só o primeiro valor e fazem clamp | Valores como `1e9` podem estourar memória; negativos produzem uma visualização diferente do que foi digitado; lições de N único ignoram o resto silenciosamente | Validar faixa (ex.: 0–999) por lição; schema de entrada (`array`, `n`, `array + alvo`); mostrar erro em vez de clampar |
| BUG-05 | Média | Busca sempre procura o elemento do meio | `busca-sequencial.ts` e `busca-binaria.ts` definem `target = v[Math.floor(v.length / 2)]` | Não dá para demonstrar melhor/pior caso nem o caminho “não encontrado”; a busca sequencial sempre percorre metade do vetor | Permitir alvo explícito na entrada; manter um padrão quando não informado |
| BUG-06 | Média | Refactor de tema incompleto e com armadilha de resolução | `src/theme/tokens.ts` não rastreado; `src/theme.ts` é shim; `@/theme` resolve para o arquivo; não há `src/theme/index.ts`; `viz` está deprecated e sem uso | O build quebra se o shim for removido antes de criar o índice; a migração fica ambígua | Concluir a migração: mover o shim para `src/theme/index.ts` (ou trocar imports para `@/theme/tokens`), remover `viz`, commitar tokens + componentes juntos |
| BUG-07 | Resolvido | Tabela de complexidade mostrava “Estável: Não” quando o valor era indefinido | `ComplexityTable.tsx` agora distingue `stable === undefined` e exibe “—” | — | Coberto por `ComplexityTable.test.tsx` |
| BUG-08 | Resolvido | Acessibilidade e semântica | Home com um único `h1`; views com `role="img"` e `aria-label`; descrição do passo com `aria-live="polite"`; atalhos ignoram foco em campos, botões e links; skip link e breadcrumbs adicionados | — | Mantido coberto por revisão manual e testes de rota |
| BUG-09 | Baixa | Higiene do repositório | `dump.txt` (334 KB) e `criar-issues.sh` não rastreados; o script referencia caminhos antigos (`src/lessons/selection-sort/algorithm.ts`, `ArrayView`) e Tailwind/Prettier | Risco de commit acidental de dump e de automação obsoleta | Remover ou ignorar `dump.txt`; atualizar ou remover `criar-issues.sh`; manter `dist/` fora do git |
| BUG-10 | Média | Testes, documentação e CI parcialmente defasados | Agora há 10 arquivos e 73 testes, incluindo playback, catálogo, busca local/global, escala das barras e complexidade; ainda faltam testes de limites de linha; `.github` tem templates mas nenhum workflow | Regressões de conteúdo ainda podem entrar sem aviso; onboarding depende de conhecimento oral | Adicionar os testes restantes e workflow de CI (`lint`, `typecheck`, `test`, `build`); atualizar `package.json` (`engines`) |
| BUG-11 | Resolvido | Atalho de espaço no fim da animação | `usePlayback.toggle()` reinicia no passo 0 quando `atEnd`, e o botão passa a exibir “Recomeçar” | — | Coberto por `usePlayback.test.ts` |
| BUG-12 | Baixa | Highlighter não cobre comentários de bloco nem strings | `CodePanel.tsx` reconhece `//`, números e palavras-chave; `aritmetica.ts` usa `/* ... */` | Comentários de bloco e strings ficam sem cor, reduzindo a legibilidade | Melhorar o tokenizer ou documentar a limitação |
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
   errado.
4. **Validação de entrada centralizada e frouxa.** Cada lição assume um formato diferente (vetor,
   N único, vetor + alvo), mas a UI oferece o mesmo campo para todas.
5. **Cobertura de testes estreita.** Os testes atuais garantem que as lições produzem passos e que
   as ordenações terminam ordenadas, mas não validam o destaque de linha, a entrada ou o playback.
6. **Acessibilidade incompleta.** As visualizações são predominantemente visuais e mudam sem
   anúncio para tecnologias assistivas.
7. **Sem CI.** Lint, testes e typecheck dependem de execução local.
8. **Artefatos locais.** `dump.txt`, `dist/` e scripts antigos podem ser confundidos com fonte.
9. **Dependência não usada.** `@mantine/hooks`.
10. **Sem `engines`.** A versão mínima de Node está só no README.

---

## 7. Melhorias futuras

### Curto prazo (próximas entregas)

- Corrigir BUG-01, BUG-02 e BUG-03.
- Concluir o refactor de tema e remover o shim/alias `viz`.
- Validar entrada por lição (inteiros, faixa, quantidade, N único, alvo).
- Adicionar testes de limites de linha, catálogo ↔ registro, playback e validação.
- Criar workflow de CI com `lint`, `typecheck`, `test` e `build`.
- Limpar `dump.txt` e `criar-issues.sh`.

### Médio prazo

- Alvo configurável nas lições de busca.
- Estado da entrada na URL, permitindo compartilhar uma execução.
- Timeline/lista de passos clicável, além de anterior/próximo.
- Histórico de variáveis e destaque de mudanças entre passos.
- Metadados por rota (título do documento, descrição, Open Graph).
- Acessibilidade das três views, com rótulos e anúncio do passo.
- Testes de propriedade para ordenações com entradas aleatórias (seed fixa).
- Remover `@mantine/hooks` se continuar sem uso e adicionar `engines` ao `package.json`.

### Longo prazo

- Visualização de pilha de chamadas para recursão (quicksort, mergesort, heapsort).
- Novas views para árvores e grafos.
- Modo de comparação entre algoritmos ou entre Java e C.
- Internacionalização (pt-BR/en) e tema claro.
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
   (nodes).
4. Use “Executar”, “Pausar”, “Anterior”, “Próximo”, “Recomeçar”, o slider de passo e a velocidade.
5. Alterne Java/C e confira o destaque da linha.
6. Aplique uma entrada válida e uma inválida; teste também “Sortear” e os presets.
7. Teste os atalhos `←`, `→`, espaço, `Home` e `End`.
8. Abra `/teoria/complexidade` e `/teoria/inducao`.
9. Use a busca do header e confira o agrupamento por matéria.
10. Abra uma URL inexistente e confira o 404.

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

---

## 10. Referências

- `README.md` — visão geral, scripts e instruções de deploy.
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
