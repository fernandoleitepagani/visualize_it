import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { App } from './App';

/** One row per page type, asserting the page header renders for its route. */
const views = [
  { name: 'subject', route: '/materias/aeds-ii', heading: 'AEDS II' },
  { name: 'analysis', route: '/materias/analise', heading: 'Análise' },
  { name: 'bars', route: '/algoritmos/selecao', heading: 'Selection Sort' },
  { name: 'cells', route: '/algoritmos/pilha-sequencial', heading: 'Pilha Sequencial' },
  { name: 'nodes', route: '/algoritmos/lista-encadeada', heading: 'Lista Encadeada' },
  { name: 'theory', route: '/teoria/complexidade', heading: 'Complexidade de Algoritmos' },
];

describe('App', () => {
  it('presents the subjects on the home page', () => {
    renderWithProviders(<App />, '/');
    expect(screen.getByText(/Visualize It/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AEDS I' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AEDS II' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Análise' })).toBeInTheDocument();
    expect(screen.getByText('Selection Sort')).toBeInTheDocument();
    expect(screen.getByText('Busca Binária')).toBeInTheDocument();
    expect(screen.getByText('Pilha Sequencial')).toBeInTheDocument();
  });

  it.each(views)('renders the $name page at $route', ({ route, heading }) => {
    renderWithProviders(<App />, route);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('renders the 404 page for unknown routes', () => {
    renderWithProviders(<App />, '/nao-existe');
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
  });

  it('renders the 404 page for an unknown subject', () => {
    renderWithProviders(<App />, '/materias/inexistente');
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
  });
});
