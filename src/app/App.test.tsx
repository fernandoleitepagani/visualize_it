import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { App } from './App';

/** One row per `view`, asserting the page header renders for its route. */
const views = [
  { name: 'bars', route: '/algoritmos/selecao', heading: 'Selection Sort' },
  { name: 'cells', route: '/algoritmos/pilha-sequencial', heading: 'Pilha Sequencial' },
  { name: 'nodes', route: '/algoritmos/lista-encadeada', heading: 'Lista Encadeada' },
  { name: 'theory', route: '/teoria/complexidade', heading: 'Complexidade de Algoritmos' },
];

describe('App', () => {
  it('lists the catalog on the home page', () => {
    renderWithProviders(<App />, '/');
    expect(screen.getByText(/Visualize It/)).toBeInTheDocument();
    expect(screen.getByText('Selection Sort')).toBeInTheDocument();
    expect(screen.getByText('Quicksort')).toBeInTheDocument();
    expect(screen.getByText('Fila Circular')).toBeInTheDocument();
  });

  it.each(views)('renders the $name view at $route', ({ route, heading }) => {
    renderWithProviders(<App />, route);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('switches selection sort between iterative and recursive listings', () => {
    const { container } = renderWithProviders(<App />, '/algoritmos/selecao');

    expect(container.textContent).not.toContain('selectionSort(array, i+1)');
    fireEvent.click(screen.getByText('recursivo'));
    expect(container.textContent).toContain('selectionSort(array, i+1)');

    fireEvent.click(screen.getByText('c'));
    expect(container.textContent).toContain('void selectionSort(int *array, int i, int n)');
  });

  it.each([
    ['insercao', 'insertionSort(array, i+1)', 'void insertionSort(int *array, int i, int n)'],
    ['bolha', 'bubbleSort(array, i+1)', 'void bubbleSort(int *array, int i, int n)'],
  ])('switches %s between iterative and recursive listings', (slug, marker, cSignature) => {
    const { container } = renderWithProviders(<App />, `/algoritmos/${slug}`);

    expect(container.textContent).not.toContain(marker);
    fireEvent.click(screen.getByText('recursivo'));
    expect(container.textContent).toContain(marker);

    fireEvent.click(screen.getByText('c'));
    expect(container.textContent).toContain(cSignature);
  });

  it('places the complexity analysis card before Sobre on sorting lessons', () => {
    renderWithProviders(<App />, '/algoritmos/selecao');

    const analysis = screen.getByText('análise de complexidade');
    const about = screen.getByRole('heading', { name: 'Sobre' });
    expect(analysis.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(screen.getByText(/n\(n − 1\) \/ 2/)).toBeInTheDocument();
    expect(screen.getByText(/3 · \(n − 1\) = 3n − 3/)).toBeInTheDocument();
  });

  it('does not show the complexity analysis card on search lessons', () => {
    renderWithProviders(<App />, '/algoritmos/busca-sequencial');

    expect(screen.queryByText('análise de complexidade')).not.toBeInTheDocument();
  });

  it('restores the array and step from the query string', () => {
    renderWithProviders(<App />, '/algoritmos/selecao?arr=5,2,9&step=2');

    expect(screen.getByDisplayValue('5, 2, 9')).toBeInTheDocument();
    expect(screen.getAllByText(/^2 \/ \d+$/).length).toBeGreaterThan(0);
  });

  it('falls back to defaults for invalid query params', () => {
    renderWithProviders(<App />, '/algoritmos/selecao?arr=nope&step=abc');

    expect(screen.getByDisplayValue('7, 3, 9, 1, 5, 8, 2')).toBeInTheDocument();
    expect(screen.getAllByText(/^1 \/ \d+$/).length).toBeGreaterThan(0);
  });

  it('exposes a theme toggle', () => {
    renderWithProviders(<App />, '/');
    expect(screen.getByRole('button', { name: /Mudar para tema/ })).toBeInTheDocument();
  });

  it('toggles quiz mode on a bars lesson', () => {
    renderWithProviders(<App />, '/algoritmos/selecao');
    fireEvent.click(screen.getByLabelText('quiz'));

    expect(screen.getByText('Qual é o vetor do próximo passo?')).toBeInTheDocument();
  });

  it('shows feedback after answering a quiz question', () => {
    renderWithProviders(<App />, '/algoritmos/selecao');
    fireEvent.click(screen.getByLabelText('quiz'));

    const options = screen.getAllByRole('button', { name: /^\[/ });
    fireEvent.click(options[0]);

    expect(screen.getByText(/Correto!|Incorreto — resposta:/)).toBeInTheDocument();
  });

  it('does not offer quiz mode on a nodes lesson', () => {
    renderWithProviders(<App />, '/algoritmos/lista-encadeada');
    expect(screen.queryByLabelText('quiz')).not.toBeInTheDocument();
  });

  it('renders the playground', () => {
    renderWithProviders(<App />, '/playground');
    expect(screen.getByRole('heading', { name: 'Playground' })).toBeInTheDocument();
  });

  it('renders the 404 page for unknown routes', () => {
    renderWithProviders(<App />, '/nao-existe');
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
  });
});
