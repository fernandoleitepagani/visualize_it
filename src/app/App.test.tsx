import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App', () => {
  it('lists the catalog on the home page', () => {
    renderAt('/');
    expect(screen.getByText(/Visualize It/)).toBeInTheDocument();
    expect(screen.getByText('Selection Sort')).toBeInTheDocument();
    expect(screen.getByText('Quicksort')).toBeInTheDocument();
    expect(screen.getByText('Fila Circular')).toBeInTheDocument();
  });

  it('renders a bars lesson', () => {
    renderAt('/algoritmos/selecao');
    expect(screen.getByRole('heading', { name: 'Selection Sort' })).toBeInTheDocument();
  });

  it('renders a cells lesson', () => {
    renderAt('/algoritmos/pilha-sequencial');
    expect(screen.getByRole('heading', { name: 'Pilha Sequencial' })).toBeInTheDocument();
  });

  it('renders a nodes lesson', () => {
    renderAt('/algoritmos/lista-encadeada');
    expect(screen.getByRole('heading', { name: 'Lista Encadeada' })).toBeInTheDocument();
  });

  it('renders a theory article', () => {
    renderAt('/teoria/complexidade');
    expect(screen.getByRole('heading', { name: 'Complexidade de Algoritmos' })).toBeInTheDocument();
  });

  it('renders the 404 page for unknown routes', () => {
    renderAt('/nao-existe');
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
  });
});
