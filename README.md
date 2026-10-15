# Visualize It

Visualizador interativo de algoritmos, estruturas de dados e análise de complexidade.
Cada página mostra o passo a passo de um algoritmo com animação, código em
Java ou C, e uma tabela de complexidade assintótica.

## Conteúdo

**Ordenação** — Selection Sort, Insertion Sort, Bubble Sort, Shellsort,
Quicksort, Mergesort, Heapsort, Counting Sort, Radix Sort.

**Busca** — Busca Sequencial, Busca Binária.

**Estruturas lineares** — Lista sequencial, lista encadeada, lista dupla,
pilha sequencial, pilha encadeada, fila circular, fila encadeada.

**Análise** — Complexidade (Θ / O / Ω) e provas por indução.

São 21 páginas no total, todas servidas como HTML estático.

## Estrutura do projeto

```
.
├── assets/
│   ├── css/
│   │   └── style.css              # única folha de estilo do site
│   └── js/
│       ├── algorithms/            # um script por algoritmo/página
│       └── viz.js                 # motor de animação compartilhado
├── pages/                         # uma página HTML por conteúdo
│   └── _template.html             # modelo base para novas páginas
├── .github/                       # templates de issue e PR
├── CONTRIBUTING.md
├── index.html                     # índice com todas as visualizações
├── README.md
└── vercel.json                    # configuração de deploy (Vercel)
```

Cada página é um HTML independente que carrega `assets/css/style.css` e o
script do algoritmo correspondente. Não há etapa de build: os arquivos são
servidos exatamente como estão no repositório.

## Rodando localmente

Não há build nem dependências para instalar. Basta servir a raiz do projeto
por HTTP (abrir `index.html` direto funciona, mas um servidor evita problemas
de caminho relativo):

```bash
# com Node instalado
npx serve .

# ou com Python
python3 -m http.server 5173
```

Depois abra [http://localhost:5173](http://localhost:5173).

## Deploy no Vercel

O site é publicado no [Vercel](https://vercel.com) a cada push na `main`. Por
ser estático, não há comando de build nem diretório de saída — o Vercel serve
os arquivos da raiz do repositório.

### Primeira configuração

1. Faça push do repositório no GitHub.
2. Acesse [vercel.com](https://vercel.com) e entre com o GitHub.
3. **Add New → Project** → importe o repositório `visualize_it`.
4. O Vercel detecta um site estático. Aceite os padrões:
   - **Framework Preset:** Other
   - **Build Command:** (vazio)
   - **Output Directory:** (vazio — raiz do repositório)
   - **Install Command:** (vazio)
5. Deploy.

### `vercel.json`

Diferente de uma SPA — que precisa reescrever todas as rotas para `/` para o
roteador do cliente funcionar, como no `fernandoleitepagani-portfolio` —, aqui
as páginas são arquivos HTML reais e não precisam de rewrite. A configuração
apenas ativa URLs limpas:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true
}
```

Com `cleanUrls`, `/pages/for.html` também responde em `/pages/for`; os links
internos que usam `.html` continuam funcionando (o Vercel redireciona).

### Domínio próprio

Vercel → **Project Settings → Domains**. Adicione o domínio e aponte os
registros DNS conforme indicado no painel.
