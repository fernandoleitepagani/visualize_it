import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LessonView } from '@/components/LessonView';
import { getLesson } from '@/content/lessons';
import { lesson as funcoesLesson } from '@/content/lessons/funcoes';
import { renderWithProviders } from '@/test/render';

const lesson = getLesson('selecao');

if (!lesson) throw new Error('A lição de seleção precisa existir para estes testes.');

describe('LessonView input toolbar', () => {
  it('reports invalid input next to the field', () => {
    renderWithProviders(<LessonView lesson={lesson} />);

    fireEvent.change(screen.getByLabelText('valores'), { target: { value: '1, 2.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(
      screen.getByText('Use entre 1 e 12 números inteiros separados por vírgula.'),
    ).toBeInTheDocument();
  });

  it('applies a valid list and the ordering preset', () => {
    renderWithProviders(<LessonView lesson={lesson} />);
    const input = screen.getByLabelText('valores');

    fireEvent.change(input, { target: { value: '5, 2, 9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(input).toHaveValue('5, 2, 9');

    fireEvent.click(screen.getByRole('button', { name: 'Ordenado' }));
    expect(input).toHaveValue('2, 5, 9');
  });
});

describe('LessonView code languages', () => {
  it('shows only C for AEDS I lessons and ignores lang=java', () => {
    const forLesson = getLesson('for');
    if (!forLesson) throw new Error('A lição for precisa existir.');

    renderWithProviders(<LessonView lesson={forLesson} />, '/algoritmos/for?lang=java');
    fireEvent.click(screen.getByRole('tab', { name: 'Código' }));
    expect(screen.getByRole('region', { name: 'Código C' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Código Java' })).not.toBeInTheDocument();
  });

  it('restores the C listing from the query string', () => {
    renderWithProviders(<LessonView lesson={lesson} />, '/algoritmos/selecao?lang=c');
    fireEvent.click(screen.getByRole('tab', { name: 'Código' }));
    expect(screen.getByRole('region', { name: 'Código C' })).toBeInTheDocument();
  });
});

describe('LessonView call stack', () => {
  it('renders the call stack without an input toolbar and with C only', () => {
    renderWithProviders(<LessonView lesson={funcoesLesson} />, '/algoritmos/funcoes?lang=java');

    expect(screen.getByTestId('call-stack')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /main ativo.*x = 3/i })).toBeInTheDocument();
    expect(screen.queryByLabelText('valores')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Código' }));
    expect(screen.getByRole('region', { name: 'Código C' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Código Java' })).not.toBeInTheDocument();
  });
});

describe('LessonView conditionals', () => {
  const conditionalLesson = getLesson('if-else');

  if (!conditionalLesson) throw new Error('A lição if-else precisa existir.');

  it('renders the branch strip without an input toolbar and with C only', () => {
    renderWithProviders(
      <LessonView lesson={conditionalLesson} />,
      '/algoritmos/if-else?lang=java',
    );

    const region = screen.getByRole('region', {
      name: 'Visualizador de fluxo condicional',
    });
    expect(within(region).getByText('if')).toBeInTheDocument();
    expect(within(region).getByText('else if')).toBeInTheDocument();
    expect(screen.queryByLabelText('valores')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Código' }));
    expect(screen.getByRole('region', { name: 'Código C' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Código Java' })).not.toBeInTheDocument();
  });
});

describe('LessonView insights', () => {
  it('renders the tip and curiosity in the about panel', () => {
    renderWithProviders(<LessonView lesson={lesson} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Sobre' }));
    expect(screen.getByText(/Depois de i rodadas/)).toBeInTheDocument();
    expect(screen.getByText(/Θ\(n²\) comparações/)).toBeInTheDocument();
  });
});

describe('LessonView shortcuts', () => {
  it('opens the keyboard help with ?', async () => {
    renderWithProviders(<LessonView lesson={lesson} />);
    fireEvent.keyDown(document.body, { key: '?' });
    expect(await screen.findByText('Atalhos de teclado')).toBeInTheDocument();
  });
});

describe('LessonView unit-interval input', () => {
  const bucketLesson = getLesson('bucket');

  if (!bucketLesson) throw new Error('A lição de bucket precisa existir para estes testes.');

  it('accepts decimals in [0, 1)', () => {
    renderWithProviders(<LessonView lesson={bucketLesson} />);
    const input = screen.getByLabelText('valores');

    fireEvent.change(input, { target: { value: '0.9, 0.1, 0.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(input).toHaveValue('0.9, 0.1, 0.5');
    expect(screen.queryByText(/Use valores entre 0/)).not.toBeInTheDocument();
  });

  it('rejects values outside [0, 1)', () => {
    renderWithProviders(<LessonView lesson={bucketLesson} />);

    fireEvent.change(screen.getByLabelText('valores'), { target: { value: '1.5, 0.2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(
      screen.getByText('Use valores entre 0 (inclusive) e 1 (exclusive), como 0.25 ou 0.70.'),
    ).toBeInTheDocument();
  });
});

describe('LessonView pointers', () => {
  const pointersLesson = getLesson('ponteiros-basico');

  if (!pointersLesson) throw new Error('A lição ponteiros-basico precisa existir.');

  it('renders the memory canvas without an input toolbar and with C only', () => {
    renderWithProviders(
      <LessonView lesson={pointersLesson} />,
      '/algoritmos/ponteiros-basico?lang=java',
    );

    expect(screen.getByRole('img', { name: /Memória com 1 variável/ })).toBeInTheDocument();
    expect(screen.queryByLabelText('valores')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Código' }));
    expect(screen.getByRole('region', { name: 'Código C' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Código Java' })).not.toBeInTheDocument();
  });

  const doublePointersLesson = getLesson('ponteiros-duplos');

  if (!doublePointersLesson) throw new Error('A lição ponteiros-duplos precisa existir.');

  it('renders the pp -> p -> x chain in the double pointers lesson', () => {
    renderWithProviders(
      <LessonView lesson={doublePointersLesson} />,
      '/algoritmos/ponteiros-duplos?lang=java',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ir para o passo 4' }));

    const canvas = screen.getByRole('img', { name: /pp.*0x100c.*aponta para p/i });
    expect(canvas).toHaveAccessibleName(/p.*0x1008.*aponta para x/i);
    expect(canvas.querySelectorAll('path[data-lane]')).toHaveLength(2);
    expect(screen.queryByLabelText('valores')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Código' }));
    expect(screen.getByRole('region', { name: 'Código C' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Código Java' })).not.toBeInTheDocument();
  });
});

describe('LessonView operations group (vetores-matrizes)', () => {
  const vmLesson = getLesson('vetores-matrizes');
  if (!vmLesson) throw new Error('A lição de vetores-matrizes precisa existir.');

  it('renders structure and operation controls for vetores-matrizes', () => {
    renderWithProviders(<LessonView lesson={vmLesson} />);

    expect(screen.getByText('Estrutura')).toBeInTheDocument();
    expect(screen.getByText('Operação')).toBeInTheDocument();
    expect(screen.getByText('Vetor (1D)')).toBeInTheDocument();
    expect(screen.getByText('Matriz (2D)')).toBeInTheDocument();
    expect(screen.getByText('Preencher')).toBeInTheDocument();
    expect(screen.getByText('Limpar')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
    expect(screen.getByText('Somar')).toBeInTheDocument();
  });

  it('allows entering custom vector values and applying', () => {
    renderWithProviders(<LessonView lesson={vmLesson} />);

    const input = screen.getByLabelText('valores do vetor');
    fireEvent.change(input, { target: { value: '5, 15, 25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(input).toHaveValue('5, 15, 25');
    expect(screen.getByText(/3 elementos/)).toBeInTheDocument();
  });

  it('switches to Matriz and shows row input fields with add line control', () => {
    renderWithProviders(<LessonView lesson={vmLesson} />);

    fireEvent.click(screen.getByText('Matriz (2D)'));

    expect(screen.getByText(/Linhas da matriz/)).toBeInTheDocument();
    expect(screen.getByLabelText('valores da linha 0')).toBeInTheDocument();
    expect(screen.getByLabelText('valores da linha 1')).toBeInTheDocument();

    const addLineBtn = screen.getByRole('button', { name: '+ Linha' });
    fireEvent.click(addLineBtn);

    expect(screen.getByLabelText('valores da linha 2')).toBeInTheDocument();
  });
});

describe('LessonView search target input and scenarios', () => {
  const buscaSeqLesson = getLesson('busca-sequencial');
  if (!buscaSeqLesson) throw new Error('A lição de busca-sequencial precisa existir.');

  it('renders target input, default target, presence badge and search scenarios', () => {
    renderWithProviders(<LessonView lesson={buscaSeqLesson} />);

    const targetInput = screen.getByLabelText('alvo da busca');
    expect(targetInput).toBeInTheDocument();
    expect(targetInput).toHaveValue('55');

    // 55 is present in initial [10, 25, 30, 45, 55, 60, 75, 88]
    expect(screen.getByTestId('target-status')).toHaveTextContent('Presente');

    // Scenario buttons
    expect(screen.getByRole('button', { name: 'Início' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Meio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fim' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ausente' })).toBeInTheDocument();
  });

  it('reads target from URL query string', () => {
    renderWithProviders(
      <LessonView lesson={buscaSeqLesson} />,
      '/algoritmos/busca-sequencial?target=999',
    );

    const targetInput = screen.getByLabelText('alvo da busca');
    expect(targetInput).toHaveValue('999');
    expect(screen.getByTestId('target-status')).toHaveTextContent('Ausente');
  });

  it('validates invalid target when applying', () => {
    renderWithProviders(<LessonView lesson={buscaSeqLesson} />);

    const targetInput = screen.getByLabelText('alvo da busca');
    fireEvent.change(targetInput, { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(screen.getByText('Alvo deve ser um número inteiro.')).toBeInTheDocument();
  });

  it('clicking scenario presets updates target and presence badge', () => {
    renderWithProviders(<LessonView lesson={buscaSeqLesson} />);

    const targetInput = screen.getByLabelText('alvo da busca');

    // Início: first element in [10, 25, 30, 45, 55, 60, 75, 88] is 10
    fireEvent.click(screen.getByRole('button', { name: 'Início' }));
    expect(targetInput).toHaveValue('10');
    expect(screen.getByTestId('target-status')).toHaveTextContent('Presente');

    // Fim: last element is 88
    fireEvent.click(screen.getByRole('button', { name: 'Fim' }));
    expect(targetInput).toHaveValue('88');
    expect(screen.getByTestId('target-status')).toHaveTextContent('Presente');

    // Ausente: number not in vector
    fireEvent.click(screen.getByRole('button', { name: 'Ausente' }));
    expect(screen.getByTestId('target-status')).toHaveTextContent('Ausente');
  });

  it('supports binary search presets based on effective sorted order', () => {
    const buscaBinLesson = getLesson('busca-binaria');
    if (!buscaBinLesson) throw new Error('A lição busca-binaria precisa existir.');

    renderWithProviders(<LessonView lesson={buscaBinLesson} />);
    const targetInput = screen.getByLabelText('alvo da busca');

    // Initial for busca-binaria: [10, 25, 30, 45, 55, 60, 75, 88]
    // Middle element (idx 3): 45
    fireEvent.click(screen.getByRole('button', { name: 'Meio' }));
    expect(targetInput).toHaveValue('45');
    expect(screen.getByTestId('target-status')).toHaveTextContent('Presente');
  });
});

describe('LessonView playback persistence and progression', () => {
  const selecaoLesson = getLesson('selecao');
  if (!selecaoLesson) throw new Error('A lição selecao precisa existir.');

  it('preserves playback step progress and does not reset to step 1 when advancing', () => {
    renderWithProviders(<LessonView lesson={selecaoLesson} />);

    // Initially at step 1
    expect(screen.getAllByText(/1 \/ \d+/)[0]).toBeInTheDocument();

    // Click next step button
    const nextBtn = screen.getByLabelText('Próximo passo');
    fireEvent.click(nextBtn);

    // Should now be at step 2, not reset to step 1
    expect(screen.getAllByText(/2 \/ \d+/)[0]).toBeInTheDocument();

    // Advance again to step 3
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/3 \/ \d+/)[0]).toBeInTheDocument();
  });
});

