# Guia de UI — Living Graph Paper

**Público:** desenvolvedores e agentes de IA que alteram a interface.
**Fonte da verdade:** `src/theme/tokens.ts` + `src/styles/index.css` + este guia.
**Última atualização:** 2026-10-21

Este documento explica a linguagem visual do Visualize It, os tokens, os dois temas, as cores por
matéria e como implementar UI sem quebrar a coerência entre páginas.

> Leia também `AGENTS.md` (contrato operacional) e `CONTEXT.md` (estado atual). Em caso de conflito,
> o código vence; atualize este guia e o `CONTEXT.md` na mesma tarefa.

---

## 1. Princípios

1. **Papel quadriculado vivo.** Grade fina de 28 px (112 px nas linhas maiores), superfícies de
   papel quente no claro e preto grafite no escuro.
2. **Código e matemática como identidade.** Sans do sistema para leitura; mono do sistema para
   código, números, kickers e notação (`Θ`, `O`, `Ω`, `Σ`).
3. **Uma cor de ação global + uma cor por matéria.** O âmbar é a assinatura da home e das ações
   globais. Cada matéria tem seu próprio acento, herdado por suas páginas.
4. **Formas orgânicas, movimento com peso.** Raios grandes, hairlines que somem nas pontas, curvas
   em SVG e transições spring. Nada de animação gratuita.
5. **Temas claro e escuro são cidadãos iguais.** Toda cor dependente do esquema passa por variável
   CSS; não existe “modo escuro principal” com o claro remendado.
6. **Acessibilidade faz parte do visual.** Contraste, foco visível, rótulos, `aria-live` e
   `prefers-reduced-motion` não são opcionais.

---

## 2. Arquitetura visual

| Arquivo | Papel |
|---|---|
| `src/theme/tokens.ts` | Fonte única: paletas, tipografia, espaço, raio, sombra, movimento, `vizVar`, `subjectAccent`, `theme` Mantine e `cssVariablesResolver`. |
| `src/theme.ts` | Shim de re-exportação de `@/theme`. **Não apague** sem migrar todos os imports. |
| `src/main.tsx` | Providers: `MantineProvider` + `cssVariablesResolver` + Router. |
| `src/styles/index.css` | Shell, grade, cards, workbench, motion e refinamentos sobre o Mantine. Consome `--viz-*`; não mantém paleta paralela. |
| `src/test/render.tsx` | Provider de testes com o mesmo resolver. |
| `.storybook/preview.tsx` | Provider do Storybook com o mesmo resolver. |
| `src/components/` | Primitivas e páginas compartilhadas. |

O resolver **precisa** ser passado em todos os providers. Sem ele, as variáveis `--viz-*` não
existem e os componentes ficam sem cor.

---

## 3. Temas e cores

### 3.1 Esquemas

O tema inicial segue `prefers-color-scheme` e a escolha fica em
`localStorage` (`visualize-it:color-scheme`). O botão no header alterna claro/escuro.

| Token | Dark | Light |
|---|---|---|
| Canvas | `#000000` | `#f6f3ea` |
| Painel / superfície | `#070707` | `#fffdf7` |
| Superfície 2 | `#0d0d0d` | `#f1ece0` |
| Texto principal | `#f2f2ef` | `#1c211d` |
| Texto secundário | `#94948e` | `#5c655c` |
| Acento global (âmbar) | `#fbbf24` | `#8a5a00` |
| AEDS I | `#7aa2ff` | `#1d4ed8` |
| AEDS II | `#5eead4` | `#0f766e` |
| Análise | `#c084fc` | `#6d3fc0` |

O âmbar claro é mais escuro de propósito: `#fbbf24` sobre papel não passa contraste de texto.

### 3.2 Tokens de cor

- `palette` / `lightPalette`: cores dos dois esquemas.
- `vizVar.*`: aliases para `var(--viz-*)`, usados em estilos inline.
- `subjectAccent.{blue,teal,violet}`: aliases para os acentos de matéria.
- `tint(color, percent)`: mistura translúcida via `color-mix`.

**Regra:** componentes não usam hex/rgba diretos. Use `vizVar`, `palette` (apenas para montar o
tema) ou `var(--viz-*)` no CSS. Para cores de matéria, use
`var(--subject-accent, var(--viz-accent))`.

### 3.3 Variáveis CSS principais

| Variável | Uso |
|---|---|
| `--viz-canvas` | Fundo da aplicação |
| `--viz-panel` | Fundo de painéis/cards |
| `--viz-surface` … `--viz-surface-4` | Camadas de superfície |
| `--viz-line`, `--viz-line-2`, `--viz-line-3` | Bordas e divisores |
| `--viz-ink`, `--viz-ink-2` | Texto |
| `--viz-muted`, `--viz-dim`, `--viz-faint` | Texto auxiliar e elementos discretos |
| `--viz-accent` | Âmbar global |
| `--viz-accent-ink` | Texto sobre o âmbar |
| `--viz-accent-soft`, `--viz-accent-line`, `--viz-accent-dim` | Fundos, bordas e tom escuro |
| `--viz-green`, `--viz-green-soft` | Aliases semânticos do âmbar (não são verdes) |
| `--viz-purple`, `--viz-purple-soft` | Pivô e informação |
| `--viz-danger` | Erros |
| `--viz-grid`, `--viz-grid-major` | Grade de papel |
| `--viz-code-bg`, `--viz-code-ink`, `--viz-code-keyword`, `--viz-code-number`, `--viz-code-comment`, `--viz-code-string` | Código |
| `--subject-accent` | Acento da matéria atual (definido pela página) |
| `--subject-accent-ink` | Texto sobre o acento da matéria |
| `--viz-subject-blue`, `--viz-subject-teal`, `--viz-subject-violet` | Valores dos acentos por matéria |
| `--viz-shadow-panel`, `--viz-shadow-lift`, `--viz-shadow-deck` | Sombras compartilhadas |
| `--viz-radius-card`, `--viz-radius-control` | Raios compartilhados |

**Importante:** `--viz-green` e `palette.success` são aliases do âmbar. O site não usa verde.

### 3.4 Cores de estado da visualização

As views são didáticas e usam cores globais, independentes da matéria:

| Estado | Cor |
|---|---|
| `cmp` / comparação | âmbar |
| `swap` / troca | âmbar (alias de sucesso) |
| `active` / `write` | âmbar |
| `pivot` | violeta (`--viz-purple`) |
| `sorted` | âmbar escuro (`--viz-accent-dim`) |
| `terminator` | `\0` com borda tracejada (`--viz-line-3`) |
| `diff` | vermelho de diferença (`--viz-danger`) |
| `dim` | cinza (`--viz-dim`) |

Na `PointersView`, leitura (`compare`) usa violeta e escrita/atividade usa âmbar. Cada seta é
desenhada a partir do `targetId` da caixa; alvos ausentes não geram seta. Cadeias com várias setas,
como `pp → p → x`, usam pistas (`data-lane`) separadas para não se sobrepor.

Na `CallStackView`, o quadro ativo usa âmbar, os que aguardam usam cinza (`--viz-dim`) e o retorno
usa violeta. O topo aparece primeiro, cada quadro separa parâmetros de locais e o estado também
está escrito no cabeçalho do quadro. Ao receber um retorno, o chamador mostra `recebeu X` em texto.

Não codifique estado apenas por cor: use também legenda, rótulos e a descrição do passo.

---

## 4. Cores por matéria

Cada matéria tem um acento próprio. A **home usa o âmbar global**; páginas de matéria, lições e
teoria herdam o acento da matéria.

| Matéria | Chave (`Subject.accent`) | Dark | Light |
|---|---|---|---|
| AEDS I | `blue` | `#7aa2ff` | `#1d4ed8` |
| AEDS II | `teal` | `#5eead4` | `#0f766e` |
| Análise | `violet` | `#c084fc` | `#6d3fc0` |

### 4.1 Como a página define o acento

`SubjectPage`, `LessonPage` e `TheoryPage` envolvem o conteúdo em um `Box` que define as variáveis:

```tsx
const accent = subjectAccent[subject.accent];

<Box
  style={
    {
      '--subject-accent': accent,
      '--subject-accent-ink': 'var(--viz-subject-ink)',
    } as CSSProperties
  }
>
  …
</Box>
```

A home **não** define `--subject-accent`; por isso seus elementos caem no fallback âmbar.

### 4.2 Como consumir

```ts
const accent = 'var(--subject-accent, var(--viz-accent))';

// borda/realce
border: `1px solid color-mix(in srgb, ${accent} 34%, transparent)`,
background: `color-mix(in srgb, ${accent} 12%, transparent)`,
color: accent,
```

```css
.section-index {
  color: var(--subject-accent, var(--viz-accent));
}
```

Use esse padrão em **chrome de página**: cabeçalho, índice de seção, filtros ativos, tags, setas de
cards, ícones de painel, linha ativa do código, variáveis alteradas, narração, timeline e
botão primário. Estados de dados continuam nas cores globais da seção 3.4.

### 4.3 Adicionar uma nova matéria com acento

1. Adicione a chave em `subjectAccent` e em `SubjectAccent` (`src/theme/tokens.ts`).
2. Emita os valores dark/light no `cssVariablesResolver`.
3. Use a chave em `Subject.accent` (`src/content/subjects.ts`).
4. Atualize `subjects.test.ts` (acentos únicos) e `tokens.test.ts`.
5. Confira as páginas de matéria/lição/teoria nos dois temas.

Nunca reutilize o âmbar para uma matéria; ele é reservado à home e às ações globais.

---

## 5. Tipografia

- **Sans:** pilha do sistema (`ui-sans-serif, system-ui, …`) para leitura, títulos e UI.
- **Mono:** pilha do sistema (`ui-monospace, …`) para código, números, tags, kickers, índices,
  legendas e notação matemática.
- Não adicione fontes customizadas ou `@fontsource` sem decisão explícita.

Escala em `font`:

| Token | px | Uso |
|---|---|---|
| `micro` | 10.5 | Kickers, legendas, índices |
| `tiny` | 11.5 | Metadados, tags |
| `small` | 13 | Texto compacto, listas |
| `body` | 15 | Corpo padrão |
| `lead` | 17 | Narração, subtítulos |
| `h3` | 20 | Títulos de seção/card |
| `h2` | 26 | Título de página no mobile |
| `h1` | 34 | Título de página |
| `display` | `clamp(2.35rem, 4.6vw, 3.6rem)` | Hero da home |

Use `ff="monospace"` apenas onde o texto é código/número. Títulos e prosa em sans.

---

## 6. Espaço, forma e sombra

- `space`: `xxs 2`, `xs 4`, `sm 8`, `md 12`, `lg 16`, `xl 24`, `xxl 40`, `huge 64`.
- `radius`: `xs 4`, `sm 8`, `md 12`, `lg 18`, `xl 24`, `xxl 32`, `pill 999`.
- Cards e painéis: `radius="xl"`, borda `--viz-line`, sombra `--viz-shadow-panel`.
- Controles: `radius="md"` ou pill para chips.
- Hairlines: `flow-rule` ou gradiente que some nas pontas; evite bordas duras de ponta a ponta.
- Não empilhe sombras ou bordas fortes; use uma camada de profundidade por superfície.

---

## 7. Componentes e primitivas

| Componente | Uso |
|---|---|
| `Panel` | Chrome de painel: header com ícone, label mono, `aside`, corpo flex e footer opcional. |
| `PageHeader` | Breadcrumb, kicker, título, subtítulo, meta pills, ações e régua com acento. |
| `SectionHeading` | Índice mono + título + `count` + régua. Use `id` para `aria-labelledby`. |
| `MetaPill` | Tag mono. `tone="subject"` segue a matéria; `accent`, `purple`, `danger` são globais; `green` é alias do âmbar. |
| `Breadcrumbs` | Navegação acessível com `aria-current="page"`. |
| `ViewLegend` | Legenda compartilhada das views. |
| `MatrixView` | Grade 2D com realce cruzado de linha/coluna, coordenadas e rótulos; usada por vetores/matrizes. |
| `StringsView` | Fileiras de caracteres para lições de string: índices, ponteiros, terminador `\0`, setas de cópia/concatenação e resultado. |
| `PointersView` | Caixas de memória para lições de ponteiro: tipo, nome, endereço, valor, setas por `targetId` e estados de leitura/escrita. |
| `ObjectView` | Moldes de classe, instâncias, ponteiros, chamadas e exceções para lições de POO em C++. |
| `LoopView` | Tracker de laço: iteração, condição e acumulador para `for`, `while` e `do-while`. |
| `CallStackView` | Pilha de chamadas para funções/recursão: quadros com parâmetros, locais, estado, valor de retorno e valor recebido da chamada interna; topo primeiro. |
| `AlgorithmCard` / `SubjectCard` | Cards de catálogo/home. Já definem `--subject-accent` e `--card-glow`. |
| `ViewPreview` | Miniatura da view; herda o acento da matéria via `--subject-accent`. |
| `CodePanel` | Código Java/C com linha ativa, highlighter e rodapé. |
| `PlayerControls` | Timeline + transporte + progresso + velocidade + quiz + atalhos + link. |
| `ShortcutsModal` | Lista acessível de atalhos de teclado. |
| `ReportIssueLink` | Link para issue pré-preenchida no GitHub. |
| `TimelineBar` | Mapa clicável de passos com preview da operação. |
| `VarsPanel` | Variáveis do passo com destaque de mudança. |
| `icons.tsx` | SVGs inline; não use emojis/glyphs como ícones. |

### 7.1 Linguagens por lição

`Lesson.languages` define quais abas de código aparecem. O padrão é `['java', 'c']`; lições de
AEDS I usam somente `['c']` ou `['cpp']` e não têm listagem Java. `Lesson.inputless` esconde a
toolbar de entrada em módulos conceituais (OOP, structs, memória). `CodePanel` recebe `languages` e esconde o
seletor quando há apenas uma opção. `lang` e `approach` também entram na URL compartilhável.

### 7.2 Receitas

**Painel**

```tsx
<Panel label="código" icon={<CodeIcon size={13} />} aside={<SegmentedControl … />}>
  …
</Panel>
```

**Cabeçalho de página**

```tsx
<PageHeader
  breadcrumb={[{ label: 'Início', to: '/' }, { label: subject.title }]}
  kicker="matéria"
  title={subject.title}
  subtitle={subject.description}
  accent={accent}
  meta={<MetaPill>18 lições</MetaPill>}
/>
```

**Seção**

```tsx
<SectionHeading id="grupo-ordenacao" index="01" count={9}>
  Ordenação
</SectionHeading>
```

**Chip de filtro ativo**

```tsx
<Button
  variant="default"
  style={
    active
      ? {
          borderColor: accent,
          background: `color-mix(in srgb, ${accent} 12%, transparent)`,
          color: accent,
        }
      : undefined
  }
/>
```

Não coloque lógica de página dentro de `Panel`, `MetaPill` ou `SectionHeading`; elas são
apresentacionais.

---

## 8. Padrões de página

### Home

- Sem wrapper de matéria; usa o âmbar global.
- Hero com `HeroFigure`, busca global e `SectionHeading`.
- Subject cards mostram o acento de cada matéria (é a identidade do card), mas o acento da home é
  o âmbar.

### Matéria

- Wrapper com `--subject-accent` da matéria.
- `PageHeader` + `AlgorithmBrowser`.
- Filtros ativos, índices de grupo, tags e previews usam o acento da matéria.

### Lição

- Wrapper com `--subject-accent`.
- `PageHeader` com meta pills (a complexidade usa `tone="subject"`).
- Grid 1.14/0.86 no desktop; abas abaixo de 62em.
- O player usa o acento da matéria no botão primário e timeline; os estados da view
  continuam globais.

### Teoria

- Wrapper com `--subject-accent`; `PageHeader` e `§` das seções usam o acento.
- Prosa em sans, 16 px/1.78, largura de 72–74ch; código em mono com o highlighter compartilhado.

### Comparar algoritmos

- Rota `/comparar`, acessível pelo CTA da página de AEDS II.
- Usa a mesma entrada e conta **passos, comparações e trocas** a partir de `Step[]`; nunca mede
  tempo de animação.
- Bucket Sort fica de fora porque espera valores em `[0, 1)`.
- Tabela é a fonte acessível; barras são decoração `aria-hidden`.

### Playground e 404

- Sem matéria; usam o âmbar global.

---

## 9. Movimento

- Tokens em `transition`: `fast`, `base`, `slow`, `spring`, `pop`.
- Classes: `page-enter`, `viz-step-desc`, `viz-var-changed`, `viz-pointer-badge`, `hero-bar`,
  `hero-curve`, `viz-preview-bar`.
- Animações usam `transform`, `opacity` e cores; evite animar layout.
- `prefers-reduced-motion` é tratado globalmente e nas views. Toda animação nova precisa funcionar
  sem movimento.
- Atalhos da lição: `←`/`→`, espaço, `Home`, `End`, `R`, `N`, `+`/`-` e `?`. O modal é acessível
  pelo botão de teclado no player e ignora eventos quando o foco está em campos/controles.

---

## 10. Responsividade

- Container do shell: **1600 px**; header **64 px**.
- Desktop: lição em grid 1.14/0.86; código e visualização lado a lado.
- `≤ 75.99em`: player empilha transporte/progresso/velocidade.
- `≤ 61.99em`: lição em coluna única, abas, hero em coluna única, player vira dock sticky.
- `≤ 40em`: input de valores ocupa a linha inteira, canvas reduz a altura mínima e presets rolam
  horizontalmente.
- `≤ 26em`: transporte compacto.
- Use `nowrap` + rolagem com fade (`scroll-fade-x`) para listas de células/nós; não quebre a
  linearidade da estrutura.

---

## 11. Acessibilidade

- Títulos semânticos (`h1` único por página) e `aria-labelledby` nas seções.
- A descrição do passo usa `aria-live="polite"`.
- Controles com `aria-label`; ícones decorativos com `aria-hidden`.
- Foco visível global (`:focus-visible`); skip link no shell.
- Estado nunca só por cor: legenda + rótulos + texto.
- Dicas e curiosidades ficam em `src/content/insights.ts`; não alteram o contrato de `Lesson`.
- Contraste: verificações manuais nos dois temas; o âmbar claro é escuro de propósito.
- `prefers-reduced-motion` desliga animações e transições.
- Atalhos da lição: `←/→`, espaço, `Home`, `End`, `R`, `N`, `+/-` e `?`; não capture teclas quando o
  foco está em campos/botões/links.

---

## 12. Testes e validação

Antes de concluir qualquer mudança de UI:

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

- Testes de UI usam `renderWithProviders`, que já injeta tema + resolver + router.
- Storybook usa o mesmo resolver em `.storybook/preview.tsx`.
- Novos tokens/cores: cubra em `src/theme/tokens.test.ts`.
- Novos padrões de página: teste comportamento observável, não animação/tempo.
- Comparação: teste `countRunMetrics` e a página `/comparar`; insights: valide as chaves contra o
  registro de lições; código C-only: valide `step.line` contra a listagem declarada.
- QA visual: rotas de matéria, lição (`bars`, `cells`, `nodes`, `plot`, `matrix`, `strings`, `pointers`, `callstack`), teoria, playground e 404;
  larguras 390, 768, 1024 e 1440; temas claro e escuro.

---

## 13. Checklist para agentes de IA

1. Leia `AGENTS.md`, `CONTEXT.md` e este guia antes de mexer em UI.
2. Reutilize `Panel`, `PageHeader`, `SectionHeading`, `MetaPill` e os tokens; não crie um segundo
   sistema visual.
3. Não adicione Tailwind, Prettier, fonte customizada ou biblioteca de animação.
4. Não use hex/rgba em componentes; use `vizVar`/`--viz-*`/`--subject-accent`.
5. Preserve rótulos, roles, `aria-*` e textos didáticos existentes.
6. Mantenha paridade claro/escuro e `prefers-reduced-motion`.
7. Rode lint, testes, typecheck e build.
8. Atualize `CONTEXT.md` e este guia quando criar/alterar tokens, componentes ou padrões.

### Anti-padrões

- Card com fundo escuro fixo no tema claro.
- Título de card herdando azul de `<a>`.
- Verde “de sucesso” — o alias é âmbar.
- Acento de matéria em estado de dados (`cmp`/`swap`/`pivot`).
- `position: fixed` no player mobile; use sticky + safe area.
- Animação que depende de tempo real em teste.
- `any` para calar o TypeScript.

---

## 14. Seção Vim

A seção `/vim` usa a identidade global da home (âmbar, papel quadriculado, mono), sem acento de
matéria próprio.

| Elemento | Regra |
|---|---|
| Painel do buffer | `Panel` com `label="buffer"`, `footer` de statusline; fundo `--viz-code-bg` |
| Cursor normal | bloco âmbar com texto `--viz-accent-ink` |
| Cursor insert | barra de 2 px âmbar; pisca com `vim-blink`, desligada por `prefers-reduced-motion` |
| Seleção visual | `color-mix` do âmbar a 26%; linha inteira a 14% |
| Busca | `--viz-purple` a 24% |
| Foco normal | anel interno `--viz-accent-line` via `:focus-within` |
| Foco insert | anel interno violeta (`--viz-purple` a 55%) |
| Sem foco | overlay central com `backdrop-filter: blur(5px)`, fundo `--viz-canvas` a 42%, card em `--viz-panel`; clicar devolve o foco ao `textarea` |
| Cheatsheet | 2 colunas; linha com `grid-template-columns: minmax(72px, auto) 1fr`; keycaps `Kbd` 11.5, rótulo 13 em `--viz-ink-2`; um "praticar" por grupo |
| Trilha de desafios | grade 6×2 de chips; ativo com `--viz-accent-soft` e `--viz-accent-line` |
| Teclas tocáveis | 3 grupos (mover, modos, editar), `Button` `variant="default"` mono, visíveis abaixo de 62em ou em ponteiro grosso; deck sticky no mobile |

Não crie uma paleta paralela: qualquer estado novo da seção deve reutilizar `--viz-*`. O texto do
buffer é mono; rótulos e instruções seguem a tipografia do site. O conteúdo é pt-BR, os comandos Vim
ficam em inglês (`NORMAL`, `INSERT`, `:w`, `:q`).

## 15. Referência rápida

```ts
import {
  palette,
  lightPalette,
  space,
  radius,
  font,
  sans,
  mono,
  shadow,
  transition,
  vizVar,
  subjectAccent,
  tint,
  theme,
  cssVariablesResolver,
} from '@/theme';
```

```tsx
const accent = subjectAccent[location.subject.accent];
const chrome = 'var(--subject-accent, var(--viz-accent))';
```

```css
.surface {
  background: var(--viz-panel);
  border: 1px solid var(--viz-line);
  border-radius: var(--viz-radius-card);
  box-shadow: var(--viz-shadow-panel);
  color: var(--viz-ink);
}
```

Dúvidas de arquitetura: consulte `CONTEXT.md`. Contrato para agentes: `AGENTS.md`.
