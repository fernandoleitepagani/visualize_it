import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BarsView } from '@/components/BarsView';
import { renderWithProviders } from '@/test/render';

describe('BarsView', () => {
  it('renders one value and one index label per array position', () => {
    renderWithProviders(<BarsView state={{ line: 0, desc: 'passo', arr: [30, 10, 20] }} />);
    for (const value of ['30', '10', '20']) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
    for (const index of ['0', '1', '2']) {
      expect(screen.getByText(index)).toBeInTheDocument();
    }
  });

  it('describes the vector for screen readers', () => {
    renderWithProviders(<BarsView state={{ line: 0, desc: 'passo', arr: [30, 10, 20] }} />);
    expect(
      screen.getByRole('img', { name: 'Vetor com 3 elementos: 30, 10, 20' }),
    ).toBeInTheDocument();
  });

  it('shows a legend only for the states present in the current step', () => {
    renderWithProviders(
      <BarsView
        state={{
          line: 0,
          desc: 'passo',
          arr: [30, 10, 20],
          cmp: [0],
          swap: [1],
        }}
      />,
    );
    expect(screen.getByText('comparação')).toBeInTheDocument();
    expect(screen.getByText('troca')).toBeInTheDocument();
    expect(screen.queryByText('pivô')).not.toBeInTheDocument();
  });

  it('renders negative values', () => {
    renderWithProviders(<BarsView state={{ line: 0, desc: 'passo', arr: [-4, 6] }} />);
    expect(screen.getByText('-4')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('shows a placeholder when there is no data', () => {
    renderWithProviders(<BarsView state={undefined} />);
    expect(screen.getByText('Gerando…')).toBeInTheDocument();
  });
});
