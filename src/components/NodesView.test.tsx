import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Node } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { NodesView } from './NodesView';

describe('NodesView', () => {
  it('renders empty message when no nodes are passed', () => {
    renderWithProviders(<NodesView nodes={[]} />);
    expect(screen.getByText('Lista vazia')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Lista vazia' })).toBeInTheDocument();
  });

  it('renders nodes with values, labels and singly-linked connectors', () => {
    const nodes: Node[] = [
      { id: 'n1', val: 10, next: 'n2', labels: ['head'], state: 'active' },
      { id: 'n2', val: 20, next: 'n3', labels: ['curr'] },
      { id: 'n3', val: 30, next: null },
    ];

    renderWithProviders(<NodesView nodes={nodes} linked="singly" />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('head')).toBeInTheDocument();
    expect(screen.getByText('curr')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Lista com 3 nós' })).toBeInTheDocument();
  });

  it('renders doubly-linked list with previous and next value references', () => {
    const nodes: Node[] = [
      { id: 'n1', val: 10, prev: null, next: 'n2', labels: ['primeiro'] },
      { id: 'n2', val: 20, prev: 'n1', next: null, labels: ['último'], state: 'compare' },
    ];

    renderWithProviders(<NodesView nodes={nodes} linked="doubly" />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('primeiro')).toBeInTheDocument();
    expect(screen.getByText('último')).toBeInTheDocument();
    // n2 points back to n1 whose val is 10
    expect(screen.getByText('←10')).toBeInTheDocument();
    expect(screen.getByText('comparação')).toBeInTheDocument();
  });

  it('includes accessible tabIndex on scrollable container', () => {
    const nodes: Node[] = [{ id: 'n1', val: 42, next: null }];
    renderWithProviders(<NodesView nodes={nodes} />);
    const scrollContainer = screen.getByRole('img', { name: 'Lista com 1 nós' });
    expect(scrollContainer).toHaveAttribute('tabIndex', '0');
  });
});
