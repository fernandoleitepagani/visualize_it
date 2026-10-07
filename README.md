# Algoritmos — visualizações passo a passo

Site estático que mostra algoritmos clássicos em execução: barras animadas,
código em Java e C, e análise assintótica lado a lado.

## Estrutura

```
index.html              → menu
pages/                  → uma página por algoritmo
assets/css/style.css    → tema único (preto + âmbar)
assets/js/page.js       → bootstrap de cada página
assets/js/registry.js   → catálogo de algoritmos
assets/js/algorithms/   → um módulo por algoritmo
```


## Adicionar um algoritmo novo

1. Crie `assets/js/algorithms/meu_algo.js` exportando um objeto com o
   formato do `ALGORITHMS` (id, title, complexity, code, steps).
2. Importe-o em `assets/js/registry.js` e registre no mapa.
3. Crie `pages/meu_algo.html` (copie qualquer página existente e mude
   `data-algo` e `<title>`).
4. Adicione um card no `index.html`.

O motor (Player, renderBars, renderCode) já cuida do resto.

## Deploy no GitHub Pages

1. Push para um repositório público.
2. Settings → Pages → Deploy from branch → `main` / root.
3. O `.nojekyll` já está lá para o Pages não mexer nos arquivos.

## Licença

Uso educacional.
