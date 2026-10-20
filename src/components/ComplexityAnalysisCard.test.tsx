import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { ComplexityAnalysisCard } from './ComplexityAnalysisCard';

describe('ComplexityAnalysisCard', () => {
  it('reserves a column for comparisons and another for movements', () => {
    renderWithProviders(<ComplexityAnalysisCard analysis={{}} />);

    expect(screen.getByText('análise de complexidade')).toBeInTheDocument();
    expect(screen.getByText('comparações')).toBeInTheDocument();
    expect(screen.getByText('movimentações')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('renders the copy once it is filled in', () => {
    renderWithProviders(
      <ComplexityAnalysisCard
        analysis={{ comparisons: '~n²/2 comparações', movements: 'n−1 trocas' }}
      />,
    );

    expect(screen.getByText('~n²/2 comparações')).toBeInTheDocument();
    expect(screen.getByText('n−1 trocas')).toBeInTheDocument();
  });
});
