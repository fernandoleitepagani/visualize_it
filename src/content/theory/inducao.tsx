import { Code, H2, H3, Li, Ol, P, Pre, Quote, Table, Tbody, Td, Th, Thead, Tr } from './prose';

export function Inducao() {
  return (
    <>
      <H2>Por que provar?</H2>
      <P>
        Testar um algoritmo com alguns vetores não garante que ele funcione para <em>todos</em> os
        casos. A prova por indução é a ferramenta padrão para mostrar que uma propriedade vale para
        qualquer entrada — por exemplo, que um algoritmo de ordenação sempre produz um vetor
        ordenado.
      </P>

      <H2>Indução matemática simples</H2>
      <P>
        Para mostrar que uma proposição <Code>P(n)</Code> vale para todo{' '}
        <Code>n ≥ inicial</Code>:
      </P>
      <Ol>
        <Li>
          <strong>Passo base</strong> — mostrar que <Code>P(inicial)</Code> é
          verdadeira.
        </Li>
        <Li>
          <strong>Passo indutivo</strong> — assumir <Code>P(k)</Code> e
          mostrar que <Code>P(k+1)</Code> também é verdadeira.
        </Li>
      </Ol>
      <P>
        Se ambos valem, <Code>P(n)</Code> é verdadeira para todo{' '}
        <Code>n ≥ inicial</Code>.
      </P>

      <H3>Exemplo — soma de um vetor</H3>
      <P>Considere o código abaixo, que soma os elementos de uma lista:</P>
      <Pre>{`int soma = 0;
for (int i = 0; i < n; i++) {
  soma += lista[i];
}`}</Pre>
      <P>
        <strong>Proposição P(n):</strong> após <Code>n</Code> iterações,{' '}
        <Code>soma</Code> contém a soma dos{' '}
        <Code>n</Code> primeiros elementos.
      </P>
      <P>
        <strong>Passo base (n = 0):</strong> nenhuma iteração,{' '}
        <Code>soma = 0</Code>. Verdadeiro.
      </P>
      <P>
        <strong>Passo indutivo:</strong> suponha <Code>P(k)</Code> — após{' '}
        <Code>k</Code> iterações,{' '}
        <Code>soma = Σ lista[i]</Code> para{' '}
        <Code>i</Code> de <Code>0</Code> a{' '}
        <Code>k-1</Code>. Ao executar mais uma iteração, somamos{' '}
        <Code>lista[k]</Code>:
      </P>
      <Pre>{`Σ(i=0..k-1) lista[i]  +  lista[k]  =  Σ(i=0..k) lista[i]`}</Pre>
      <P>
        Ou seja, <Code>P(k+1)</Code> também vale. Por indução,{' '}
        <Code>P(n)</Code> vale para todo{' '}
        <Code>n ≥ 0</Code>.
      </P>

      <H2>Indução forte</H2>
      <P>
        Às vezes, provar <Code>P(k+1)</Code> precisa de mais do que apenas{' '}
        <Code>P(k)</Code> — pode ser necessário assumir <em>todos</em> os
        casos anteriores. Nesse caso usamos a indução forte:
      </P>
      <Ol>
        <Li>
          <strong>Passo base</strong> — <Code>P(inicial)</Code> é verdadeira.
        </Li>
        <Li>
          <strong>Passo indutivo</strong> — assumir{' '}
          <Code>P(inicial), P(inicial+1), …, P(k)</Code> e mostrar{' '}
          <Code>P(k+1)</Code>.
        </Li>
      </Ol>
      <P>
        A indução forte é mais comum em algoritmos de divisão e conquista, como quicksort, mergesort
        e busca binária — onde o problema se decompõe em subproblemas que não são{' '}
        <Code>k+1 → k</Code>, mas sim{' '}
        <Code>n → n/2</Code>.
      </P>

      <H3>Exemplo — busca binária</H3>
      <P>
        <strong>Proposição P(n):</strong> a busca binária retorna corretamente o índice do alvo (ou{' '}
        <Code>-1</Code>) em qualquer vetor ordenado de tamanho{' '}
        <Code>n ≥ 1</Code>.
      </P>
      <P>
        <strong>Passo base (n = 1):</strong> um vetor com um único elemento. A busca compara uma vez
        e retorna o resultado. Verdadeiro.
      </P>
      <P>
        <strong>Passo indutivo:</strong> suponha que <Code>P(j)</Code> vale
        para todo <Code>1 ≤ j ≤ k</Code>. Para um vetor de tamanho{' '}
        <Code>k+1</Code>, a busca compara com o meio e descarta metade. O
        subvetor restante tem tamanho <Code>j</Code> com{' '}
        <Code>1 ≤ j ≤ ⌊(k+1)/2⌋ ≤ k</Code>. Pela hipótese,{' '}
        <Code>P(j)</Code> vale — logo o resultado é correto.{' '}
        <Code>P(k+1)</Code> também vale.
      </P>
      <P>
        Por indução forte, <Code>P(n)</Code> vale para todo{' '}
        <Code>n ≥ 1</Code>.
      </P>

      <H2>Indução estrutural</H2>
      <P>
        Quando a estrutura é definida recursivamente — como listas encadeadas e árvores —, a indução
        matemática simples não basta. É necessário raciocinar sobre{' '}
        <em>como a estrutura é construída</em>, e não sobre números.
      </P>
      <P>A prova por indução estrutural segue o formato:</P>
      <Ol>
        <Li>
          <strong>Passo base</strong> — a propriedade vale para o caso base da definição (por
          exemplo, a lista vazia <Code>NULL</Code>).
        </Li>
        <Li>
          <strong>Passo recursivo</strong> — assumindo que a propriedade vale para uma estrutura
          menor, mostrar que ela também vale para a estrutura construída a partir dela.
        </Li>
      </Ol>

      <H3>Definição recursiva de lista</H3>
      <Pre>{`Lista ::= NULL
       |  Célula(elemento, Lista)`}</Pre>
      <P>
        Traduzindo: uma lista ou é vazia, ou é uma célula com um elemento e uma referência a outra
        lista (possivelmente vazia).
      </P>

      <H3>Exemplo — comprimento da lista</H3>
      <Pre>{`int tamanho(Lista* l) {
  return (l == NULL) ? 0 : 1 + tamanho(l->prox);
}`}</Pre>
      <P>
        <strong>Proposição P(L):</strong> <Code>tamanho(L)</Code> retorna o
        número exato de células de <Code>L</Code>.
      </P>
      <P>
        <strong>Passo base — L = NULL:</strong>{' '}
        <Code>tamanho(NULL) = 0</Code>. Correto.
      </P>
      <P>
        <strong>Passo recursivo:</strong> seja <Code>L' = Célula(x, L)</Code>
        , construída a partir de uma lista menor <Code>L</Code>. Pela
        hipótese, <Code>tamanho(L)</Code> retorna corretamente o tamanho de{' '}
        <Code>L</Code>. Então{' '}
        <Code>tamanho(L') = 1 + tamanho(L)</Code> — uma célula mais o tamanho
        do restante. Coincide com o número real de células de <Code>L'</Code>
        .
      </P>
      <P>
        Por indução estrutural, a propriedade vale para toda lista{' '}
        <Code>L</Code>.
      </P>

      <H2>Indução matemática × estrutural</H2>
      <Table>
        <Thead>
          <Tr>
            <Th></Th>
            <Th>matemática</Th>
            <Th>estrutural</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Domínio</Td>
            <Td>números naturais</Td>
            <Td>conjuntos definidos recursivamente</Td>
          </Tr>
          <Tr>
            <Td>Passo</Td>
            <Td>
              <Code>P(k) → P(k+1)</Code>
            </Td>
            <Td>aplicar a regra recursiva</Td>
          </Tr>
          <Tr>
            <Td>Justificativa</Td>
            <Td>sequência linear</Td>
            <Td>estrutura de construção do objeto</Td>
          </Tr>
        </Tbody>
      </Table>

      <Quote>
        Regra prática: se provar <Code>P(k+1)</Code> só precisa de{' '}
        <Code>P(k)</Code>, use indução simples. Se a redução for{' '}
        <Code>n → n/2</Code> ou <Code>n → n-1</Code>{' '}
        (mais de um caso), use indução forte. Se a estrutura não for numérica — listas, árvores —,
        use indução estrutural.
      </Quote>
    </>
  );
}
