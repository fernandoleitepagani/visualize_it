import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import type { StringState } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { StringsView } from './StringsView';

const state: StringState = {
  rows: [
    {
      label: 'origem',
      cells: [
        { val: 'B', labels: ['i'], state: 'active' },
        { val: 'A' },
        { val: 'N' },
        { val: '\\0', state: 'terminator' },
      ],
    },
    {
      label: 'destino',
      cells: [
        { val: 'B', state: 'write' },
        { val: null, state: 'empty' },
      ],
    },
  ],
  links: [{ fromRow: 0, fromIndex: 0, toRow: 1, toIndex: 0 }],
  result: { label: 'resultado', value: 'BAN' },
};

describe('StringsView', () => {
  it('renders rows, pointers, links and result', () => {
    const { container } = renderWithProviders(<StringsView state={state} />);

    expect(screen.getByText('origem')).toBeInTheDocument();
    expect(screen.getByText('destino')).toBeInTheDocument();
    expect(screen.getAllByText('B')).toHaveLength(2);
    expect(screen.getByText('i')).toBeInTheDocument();
    expect(screen.getByText('resultado')).toBeInTheDocument();
    expect(screen.getByText('BAN')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName(/origem.*destino/i);
    expect(container.querySelector('[data-testid="string-links"] path')).toBeInTheDocument();
  });

  it('renders the terminator as a distinct cell', () => {
    renderWithProviders(<StringsView state={state} />);

    expect(screen.getByText('\\0')).toBeInTheDocument();
    expect(screen.getByText('terminador')).toBeInTheDocument();
  });

  it('renders an empty state', () => {
    renderWithProviders(<StringsView state={undefined} />);

    expect(screen.getByText('String vazia')).toBeInTheDocument();
  });
});
