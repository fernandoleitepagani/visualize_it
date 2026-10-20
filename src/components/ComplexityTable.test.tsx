import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ComplexityTable } from '@/components/ComplexityTable';
import { renderWithProviders } from '@/test/render';

describe('ComplexityTable', () => {
  it('shows a dash when stability is not defined', () => {
    renderWithProviders(
      <ComplexityTable
        complexity={{ time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' }, space: 'O(1)' }}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows no for an unstable algorithm', () => {
    renderWithProviders(
      <ComplexityTable complexity={{ time: {}, space: 'O(1)', stable: false }} />,
    );
    expect(screen.getByText('Não')).toBeInTheDocument();
  });

  it('shows yes for a stable algorithm', () => {
    renderWithProviders(
      <ComplexityTable complexity={{ time: {}, space: 'O(1)', stable: true }} />,
    );
    expect(screen.getByText('Sim')).toBeInTheDocument();
  });
});
