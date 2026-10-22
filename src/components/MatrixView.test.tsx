import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { MatrixState } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { MatrixView } from './MatrixView';

describe('MatrixView', () => {
  it('renders empty fallback when matrix is undefined or empty', () => {
    renderWithProviders(<MatrixView />);
    expect(screen.getByText('Matriz vazia')).toBeInTheDocument();
  });

  it('renders a grid with row headers, column headers, and cell values', () => {
    const matrix: MatrixState = {
      rows: 2,
      cols: 2,
      grid: [
        [{ val: 10, state: 'active' }, { val: 20 }],
        [{ val: 30 }, { val: 40 }],
      ],
      activeRow: 0,
      activeCol: 0,
    };

    renderWithProviders(<MatrixView matrix={matrix} />);

    expect(screen.getByRole('grid', { name: /Matriz com 2 linhas e 2 colunas/i })).toBeInTheDocument();
    expect(screen.getByText('c[0]')).toBeInTheDocument();
    expect(screen.getByText('c[1]')).toBeInTheDocument();
    expect(screen.getByText('l[0]')).toBeInTheDocument();
    expect(screen.getByText('l[1]')).toBeInTheDocument();

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();

    // Check legend for active state
    expect(screen.getByText('ativo')).toBeInTheDocument();
  });

  it('renders custom rowLabels and colLabels', () => {
    const matrix: MatrixState = {
      rows: 1,
      cols: 2,
      rowLabels: ['Linha A'],
      colLabels: ['Col X', 'Col Y'],
      grid: [[{ val: 'A' }, { val: 'B' }]],
    };

    renderWithProviders(<MatrixView matrix={matrix} />);

    expect(screen.getByText('Linha A')).toBeInTheDocument();
    expect(screen.getByText('Col X')).toBeInTheDocument();
    expect(screen.getByText('Col Y')).toBeInTheDocument();
  });
});
