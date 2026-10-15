import { blockquote, h2, h3, inlineCode, li, ol, p, pre, table, td, th } from './prose';

export function Inducao() {
  return (
    <>
      <h2 className={h2}>Por que provar?</h2>
      <p className={p}>
        Testar um algoritmo com alguns vetores não garante que ele funcione para <em>todos</em> os
        casos. A prova por indução é a ferramenta padrão para mostrar que uma propriedade vale para
        qualquer entrada — por exemplo, que um algoritmo de ordenação sempre produz um vetor
        ordenado.
      </p>

      <h2 className={h2}>Indução matemática simples</h2>
      <p className={p}>
        Para mostrar que uma proposição <code className={inlineCode}>P(n)</code> vale para todo{' '}
        <code className={inlineCode}>n ≥ inicial</code>:
      </p>
      <ol className={ol}>
        <li className={li}>
          <strong>Passo base</strong> — mostrar que <code className={inlineCode}>P(inicial)</code> é
          verdadeira.
        </li>
        <li className={li}>
          <strong>Passo indutivo</strong> — assumir <code className={inlineCode}>P(k)</code> e
          mostrar que <code className={inlineCode}>P(k+1)</code> também é verdadeira.
        </li>
      </ol>
      <p className={p}>
        Se ambos valem, <code className={inlineCode}>P(n)</code> é verdadeira para todo{' '}
        <code className={inlineCode}>n ≥ inicial</code>.
      </p>

      <h3 className={h3}>Exemplo — soma de um vetor</h3>
      <p className={p}>Considere o código abaixo, que soma os elementos de uma lista:</p>
      <pre className={pre}>{`int soma = 0;
for (int i = 0; i < n; i++) {
  soma += lista[i];
}`}</pre>
      <p className={p}>
        <strong>Proposição P(n):</strong> após <code className={inlineCode}>n</code> iterações,{' '}
        <code className={inlineCode}>soma</code> contém a soma dos{' '}
        <code className={inlineCode}>n</code> primeiros elementos.
      </p>
      <p className={p}>
        <strong>Passo base (n = 0):</strong> nenhuma iteração,{' '}
        <code className={inlineCode}>soma = 0</code>. Verdadeiro.
      </p>
      <p className={p}>
        <strong>Passo indutivo:</strong> suponha <code className={inlineCode}>P(k)</code> — após{' '}
        <code className={inlineCode}>k</code> iterações,{' '}
        <code className={inlineCode}>soma = Σ lista[i]</code> para{' '}
        <code className={inlineCode}>i</code> de <code className={inlineCode}>0</code> a{' '}
        <code className={inlineCode}>k-1</code>. Ao executar mais uma iteração, somamos{' '}
        <code className={inlineCode}>lista[k]</code>:
      </p>
      <pre className={pre}>{`Σ(i=0..k-1) lista[i]  +  lista[k]  =  Σ(i=0..k) lista[i]`}</pre>
      <p className={p}>
        Ou seja, <code className={inlineCode}>P(k+1)</code> também vale. Por indução,{' '}
        <code className={inlineCode}>P(n)</code> vale para todo{' '}
        <code className={inlineCode}>n ≥ 0</code>.
      </p>

      <h2 className={h2}>Indução forte</h2>
      <p className={p}>
        Às vezes, provar <code className={inlineCode}>P(k+1)</code> precisa de mais do que apenas{' '}
        <code className={inlineCode}>P(k)</code> — pode ser necessário assumir <em>todos</em> os
        casos anteriores. Nesse caso usamos a indução forte:
      </p>
      <ol className={ol}>
        <li className={li}>
          <strong>Passo base</strong> — <code className={inlineCode}>P(inicial)</code> é verdadeira.
        </li>
        <li className={li}>
          <strong>Passo indutivo</strong> — assumir{' '}
          <code className={inlineCode}>P(inicial), P(inicial+1), …, P(k)</code> e mostrar{' '}
          <code className={inlineCode}>P(k+1)</code>.
        </li>
      </ol>
      <p className={p}>
        A indução forte é mais comum em algoritmos de divisão e conquista, como quicksort, mergesort
        e busca binária — onde o problema se decompõe em subproblemas que não são{' '}
        <code className={inlineCode}>k+1 → k</code>, mas sim{' '}
        <code className={inlineCode}>n → n/2</code>.
      </p>

      <h3 className={h3}>Exemplo — busca binária</h3>
      <p className={p}>
        <strong>Proposição P(n):</strong> a busca binária retorna corretamente o índice do alvo (ou{' '}
        <code className={inlineCode}>-1</code>) em qualquer vetor ordenado de tamanho{' '}
        <code className={inlineCode}>n ≥ 1</code>.
      </p>
      <p className={p}>
        <strong>Passo base (n = 1):</strong> um vetor com um único elemento. A busca compara uma vez
        e retorna o resultado. Verdadeiro.
      </p>
      <p className={p}>
        <strong>Passo indutivo:</strong> suponha que <code className={inlineCode}>P(j)</code> vale
        para todo <code className={inlineCode}>1 ≤ j ≤ k</code>. Para um vetor de tamanho{' '}
        <code className={inlineCode}>k+1</code>, a busca compara com o meio e descarta metade. O
        subvetor restante tem tamanho <code className={inlineCode}>j</code> com{' '}
        <code className={inlineCode}>1 ≤ j ≤ ⌊(k+1)/2⌋ ≤ k</code>. Pela hipótese,{' '}
        <code className={inlineCode}>P(j)</code> vale — logo o resultado é correto.{' '}
        <code className={inlineCode}>P(k+1)</code> também vale.
      </p>
      <p className={p}>
        Por indução forte, <code className={inlineCode}>P(n)</code> vale para todo{' '}
        <code className={inlineCode}>n ≥ 1</code>.
      </p>

      <h2 className={h2}>Indução estrutural</h2>
      <p className={p}>
        Quando a estrutura é definida recursivamente — como listas encadeadas e árvores —, a indução
        matemática simples não basta. É necessário raciocinar sobre{' '}
        <em>como a estrutura é construída</em>, e não sobre números.
      </p>
      <p className={p}>A prova por indução estrutural segue o formato:</p>
      <ol className={ol}>
        <li className={li}>
          <strong>Passo base</strong> — a propriedade vale para o caso base da definição (por
          exemplo, a lista vazia <code className={inlineCode}>NULL</code>).
        </li>
        <li className={li}>
          <strong>Passo recursivo</strong> — assumindo que a propriedade vale para uma estrutura
          menor, mostrar que ela também vale para a estrutura construída a partir dela.
        </li>
      </ol>

      <h3 className={h3}>Definição recursiva de lista</h3>
      <pre className={pre}>{`Lista ::= NULL
       |  Célula(elemento, Lista)`}</pre>
      <p className={p}>
        Traduzindo: uma lista ou é vazia, ou é uma célula com um elemento e uma referência a outra
        lista (possivelmente vazia).
      </p>

      <h3 className={h3}>Exemplo — comprimento da lista</h3>
      <pre className={pre}>{`int tamanho(Lista* l) {
  return (l == NULL) ? 0 : 1 + tamanho(l->prox);
}`}</pre>
      <p className={p}>
        <strong>Proposição P(L):</strong> <code className={inlineCode}>tamanho(L)</code> retorna o
        número exato de células de <code className={inlineCode}>L</code>.
      </p>
      <p className={p}>
        <strong>Passo base — L = NULL:</strong>{' '}
        <code className={inlineCode}>tamanho(NULL) = 0</code>. Correto.
      </p>
      <p className={p}>
        <strong>Passo recursivo:</strong> seja <code className={inlineCode}>L' = Célula(x, L)</code>
        , construída a partir de uma lista menor <code className={inlineCode}>L</code>. Pela
        hipótese, <code className={inlineCode}>tamanho(L)</code> retorna corretamente o tamanho de{' '}
        <code className={inlineCode}>L</code>. Então{' '}
        <code className={inlineCode}>tamanho(L') = 1 + tamanho(L)</code> — uma célula mais o tamanho
        do restante. Coincide com o número real de células de <code className={inlineCode}>L'</code>
        .
      </p>
      <p className={p}>
        Por indução estrutural, a propriedade vale para toda lista{' '}
        <code className={inlineCode}>L</code>.
      </p>

      <h2 className={h2}>Indução matemática × estrutural</h2>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}></th>
            <th className={th}>matemática</th>
            <th className={th}>estrutural</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={td}>Domínio</td>
            <td className={td}>números naturais</td>
            <td className={td}>conjuntos definidos recursivamente</td>
          </tr>
          <tr>
            <td className={td}>Passo</td>
            <td className={td}>
              <code className={inlineCode}>P(k) → P(k+1)</code>
            </td>
            <td className={td}>aplicar a regra recursiva</td>
          </tr>
          <tr>
            <td className={td}>Justificativa</td>
            <td className={td}>sequência linear</td>
            <td className={td}>estrutura de construção do objeto</td>
          </tr>
        </tbody>
      </table>

      <blockquote className={blockquote}>
        Regra prática: se provar <code className={inlineCode}>P(k+1)</code> só precisa de{' '}
        <code className={inlineCode}>P(k)</code>, use indução simples. Se a redução for{' '}
        <code className={inlineCode}>n → n/2</code> ou <code className={inlineCode}>n → n-1</code>{' '}
        (mais de um caso), use indução forte. Se a estrutura não for numérica — listas, árvores —,
        use indução estrutural.
      </blockquote>
    </>
  );
}
