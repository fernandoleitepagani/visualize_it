import type {
  Lesson,
  ObjectClassBlueprint,
  ObjectState,
  Step,
  VarValue,
} from '@/engine/types';
import { lines } from '@/lib/lines';

const lineOf = (code: string[], text: string): number => {
  const index = code.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada: ${text}`);
  return index;
};

const so = (
  line: number,
  desc: string,
  object: ObjectState,
  vars?: Record<string, VarValue>,
): Step => ({
  line,
  desc,
  object,
  vars,
});

const base = {
  view: 'object' as const,
  inputless: true,
  initial: [1],
  complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 1. OOP (Introdução a Objetos e Classes)
 * ────────────────────────────────────────────────────────────────────────── */

const oopCode = lines(`
#include <iostream>
#include <string>
using namespace std;

class Aluno {
private:
  string nome;
  int matricula;
public:
  void setNome(string n) {
    nome = n;
  }
  void setMatricula(int m) {
    matricula = m;
  }
  string getNome() {
    return nome;
  }
};

int main() {
  Aluno a;
  a.setNome("Ana");
  a.setMatricula(202601);
  cout << a.getNome() << endl;
  return 0;
}`);

const alunoBlueprint: ObjectClassBlueprint = {
  name: 'Aluno',
  attributes: [
    { name: 'nome', type: 'string', visibility: 'private' },
    { name: 'matricula', type: 'int', visibility: 'private' },
  ],
  methods: [
    { name: 'setNome', params: 'string n', returnType: 'void', visibility: 'public' },
    { name: 'setMatricula', params: 'int m', returnType: 'void', visibility: 'public' },
    { name: 'getNome', params: '', returnType: 'string', visibility: 'public' },
  ],
};

export const lessonOop: Lesson = {
  ...base,
  id: 'oop',
  title: 'OOP',
  subtitle: 'Objetos, classes e os quatro pilares',
  description:
    'O paradigma orientado a objetos organiza o programa em classes e objetos. A classe é o molde que define atributos e comportamentos; o objeto é uma instância com estado próprio alocada na memória. Os quatro pilares são abstração, encapsulamento, herança e polimorfismo.',
  panelLabel: 'objeto',
  languages: ['cpp'],
  code: { cpp: oopCode },
  steps: () => [
    so(
      lineOf(oopCode, 'class Aluno'),
      'Definição da classe Aluno: a classe funciona como molde (blueprint), especificando atributos privados e métodos públicos.',
      { blueprints: [alunoBlueprint] },
      { 'classe': 'Aluno' },
    ),
    so(
      lineOf(oopCode, 'int main()'),
      'Início da execução do programa na função main().',
      { blueprints: [alunoBlueprint] },
      { 'função': 'main' },
    ),
    so(
      lineOf(oopCode, 'Aluno a;'),
      'Instanciação do objeto a: uma área de memória é reservada para a instância do tipo Aluno na pilha (stack).',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            state: 'write',
            attributes: [
              { name: 'nome', value: null, visibility: 'private' },
              { name: 'matricula', value: null, visibility: 'private' },
            ],
          },
        ],
      },
      { 'instância': 'a' },
    ),
    so(
      lineOf(oopCode, 'a.setNome("Ana");'),
      'Invocação do método a.setNome("Ana"): controle prepara a chamada repassando o argumento "Ana".',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: null, visibility: 'private' },
              { name: 'matricula', value: null, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setNome("Ana")',
          dispatchedTo: 'Aluno::setNome',
          params: { n: 'Ana' },
          effect: 'prepara envio de "Ana"',
        },
      },
      { 'chamada': 'a.setNome("Ana")', 'argumento': '"Ana"' },
    ),
    so(
      lineOf(oopCode, 'void setNome(string n)'),
      'O fluxo entra no método setNome: o parâmetro formal n recebe o valor "Ana".',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: null, visibility: 'private' },
              { name: 'matricula', value: null, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setNome("Ana")',
          dispatchedTo: 'Aluno::setNome',
          params: { n: 'Ana' },
          effect: 'parâmetro n inicializado',
        },
      },
      { 'escopo': 'Aluno::setNome', 'parâmetro n': '"Ana"' },
    ),
    so(
      lineOf(oopCode, 'nome = n;'),
      'Atribuição: o valor do parâmetro n ("Ana") é gravado no atributo privado nome da instância a.',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private', state: 'write', sourceValue: 'parâmetro n ("Ana")' },
              { name: 'matricula', value: null, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setNome("Ana")',
          dispatchedTo: 'Aluno::setNome',
          params: { n: 'Ana' },
          effect: 'atualiza a.nome = "Ana"',
        },
      },
      { 'a.nome': '"Ana"' },
    ),
    so(
      lineOf(oopCode, 'a.setMatricula(202601);'),
      'Retorno a main(): agora invocamos a.setMatricula(202601) passando a matrícula como argumento.',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private' },
              { name: 'matricula', value: null, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setMatricula(202601)',
          dispatchedTo: 'Aluno::setMatricula',
          params: { m: 202601 },
          effect: 'prepara envio de 202601',
        },
      },
      { 'chamada': 'a.setMatricula(202601)' },
    ),
    so(
      lineOf(oopCode, 'void setMatricula(int m)'),
      'O fluxo entra em setMatricula: o parâmetro formal m recebe o valor 202601.',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private' },
              { name: 'matricula', value: null, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setMatricula(202601)',
          dispatchedTo: 'Aluno::setMatricula',
          params: { m: 202601 },
          effect: 'parâmetro m inicializado',
        },
      },
      { 'escopo': 'Aluno::setMatricula', 'parâmetro m': 202601 },
    ),
    so(
      lineOf(oopCode, 'matricula = m;'),
      'Atribuição: o valor de m (202601) é armazenado no atributo privado matricula da instância a.',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private' },
              { name: 'matricula', value: 202601, visibility: 'private', state: 'write', sourceValue: 'parâmetro m (202601)' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setMatricula(202601)',
          dispatchedTo: 'Aluno::setMatricula',
          params: { m: 202601 },
          effect: 'atualiza a.matricula = 202601',
        },
      },
      { 'a.matricula': 202601 },
    ),
    so(
      lineOf(oopCode, 'cout << a.getNome()'),
      'Em main(), chamada ao getter a.getNome() para consultar o nome encapsulado.',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private' },
              { name: 'matricula', value: 202601, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.getNome()',
          dispatchedTo: 'Aluno::getNome',
          effect: 'leitura de a.nome',
        },
      },
      { 'chamada': 'a.getNome()' },
    ),
    so(
      lineOf(oopCode, 'string getNome()'),
      'Entrada no método acessor getNome(): nenhuma modificação de estado será permitida.',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private', state: 'read' },
              { name: 'matricula', value: 202601, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.getNome()',
          dispatchedTo: 'Aluno::getNome',
          effect: 'lendo campo nome',
        },
      },
      { 'escopo': 'Aluno::getNome' },
    ),
    so(
      lineOf(oopCode, 'return nome;'),
      'Retorno: o atributo privado nome ("Ana") é lido e devolvido para a expressão em main().',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private', state: 'read', sourceValue: 'retorna "Ana"' },
              { name: 'matricula', value: 202601, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.getNome()',
          dispatchedTo: 'Aluno::getNome',
          returned: 'Ana',
          effect: 'retorna "Ana"',
        },
      },
      { 'retorno': '"Ana"' },
    ),
    so(
      lineOf(oopCode, 'cout << a.getNome() << endl;'),
      'A saída padrão recebe o retorno de getNome() e imprime "Ana" com quebra de linha.',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private' },
              { name: 'matricula', value: 202601, visibility: 'private' },
            ],
          },
        ],
      },
      { 'console': '"Ana"' },
    ),
    so(
      lineOf(oopCode, 'return 0;'),
      'Fim da execução: o objeto a completou suas operações mantendo integridade e consistência.',
      {
        blueprints: [alunoBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private' },
              { name: 'matricula', value: 202601, visibility: 'private' },
            ],
          },
        ],
      },
      { 'status': 'concluído com sucesso' },
    ),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 2. Abstração
 * ────────────────────────────────────────────────────────────────────────── */

const abstracaoCode = lines(`
#include <iostream>
using namespace std;

class Conta {
private:
  double saldo;
public:
  Conta() {
    saldo = 0;
  }
  void depositar(double valor) {
    if (valor > 0) saldo += valor;
  }
  void sacar(double valor) {
    if (valor <= saldo) saldo -= valor;
  }
  double getSaldo() {
    return saldo;
  }
};

int main() {
  Conta c;
  c.depositar(100);
  c.sacar(30);
  cout << c.getSaldo() << endl;
  return 0;
}`);

const contaBlueprint: ObjectClassBlueprint = {
  name: 'Conta',
  attributes: [{ name: 'saldo', type: 'double', visibility: 'private' }],
  methods: [
    { name: 'Conta', params: '', returnType: '', visibility: 'public' },
    { name: 'depositar', params: 'double valor', returnType: 'void', visibility: 'public' },
    { name: 'sacar', params: 'double valor', returnType: 'void', visibility: 'public' },
    { name: 'getSaldo', params: '', returnType: 'double', visibility: 'public' },
  ],
};

export const lessonAbstracao: Lesson = {
  ...base,
  id: 'abstracao',
  title: 'Abstração',
  subtitle: 'Separar o essencial dos detalhes',
  description:
    'Abstração é representar apenas as características essenciais de uma entidade, escondendo complexidades internas. Quem utiliza a classe Conta interage apenas com depositar, sacar e getSaldo, sem precisar saber como o saldo é protegido ou recalculado.',
  panelLabel: 'conta',
  languages: ['cpp'],
  code: { cpp: abstracaoCode },
  steps: () => [
    so(
      lineOf(abstracaoCode, 'class Conta'),
      'Abstração: a classe Conta estabelece o contrato essencial com o mundo exterior, ocultando detalhes de implementação.',
      { blueprints: [contaBlueprint] },
      { 'abstração': 'Conta bancária' },
    ),
    so(
      lineOf(abstracaoCode, 'Conta c;'),
      'Instanciação: o objeto c é criado na memória e o construtor default é acionado.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 0, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'Conta()',
          dispatchedTo: 'Conta::Conta',
          effect: 'invoca construtor default',
        },
      },
      { 'instância': 'c' },
    ),
    so(
      lineOf(abstracaoCode, 'saldo = 0;'),
      'O construtor garante que a conta inicie com saldo válido (0.0).',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            state: 'write',
            attributes: [{ name: 'saldo', value: 0, visibility: 'private', state: 'write', sourceValue: 'inicializado com 0' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'Conta()',
          dispatchedTo: 'Conta::Conta',
          effect: 'c.saldo = 0.0',
        },
      },
      { 'c.saldo': 0 },
    ),
    so(
      lineOf(abstracaoCode, 'c.depositar(100);'),
      'Interface em ação: o cliente solicita a operação depositar(100) sem manipular diretamente o saldo.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 0, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.depositar(100)',
          dispatchedTo: 'Conta::depositar',
          params: { valor: 100 },
          effect: 'prepara depósito de 100',
        },
      },
      { 'operação': 'depositar', 'valor': 100 },
    ),
    so(
      lineOf(abstracaoCode, 'void depositar(double valor)'),
      'Entrada no método depositar: parâmetro valor recebe 100.0.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 0, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.depositar(100)',
          dispatchedTo: 'Conta::depositar',
          params: { valor: 100 },
          effect: 'valida valor > 0',
        },
      },
      { 'parâmetro valor': 100 },
    ),
    so(
      lineOf(abstracaoCode, 'if (valor > 0) saldo += valor;'),
      'A validação interna (100 > 0) é satisfeita e o saldo passa de 0 para 100.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 100, visibility: 'private', state: 'write', sourceValue: '+100 creditado' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.depositar(100)',
          dispatchedTo: 'Conta::depositar',
          effect: 'atualiza c.saldo = 100',
        },
      },
      { 'c.saldo': 100 },
    ),
    so(
      lineOf(abstracaoCode, 'c.sacar(30);'),
      'O cliente solicita sacar(30) através da mesma interface uniforme.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 100, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.sacar(30)',
          dispatchedTo: 'Conta::sacar',
          params: { valor: 30 },
          effect: 'prepara saque de 30',
        },
      },
      { 'operação': 'sacar', 'valor': 30 },
    ),
    so(
      lineOf(abstracaoCode, 'void sacar(double valor)'),
      'Entrada no método sacar: parâmetro valor recebe 30.0.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 100, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.sacar(30)',
          dispatchedTo: 'Conta::sacar',
          params: { valor: 30 },
          effect: 'valida saldo suficiente',
        },
      },
      { 'parâmetro valor': 30 },
    ),
    so(
      lineOf(abstracaoCode, 'if (valor <= saldo) saldo -= valor;'),
      'Validação de saldo suficiente (30 <= 100): o débito é autorizado e o saldo é reduzido para 70.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 70, visibility: 'private', state: 'write', sourceValue: '-30 debitado' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.sacar(30)',
          dispatchedTo: 'Conta::sacar',
          effect: 'atualiza c.saldo = 70',
        },
      },
      { 'c.saldo': 70 },
    ),
    so(
      lineOf(abstracaoCode, 'cout << c.getSaldo()'),
      'getSaldo() entrega o resultado (70) ao usuário sem expor os bastidores do cálculo.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 70, visibility: 'private', state: 'read', sourceValue: 'retorna 70' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.getSaldo()',
          dispatchedTo: 'Conta::getSaldo',
          returned: 70,
          effect: 'retorna 70',
        },
      },
      { 'saldo final': 70 },
    ),
    so(
      lineOf(abstracaoCode, 'return 0;'),
      'Conclusão: o usuário manipulou a conta através de operações de negócio sem tocar na estrutura interna.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 70, visibility: 'private' }],
          },
        ],
      },
      { 'status': 'sucesso' },
    ),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 3. Classes
 * ────────────────────────────────────────────────────────────────────────── */

const classesCode = lines(`
#include <iostream>
#include <string>
using namespace std;

class Pessoa {
public:
  string nome;
  int idade;

  void apresentar() {
    cout << nome << " tem " << idade << " anos" << endl;
  }
};

int main() {
  Pessoa p;
  p.nome = "Carlos";
  p.idade = 30;
  p.apresentar();
  return 0;
}`);

const pessoaClassBlueprint: ObjectClassBlueprint = {
  name: 'Pessoa',
  attributes: [
    { name: 'nome', type: 'string', visibility: 'public' },
    { name: 'idade', type: 'int', visibility: 'public' },
  ],
  methods: [{ name: 'apresentar', params: '', returnType: 'void', visibility: 'public' }],
};

export const lessonClasses: Lesson = {
  ...base,
  id: 'classes',
  title: 'Classes',
  subtitle: 'Um novo tipo de dado',
  description:
    'Uma classe funciona como molde, especificação ou planta de um novo tipo de dado. Declarar a classe Pessoa não ocupa memória de dados; apenas quando instanciamos Pessoa p o objeto real é criado na memória.',
  panelLabel: 'classe',
  languages: ['cpp'],
  code: { cpp: classesCode },
  steps: () => [
    so(
      lineOf(classesCode, 'class Pessoa'),
      'Definição do molde da classe Pessoa com atributos públicos nome e idade, e o método apresentar().',
      { blueprints: [pessoaClassBlueprint] },
      { 'tipo criado': 'Pessoa' },
    ),
    so(
      lineOf(classesCode, 'int main()'),
      'Início do programa em main(): a pilha de execução é preparada.',
      { blueprints: [pessoaClassBlueprint] },
      { 'escopo': 'main()' },
    ),
    so(
      lineOf(classesCode, 'Pessoa p;'),
      'Instanciação: a variável p do tipo Pessoa é alocada na memória da pilha com campos vazios.',
      {
        blueprints: [pessoaClassBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            state: 'active',
            attributes: [
              { name: 'nome', value: null, visibility: 'public' },
              { name: 'idade', value: null, visibility: 'public' },
            ],
          },
        ],
      },
      { 'instância': 'p' },
    ),
    so(
      lineOf(classesCode, 'p.nome = "Carlos";'),
      'Atribuição direta: por ser membro público, p.nome recebe "Carlos".',
      {
        blueprints: [pessoaClassBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'public', state: 'write', sourceValue: 'atribuído: "Carlos"' },
              { name: 'idade', value: null, visibility: 'public' },
            ],
          },
        ],
      },
      { 'p.nome': '"Carlos"' },
    ),
    so(
      lineOf(classesCode, 'p.idade = 30;'),
      'Atribuição direta: p.idade recebe 30.',
      {
        blueprints: [pessoaClassBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'public' },
              { name: 'idade', value: 30, visibility: 'public', state: 'write', sourceValue: 'atribuído: 30' },
            ],
          },
        ],
      },
      { 'p.idade': 30 },
    ),
    so(
      lineOf(classesCode, 'p.apresentar();'),
      'Invocação de método: p.apresentar() executa a lógica de apresentação da instância.',
      {
        blueprints: [pessoaClassBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'public' },
              { name: 'idade', value: 30, visibility: 'public' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'p.apresentar()',
          dispatchedTo: 'Pessoa::apresentar',
          effect: 'executa apresentar()',
        },
      },
      { 'chamada': 'p.apresentar()' },
    ),
    so(
      lineOf(classesCode, 'void apresentar()'),
      'Entrada no método apresentar(): o ponteiro implícito this aponta para o objeto p.',
      {
        blueprints: [pessoaClassBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'public', state: 'read' },
              { name: 'idade', value: 30, visibility: 'public', state: 'read' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'p.apresentar()',
          dispatchedTo: 'Pessoa::apresentar',
          effect: 'lendo atributos de p',
        },
      },
      { 'this': '&p' },
    ),
    so(
      lineOf(classesCode, 'cout << nome'),
      'Impressão: o método acessa os atributos da própria instância exibindo "Carlos tem 30 anos".',
      {
        blueprints: [pessoaClassBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'public' },
              { name: 'idade', value: 30, visibility: 'public' },
            ],
          },
        ],
      },
      { 'saída': '"Carlos tem 30 anos"' },
    ),
    so(
      lineOf(classesCode, 'return 0;'),
      'Conclusão: a classe forneceu o projeto e p corporificou o objeto com estado concreto.',
      {
        blueprints: [pessoaClassBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'public' },
              { name: 'idade', value: 30, visibility: 'public' },
            ],
          },
        ],
      },
      { 'status': 'finalizado' },
    ),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 4. Construtores
 * ────────────────────────────────────────────────────────────────────────── */

const construtoresCode = lines(`
#include <iostream>
#include <string>
using namespace std;

class Pessoa {
private:
  string nome;
  int idade;
public:
  Pessoa(string n, int i) {
    nome = n;
    idade = i;
  }
  void apresentar() {
    cout << nome << " (" << idade << ")" << endl;
  }
};

int main() {
  Pessoa p("Carlos", 30);
  p.apresentar();
  return 0;
}`);

const pessoaConstrutorBlueprint: ObjectClassBlueprint = {
  name: 'Pessoa',
  attributes: [
    { name: 'nome', type: 'string', visibility: 'private' },
    { name: 'idade', type: 'int', visibility: 'private' },
  ],
  methods: [
    { name: 'Pessoa', params: 'string n, int i', returnType: '', visibility: 'public' },
    { name: 'apresentar', params: '', returnType: 'void', visibility: 'public' },
  ],
};

export const lessonConstrutores: Lesson = {
  ...base,
  id: 'construtores',
  title: 'Construtores',
  subtitle: 'Inicializando objetos',
  description:
    'O construtor é um método especial com o mesmo nome da classe e sem tipo de retorno. Ele executa automaticamente no instante em que o objeto é criado, garantindo que todos os atributos privados recebam valores válidos desde o nascimento.',
  panelLabel: 'pessoa',
  languages: ['cpp'],
  code: { cpp: construtoresCode },
  steps: () => [
    so(
      lineOf(construtoresCode, 'class Pessoa'),
      'Definição da classe Pessoa com atributos privados que necessitam de inicialização controlada.',
      { blueprints: [pessoaConstrutorBlueprint] },
      { 'classe': 'Pessoa' },
    ),
    so(
      lineOf(construtoresCode, 'Pessoa p("Carlos", 30);'),
      'Instanciação: ao declarar p("Carlos", 30), o C++ aciona imediatamente o construtor com os argumentos fornecidos.',
      {
        blueprints: [pessoaConstrutorBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            state: 'write',
            attributes: [
              { name: 'nome', value: null, visibility: 'private' },
              { name: 'idade', value: null, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'Pessoa("Carlos", 30)',
          dispatchedTo: 'Pessoa::Pessoa',
          params: { n: 'Carlos', i: 30 },
          effect: 'invoca construtor parametrizado',
        },
      },
      { 'construtor': 'invocado', 'n': '"Carlos"', 'i': 30 },
    ),
    so(
      lineOf(construtoresCode, 'Pessoa(string n, int i)'),
      'Entrada no corpo do construtor: parâmetros n e i estão prontos para inicializar os atributos da instância.',
      {
        blueprints: [pessoaConstrutorBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: null, visibility: 'private' },
              { name: 'idade', value: null, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'Pessoa("Carlos", 30)',
          dispatchedTo: 'Pessoa::Pessoa',
          params: { n: 'Carlos', i: 30 },
          effect: 'inicializando campos',
        },
      },
      { 'parâmetros': 'n="Carlos", i=30' },
    ),
    so(
      lineOf(construtoresCode, 'nome = n;'),
      'O construtor atribui o argumento n ("Carlos") ao atributo privado nome da instância p.',
      {
        blueprints: [pessoaConstrutorBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'private', state: 'write', sourceValue: 'parâmetro n ("Carlos")' },
              { name: 'idade', value: null, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'Pessoa("Carlos", 30)',
          dispatchedTo: 'Pessoa::Pessoa',
          params: { n: 'Carlos', i: 30 },
          effect: 'atualiza p.nome = "Carlos"',
        },
      },
      { 'p.nome': '"Carlos"' },
    ),
    so(
      lineOf(construtoresCode, 'idade = i;'),
      'O construtor atribui o argumento i (30) ao atributo privado idade da instância p.',
      {
        blueprints: [pessoaConstrutorBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'private' },
              { name: 'idade', value: 30, visibility: 'private', state: 'write', sourceValue: 'parâmetro i (30)' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'Pessoa("Carlos", 30)',
          dispatchedTo: 'Pessoa::Pessoa',
          params: { n: 'Carlos', i: 30 },
          effect: 'atualiza p.idade = 30',
        },
      },
      { 'p.idade': 30 },
    ),
    so(
      lineOf(construtoresCode, 'p.apresentar();'),
      'O objeto p nasce totalmente inicializado e íntegro, pronto para executar apresentar().',
      {
        blueprints: [pessoaConstrutorBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'private' },
              { name: 'idade', value: 30, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'p.apresentar()',
          dispatchedTo: 'Pessoa::apresentar',
          effect: 'chama apresentar()',
        },
      },
      { 'chamada': 'p.apresentar()' },
    ),
    so(
      lineOf(construtoresCode, 'void apresentar()'),
      'Entrada no método apresentar(): os dados válidos são lidos da memória.',
      {
        blueprints: [pessoaConstrutorBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'private', state: 'read' },
              { name: 'idade', value: 30, visibility: 'private', state: 'read' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'p.apresentar()',
          dispatchedTo: 'Pessoa::apresentar',
          effect: 'lendo atributos',
        },
      },
      { 'lendo': 'p.nome, p.idade' },
    ),
    so(
      lineOf(construtoresCode, 'cout << nome'),
      'Exibição dos dados do objeto inicializado: "Carlos (30)".',
      {
        blueprints: [pessoaConstrutorBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'private' },
              { name: 'idade', value: 30, visibility: 'private' },
            ],
          },
        ],
      },
      { 'saída': '"Carlos (30)"' },
    ),
    so(
      lineOf(construtoresCode, 'return 0;'),
      'Construtores eliminam o perigo de variáveis com lixo de memória na criação de objetos.',
      {
        blueprints: [pessoaConstrutorBlueprint],
        instances: [
          {
            id: 'p',
            label: 'Pessoa p',
            className: 'Pessoa',
            attributes: [
              { name: 'nome', value: 'Carlos', visibility: 'private' },
              { name: 'idade', value: 30, visibility: 'private' },
            ],
          },
        ],
      },
      { 'status': 'sucesso' },
    ),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 5. Encapsulamento
 * ────────────────────────────────────────────────────────────────────────── */

const encapsulamentoCode = lines(`
#include <iostream>
using namespace std;

class Conta {
private:
  double saldo;
public:
  Conta() { saldo = 0; }
  void depositar(double valor) {
    if (valor > 0) saldo += valor;
  }
  bool sacar(double valor) {
    if (valor > saldo) return false;
    saldo -= valor;
    return true;
  }
  double getSaldo() const { return saldo; }
};

int main() {
  Conta c;
  c.depositar(100);
  c.sacar(40);
  cout << c.getSaldo() << endl;
  return 0;
}`);

export const lessonEncapsulamento: Lesson = {
  ...base,
  id: 'encapsulamento',
  title: 'Encapsulamento',
  subtitle: 'Protegendo o estado',
  description:
    'Encapsulamento controla a visibilidade dos membros: private oculta o estado e impede modificações arbitrárias externas; public expõe a interface autorizada. Métodos validam invariantes antes de atualizar o estado interno.',
  panelLabel: 'conta',
  languages: ['cpp'],
  code: { cpp: encapsulamentoCode },
  steps: () => [
    so(
      lineOf(encapsulamentoCode, 'class Conta'),
      'A classe Conta blinda seu atributo saldo com o modificador private (🔒).',
      { blueprints: [contaBlueprint] },
      { 'encapsulamento': 'private saldo' },
    ),
    so(
      lineOf(encapsulamentoCode, 'Conta c;'),
      'Instanciação: o construtor inicializa o saldo em 0.0.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 0, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'Conta()',
          dispatchedTo: 'Conta::Conta',
          effect: 'saldo inicializado com 0',
        },
      },
      { 'c.saldo': 0 },
    ),
    so(
      lineOf(encapsulamentoCode, 'c.depositar(100);'),
      'Tentativa de alteração direta c.saldo = 100 geraria erro de compilação. O acesso deve ser feito via depositar().',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 0, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.depositar(100)',
          dispatchedTo: 'Conta::depositar',
          params: { valor: 100 },
          effect: 'prepara depósito',
        },
      },
      { 'acesso direto': 'bloqueado', 'método': 'depositar(100)' },
    ),
    so(
      lineOf(encapsulamentoCode, 'void depositar(double valor)'),
      'Entrada no método público depositar: o parâmetro valor recebe 100.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 0, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.depositar(100)',
          dispatchedTo: 'Conta::depositar',
          params: { valor: 100 },
          effect: 'testa if (valor > 0)',
        },
      },
      { 'parâmetro valor': 100 },
    ),
    so(
      lineOf(encapsulamentoCode, 'if (valor > 0) saldo += valor;'),
      'O método valida a regra de negócio antes de gravar: 100 > 0 é válido, logo saldo passa a 100.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 100, visibility: 'private', state: 'write', sourceValue: '+100 validado' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.depositar(100)',
          dispatchedTo: 'Conta::depositar',
          effect: 'c.saldo = 100',
        },
      },
      { 'c.saldo': 100 },
    ),
    so(
      lineOf(encapsulamentoCode, 'c.sacar(40);'),
      'Chamada a sacar(40): a classe valida se o valor excede o saldo disponível.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 100, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.sacar(40)',
          dispatchedTo: 'Conta::sacar',
          params: { valor: 40 },
          effect: 'prepara saque',
        },
      },
      { 'operação': 'sacar', 'valor': 40 },
    ),
    so(
      lineOf(encapsulamentoCode, 'bool sacar(double valor)'),
      'Entrada no método sacar: parâmetro valor recebe 40.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 100, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.sacar(40)',
          dispatchedTo: 'Conta::sacar',
          params: { valor: 40 },
          effect: 'testa se 40 > saldo',
        },
      },
      { 'parâmetro valor': 40 },
    ),
    so(
      lineOf(encapsulamentoCode, 'if (valor > saldo) return false;'),
      'Validação de segurança: 40 > 100 é falso, permitindo a continuidade do saque.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 100, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.sacar(40)',
          dispatchedTo: 'Conta::sacar',
          effect: 'saldo suficiente',
        },
      },
      { 'saldo suficiente': 'sim' },
    ),
    so(
      lineOf(encapsulamentoCode, 'saldo -= valor;'),
      'O débito é executado com segurança: saldo reduzido para 60.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 60, visibility: 'private', state: 'write', sourceValue: '-40 debitado' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.sacar(40)',
          dispatchedTo: 'Conta::sacar',
          effect: 'c.saldo = 60',
        },
      },
      { 'c.saldo': 60 },
    ),
    so(
      lineOf(encapsulamentoCode, 'return true;'),
      'Método retorna true confirmando que a operação foi autorizada e concluída.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 60, visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.sacar(40)',
          dispatchedTo: 'Conta::sacar',
          returned: 'true',
          effect: 'retorna true',
        },
      },
      { 'retorno': 'true' },
    ),
    so(
      lineOf(encapsulamentoCode, 'cout << c.getSaldo()'),
      'O método constante getSaldo() lê o valor 60 sem permitir que o chamador modifique os dados.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 60, visibility: 'private', state: 'read', sourceValue: 'retorna 60' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.getSaldo()',
          dispatchedTo: 'Conta::getSaldo',
          returned: 60,
          effect: 'leitura somente-leitura',
        },
      },
      { 'saldo consultado': 60 },
    ),
    so(
      lineOf(encapsulamentoCode, 'return 0;'),
      'Encapsulamento garante que o estado interno só transite por caminhos previstos e seguros.',
      {
        blueprints: [contaBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Conta c',
            className: 'Conta',
            attributes: [{ name: 'saldo', value: 60, visibility: 'private' }],
          },
        ],
      },
      { 'status': 'sucesso' },
    ),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 6. Herança
 * ────────────────────────────────────────────────────────────────────────── */

const herancaCode = lines(`
#include <iostream>
using namespace std;

class Veiculo {
public:
  void ligar() {
    cout << "Veiculo ligado" << endl;
  }
};

class Carro : public Veiculo {
public:
  void abrirPorta() {
    cout << "Porta aberta" << endl;
  }
};

int main() {
  Carro c;
  c.ligar();
  c.abrirPorta();
  return 0;
}`);

const veiculoBlueprint: ObjectClassBlueprint = {
  name: 'Veiculo',
  methods: [{ name: 'ligar', params: '', returnType: 'void', visibility: 'public' }],
};

const carroBlueprint: ObjectClassBlueprint = {
  name: 'Carro',
  baseClass: 'Veiculo',
  methods: [
    { name: 'abrirPorta', params: '', returnType: 'void', visibility: 'public' },
    { name: 'ligar (herdado)', params: '', returnType: 'void', visibility: 'public' },
  ],
};

export const lessonHeranca: Lesson = {
  ...base,
  id: 'heranca',
  title: 'Herança',
  subtitle: 'Reaproveitando comportamento',
  description:
    'Herança permite que uma classe derivada adquira atributos e métodos de uma classe base. A relação "é um" (Carro é um Veiculo) permite especializar comportamento sem duplicar lógica comum.',
  panelLabel: 'classes',
  languages: ['cpp'],
  code: { cpp: herancaCode },
  steps: () => [
    so(
      lineOf(herancaCode, 'class Veiculo'),
      'Definição da classe base Veiculo com o comportamento geral ligar().',
      { blueprints: [veiculoBlueprint] },
      { 'classe base': 'Veiculo' },
    ),
    so(
      lineOf(herancaCode, 'class Carro : public Veiculo'),
      'Definição da classe derivada Carro: herda publicamente de Veiculo e adiciona abrirPorta().',
      { blueprints: [veiculoBlueprint, carroBlueprint] },
      { 'classe derivada': 'Carro', 'herda de': 'Veiculo' },
    ),
    so(
      lineOf(herancaCode, 'Carro c;'),
      'Instanciação de Carro c: a instância contém a subestrutura de Veiculo integrada na sua memória.',
      {
        blueprints: [veiculoBlueprint, carroBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Carro c',
            className: 'Carro',
            state: 'active',
            attributes: [{ name: 'base', value: 'Veiculo embutido', visibility: 'public' }],
          },
        ],
      },
      { 'instância': 'c', 'tipo': 'Carro' },
    ),
    so(
      lineOf(herancaCode, 'c.ligar();'),
      'Invocação de c.ligar() no main(): o programa solicita a execução do método no objeto c.',
      {
        blueprints: [veiculoBlueprint, carroBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Carro c',
            className: 'Carro',
            attributes: [{ name: 'base', value: 'Veiculo embutido', visibility: 'public' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.ligar()',
          dispatchedTo: 'Veiculo::ligar [herdado]',
          effect: 'busca na hierarquia de herança',
        },
      },
      { 'chamada': 'c.ligar()' },
    ),
    so(
      lineOf(herancaCode, 'void ligar()'),
      'Resolução de método herdado: o compilador busca ligar() em Carro, não encontra, e resolve no ancestral Veiculo.',
      {
        blueprints: [veiculoBlueprint, carroBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Carro c',
            className: 'Carro',
            attributes: [{ name: 'base', value: 'Veiculo embutido', visibility: 'public' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.ligar()',
          dispatchedTo: 'Veiculo::ligar [herdado]',
          effect: 'executando Veiculo::ligar',
        },
      },
      { 'resolvido em': 'Veiculo::ligar' },
    ),
    so(
      lineOf(herancaCode, 'cout << "Veiculo ligado"'),
      'Execução do método herdado da classe base.',
      {
        blueprints: [veiculoBlueprint, carroBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Carro c',
            className: 'Carro',
            attributes: [{ name: 'base', value: 'Veiculo embutido', visibility: 'public' }],
          },
        ],
      },
      { 'saída': '"Veiculo ligado"' },
    ),
    so(
      lineOf(herancaCode, 'c.abrirPorta();'),
      'Invocação do método específico c.abrirPorta() no main().',
      {
        blueprints: [veiculoBlueprint, carroBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Carro c',
            className: 'Carro',
            attributes: [{ name: 'base', value: 'Veiculo embutido', visibility: 'public' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.abrirPorta()',
          dispatchedTo: 'Carro::abrirPorta',
          effect: 'busca local em Carro',
        },
      },
      { 'chamada': 'c.abrirPorta()' },
    ),
    so(
      lineOf(herancaCode, 'void abrirPorta()'),
      'Resolução local: o método abrirPorta pertence diretamente à classe derivada Carro.',
      {
        blueprints: [veiculoBlueprint, carroBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Carro c',
            className: 'Carro',
            attributes: [{ name: 'base', value: 'Veiculo embutido', visibility: 'public' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'c.abrirPorta()',
          dispatchedTo: 'Carro::abrirPorta',
          effect: 'executando Carro::abrirPorta',
        },
      },
      { 'resolvido em': 'Carro::abrirPorta' },
    ),
    so(
      lineOf(herancaCode, 'cout << "Porta aberta"'),
      'Execução do método especializado da filha.',
      {
        blueprints: [veiculoBlueprint, carroBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Carro c',
            className: 'Carro',
            attributes: [{ name: 'base', value: 'Veiculo embutido', visibility: 'public' }],
          },
        ],
      },
      { 'saída': '"Porta aberta"' },
    ),
    so(
      lineOf(herancaCode, 'return 0;'),
      'Herança permite estender e reutilizar funcionalidades de forma estruturada.',
      {
        blueprints: [veiculoBlueprint, carroBlueprint],
        instances: [
          {
            id: 'c',
            label: 'Carro c',
            className: 'Carro',
            attributes: [{ name: 'base', value: 'Veiculo embutido', visibility: 'public' }],
          },
        ],
      },
      { 'status': 'concluído' },
    ),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 7. Polimorfismo
 * ────────────────────────────────────────────────────────────────────────── */

const polimorfismoCode = lines(`
#include <iostream>
using namespace std;

class Animal {
public:
  virtual void emitirSom() {
    cout << "Som generico" << endl;
  }
};

class Cachorro : public Animal {
public:
  void emitirSom() override {
    cout << "Au au" << endl;
  }
};

class Gato : public Animal {
public:
  void emitirSom() override {
    cout << "Miau" << endl;
  }
};

int main() {
  Animal* a;
  Cachorro c;
  Gato g;
  a = &c;
  a->emitirSom();
  a = &g;
  a->emitirSom();
  return 0;
}`);

const animalBlueprint: ObjectClassBlueprint = {
  name: 'Animal',
  methods: [{ name: 'emitirSom', params: '', returnType: 'void', visibility: 'public', isVirtual: true }],
};

const cachorroBlueprint: ObjectClassBlueprint = {
  name: 'Cachorro',
  baseClass: 'Animal',
  methods: [{ name: 'emitirSom', params: '', returnType: 'void', visibility: 'public', isOverride: true }],
};

const gatoBlueprint: ObjectClassBlueprint = {
  name: 'Gato',
  baseClass: 'Animal',
  methods: [{ name: 'emitirSom', params: '', returnType: 'void', visibility: 'public', isOverride: true }],
};

export const lessonPolimorfismo: Lesson = {
  ...base,
  id: 'polimorfismo',
  title: 'Polimorfismo',
  subtitle: 'Um método, várias formas',
  description:
    'Polimorfismo permite tratar instâncias de classes derivadas através de um ponteiro da classe base. A palavra-chave virtual viabiliza o despacho dinâmico (dynamic dispatch / vtable): em tempo de execução, o C++ descobre o tipo real do objeto e executa a função sobrescrita correspondente.',
  panelLabel: 'animal',
  languages: ['cpp'],
  code: { cpp: polimorfismoCode },
  steps: () => [
    so(
      lineOf(polimorfismoCode, 'class Animal'),
      'Classe base Animal define método virtual emitirSom(): a palavra-chave virtual habilita a ligação dinâmica (vtable).',
      { blueprints: [animalBlueprint] },
      { 'virtual': 'ativado' },
    ),
    so(
      lineOf(polimorfismoCode, 'class Cachorro : public Animal'),
      'Cachorro e Gato sobrescrevem o método emitirSom() com a marcação override.',
      { blueprints: [animalBlueprint, cachorroBlueprint, gatoBlueprint] },
      { 'sobrescrita': 'override' },
    ),
    so(
      lineOf(polimorfismoCode, 'Animal* a;'),
      'Declaração do ponteiro polimórfico a do tipo base Animal*. Inicialmente aponta para nullptr.',
      {
        blueprints: [animalBlueprint, cachorroBlueprint, gatoBlueprint],
        pointer: { name: 'Animal* a', type: 'Animal*', targetId: null, targetLabel: 'nullptr' },
      },
      { 'ponteiro': 'a = nullptr' },
    ),
    so(
      lineOf(polimorfismoCode, 'Cachorro c;'),
      'Instanciação dos objetos concretos c (Cachorro) e g (Gato) na memória.',
      {
        blueprints: [animalBlueprint, cachorroBlueprint, gatoBlueprint],
        pointer: { name: 'Animal* a', type: 'Animal*', targetId: null, targetLabel: 'nullptr' },
        instances: [
          {
            id: 'c',
            label: 'c',
            className: 'Cachorro',
            attributes: [{ name: 'vtable', value: '&Cachorro::emitirSom', visibility: 'private' }],
          },
          {
            id: 'g',
            label: 'g',
            className: 'Gato',
            attributes: [{ name: 'vtable', value: '&Gato::emitirSom', visibility: 'private' }],
          },
        ],
      },
      { 'objetos criados': 'c, g' },
    ),
    so(
      lineOf(polimorfismoCode, 'a = &c;'),
      'Ponteiro de tipo base Animal* passa a apontar para o endereço do objeto derivado Cachorro (&c).',
      {
        blueprints: [animalBlueprint, cachorroBlueprint, gatoBlueprint],
        pointer: { name: 'Animal* a', type: 'Animal*', targetId: 'c', targetLabel: '&c (Cachorro)' },
        instances: [
          {
            id: 'c',
            label: 'c',
            className: 'Cachorro',
            state: 'write',
            attributes: [{ name: 'vtable', value: '&Cachorro::emitirSom', visibility: 'private', sourceValue: 'apontado por a' }],
          },
          {
            id: 'g',
            label: 'g',
            className: 'Gato',
            attributes: [{ name: 'vtable', value: '&Gato::emitirSom', visibility: 'private' }],
          },
        ],
      },
      { 'a aponta para': '&c (Cachorro)' },
    ),
    so(
      lineOf(polimorfismoCode, 'a->emitirSom();'),
      'Invocação polimórfica: a->emitirSom() é chamado pelo ponteiro base a.',
      {
        blueprints: [animalBlueprint, cachorroBlueprint, gatoBlueprint],
        pointer: { name: 'Animal* a', type: 'Animal*', targetId: 'c', targetLabel: '&c (Cachorro)' },
        instances: [
          {
            id: 'c',
            label: 'c',
            className: 'Cachorro',
            attributes: [{ name: 'vtable', value: '&Cachorro::emitirSom', visibility: 'private' }],
          },
          {
            id: 'g',
            label: 'g',
            className: 'Gato',
            attributes: [{ name: 'vtable', value: '&Gato::emitirSom', visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a->emitirSom()',
          dispatchedTo: 'Cachorro::emitirSom',
          effect: 'consulta vtable de &c',
        },
      },
      { 'despacho': 'vtable de Cachorro' },
    ),
    so(
      lineOf(polimorfismoCode, 'void emitirSom() override {'),
      'Ligação dinâmica (dynamic dispatch): a execução cai em Cachorro::emitirSom(), imprimindo "Au au".',
      {
        blueprints: [animalBlueprint, cachorroBlueprint, gatoBlueprint],
        pointer: { name: 'Animal* a', type: 'Animal*', targetId: 'c', targetLabel: '&c (Cachorro)' },
        instances: [
          {
            id: 'c',
            label: 'c',
            className: 'Cachorro',
            attributes: [{ name: 'vtable', value: '&Cachorro::emitirSom', visibility: 'private', state: 'read', sourceValue: 'Au au' }],
          },
          {
            id: 'g',
            label: 'g',
            className: 'Gato',
            attributes: [{ name: 'vtable', value: '&Gato::emitirSom', visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a->emitirSom()',
          dispatchedTo: 'Cachorro::emitirSom',
          effect: 'emite "Au au"',
        },
      },
      { 'método chamado': 'Cachorro::emitirSom', 'saída': '"Au au"' },
    ),
    so(
      lineOf(polimorfismoCode, 'a = &g;'),
      'Redirecionamento: o mesmo ponteiro base a agora aponta para o endereço do objeto Gato (&g).',
      {
        blueprints: [animalBlueprint, cachorroBlueprint, gatoBlueprint],
        pointer: { name: 'Animal* a', type: 'Animal*', targetId: 'g', targetLabel: '&g (Gato)' },
        instances: [
          {
            id: 'c',
            label: 'c',
            className: 'Cachorro',
            attributes: [{ name: 'vtable', value: '&Cachorro::emitirSom', visibility: 'private' }],
          },
          {
            id: 'g',
            label: 'g',
            className: 'Gato',
            state: 'write',
            attributes: [{ name: 'vtable', value: '&Gato::emitirSom', visibility: 'private', sourceValue: 'apontado por a' }],
          },
        ],
      },
      { 'a aponta para': '&g (Gato)' },
    ),
    so(
      lineOf(polimorfismoCode, 'a->emitirSom();'),
      'A mesma instrução a->emitirSom(), sem alteração no código, agora consulta a vtable de g.',
      {
        blueprints: [animalBlueprint, cachorroBlueprint, gatoBlueprint],
        pointer: { name: 'Animal* a', type: 'Animal*', targetId: 'g', targetLabel: '&g (Gato)' },
        instances: [
          {
            id: 'c',
            label: 'c',
            className: 'Cachorro',
            attributes: [{ name: 'vtable', value: '&Cachorro::emitirSom', visibility: 'private' }],
          },
          {
            id: 'g',
            label: 'g',
            className: 'Gato',
            attributes: [{ name: 'vtable', value: '&Gato::emitirSom', visibility: 'private' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a->emitirSom()',
          dispatchedTo: 'Gato::emitirSom',
          effect: 'consulta vtable de &g',
        },
      },
      { 'despacho': 'vtable de Gato' },
    ),
    so(
      lineOf(polimorfismoCode, 'void emitirSom() override {'),
      'Ligação dinâmica: o método executado agora é Gato::emitirSom(), imprimindo "Miau".',
      {
        blueprints: [animalBlueprint, cachorroBlueprint, gatoBlueprint],
        pointer: { name: 'Animal* a', type: 'Animal*', targetId: 'g', targetLabel: '&g (Gato)' },
        instances: [
          {
            id: 'c',
            label: 'c',
            className: 'Cachorro',
            attributes: [{ name: 'vtable', value: '&Cachorro::emitirSom', visibility: 'private' }],
          },
          {
            id: 'g',
            label: 'g',
            className: 'Gato',
            attributes: [{ name: 'vtable', value: '&Gato::emitirSom', visibility: 'private', state: 'read', sourceValue: 'Miau' }],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a->emitirSom()',
          dispatchedTo: 'Gato::emitirSom',
          effect: 'emite "Miau"',
        },
      },
      { 'método chamado': 'Gato::emitirSom', 'saída': '"Miau"' },
    ),
    so(
      lineOf(polimorfismoCode, 'return 0;'),
      'Polimorfismo: múltiplos comportamentos a partir da mesma interface genérica em tempo de execução.',
      {
        blueprints: [animalBlueprint, cachorroBlueprint, gatoBlueprint],
        instances: [
          {
            id: 'c',
            label: 'c',
            className: 'Cachorro',
            attributes: [{ name: 'vtable', value: '&Cachorro::emitirSom', visibility: 'private' }],
          },
          {
            id: 'g',
            label: 'g',
            className: 'Gato',
            attributes: [{ name: 'vtable', value: '&Gato::emitirSom', visibility: 'private' }],
          },
        ],
      },
      { 'status': 'finalizado' },
    ),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 8. Métodos Acessores (Getters e Setters)
 * ────────────────────────────────────────────────────────────────────────── */

const acessoresCode = lines(`
#include <iostream>
#include <string>
using namespace std;

class Aluno {
private:
  string nome;
  int idade;
public:
  Aluno() { nome = "nao informado"; idade = 0; }
  void setNome(string n) { nome = n; }
  string getNome() { return nome; }
  void setIdade(int i) {
    if (i >= 0 && i <= 120) idade = i;
  }
  int getIdade() { return idade; }
};

int main() {
  Aluno a;
  a.setNome("Ana");
  a.setIdade(20);
  cout << a.getNome() << " " << a.getIdade() << endl;
  return 0;
}`);

const alunoAcessoresBlueprint: ObjectClassBlueprint = {
  name: 'Aluno',
  attributes: [
    { name: 'nome', type: 'string', visibility: 'private' },
    { name: 'idade', type: 'int', visibility: 'private' },
  ],
  methods: [
    { name: 'Aluno', params: '', returnType: '', visibility: 'public' },
    { name: 'setNome', params: 'string n', returnType: 'void', visibility: 'public' },
    { name: 'getNome', params: '', returnType: 'string', visibility: 'public' },
    { name: 'setIdade', params: 'int i', returnType: 'void', visibility: 'public' },
    { name: 'getIdade', params: '', returnType: 'int', visibility: 'public' },
  ],
};

export const lessonAcessores: Lesson = {
  ...base,
  id: 'metodos-acessores',
  title: 'Métodos acessores',
  subtitle: 'Getters e setters',
  description:
    'Getters leem atributos privados com segurança; setters alteram aplicando validação de limites e regras de integridade. Isso protege os dados internos contra valores inválidos e centraliza a manutenção.',
  panelLabel: 'aluno',
  languages: ['cpp'],
  code: { cpp: acessoresCode },
  steps: () => [
    so(
      lineOf(acessoresCode, 'class Aluno'),
      'A classe Aluno protege nome e idade como membros privados, expondo getters e setters com validação.',
      { blueprints: [alunoAcessoresBlueprint] },
      { 'classe': 'Aluno' },
    ),
    so(
      lineOf(acessoresCode, 'Aluno a;'),
      'Instanciação: o construtor default define nome = "nao informado" e idade = 0.',
      {
        blueprints: [alunoAcessoresBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            state: 'write',
            attributes: [
              { name: 'nome', value: 'nao informado', visibility: 'private' },
              { name: 'idade', value: 0, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'Aluno()',
          dispatchedTo: 'Aluno::Aluno',
          effect: 'inicialização default',
        },
      },
      { 'a.nome': '"nao informado"', 'a.idade': 0 },
    ),
    so(
      lineOf(acessoresCode, 'a.setNome("Ana");'),
      'Invocação do setter setNome("Ana") para atualizar o nome protegido.',
      {
        blueprints: [alunoAcessoresBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'nao informado', visibility: 'private' },
              { name: 'idade', value: 0, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setNome("Ana")',
          dispatchedTo: 'Aluno::setNome',
          params: { n: 'Ana' },
          effect: 'prepara envio de "Ana"',
        },
      },
      { 'setter': 'setNome' },
    ),
    so(
      lineOf(acessoresCode, 'void setNome(string n) { nome = n; }'),
      'O setter grava com sucesso o novo nome na instância.',
      {
        blueprints: [alunoAcessoresBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private', state: 'write', sourceValue: 'parâmetro n ("Ana")' },
              { name: 'idade', value: 0, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setNome("Ana")',
          dispatchedTo: 'Aluno::setNome',
          effect: 'atualiza a.nome = "Ana"',
        },
      },
      { 'a.nome': '"Ana"' },
    ),
    so(
      lineOf(acessoresCode, 'a.setIdade(20);'),
      'Invocação do setter setIdade(20) que contém verificação de integridade.',
      {
        blueprints: [alunoAcessoresBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private' },
              { name: 'idade', value: 0, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setIdade(20)',
          dispatchedTo: 'Aluno::setIdade',
          params: { i: 20 },
          effect: 'prepara validação da idade',
        },
      },
      { 'setter': 'setIdade', 'valor proposto': 20 },
    ),
    so(
      lineOf(acessoresCode, 'void setIdade(int i)'),
      'Entrada no setter setIdade: parâmetro i recebe 20.',
      {
        blueprints: [alunoAcessoresBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private' },
              { name: 'idade', value: 0, visibility: 'private' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setIdade(20)',
          dispatchedTo: 'Aluno::setIdade',
          params: { i: 20 },
          effect: 'testa se 0 <= i <= 120',
        },
      },
      { 'parâmetro i': 20 },
    ),
    so(
      lineOf(acessoresCode, 'if (i >= 0 && i <= 120) idade = i;'),
      'A regra de negócio (0 <= 20 <= 120) é atendida: a idade de a é atualizada para 20.',
      {
        blueprints: [alunoAcessoresBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private' },
              { name: 'idade', value: 20, visibility: 'private', state: 'write', sourceValue: 'validado: 20' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.setIdade(20)',
          dispatchedTo: 'Aluno::setIdade',
          effect: 'atualiza a.idade = 20',
        },
      },
      { 'a.idade': 20 },
    ),
    so(
      lineOf(acessoresCode, 'cout << a.getNome()'),
      'Os getters getNome() e getIdade() retornam os valores sem conceder acesso de escrita ao chamador.',
      {
        blueprints: [alunoAcessoresBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private', state: 'read', sourceValue: 'retorna "Ana"' },
              { name: 'idade', value: 20, visibility: 'private', state: 'read', sourceValue: 'retorna 20' },
            ],
          },
        ],
        call: {
          caller: 'main()',
          target: 'a.getNome()',
          dispatchedTo: 'Aluno::getNome',
          returned: 'Ana',
          effect: 'retorna "Ana"',
        },
      },
      { 'saída': '"Ana 20"' },
    ),
    so(
      lineOf(acessoresCode, 'return 0;'),
      'Getters e setters mantêm a integridade de dados e evitam que valores inválidos entrem no objeto.',
      {
        blueprints: [alunoAcessoresBlueprint],
        instances: [
          {
            id: 'a',
            label: 'Aluno a',
            className: 'Aluno',
            attributes: [
              { name: 'nome', value: 'Ana', visibility: 'private' },
              { name: 'idade', value: 20, visibility: 'private' },
            ],
          },
        ],
      },
      { 'status': 'concluído' },
    ),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * 9. Exceções
 * ────────────────────────────────────────────────────────────────────────── */

const excecoesCode = lines(`
#include <iostream>
#include <stdexcept>
using namespace std;

double dividir(double a, double b) {
  if (b == 0) throw runtime_error("divisao por zero");
  return a / b;
}

int main() {
  try {
    double r = dividir(10, 0);
    cout << r << endl;
  }
  catch (const exception& e) {
    cout << "Erro: " << e.what() << endl;
  }
  return 0;
}`);

export const lessonExcecoes: Lesson = {
  ...base,
  id: 'excecoes',
  title: 'Exceções',
  subtitle: 'Tratando erros em C++',
  description:
    'Exceções separam o fluxo normal do tratamento de anomalias. try delimita o bloco monitorado; throw interrompe a rotina e lança o erro; catch captura o objeto de exceção para tratá-lo sem abortar o processo.',
  panelLabel: 'execução',
  languages: ['cpp'],
  code: { cpp: excecoesCode },
  steps: () => [
    so(
      lineOf(excecoesCode, 'double dividir(double a, double b)'),
      'A função dividir(a, b) possui cláusula de guarda para evitar divisão por zero.',
      {
        exception: { stage: 'try' },
      },
      { 'função': 'dividir' },
    ),
    so(
      lineOf(excecoesCode, 'try {'),
      'O bloco try protege a execução, pronto para interceptar exceções lançadas pelas instruções internas.',
      {
        exception: { stage: 'try' },
      },
      { 'bloco': 'try monitorado' },
    ),
    so(
      lineOf(excecoesCode, 'double r = dividir(10, 0);'),
      'Chamada a dividir(10, 0): os argumentos a = 10 e b = 0 são repassados à função.',
      {
        call: {
          caller: 'main() [bloco try]',
          target: 'dividir(10, 0)',
          params: { a: 10, b: 0 },
          effect: 'invoca função com b=0',
        },
        exception: { stage: 'try' },
      },
      { 'a': 10, 'b': 0 },
    ),
    so(
      lineOf(excecoesCode, 'if (b == 0) throw runtime_error("divisao por zero");'),
      'Condição crítica satisfeita (b == 0): o throw dispara uma exceção runtime_error. A função é abortada imediatamente.',
      {
        exception: {
          stage: 'throw',
          errorType: 'runtime_error',
          message: 'divisao por zero',
          bypassed: true,
        },
      },
      { 'exceção disparada': 'runtime_error("divisao por zero")' },
    ),
    so(
      lineOf(excecoesCode, 'cout << r << endl;'),
      'O restante do bloco try é descartado: a instrução cout << r é pulada para proteger o programa.',
      {
        exception: {
          stage: 'throw',
          errorType: 'runtime_error',
          message: 'divisao por zero',
          bypassed: true,
        },
      },
      { 'fluxo normal': 'interrompido' },
    ),
    so(
      lineOf(excecoesCode, 'catch (const exception& e) {'),
      'O controle salta diretamente para o bloco catch compatível, capturando a exceção lançada.',
      {
        exception: {
          stage: 'catch',
          errorType: 'runtime_error',
          message: 'divisao por zero',
        },
      },
      { 'captura': 'catch (const exception& e)' },
    ),
    so(
      lineOf(excecoesCode, 'cout << "Erro: " << e.what() << endl;'),
      'Tratamento concluído: e.what() recupera a mensagem original "divisao por zero" e exibe no console.',
      {
        exception: {
          stage: 'handled',
          errorType: 'runtime_error',
          message: 'divisao por zero',
        },
      },
      { 'saída': '"Erro: divisao por zero"' },
    ),
    so(
      lineOf(excecoesCode, 'return 0;'),
      'O programa continua sua execução normalmente após o catch sem travar (crash).',
      {
        exception: {
          stage: 'handled',
          message: 'Erro tratado com sucesso',
        },
      },
      { 'status': 'recuperado com sucesso' },
    ),
  ],
};
