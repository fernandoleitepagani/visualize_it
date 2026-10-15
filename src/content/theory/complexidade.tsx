import { blockquote, h2, h3, inlineCode, li, p, pre, table, td, th, ul } from './prose';

export function Complexidade() {
  return (
    <>
      <h2 className={h2}>Por que medir o custo de um algoritmo?</h2>
      <p className={p}>
        Um algoritmo pode ser correto e ainda assim ser inútil na prática — basta que ele leve
        séculos para terminar. Antes de escolher entre duas soluções, precisamos comparar{' '}
        <em>quanto</em> cada uma consome de tempo e de memória conforme o tamanho da entrada{' '}
        <code className={inlineCode}>n</code> cresce.
      </p>
      <p className={p}>
        Essa medição é feita através de uma <strong>função de complexidade</strong>, que conta
        operações relevantes (comparações, movimentações, somas) sem se prender a detalhes de
        hardware ou de compilador.
      </p>

      <h2 className={h2}>Contagem de operações</h2>
      <p className={p}>
        A ideia central é simples: para cada trecho do código, somamos quantas vezes a operação de
        interesse acontece.
      </p>

      <h3 className={h3}>Condicional</h3>
      <p className={p}>
        O custo é o da condição mais o da lista executada. Melhor caso é o mínimo entre os dois
        ramos; pior caso é o máximo.
      </p>
      <pre className={pre}>{`if (a - 5 < b - 3 || c - 1 < d - 3) {
  i--; --b; a -= 3;      // 4 subtrações
} else {
  j--;                    // 1 subtração
}`}</pre>
      <p className={p}>
        Melhor caso: 5 subtrações. Pior caso: 7 subtrações (o operador{' '}
        <code className={inlineCode}>||</code> curto-circuita quando a primeira condição é
        verdadeira).
      </p>

      <h3 className={h3}>Repetição simples</h3>
      <p className={p}>
        Um laço <code className={inlineCode}>for (i = 0; i &lt; n; i++)</code> executa o corpo{' '}
        <code className={inlineCode}>n</code> vezes. Se o corpo faz 2 subtrações, o total é{' '}
        <code className={inlineCode}>2n</code>.
      </p>

      <h3 className={h3}>Laço duplo</h3>
      <pre className={pre}>{`for (i = 0; i < n; i++)
  for (j = 0; j < n; j++)
    a--;                    // n·n = n² operações`}</pre>

      <h3 className={h3}>Laço logarítmico</h3>
      <p className={p}>
        Quando o contador é dividido por 2 a cada passo, o número de iterações é{' '}
        <code className={inlineCode}>⌊lg n⌋ + 1</code>:
      </p>
      <pre className={pre}>{`for (i = n; i > 0; i /= 2)
  a *= 2;`}</pre>

      <h2 className={h2}>Notações assintóticas</h2>
      <p className={p}>
        Contar operações exatas é útil, mas o que realmente importa é <em>como a função cresce</em>.
        As notações assintóticas capturam essa tendência — ignoram constantes e termos de menor
        grau.
      </p>

      <h3 className={h3}>Notação Θ — limite justo</h3>
      <p className={p}>
        <code className={inlineCode}>g(n)</code> é <code className={inlineCode}>Θ(f(n))</code> se
        existem constantes positivas <code className={inlineCode}>c₁</code>,{' '}
        <code className={inlineCode}>c₂</code> e <code className={inlineCode}>m</code> tais que,
        para todo <code className={inlineCode}>n ≥ m</code>:
      </p>
      <pre className={pre}>{`c₁ · f(n) ≤ g(n) ≤ c₂ · f(n)`}</pre>
      <p className={p}>
        Ou seja, <code className={inlineCode}>g</code> é limitada por{' '}
        <code className={inlineCode}>f</code> tanto por baixo quanto por cima.
      </p>

      <h3 className={h3}>Notação O — limite superior</h3>
      <p className={p}>
        <code className={inlineCode}>g(n)</code> é <code className={inlineCode}>O(f(n))</code> se
        existe <code className={inlineCode}>c &gt; 0</code> e{' '}
        <code className={inlineCode}>m &gt; 0</code> tais que, para todo{' '}
        <code className={inlineCode}>n ≥ m</code>:
      </p>
      <pre className={pre}>{`|g(n)| ≤ c · |f(n)|`}</pre>
      <p className={p}>
        É um teto assintótico — diz que a função não cresce mais rápido que{' '}
        <code className={inlineCode}>f</code>.
      </p>

      <h3 className={h3}>Notação Ω — limite inferior</h3>
      <p className={p}>
        <code className={inlineCode}>g(n)</code> é <code className={inlineCode}>Ω(f(n))</code> se
        existe <code className={inlineCode}>c &gt; 0</code> e{' '}
        <code className={inlineCode}>m &gt; 0</code> tais que, para todo{' '}
        <code className={inlineCode}>n ≥ m</code>:
      </p>
      <pre className={pre}>{`|g(n)| ≥ c · |f(n)|`}</pre>
      <p className={p}>
        É um piso assintótico — diz que a função cresce pelo menos como{' '}
        <code className={inlineCode}>f</code>.
      </p>

      <h3 className={h3}>Relação entre as três</h3>
      <pre className={pre}>{`g(n) é Θ(f(n))   ⇔   g(n) é O(f(n))  e  g(n) é Ω(f(n))`}</pre>

      <h2 className={h2}>Regras práticas</h2>
      <ul className={ul}>
        <li className={li}>
          Ignore constantes multiplicativas: <code className={inlineCode}>3n²</code>,{' '}
          <code className={inlineCode}>5n²</code> e <code className={inlineCode}>n²</code> são todas{' '}
          <code className={inlineCode}>Θ(n²)</code>.
        </li>
        <li className={li}>
          Ignore termos de menor grau: <code className={inlineCode}>3n + 2n²</code> é{' '}
          <code className={inlineCode}>Θ(n²)</code>; <code className={inlineCode}>lg n + n</code> é{' '}
          <code className={inlineCode}>Θ(n)</code>.
        </li>
        <li className={li}>
          <code className={inlineCode}>O</code> e <code className={inlineCode}>Ω</code> são
          independentes: uma função pode ser <code className={inlineCode}>O(n³)</code> e{' '}
          <code className={inlineCode}>Ω(n)</code> ao mesmo tempo — só{' '}
          <code className={inlineCode}>Θ</code> exige casamento dos dois.
        </li>
      </ul>

      <h2 className={h2}>Classes de complexidade</h2>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>classe</th>
            <th className={th}>nome</th>
            <th className={th}>exemplo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={td}>Θ(1)</td>
            <td className={td}>constante</td>
            <td className={td}>acessar v[0]</td>
          </tr>
          <tr>
            <td className={td}>Θ(lg n)</td>
            <td className={td}>logarítmica</td>
            <td className={td}>busca binária</td>
          </tr>
          <tr>
            <td className={td}>Θ(n)</td>
            <td className={td}>linear</td>
            <td className={td}>busca sequencial, counting sort</td>
          </tr>
          <tr>
            <td className={td}>Θ(n·lg n)</td>
            <td className={td}>linearítmica</td>
            <td className={td}>mergesort, heapsort</td>
          </tr>
          <tr>
            <td className={td}>Θ(n²)</td>
            <td className={td}>quadrática</td>
            <td className={td}>selection, insertion, bubble</td>
          </tr>
          <tr>
            <td className={td}>Θ(n³)</td>
            <td className={td}>cúbica</td>
            <td className={td}>multiplicação ingênua de matrizes</td>
          </tr>
          <tr>
            <td className={td}>Θ(2ⁿ)</td>
            <td className={td}>exponencial</td>
            <td className={td}>força bruta do caixeiro viajante</td>
          </tr>
          <tr>
            <td className={td}>Θ(n!)</td>
            <td className={td}>fatorial</td>
            <td className={td}>todas as permutações</td>
          </tr>
        </tbody>
      </table>

      <h2 className={h2}>Exemplo completo</h2>
      <p className={p}>
        Seja <code className={inlineCode}>g(n) = 3n² + 5n + 1</code>. Afirmações:
      </p>
      <ul className={ul}>
        <li className={li}>
          <code className={inlineCode}>g(n)</code> é <code className={inlineCode}>O(n²)</code> —
          verdadeira (basta <code className={inlineCode}>c = 4</code>,{' '}
          <code className={inlineCode}>m = 5</code>).
        </li>
        <li className={li}>
          <code className={inlineCode}>g(n)</code> é <code className={inlineCode}>O(n³)</code> —
          verdadeira (afrouxar o teto é permitido).
        </li>
        <li className={li}>
          <code className={inlineCode}>g(n)</code> é <code className={inlineCode}>Ω(n²)</code> —
          verdadeira.
        </li>
        <li className={li}>
          <code className={inlineCode}>g(n)</code> é <code className={inlineCode}>Ω(n³)</code> —{' '}
          <strong>falsa</strong> (a função não cresce tão rápido).
        </li>
        <li className={li}>
          <code className={inlineCode}>g(n)</code> é <code className={inlineCode}>Θ(n²)</code> —
          verdadeira, é a caracterização justa.
        </li>
      </ul>

      <h2 className={h2}>Operações válidas</h2>
      <pre className={pre}>{`f(n) = Θ(f(n))
c · Θ(f(n)) = Θ(f(n))
Θ(f(n)) + Θ(f(n)) = Θ(f(n))
Θ(f(n)) + Θ(g(n)) = Θ(max(f(n), g(n)))
Θ(f(n)) · Θ(g(n)) = Θ(f(n) · g(n))`}</pre>
      <p className={p}>
        As mesmas regras valem para <code className={inlineCode}>O</code> e{' '}
        <code className={inlineCode}>Ω</code>.
      </p>

      <h2 className={h2}>Algoritmos polinomiais × intratáveis</h2>
      <p className={p}>
        Um algoritmo é <strong>polinomial</strong> se seu custo é{' '}
        <code className={inlineCode}>Θ(nᵖ)</code> para algum inteiro{' '}
        <code className={inlineCode}>p</code>. Problemas que admitem solução polinomial são
        considerados <em>tratáveis</em>. Problemas para os quais nenhum algoritmo polinomial é
        conhecido — como o Caixeiro Viajante na formulação exata — são chamados de{' '}
        <em>intratáveis</em>.
      </p>

      <blockquote className={blockquote}>
        O limite <code className={inlineCode}>Ω(n lg n)</code> vale para qualquer algoritmo de
        ordenação que decida apenas por comparações entre chaves. Algoritmos como counting sort
        escapam desse limite ao ordenar pelo valor das chaves, não por comparação.
      </blockquote>
    </>
  );
}
