import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { App } from './App';

describe('App', () => {
  it('lists the catalog on the home page', () => {
    renderWithProviders(<App />, '/');
    expect(screen.getByText(/Visualize It/)).toBeInTheDocument();
    expect(screen.getByText('Selection Sort')).toBeInTheDocument();
    expect(screen.getByText('Quicksort')).toBeInTheDocument();
    expect(screen.getByText('Fila Circular')).toBeInTheDocument();
  });

  it('renders a bars lesson', () => {
    renderWithProviders(<App />, '/algoritmos/selecao');
    expect(screen.getByRole('heading', { name: 'Selection Sort' })).toBeInTheDocument();
  });

  it('renders a cells lesson', () => {
    renderWithProviders(<App />, '/algoritmos/pilha-sequencial');
    expect(screen.getByRole('heading', { name: 'Pilha Sequencial' })).toBeInTheDocument();
  });

  it('renders a nodes lesson', () => {
    renderWithProviders(<App />, '/algoritmos/lista-encadeada');
    expect(screen.getByRole('heading', { name: 'Lista Encadeada' })).toBeInTheDocument();
  });

  it('renders a theory article', () => {
    renderWithProviders(<App />, '/teoria/complexidade');
    expect(screen.getByRole('heading', { name: 'Complexidade de Algoritmos' })).toBeInTheDocument();
  });

  it('renders the 404 page for unknown routes', () => {
    renderWithProviders(<App />, '/nao-existe');
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
  });
});
