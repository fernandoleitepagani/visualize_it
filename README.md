# Visualize It

Visualizador interativo de algoritmos, estruturas de dados e análise de complexidade. Cada
visualização mostra o passo a passo do algoritmo com animação, código em Java ou C lado a lado com
a linha executada, variáveis do passo e a tabela de complexidade assintótica.

[![CI](https://github.com/fernandoleitepagani/visualize_it/actions/workflows/ci.yml/badge.svg)](https://github.com/fernandoleitepagani/visualize_it/actions/workflows/ci.yml)

Deploy no [Vercel](https://vercel.com).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 |
| Linguagem | TypeScript 6 (strict) |
| Build | Vite 8 |
| UI | Mantine 9 (tema dark + âmbar) |
| Fonte | JetBrains Mono (self-hosted) |
| Rotas | React Router 7 |
| Testes | Vitest + Testing Library |
| Lint | ESLint 10 (flat) |
| Hospedagem | Vercel |

---

## Estrutura

```
.
├── src/
│   ├── app/App.tsx              # tabela de rotas
│   ├── components/              # BarsView, CellsView, NodesView, CodePanel, PlayerControls, …
│   ├── content/
│   │   ├── catalog.ts           # seções e cards da página inicial
│   │   ├── lessons/             # um arquivo por algoritmo + index.ts (registro)
│   │   └── theory/              # artigos (Complexidade, Provas por Indução)
│   ├── engine/
│   │   ├── types.ts             # Lesson, Step, Cell, Node…
│   │   ├── elementIds.ts        # identidade estável dos elementos (animação de troca)
│   │   └── usePlayback.ts       # play/pause/prev/next/velocidade
│   ├── lib/                     # utilitários (lines)
│   ├── pages/                   # HomePage, LessonPage, TheoryPage, NotFound
│   ├── styles/index.css         # estilos base sobre o CSS do Mantine
│   ├── test/                    # helpers de render + setup do Vitest
│   ├── theme.ts                 # tema Mantine (paleta dark/âmbar, tipografia)
│   └── main.tsx
├── index.html
├── vercel.json
└── vite.config.ts
```

### Como uma visualização é modelada

Cada algoritmo é **dado puro + uma função pura**, em `src/content/lessons/<slug>.ts`:

```ts
export const lesson: Lesson = {
  id: 'selecao',
  title: 'Selection Sort',
  view: 'bars',                 // 'bars' | 'cells' | 'nodes'
  initial: [7, 3, 9, 1, 5, 8, 2],
  complexity: { time: { best: 'Θ(n²)' /* … */ }, space: 'Θ(1)', stable: false },
  code: { java: [...], c: [...] },
  steps: (input) => [{ line: 0, desc: '…', arr: [...], cmp: [0, 1] }],
};
```

`steps()` devolve a lista de quadros da animação; o player só percorre essa lista. Como é pura, dá
para testar sem navegador. O registro em `src/content/lessons/index.ts` liga o slug à lição.

As três visões reaproveitam o mesmo motor:

| `view` | Usado por | Payload do passo |
|---|---|---|
| `bars` | ordenação e busca | `arr`, `cmp`, `swap`, `pivot`, `sorted`, `dim` |
| `cells` | estruturas em vetor e laços | `cells: [{ val, labels, state }]` |
| `nodes` | estruturas encadeadas | `nodes: [{ id, val, prev, next, labels, state }]` |

---

## Rodando localmente

Requer Node.js 20.19+ ou 22.12+ (Vite 8).

```bash
npm install
npm run dev      # http://localhost:5173
```

### Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (HMR) |
| `npm run build` | Type-check (`tsc -b`) + build em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint com correções automáticas |
| `npm run typecheck` | Type-check (`tsc -b`) |
| `npm test` | Vitest (uma execução) |
| `npm run test:watch` | Vitest em modo watch |

### Tema e atalhos

Na primeira visita o tema segue `prefers-color-scheme`; a escolha fica salva em `localStorage`.
Use o botão ☀/☾ no cabeçalho para alternar entre claro e escuro.

Na página de uma lição:

| Tecla | Ação |
|---|---|
| `←` / `→` | passo anterior / próximo |
| `Espaço` | executar / pausar |
| `Home` | voltar ao primeiro passo |

As teclas são ignoradas enquanto o foco está no campo de valores. As transições são desativadas
quando o sistema pede `prefers-reduced-motion`.

---

## Adicionando um algoritmo

1. Crie `src/content/lessons/<slug>.ts` exportando `export const lesson: Lesson = { … }`
   (copie um existente da mesma `view`).
2. Registre o `slug` em `src/content/lessons/index.ts`.
3. Adicione um card ao array correspondente em `src/content/catalog.ts`.

### Exemplo completo — soma dos elementos

`src/content/lessons/soma.ts`:

```ts
import type { Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

export const lesson: Lesson = {
  id: 'soma',
  title: 'Soma dos elementos',
  view: 'bars',
  initial: [4, 7, 2, 9],
  complexity: { time: { best: 'Θ(n)', avg: 'Θ(n)', worst: 'Θ(n)' }, space: 'Θ(1)' },
  code: {
    java: lines(`
      int soma(int[] v) {
          int total = 0;
          for (int i = 0; i < v.length; i++) {
              total += v[i];
          }
          return total;
      }`),
    c: lines(`
      int soma(int v[], int n) {
          int total = 0;
          for (int i = 0; i < n; i++) {
              total += v[i];
          }
          return total;
      }`),
  },
  steps: (input) => {
    const steps: Step[] = [{ line: 1, desc: 'total = 0', arr: input }];
    let total = 0;
    input.forEach((value, i) => {
      total += value;
      steps.push({
        line: 3,
        desc: `total += ${value} → ${total}`,
        arr: input,
        cmp: [i],
        vars: { total },
      });
    });
    return steps;
  },
};
```

Registre em `src/content/lessons/index.ts`:

```ts
import { lesson as soma } from './soma';

export const lessons = {
  // …
  soma,
} satisfies Record<string, Lesson>;
```

Nenhum componente precisa mudar.

---

## Compartilhando um estado

Cada lição aceita dois parâmetros na URL:

```
/algoritmos/selecao?arr=5,2,9,1,7&step=4
```

| Parâmetro | Significado |
|---|---|
| `arr` | valores do vetor, separados por vírgula (1–12 inteiros) |
| `step` | passo exibido, começando em **1** |

O player mantém a URL atualizada sem criar entradas no histórico, e o botão **Copiar link** copia o
estado atual. Parâmetros inválidos são ignorados e caem no estado padrão da lição.

O último vetor aplicado também é lembrado **por lição** em `localStorage`. Ao abrir um link, a URL
tem prioridade sobre o valor salvo.

---

## Quiz e playground

**Quiz** — nas lições de vetor (`bars`), ligue **quiz** no player. A cada passo você escolhe qual
vetor o próximo passo produz; o placar (`acertos / tentativas`) fica no painel. As opções erradas
vêm de trocas plausíveis no vetor atual.

**Playground** — em `/playground` você escreve `generateSteps(arr)` em JavaScript e vê o resultado
com o mesmo player. O código roda em um **Web Worker isolado** (sem acesso ao DOM) com timeout de
1,5 s, e o botão **Compartilhar** guarda o código na URL (`?code=`).

Formato mínimo de um passo:

```js
function generateSteps(arr) {
  return arr.map((value, i) => ({
    line: 0,
    desc: `passo ${i + 1}: ${value}`,
    arr,
    cmp: [i],
  }));
}
```

Campos aceitos: `arr`, `cmp`, `swap`, `pivot`, `sorted`, `dim`, `cells` e `nodes`.

---

## Hospedagem (Vercel)

O site é publicado no Vercel a cada push na `main`. É um SPA (React Router), então o `vercel.json`
reescreve todas as rotas para `/` e mantém **redirects 301** das URLs antigas do site estático:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "redirects": [
    { "source": "/index.html", "destination": "/", "permanent": true },
    { "source": "/pages/complexidade.html", "destination": "/teoria/complexidade", "permanent": true },
    { "source": "/pages/inducao.html", "destination": "/teoria/inducao", "permanent": true },
    { "source": "/pages/:slug.html", "destination": "/algoritmos/:slug", "permanent": true }
  ]
}
```

### Primeira configuração

1. Push do repositório no GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → importe `visualize_it`.
3. O Vercel detecta o Vite. Aceite os padrões:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Deploy.

### Domínio próprio

Vercel → **Project Settings → Domains**. Adicione o domínio e aponte os registros DNS conforme o
painel indica.

---

## Migração do site estático

As 20 visualizações originais foram convertidas para módulos TS tipados (a lógica de `steps()` foi
preservada). As páginas de teoria e os laços `while`/`do-while` (incompletos no original) foram
reescritos.

<!-- Projeto acadêmico — AEDS I/II -->
