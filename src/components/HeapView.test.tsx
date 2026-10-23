import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { HeapView } from './HeapView';
import type { Step } from '@/engine/types';

describe('HeapView', () => {
  const sampleState: Step = {
    line: 0,
    desc: 'Heap inicial',
    arr: [90, 80, 70, 50, 40, 60, 30],
    cmp: [0, 1],
    swap: [],
    pivot: [0],
    sorted: [6],
    heapSize: 6,
  };

  it('renders loading placeholder when arr is empty or missing', () => {
    renderWithProviders(<HeapView state={undefined} />);
    expect(screen.getByText('Gerando…')).toBeInTheDocument();
  });

  it('renders tree nodes and bars in dual mode by default', () => {
    renderWithProviders(<HeapView state={sampleState} />);

    // Check tree container and bars container exist
    expect(screen.getByTestId('heap-tree')).toBeInTheDocument();
    expect(screen.getByTestId('heap-bars')).toBeInTheDocument();

    // Check header indicators
    expect(screen.getByText('Árvore Binária Completa')).toBeInTheDocument();
    expect(screen.getByText('Vetor Implícito (Índices e Posições)')).toBeInTheDocument();

    // Check heap size indicator: 6 / 7
    expect(screen.getByText(/6 \/ 7/)).toBeInTheDocument();

    // Check all 7 nodes exist in tree
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`heap-node-${i}`)).toBeInTheDocument();
      expect(screen.getByTestId(`heap-bar-${i}`)).toBeInTheDocument();
    }
  });

  it('switches display mode to tree-only and bars-only', () => {
    renderWithProviders(<HeapView state={sampleState} />);

    // Initially dual
    expect(screen.getByTestId('heap-tree')).toBeInTheDocument();
    expect(screen.getByTestId('heap-bars')).toBeInTheDocument();

    // Click "Apenas Árvore"
    const treeOnlyRadio = screen.getByLabelText('Apenas Árvore');
    fireEvent.click(treeOnlyRadio);
    expect(screen.getByTestId('heap-tree')).toBeInTheDocument();
    expect(screen.queryByTestId('heap-bars')).not.toBeInTheDocument();

    // Click "Apenas Vetor"
    const barsOnlyRadio = screen.getByLabelText('Apenas Vetor');
    fireEvent.click(barsOnlyRadio);
    expect(screen.queryByTestId('heap-tree')).not.toBeInTheDocument();
    expect(screen.getByTestId('heap-bars')).toBeInTheDocument();
  });

  it('displays the heap boundary line when heapSize is between 1 and n-1', () => {
    renderWithProviders(<HeapView state={sampleState} />);
    expect(screen.getByTestId('heap-boundary')).toBeInTheDocument();
    expect(screen.getByText('Fim do Heap')).toBeInTheDocument();
  });

  it('renders synchronized swap states', () => {
    const swapState: Step = {
      line: 4,
      desc: 'Troca raiz com último',
      arr: [30, 80, 70, 50, 40, 60, 90],
      swap: [0, 6],
      sorted: [6],
      heapSize: 6,
    };

    renderWithProviders(<HeapView state={swapState} />);
    const node0 = screen.getByTestId('heap-node-0');
    const node6 = screen.getByTestId('heap-node-6');
    const bar0 = screen.getByTestId('heap-bar-0');
    const bar6 = screen.getByTestId('heap-bar-6');

    expect(node0).toBeInTheDocument();
    expect(node6).toBeInTheDocument();
    expect(bar0).toBeInTheDocument();
    expect(bar6).toBeInTheDocument();
  });

  it('renders legend items for active states', () => {
    renderWithProviders(<HeapView state={sampleState} />);
    expect(screen.getByText('comparação')).toBeInTheDocument();
    expect(screen.getByText('raiz / foco do heapify')).toBeInTheDocument();
    expect(screen.getByText('ordenado / extraído')).toBeInTheDocument();
  });
});
