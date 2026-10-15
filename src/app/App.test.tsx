import { screen } from '@testing-library/react';
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

  it('renders the 404 page for unknown routes', () => {
    renderWithProviders(<App />, '/nao-existe');
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
  });
});
