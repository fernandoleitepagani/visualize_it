# Visualize It

Visualizador interativo de algoritmos, estruturas de dados e análise de complexidade. Cada
visualização mostra o passo a passo do algoritmo com animação, código em Java ou C lado a lado com
a linha executada, variáveis do passo e a tabela de complexidade assintótica.

Deploy no [Vercel](https://vercel.com).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 |
| Linguagem | TypeScript 6 (strict) |
| Build | Vite 8 |
| Estilo | Tailwind CSS 4 |
| Rotas | React Router 7 |
| Testes | Vitest + Testing Library |
| Lint/Format | ESLint 9 (flat) + Prettier |
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
│   ├── lib/                     # utilitários (cx, lines)
│   ├── pages/                   # HomePage, LessonPage, TheoryPage, NotFound
│   ├── styles/index.css         # Tailwind + tokens do tema
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
| `npm run format` | Prettier |
| `npm test` | Vitest (uma execução) |
| `npm run test:watch` | Vitest em modo watch |

---

## Adicionando um algoritmo

1. Crie `src/content/lessons/<slug>.ts` exportando `export const lesson: Lesson = { … }`
   (copie um existente da mesma `view`).
2. Registre o `slug` em `src/content/lessons/index.ts`.
3. Adicione um card ao array correspondente em `src/content/catalog.ts`.

Nenhum componente precisa mudar.

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
