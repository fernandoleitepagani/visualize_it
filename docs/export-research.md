# Exportação da animação (GIF/SVG) — decisão

**Status:** aceito (spike) · **Contexto:** issue #22

## Pergunta

Como exportar a lição atual (vetor + passos) para um arquivo compartilhável em slides e redes
sociais, sem bloquear a interface?

## Opções avaliadas

| Opção | Como funciona | Prós | Contras |
|---|---|---|---|
| **gif.js** no navegador | captura frames do DOM (ex.: `html2canvas`) e codifica em um Web Worker | GIF é universal | pesado; `html2canvas` não lida bem com `color-mix`, variáveis CSS e sombras; paleta e arquivo grandes |
| **SVG** gerado a partir de `Step[]` | cada view desenha um frame em SVG; os frames viram um arquivo (ou uma animação SMIL) | leve, escalável, determinístico, sem dependências novas | exige um renderizador por view; SVG é estático/animação limitada |
| **ffmpeg** offline/CI | gera vídeo/GIF a partir de screenshots | melhor qualidade | não roda no navegador; precisa de servidor/CI; não é compartilhável na hora |

## Decisão

Começar por **SVG gerado a partir de `Step[]`**, não por captura de tela.

Motivos:

- O motor já entrega `Step[]` puro e cada view (`bars`, `cells`, `nodes`, `plot`) já sabe desenhar
  um passo — não é preciso capturar pixels.
- Não depende de `html2canvas` nem de estilos computados, então o resultado é o mesmo nos temas
  claro e escuro.
- O arquivo é pequeno e abre em qualquer navegador ou editor de slides.

## Próximos passos (fora deste spike)

1. `src/lib/exportSvg.ts`: `lesson + input + view → string SVG` (um frame por passo, com legenda).
2. Botão **Exportar SVG** no player, ao lado de **Copiar link**.
3. GIF continua possível no futuro: pode ser montado a partir dos SVGs no cliente (com `gif.js`),
   sem `html2canvas`.
4. `ffmpeg` apenas se houver necessidade de vídeo para redes — nesse caso, gerar no CI.

## Fora de escopo

- Exportação em vídeo.
- Embutir a fonte no SVG (usar `font-family` monoespaçada do sistema).
