# Contribuindo

Guia de contribuição do **Visualize It** — visualizador interativo de algoritmos, estruturas de
dados e análise de complexidade.

## Stack

React 19 · TypeScript 6 · Vite 8 · Mantine 9 · React Router 7 · Vitest

## Antes de começar

Requer Node.js 20.19+ ou 22.12+.

```bash
npm ci
npm run dev      # http://localhost:5173
npm run lint
npm test
npm run build
```

## Regras de ouro

1. **Nunca commite direto na `main`.** Todo trabalho entra por pull request.
2. **PR pequeno**, com CI verde, issue linkada e o template preenchido.
3. **Uma lição nova não altera `src/engine/` nem `src/components/`.** Se precisar, abra antes uma
   issue de "nova view".
4. **UI em português; código, nomes e comentários em inglês.**

## Branches

Crie a branch a partir da `main` atualizada:

| Prefixo | Uso |
|---|---|
| `feat/<slug>` | Funcionalidade |
| `fix/<slug>` | Correção |
| `chore/<slug>` | Tooling, dependências, configuração |
| `docs/<slug>` | Documentação |

Uma branch por PR. Se o PR ainda estiver aberto, continue na mesma branch em vez de criar outra.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add summation plot view
fix(player): clamp the step index
docs: document how to add a lesson
refactor: extract state colour helper
test: cover usePlayback looping
chore: bump Mantine
```

Mantenha o commit pequeno e com uma intenção clara.

## Pull requests

1. `git checkout main && git pull --ff-only`
2. `git checkout -b feat/<slug>`
3. Implemente a mudança e os testes correspondentes.
4. Rode `npm run lint`, `npm test` e `npm run build`.
5. Abra o PR para `main`, preencha o template e linke as issues no corpo:
   `Closes #12`
6. Aguarde o CI verde e a revisão. Não faça merge sozinho.

## Estilo de código

- TypeScript strict. Imports de tipo usam `import type` (regra
  `@typescript-eslint/consistent-type-imports`).
- Rode `npm run lint` antes do push; `npm run lint:fix` corrige o que for automático.
- **Prettier não faz parte do projeto.** Foi removido de propósito: não está no caminho de
  lint/test/build e o ESLint não aplica regras de formatação.
- Use os componentes do Mantine e o tema em `src/theme.ts`. Não hardcode cores fora do tema/paleta.

## Adicionando uma lição

O passo a passo completo está no README, em **"Adicionando um algoritmo"**. Resumo:

1. Crie `src/content/lessons/<slug>.ts` exportando uma `Lesson`.
2. Registre o slug em `src/content/lessons/index.ts`.
3. Adicione o card em `src/content/catalog.ts`.
4. `steps()` deve ser uma função pura (sem DOM) e coberta por
   `src/content/lessons/lessons.test.ts`.

As views existentes são `bars`, `cells` e `nodes`. Criar uma **view** nova é uma mudança de
arquitetura: exige `src/engine/types.ts`, `src/components/` e uma issue própria — não a esconda
dentro de uma lição.

## Dúvidas e problemas

Abra uma issue usando o template de **bug** ou **task** em `.github/ISSUE_TEMPLATE/`.
