# AGENTS.md — contrato para agentes e modelos de IA

> **Leitura obrigatória antes de qualquer tarefa: leia `CONTEXT.md` na raiz do repositório, inteiro.**
>
> Esta regra vale para **todos os modelos e agentes** que trabalharem neste projeto, inclusive
> agentes de código, revisores, geradores de issues e assistentes de documentação. Se você não lê
> `AGENTS.md` automaticamente, leia `AGENTS.md` e `CONTEXT.md` no início da sessão. Não peça ao
> usuário para resumir o contexto: consulte os arquivos.

`CONTEXT.md` é o contexto vivo do projeto: estado atual, arquitetura, bugs conhecidos, dívidas
técnicas e roadmap. `AGENTS.md` é o contrato operacional: como trabalhar sem quebrar o que existe.

Se `CONTEXT.md` divergir do código, **o código vence para o comportamento atual**. Nesse caso,
atualize o `CONTEXT.md` na mesma tarefa para restabelecer a verdade.

---

## 1. O que é este repositório

**Visualize It** é um visualizador interativo de algoritmos, estruturas de dados e análise de
complexidade. Cada lição mostra:

- a estrutura animada passo a passo (`bars`, `cells` ou `nodes`);
- o código em **Java ou C**, com a linha executada destacada;
- as variáveis do passo atual;
- a tabela de complexidade assintótica.

O site é um SPA publicado no Vercel. O conteúdo é acadêmico (AEDS I/II) e a interface é em
português (pt-BR).

---

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 |
| Linguagem | TypeScript 6 em modo `strict` |
| Build | Vite 8 |
| UI | Mantine 9 (tema dark + âmbar) |
| Rotas | React Router 7 |
| Testes | Vitest + Testing Library |
| Lint | ESLint 10 (flat config) |
| Fonte | JetBrains Mono self-hosted |
| Deploy | Vercel (SPA com rewrites) |

Node.js necessário: **20.19+ ou 22.12+** (requisito do Vite 8).

---

## 3. Comandos

```bash
npm install          # instala dependências
npm run dev          # servidor de desenvolvimento (HMR)
npm run build        # type-check com tsc -b + build em dist/
npm run preview      # serve o build de produção
npm run lint         # ESLint
npm run typecheck    # tsc -b (sem build)
npm test             # Vitest, uma execução
npm run test:watch   # Vitest em watch
```

Antes de considerar uma tarefa concluída, rode no mínimo:

```bash
npm run lint
npm test
npm run typecheck
```

Se a mudança afetar build, rotas ou configuração, rode também `npm run build`.

---

## 4. Mapa da arquitetura

```
src/
├── app/App.tsx              # tabela de rotas
├── components/              # views, player, catálogo, busca (AlgorithmBrowser, GlobalSearch), shell
├── content/
│   ├── subjects.ts          # fonte única: matérias, grupos, entradas e busca
│   ├── catalog.ts           # re-export de compatibilidade de subjects.ts
│   ├── lessons/             # uma lição por arquivo + index.ts (registro)
│   └── theory/              # artigos de teoria (Complexidade, Indução)
├── engine/
│   ├── types.ts             # Lesson, Step, Cell, Node, Complexity
│   ├── elementIds.ts        # identidade estável dos elementos (animação de troca)
│   └── usePlayback.ts       # play/pause/prev/next/goTo/velocidade
├── lib/lines.ts             # utilitário para transformar template em array de linhas
├── pages/                   # HomePage, SubjectPage, LessonPage, TheoryPage, NotFound
├── styles/index.css         # ajustes sobre o CSS do Mantine
├── test/                    # setup do Vitest + helpers de render
├── theme.ts                 # shim de re-exportação (migração em andamento)
├── theme/tokens.ts          # fonte única dos tokens visuais
└── main.tsx
```

O alias `@/` aponta para `src/` (configurado em `vite.config.ts` e `tsconfig.app.json`).

### Fluxo de uma lição

```
input (LessonView) → lesson.steps(input) → Step[] → usePlayback → view atual
```

- `steps()` é uma função **pura**: não toca no DOM, não usa estado global e não depende de tempo.
- O player só percorre a lista pronta de `Step`.
- As views são "burras": recebem o `Step` atual e desenham.

---

## 5. Invariantes que não podem quebrar

1. **Lições são dados puros + uma função pura.**
   `steps(input)` deve ser determinística, não mutar `input` e devolver uma lista não vazia de
   `Step` para entradas válidas.

2. **`Step.line` precisa ser válido nas duas linguagens.**
   O mesmo `Step` é usado para destacar Java e C. Se as listagens tiverem contagens de linha
   diferentes, um único índice não serve para ambas. Antes de alterar uma lição, confira o
   destaque nas duas abas. Veja BUG-01 no `CONTEXT.md`.

3. **Uma lição nova exige três coisas:**
   - arquivo `src/content/lessons/<slug>.ts` exportando `export const lesson: Lesson`;
   - registro em `src/content/lessons/index.ts` com a chave igual ao slug da URL;
   - entrada no grupo correto de `src/content/subjects.ts`.

4. **O registro e o catálogo devem ficar em sincronia.**
   Uma lição registrada mas ausente do catálogo fica inacessível pela matéria; um slug no catálogo
   sem lição mostra o slug cru. Testes devem cobrir os dois sentidos (`subjects.test.ts`).

5. **Tokens visuais vêm de `@/theme`.**
   Não introduza cores, fontes, espaçamentos ou raios soltos em componentes. Se precisar de um
   valor novo, adicione em `src/theme/tokens.ts` e use o token.

6. **As três views compartilham o mesmo motor.**
   `BarsView` lê `arr`, `cmp`, `swap`, `pivot`, `sorted`, `dim`; `CellsView` lê `cells`; `NodesView`
   lê `nodes` e `linked`. Não crie um quarto caminho de renderização sem uma decisão explícita.

7. **Textos de UI e conteúdo didático em pt-BR.**
   Código, nomes de símbolos e comentários técnicos seguem o padrão do arquivo em que você está
   mexendo. Não traduza identificadores existentes nem reescreva descrições por preferência
   pessoal.

8. **Acessibilidade faz parte da definição de pronto.**
   A visualização não pode depender só de cor; controles precisam de rótulos; a descrição do passo
   deve ser anunciada. Veja BUG-08 no `CONTEXT.md`.

---

## 6. Receita para adicionar ou alterar uma lição

1. Copie um arquivo existente da mesma `view` (`bars`, `cells` ou `nodes`).
2. Mantenha `id` igual ao slug usado na URL.
3. Declare `initial`, `complexity`, `code.java`, `code.c` e `steps`.
4. Confira se `steps()` termina no estado final correto (para ordenações, vetor ordenado).
5. Verifique se cada `line` existe nas duas listagens e destaca a instrução certa.
6. Registre o slug em `src/content/lessons/index.ts`.
7. Adicione a entrada no grupo correto de `src/content/subjects.ts`.
8. Rode `npm test`, `npm run lint` e `npm run typecheck`.

Nenhum componente precisa mudar para adicionar uma lição que use uma view existente.

---

## 7. Estilo e convenções

- **Sem Prettier.** O projeto removeu Prettier de propósito; o estilo é mantido manualmente e pelo
  ESLint.
- Aspas simples, ponto e vírgula, indentação de 2 espaços, trailing commas.
- Prefira `import type` para tipos (`verbatimModuleSyntax` está ativo).
- Use o alias `@/` em vez de caminhos relativos longos.
- Componentes e funções exportados com `export function`/`export const`; evite `default export`.
- Imports ordenados: dependências externas primeiro, depois alias `@/`, depois relativos.
- Não adicione dependências novas sem justificar o custo e verificar alternativas nativas.
- Comentários devem explicar **por que**, não repetir o código.

---

## 8. Testes e qualidade

Testes ficam ao lado do código (`*.test.ts`/`*.test.tsx`) ou em `src/test/`.

O que merece teste:

- invariantes de ordenação (vetor final ordenado) para todas as lições de ordenação;
- `steps()` não vazio, com `line` inteiro e `desc` não vazio;
- limites de `line` para `code.java` **e** `code.c`;
- igualdade entre lições registradas e cards do catálogo;
- playback (`play`, `pause`, `next`, `prev`, `reset`, fim da lista);
- validação da entrada (inteiros, faixa, quantidade);
- views (`BarsView`, `CellsView`, `NodesView`) com estados vazios e estados ativos;
- rotas e 404.

Evite testes que dependem de tempo real ou de animações CSS. Prefira testar dados e comportamento
observável.

---

## 9. Armadilhas conhecidas

Consulte a seção "Bugs conhecidos" do `CONTEXT.md` antes de mexer nestes pontos:

- **Mapeamento de linha:** várias lições têm índices desalinhados; 12 lições têm listagens Java e C
  com tamanhos diferentes.
- **`for.ts`:** as versões Java, C e a simulação calculam resultados diferentes.
- **Lista dupla:** `NodesView` lê `prev`/`next`, mas a lição fornece `ant`/`prox`.
- **Entrada:** `parseInput` aceita decimais, negativos e valores enormes; `counting` aloca
  `max + 1` posições.
- **Tema:** `@/theme` resolve hoje para `src/theme.ts` (arquivo), não para `src/theme/tokens.ts`.
  Não apague o shim sem criar um `src/theme/index.ts` ou trocar todos os imports.
- **`viz`:** alias deprecated e sem uso; pode ser removido junto com a migração do tema.
- **Estabilidade:** `ComplexityTable` mostra "Não" quando `stable` é `undefined` ou não se aplica.

---

## 10. Git e entrega

- `main` é produção (deploy no Vercel); `dev` é integração. Trabalhe em `dev` ou em uma branch
  descritiva a partir dela.
- Commits no padrão Conventional Commits, em inglês:
  `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Não commite `node_modules/`, `dist/`, `.env*`, `dump.txt`, caches do editor ou arquivos de
  ferramentas locais.
- Não faça commit de mudanças não relacionadas à tarefa. Se o worktree já estiver sujo, preserve o
  trabalho existente e explique o que é seu.
- Não faça push para `main` sem confirmação explícita.

---

## 11. Definition of Done

Uma tarefa só está pronta quando:

- [ ] o comportamento foi implementado e verificado manualmente na rota afetada;
- [ ] `npm run lint`, `npm test` e `npm run typecheck` passam;
- [ ] testes novos cobrem a regressão ou o comportamento novo;
- [ ] nenhuma lição existente quebrou (destaque de linha, estado final, descrição);
- [ ] acessibilidade básica foi preservada (rótulos, foco, contraste, `aria-live`);
- [ ] `CONTEXT.md` foi atualizado se o estado, os bugs ou o roadmap mudaram;
- [ ] o diff não inclui arquivos gerados, dumps ou mudanças acidentais.

---

## 12. O que não fazer

- Não reintroduza Tailwind CSS, Prettier ou uma segunda biblioteca de UI sem pedido explícito.
- Não altere a assinatura de `Lesson`/`Step` sem migrar todas as lições e testes.
- Não faça `steps()` depender de `Math.random()`, `Date.now()` ou do DOM.
- Não "conserte" o destaque de linha mudando só uma linguagem: confira Java e C.
- Não apague o shim `src/theme.ts` nem o alias `viz` sem concluir a migração do tema.
- Não commite `dist/`, `dump.txt` ou scripts de automação obsoletos.
- Não use `any` para calar o TypeScript; prefira tipar o contrato ou usar `unknown` + validação.
- Não reescreva textos didáticos, títulos ou descrições sem que a tarefa peça isso.
