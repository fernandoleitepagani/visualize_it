import type { Cell, Lesson, Step } from '@/engine/types';
import { lines } from '@/lib/lines';

const c = (val: Cell['val'], labels: string[], state = ''): Cell => ({ val, labels, state });
const s = (line: number, desc: string, cells: Cell[]): Step => ({ line, desc, cells });
const lineOf = (code: string[], text: string): number => {
  const index = code.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada: ${text}`);
  return index;
};

const base = {
  view: 'cells' as const,
  inputless: true,
  initial: [1],
  complexity: { time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' }, space: 'Θ(1)' },
};

const oopCode = lines(`
#include <iostream>
#include <string>
using namespace std;

class Aluno {
private:
  string nome;
  int matricula;
public:
  void setNome(string n) { nome = n; }
  void setMatricula(int m) { matricula = m; }
  string getNome() { return nome; }
};

int main() {
  Aluno a;
  a.setNome("Ana");
  a.setMatricula(202601);
  cout << a.getNome() << endl;
  return 0;
}`);

export const lessonOop: Lesson = {
  ...base,
  id: 'oop',
  title: 'OOP',
  subtitle: 'Objetos, classes e os quatro pilares',
  description:
    'O paradigma orientado a objetos organiza o programa em classes e objetos. A classe é o molde que define atributos e comportamentos; o objeto é uma instância com estado próprio. Os quatro pilares são abstração, encapsulamento, herança e polimorfismo, e todos dependem da classe como unidade básica.',
  panelLabel: 'objeto',
  languages: ['cpp'],
  code: { cpp: oopCode },
  steps: () => [
    s(lineOf(oopCode, 'class Aluno'), 'Definir a classe Aluno como molde.', [c('Aluno', ['classe']), c('—', ['objeto'])]),
    s(lineOf(oopCode, 'void setNome'), 'Métodos definem o comportamento público.', [c('setNome', ['método']), c('privado', ['estado'], 'active')]),
    s(lineOf(oopCode, 'Aluno a;'), 'Criar o objeto a: agora existe uma instância.', [c('Aluno', ['classe']), c('a', ['objeto'], 'write')]),
    s(lineOf(oopCode, 'a.setNome'), 'O objeto recebe estado próprio.', [c('Ana', ['nome'], 'write'), c('202601', ['matrícula'])]),
  ],
};

const abstracaoCode = lines(`
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
  void sacar(double valor) {
    if (valor <= saldo) saldo -= valor;
  }
  double getSaldo() { return saldo; }
};

int main() {
  Conta c;
  c.depositar(100);
  c.sacar(30);
  cout << c.getSaldo() << endl;
  return 0;
}`);

export const lessonAbstracao: Lesson = {
  ...base,
  id: 'abstracao',
  title: 'Abstração',
  subtitle: 'Separar o essencial dos detalhes',
  description:
    'Abstração é representar apenas as características importantes de um conceito, ignorando detalhes internos. A classe Conta expõe depositar, sacar e getSaldo; como o saldo é atualizado e validado fica escondido. Quem usa a conta trabalha com a interface, não com a implementação.',
  panelLabel: 'conta',
  languages: ['cpp'],
  code: { cpp: abstracaoCode },
  steps: () => [
    s(lineOf(abstracaoCode, 'class Conta'), 'A classe representa o conceito de conta.', [c('Conta', ['classe'])]),
    s(lineOf(abstracaoCode, 'double saldo'), 'O saldo interno fica escondido.', [c(0, ['saldo'], 'active')]),
    s(lineOf(abstracaoCode, 'void depositar'), 'A interface pública oferece operações.', [c('depositar', ['operação']), c('sacar', ['operação'])]),
    s(lineOf(abstracaoCode, 'c.depositar'), 'O uso não depende dos detalhes internos.', [c(70, ['saldo'], 'write')]),
  ],
};

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

export const lessonClasses: Lesson = {
  ...base,
  id: 'classes',
  title: 'Classes',
  subtitle: 'Um novo tipo de dado',
  description:
    'Uma classe descreve quais informações um objeto armazena e quais operações ele executa. Ela funciona como molde, projeto ou especificação: ainda não ocupa memória como objeto. Cada instância criada recebe seus próprios valores de atributos.',
  panelLabel: 'classe',
  languages: ['cpp'],
  code: { cpp: classesCode },
  steps: () => [
    s(lineOf(classesCode, 'class Pessoa'), 'Definir o molde Pessoa.', [c('Pessoa', ['classe'])]),
    s(lineOf(classesCode, 'string nome'), 'Atributos guardam o estado.', [c('—', ['nome']), c('—', ['idade'])]),
    s(lineOf(classesCode, 'Pessoa p;'), 'Criar uma instância do molde.', [c('Pessoa', ['classe']), c('p', ['objeto'], 'write')]),
    s(lineOf(classesCode, 'p.nome'), 'Cada objeto tem seus valores.', [c('Carlos', ['nome'], 'write'), c(30, ['idade'], 'write')]),
  ],
};

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

export const lessonConstrutores: Lesson = {
  ...base,
  id: 'construtores',
  title: 'Construtores',
  subtitle: 'Inicializando objetos',
  description:
    'O construtor é um método especial com o mesmo nome da classe e sem tipo de retorno. Ele executa automaticamente quando o objeto é criado, garantindo que atributos recebam valores válidos. Com parâmetros, o objeto já nasce preenchido e evita esquecimentos ou lixo de memória.',
  panelLabel: 'pessoa',
  languages: ['cpp'],
  code: { cpp: construtoresCode },
  steps: () => [
    s(lineOf(construtoresCode, 'class Pessoa'), 'A classe define atributos privados.', [c('Pessoa', ['classe'])]),
    s(lineOf(construtoresCode, 'Pessoa(string'), 'O construtor recebe os valores iniciais.', [c('n', ['parâmetro']), c('i', ['parâmetro'])]),
    s(lineOf(construtoresCode, 'nome = n'), 'O construtor inicializa o estado.', [c('Carlos', ['nome'], 'write'), c(30, ['idade'], 'write')]),
    s(lineOf(construtoresCode, 'Pessoa p('), 'Criar o objeto já preenchido.', [c('Carlos', ['nome']), c(30, ['idade'])]),
  ],
};

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
    'Encapsulamento controla a visibilidade dos membros: private esconde o estado, public expõe a interface. O saldo só muda por depositar e sacar, que podem validar as operações. Isso permite mudar a implementação sem quebrar quem usa a classe.',
  panelLabel: 'conta',
  languages: ['cpp'],
  code: { cpp: encapsulamentoCode },
  steps: () => [
    s(lineOf(encapsulamentoCode, 'class Conta'), 'A classe reúne estado e operações.', [c('Conta', ['classe'])]),
    s(lineOf(encapsulamentoCode, 'double saldo'), 'saldo é privado: acesso externo bloqueado.', [c(0, ['saldo'], 'active')]),
    s(lineOf(encapsulamentoCode, 'void depositar'), 'Métodos públicos validam a alteração.', [c('depositar', ['público']), c('sacar', ['público'])]),
    s(lineOf(encapsulamentoCode, 'c.depositar'), 'O estado muda apenas pela interface.', [c(60, ['saldo'], 'write')]),
  ],
};

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

export const lessonHeranca: Lesson = {
  ...base,
  id: 'heranca',
  title: 'Herança',
  subtitle: 'Reaproveitando comportamento',
  description:
    'Herança permite que uma classe derivada adquira atributos e métodos da classe base, adicionando ou especializando comportamento. A relação correta é “é um”: Carro é um Veiculo. Assim evitamos copiar código e criamos hierarquias claras, ao custo de maior acoplamento.',
  panelLabel: 'classes',
  languages: ['cpp'],
  code: { cpp: herancaCode },
  steps: () => [
    s(lineOf(herancaCode, 'class Veiculo'), 'Veiculo é a classe base.', [c('Veiculo', ['base'])]),
    s(lineOf(herancaCode, 'void ligar'), 'O método ligar é herdado.', [c('ligar', ['herdado'])]),
    s(lineOf(herancaCode, 'class Carro'), 'Carro herda publicamente de Veiculo.', [c('Carro', ['filha'], 'write')]),
    s(lineOf(herancaCode, 'void abrirPorta'), 'A filha adiciona comportamento próprio.', [c('abrirPorta', ['novo'], 'active')]),
  ],
};

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

export const lessonPolimorfismo: Lesson = {
  ...base,
  id: 'polimorfismo',
  title: 'Polimorfismo',
  subtitle: 'Um método, várias formas',
  description:
    'Polimorfismo usa a mesma interface para executar comportamentos diferentes conforme o objeto real. virtual e override fazem a escolha em tempo de execução, via ligação dinâmica. Sem virtual, a chamada seria resolvida em tempo de compilação pelo tipo do ponteiro, o chamado falso polimorfismo.',
  panelLabel: 'animal',
  languages: ['cpp'],
  code: { cpp: polimorfismoCode },
  steps: () => [
    s(lineOf(polimorfismoCode, 'class Animal'), 'Animal define a interface virtual.', [c('Animal', ['base'])]),
    s(lineOf(polimorfismoCode, 'virtual void'), 'virtual adia a escolha para a execução.', [c('virtual', ['palavra-chave'], 'active')]),
    s(lineOf(polimorfismoCode, 'class Cachorro'), 'Cachorro e Gato sobrescrevem o método.', [c('Cachorro', ['filha']), c('Gato', ['filha'])]),
    s(lineOf(polimorfismoCode, 'a = &c'), 'O ponteiro aponta para o cachorro.', [c('Animal*', ['ponteiro']), c('Au au', ['som'], 'write')]),
    s(lineOf(polimorfismoCode, 'a = &g'), 'O mesmo comando produz outro som.', [c('Animal*', ['ponteiro']), c('Miau', ['som'], 'write')]),
  ],
};

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

export const lessonAcessores: Lesson = {
  ...base,
  id: 'metodos-acessores',
  title: 'Métodos acessores',
  subtitle: 'Getters e setters',
  description:
    'Getters leem atributos privados; setters alteram com validação. Eles permitem que a classe mantenha o controle sobre o estado sem expor os campos diretamente. O custo é mais código, mas a manutenção fica centralizada e valores inválidos podem ser rejeitados.',
  panelLabel: 'aluno',
  languages: ['cpp'],
  code: { cpp: acessoresCode },
  steps: () => [
    s(lineOf(acessoresCode, 'class Aluno'), 'A classe mantém os dados privados.', [c('Aluno', ['classe'])]),
    s(lineOf(acessoresCode, 'void setNome'), 'O setter recebe o novo valor.', [c('setNome', ['setter']), c('getNome', ['getter'])]),
    s(lineOf(acessoresCode, 'void setIdade'), 'O setter valida antes de alterar.', [c('0–120', ['intervalo'], 'active')]),
    s(lineOf(acessoresCode, 'a.setNome'), 'O programa usa a interface pública.', [c('Ana', ['nome'], 'write'), c(20, ['idade'], 'write')]),
  ],
};

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
    'try delimita o trecho protegido; throw lança uma exceção; catch captura e trata. Quando dividir lança, o return não executa e o controle vai direto para o catch correspondente. Isso separa a lógica normal do tratamento de erro e evita verificações repetidas pelo código.',
  panelLabel: 'execução',
  languages: ['cpp'],
  code: { cpp: excecoesCode },
  steps: () => [
    s(lineOf(excecoesCode, 'double dividir'), 'A função pode lançar uma exceção.', [c('dividir', ['função'])]),
    s(lineOf(excecoesCode, 'throw'), 'b é zero: lançar o erro.', [c('erro', ['exceção'], 'write')]),
    s(lineOf(excecoesCode, 'try {'), 'try protege a chamada.', [c('try', ['bloco'], 'active')]),
    s(lineOf(excecoesCode, 'catch'), 'catch captura e mostra a mensagem.', [c('divisao por zero', ['mensagem'], 'write')]),
  ],
};
