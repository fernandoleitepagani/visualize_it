import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VarsPanel } from '@/components/VarsPanel';
import { renderWithProviders } from '@/test/render';

describe('VarsPanel', () => {
  it('renders nothing when there are no variables', () => {
    renderWithProviders(<VarsPanel vars={{}} />);
    expect(screen.queryByText('variáveis')).not.toBeInTheDocument();
  });

  it('renders variable names and values', () => {
    renderWithProviders(<VarsPanel vars={{ i: 2, n: 10, alvo: null }} />);

    expect(screen.getByText('variáveis')).toBeInTheDocument();
    expect(screen.getByText('i')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('n')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('alvo')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('highlights changed variables when prevVars differs', () => {
    const { container } = renderWithProviders(
      <VarsPanel vars={{ i: 3, n: 10 }} prevVars={{ i: 2, n: 10 }} />,
    );

    const changedChip = container.querySelector('.viz-var-changed');
    expect(changedChip).toBeInTheDocument();
    expect(changedChip).toHaveTextContent('i');
    expect(changedChip).toHaveTextContent('3');
  });
});
