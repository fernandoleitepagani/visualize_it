import type { Cell, Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const c = (val: Cell['val'], labels: string[], state = ''): Cell => ({ val, labels, state });
const s = (line: number, desc: string, cells: Cell[]): Step => ({ line, desc, cells });

const base = {
  view: 'cells' as const,
  inputless: true,
  initial: [1],
  complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
};

export const lessonOop: Lesson = {
  ...base,
  id: 'oop',
  title: 'OOP',
  subtitle: 'Objetos, classes e os quatro pilares',
  description: 'Uma classe define o tipo; um objeto é uma instância com estado próprio. Os pilares são abstração, encapsulamento, herança e polimorfismo.',
  panelLabel: 'objeto',
  languages: ['cpp'],
  code: {
    cpp: lines(`
class Aluno {
public:
  string nome;
  int matricula;
};
Aluno a;
a.nome = "Ana";`),
  },
  steps: () => [
    s(0, 'Definir a classe Aluno.', [c('Aluno', ['classe']), c('—', ['objeto'])]),
    s(5, 'Criar o objeto a.', [c('Aluno', ['classe']), c('a', ['objeto'])]),
    s(6, 'Atribuir nome ao objeto.', [c('Ana', ['nome'], 'write'), c('—', ['matrícula'])]),
  ],
};

export const lessonAbstracao: Lesson = {
  ...base,
  id: 'abstracao',
  title: 'Abstração',
  subtitle: 'Separar o essencial dos detalhes',
  description: 'A abstração expõe apenas o que o usuário da classe precisa saber. Conta.depositar() esconde como o saldo é atualizado.',
  panelLabel: 'conta',
  languages: ['cpp'],
  code: {
    cpp: lines(`
class Conta {
private:
  double saldo = 0;
public:
  void depositar(double v) { saldo += v; }
};`),
  },
  steps: () => [
    s(0, 'Definir a classe Conta.', [c('Conta', ['classe'])]),
    s(2, 'O saldo fica encapsulado.', [c(0, ['saldo'], 'active')]),
    s(4, 'A operação pública depositar esconde o detalhe.', [c(0, ['saldo']), c('depositar', ['operação'], 'write')]),
  ],
};

export const lessonClasses: Lesson = {
  ...base,
  id: 'classes',
  title: 'Classes',
  subtitle: 'Um novo tipo de dado',
  description: 'A classe agrupa atributos e comportamentos. Cada objeto criado a partir dela tem seus próprios valores.',
  panelLabel: 'classe',
  languages: ['cpp'],
  code: {
    cpp: lines(`
class Pessoa {
public:
  string nome;
  int idade;
};
Pessoa p;
p.idade = 20;`),
  },
  steps: () => [
    s(0, 'Definir a classe Pessoa.', [c('Pessoa', ['classe'])]),
    s(5, 'Criar o objeto p.', [c('—', ['nome']), c('—', ['idade'])]),
    s(6, 'Definir a idade.', [c('—', ['nome']), c(20, ['idade'], 'write')]),
  ],
};

export const lessonConstrutores: Lesson = {
  ...base,
  id: 'construtores',
  title: 'Construtores',
  subtitle: 'Inicializando objetos',
  description: 'O construtor roda quando o objeto é criado e garante que os atributos comecem válidos.',
  panelLabel: 'ponto',
  languages: ['cpp'],
  code: {
    cpp: lines(`
class Ponto {
public:
  int x, y;
  Ponto(int x0, int y0) { x = x0; y = y0; }
};
Ponto p(3, 4);`),
  },
  steps: () => [
    s(0, 'Definir a classe Ponto.', [c('Ponto', ['classe'])]),
    s(3, 'O construtor recebe x0 e y0.', [c('x0', ['parâmetro']), c('y0', ['parâmetro'])]),
    s(5, 'Criar p com os valores iniciais.', [c(3, ['x'], 'write'), c(4, ['y'], 'write')]),
  ],
};

export const lessonEncapsulamento: Lesson = {
  ...base,
  id: 'encapsulamento',
  title: 'Encapsulamento',
  subtitle: 'Protegendo o estado',
  description: 'Atributos privados só mudam pelos métodos da própria classe; o código externo usa a interface pública.',
  panelLabel: 'conta',
  languages: ['cpp'],
  code: {
    cpp: lines(`
class Conta {
private:
  double saldo = 0;
public:
  void depositar(double v) { saldo += v; }
  double getSaldo() { return saldo; }
};`),
  },
  steps: () => [
    s(0, 'Definir a classe Conta.', [c('Conta', ['classe'])]),
    s(2, 'saldo é privado.', [c(0, ['saldo'], 'active')]),
    s(4, 'Depositar altera o saldo por dentro.', [c(50, ['saldo'], 'write')]),
    s(5, 'getSaldo expõe apenas a leitura.', [c(50, ['saldo']), c('getSaldo', ['método'], 'active')]),
  ],
};

export const lessonHeranca: Lesson = {
  ...base,
  id: 'heranca',
  title: 'Herança',
  subtitle: 'Reaproveitando comportamento',
  description: 'Uma classe filha herda atributos e métodos da classe base e pode especializar o comportamento.',
  panelLabel: 'classes',
  languages: ['cpp'],
  code: {
    cpp: lines(`
class Animal {
public:
  void falar() { cout << "..."; }
};
class Cachorro : public Animal {
public:
  void falar() { cout << "Au"; }
};`),
  },
  steps: () => [
    s(0, 'Animal é a classe base.', [c('Animal', ['base'])]),
    s(4, 'Cachorro herda de Animal.', [c('Cachorro', ['filha'], 'write')]),
    s(6, 'Cachorro especializa falar().', [c('Au', ['som'], 'active')]),
  ],
};

export const lessonPolimorfismo: Lesson = {
  ...base,
  id: 'polimorfismo',
  title: 'Polimorfismo',
  subtitle: 'Um método, várias formas',
  description: 'Com virtual, a chamada usa o tipo real do objeto em tempo de execução, não apenas o tipo do ponteiro.',
  panelLabel: 'animal',
  languages: ['cpp'],
  code: {
    cpp: lines(`
class Animal {
public:
  virtual void falar() { cout << "..."; }
};
class Gato : public Animal {
public:
  void falar() override { cout << "Miau"; }
};
Animal* a = new Gato();
a->falar();`),
  },
  steps: () => [
    s(0, 'Animal define a interface virtual.', [c('Animal', ['base'])]),
    s(4, 'Gato sobrescreve falar().', [c('Gato', ['filha'], 'write')]),
    s(8, 'O ponteiro é do tipo Animal.', [c('Animal*', ['ponteiro'])]),
    s(9, 'A chamada executa a versão do Gato.', [c('Miau', ['som'], 'active')]),
  ],
};

export const lessonAcessores: Lesson = {
  ...base,
  id: 'metodos-acessores',
  title: 'Métodos acessores',
  subtitle: 'Getters e setters',
  description: 'Getters leem o estado; setters validam e alteram. Eles preservam o encapsulamento sem expor atributos privados.',
  panelLabel: 'produto',
  languages: ['cpp'],
  code: {
    cpp: lines(`
class Produto {
private:
  double preco = 0;
public:
  double getPreco() { return preco; }
  void setPreco(double v) { preco = v; }
};`),
  },
  steps: () => [
    s(0, 'Definir a classe Produto.', [c('Produto', ['classe'])]),
    s(2, 'preco é privado.', [c(0, ['preço'], 'active')]),
    s(4, 'getPreco lê o valor.', [c(0, ['preço'])]),
    s(5, 'setPreco altera com validação.', [c(25, ['preço'], 'write')]),
  ],
};

export const lessonExcecoes: Lesson = {
  ...base,
  id: 'excecoes',
  title: 'Exceções',
  subtitle: 'Tratando erros em C++',
  description: 'throw interrompe o fluxo normal; catch trata o erro sem deixar o programa em estado inválido.',
  panelLabel: 'execução',
  languages: ['cpp'],
  code: {
    cpp: lines(`
int dividir(int a, int b) {
  if (b == 0) throw runtime_error("divisao por zero");
  return a / b;
}
try {
  int r = dividir(10, 0);
} catch (exception& e) {
  cout << e.what();
}`),
  },
  steps: () => [
    s(0, 'Chamar dividir(10, 0).', [c(10, ['a']), c(0, ['b'])]),
    s(1, 'b é zero: lançar exceção.', [c('erro', ['estado'], 'write')]),
    s(5, 'try captura a falha.', [c('try', ['bloco'], 'active')]),
    s(7, 'catch trata a mensagem.', [c('divisao por zero', ['mensagem'], 'write')]),
  ],
};
