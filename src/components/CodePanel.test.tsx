import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { CodePanel } from './CodePanel';

const baseProps = {
  code: ['void sort() {}'],
  activeLine: 0,
  lang: 'java' as const,
  onLangChange: () => {},
};

describe('CodePanel', () => {
  it('shows the approach picker when the lesson offers variants', () => {
    const onApproachChange = vi.fn();

    renderWithProviders(
      <CodePanel {...baseProps} approach="iterativo" onApproachChange={onApproachChange} />,
    );

    expect(screen.getByLabelText('implementação')).toBeInTheDocument();
    fireEvent.click(screen.getByText('recursivo'));
    expect(onApproachChange).toHaveBeenCalledWith('recursivo');
  });

  it('hides the approach picker when the lesson has a single implementation', () => {
    renderWithProviders(<CodePanel {...baseProps} />);

    expect(screen.queryByLabelText('implementação')).not.toBeInTheDocument();
  });

  it('marks the active line for assistive technology', () => {
    const { container } = renderWithProviders(
      <CodePanel code={['int soma = 0;', 'return soma;']} activeLine={1} lang="java" onLangChange={vi.fn()} />,
    );

    const active = container.querySelector('[aria-current="step"]');
    expect(active).toHaveTextContent('return soma;');
  });

  it('switches the language through the segmented control', () => {
    const onLangChange = vi.fn();
    renderWithProviders(
      <CodePanel
        code={['int soma = 0;', 'return soma;']}
        activeLine={0}
        lang="java"
        onLangChange={onLangChange}
      />,
    );

    fireEvent.click(screen.getByText('c'));

    expect(onLangChange).toHaveBeenCalledWith('c');
  });

  it('shows only the language label when the lesson offers a single language', () => {
    renderWithProviders(
      <CodePanel
        code={['int soma = 0;']}
        activeLine={0}
        lang="c"
        languages={['c']}
        onLangChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('linguagem')).toHaveTextContent('C');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });
});
