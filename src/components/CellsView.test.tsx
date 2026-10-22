import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Cell } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { CellsView } from './CellsView';

describe('CellsView', () => {
  it('renders empty message when no cells are passed', () => {
    renderWithProviders(<CellsView cells={[]} />);
    expect(screen.getByText('Estrutura vazia')).toBeInTheDocument();
  });

  it('renders cell values, indices and pointer badges', () => {
    const cells: Cell[] = [
      { val: 42, labels: ['i', 'topo'], state: 'active' },
      { val: null },
      { val: 99, labels: ['fim'] },
    ];

    renderWithProviders(<CellsView cells={cells} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.getByText('i')).toBeInTheDocument();
    expect(screen.getByText('topo')).toBeInTheDocument();
    expect(screen.getByText('fim')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('ativo')).toBeInTheDocument();
  });
});
