import { Code, H2, H3, Li, P, Pre, Quote, Table, Tbody, Td, Th, Thead, Tr, Ul } from './prose';

export function Complexidade() {
  return (
    <>
      <H2>Por que medir o custo de um algoritmo?</H2>
      <P>
        Um algoritmo pode ser correto e ainda assim ser inútil na prática — basta que ele leve
        séculos para terminar. Antes de escolher entre duas soluções, precisamos comparar{' '}
        <em>quanto</em> cada uma consome de tempo e de memória conforme o tamanho da entrada{' '}
        <Code>n</Code> cresce.
      </P>
      <P>
        Essa medição é feita através de uma <strong>função de complexidade</strong>, que conta
        operações relevantes (comparações, movimentações, somas) sem se prender a detalhes de
        hardware ou de compilador.
      </P>

      <H2>Contagem de operações</H2>
      <P>
        A ideia central é simples: para cada trecho do código, somamos quantas vezes a operação de
        interesse acontece.
      </P>

      <H3>Condicional</H3>
      <P>
        O custo é o da condição mais o da lista executada. Melhor caso é o mínimo entre os dois
        ramos; pior caso é o máximo.
      </P>
      <Pre>{`if (a - 5 < b - 3 || c - 1 < d - 3) {
  i--; --b; a -= 3;      // 4 subtrações
} else {
  j--;                    // 1 subtração
}`}</Pre>
      <P>
        Melhor caso: 5 subtrações. Pior caso: 7 subtrações (o operador{' '}
        <Code>||</Code> curto-circuita quando a primeira condição é
        verdadeira).
      </P>

      <H3>Repetição simples</H3>
      <P>
        Um laço <Code>for (i = 0; i &lt; n; i++)</Code> executa o corpo{' '}
        <Code>n</Code> vezes. Se o corpo faz 2 subtrações, o total é{' '}
        <Code>2n</Code>.
      </P>

      <H3>Laço duplo</H3>
      <Pre>{`for (i = 0; i < n; i++)
  for (j = 0; j < n; j++)
    a--;                    // n·n = n² operações`}</Pre>

      <H3>Laço logarítmico</H3>
      <P>
        Quando o contador é dividido por 2 a cada passo, o número de iterações é{' '}
        <Code>⌊lg n⌋ + 1</Code>:
      </P>
      <Pre>{`for (i = n; i > 0; i /= 2)
  a *= 2;`}</Pre>

      <H2>Notações assintóticas</H2>
      <P>
        Contar operações exatas é útil, mas o que realmente importa é <em>como a função cresce</em>.
        As notações assintóticas capturam essa tendência — ignoram constantes e termos de menor
        grau.
      </P>

      <H3>Notação Θ — limite justo</H3>
      <P>
        <Code>g(n)</Code> é <Code>Θ(f(n))</Code> se
        existem constantes positivas <Code>c₁</Code>,{' '}
        <Code>c₂</Code> e <Code>m</Code> tais que,
        para todo <Code>n ≥ m</Code>:
      </P>
      <Pre>{`c₁ · f(n) ≤ g(n) ≤ c₂ · f(n)`}</Pre>
      <P>
        Ou seja, <Code>g</Code> é limitada por{' '}
        <Code>f</Code> tanto por baixo quanto por cima.
      </P>

      <H3>Notação O — limite superior</H3>
      <P>
        <Code>g(n)</Code> é <Code>O(f(n))</Code> se
        existe <Code>c &gt; 0</Code> e{' '}
        <Code>m &gt; 0</Code> tais que, para todo{' '}
        <Code>n ≥ m</Code>:
      </P>
      <Pre>{`|g(n)| ≤ c · |f(n)|`}</Pre>
      <P>
        É um teto assintótico — diz que a função não cresce mais rápido que{' '}
        <Code>f</Code>.
      </P>

      <H3>Notação Ω — limite inferior</H3>
      <P>
        <Code>g(n)</Code> é <Code>Ω(f(n))</Code> se
        existe <Code>c &gt; 0</Code> e{' '}
        <Code>m &gt; 0</Code> tais que, para todo{' '}
        <Code>n ≥ m</Code>:
      </P>
      <Pre>{`|g(n)| ≥ c · |f(n)|`}</Pre>
      <P>
        É um piso assintótico — diz que a função cresce pelo menos como{' '}
        <Code>f</Code>.
      </P>

      <H3>Relação entre as três</H3>
      <Pre>{`g(n) é Θ(f(n))   ⇔   g(n) é O(f(n))  e  g(n) é Ω(f(n))`}</Pre>

      <H2>Regras práticas</H2>
      <Ul>
        <Li>
          Ignore constantes multiplicativas: <Code>3n²</Code>,{' '}
          <Code>5n²</Code> e <Code>n²</Code> são todas{' '}
          <Code>Θ(n²)</Code>.
        </Li>
        <Li>
          Ignore termos de menor grau: <Code>3n + 2n²</Code> é{' '}
          <Code>Θ(n²)</Code>; <Code>lg n + n</Code> é{' '}
          <Code>Θ(n)</Code>.
        </Li>
        <Li>
          <Code>O</Code> e <Code>Ω</Code> são
          independentes: uma função pode ser <Code>O(n³)</Code> e{' '}
          <Code>Ω(n)</Code> ao mesmo tempo — só{' '}
          <Code>Θ</Code> exige casamento dos dois.
        </Li>
      </Ul>

      <H2>Classes de complexidade</H2>
      <Table>
        <Thead>
          <Tr>
            <Th>classe</Th>
            <Th>nome</Th>
            <Th>exemplo</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Θ(1)</Td>
            <Td>constante</Td>
            <Td>acessar v[0]</Td>
          </Tr>
          <Tr>
            <Td>Θ(lg n)</Td>
            <Td>logarítmica</Td>
            <Td>busca binária</Td>
          </Tr>
          <Tr>
            <Td>Θ(n)</Td>
            <Td>linear</Td>
            <Td>busca sequencial, counting sort</Td>
          </Tr>
          <Tr>
            <Td>Θ(n·lg n)</Td>
            <Td>linearítmica</Td>
            <Td>mergesort, heapsort</Td>
          </Tr>
          <Tr>
            <Td>Θ(n²)</Td>
            <Td>quadrática</Td>
            <Td>selection, insertion, bubble</Td>
          </Tr>
          <Tr>
            <Td>Θ(n³)</Td>
            <Td>cúbica</Td>
            <Td>multiplicação ingênua de matrizes</Td>
          </Tr>
          <Tr>
            <Td>Θ(2ⁿ)</Td>
            <Td>exponencial</Td>
            <Td>força bruta do caixeiro viajante</Td>
          </Tr>
          <Tr>
            <Td>Θ(n!)</Td>
            <Td>fatorial</Td>
            <Td>todas as permutações</Td>
          </Tr>
        </Tbody>
      </Table>

      <H2>Exemplo completo</H2>
      <P>
        Seja <Code>g(n) = 3n² + 5n + 1</Code>. Afirmações:
      </P>
      <Ul>
        <Li>
          <Code>g(n)</Code> é <Code>O(n²)</Code> —
          verdadeira (basta <Code>c = 4</Code>,{' '}
          <Code>m = 5</Code>).
        </Li>
        <Li>
          <Code>g(n)</Code> é <Code>O(n³)</Code> —
          verdadeira (afrouxar o teto é permitido).
        </Li>
        <Li>
          <Code>g(n)</Code> é <Code>Ω(n²)</Code> —
          verdadeira.
        </Li>
        <Li>
          <Code>g(n)</Code> é <Code>Ω(n³)</Code> —{' '}
          <strong>falsa</strong> (a função não cresce tão rápido).
        </Li>
        <Li>
          <Code>g(n)</Code> é <Code>Θ(n²)</Code> —
          verdadeira, é a caracterização justa.
        </Li>
      </Ul>

      <H2>Operações válidas</H2>
      <Pre>{`f(n) = Θ(f(n))
c · Θ(f(n)) = Θ(f(n))
Θ(f(n)) + Θ(f(n)) = Θ(f(n))
Θ(f(n)) + Θ(g(n)) = Θ(max(f(n), g(n)))
Θ(f(n)) · Θ(g(n)) = Θ(f(n) · g(n))`}</Pre>
      <P>
        As mesmas regras valem para <Code>O</Code> e{' '}
        <Code>Ω</Code>.
      </P>

      <H2>Algoritmos polinomiais × intratáveis</H2>
      <P>
        Um algoritmo é <strong>polinomial</strong> se seu custo é{' '}
        <Code>Θ(nᵖ)</Code> para algum inteiro{' '}
        <Code>p</Code>. Problemas que admitem solução polinomial são
        considerados <em>tratáveis</em>. Problemas para os quais nenhum algoritmo polinomial é
        conhecido — como o Caixeiro Viajante na formulação exata — são chamados de{' '}
        <em>intratáveis</em>.
      </P>

      <Quote>
        O limite <Code>Ω(n lg n)</Code> vale para qualquer algoritmo de
        ordenação que decida apenas por comparações entre chaves. Algoritmos como counting sort
        escapam desse limite ao ordenar pelo valor das chaves, não por comparação.
      </Quote>
    </>
  );
}
