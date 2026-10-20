import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CodePanel } from '@/components/CodePanel';
import { renderWithProviders } from '@/test/render';

const code = ['int soma = 0;', 'return soma;'];

describe('CodePanel', () => {
  it('marks the active line for assistive technology', () => {
    const { container } = renderWithProviders(
      <CodePanel code={code} activeLine={1} lang="java" onLangChange={vi.fn()} />,
    );

    const active = container.querySelector('[aria-current="step"]');
    expect(active).toHaveTextContent('return soma;');
  });

  it('switches the language through the segmented control', () => {
    const onLangChange = vi.fn();
    renderWithProviders(
      <CodePanel code={code} activeLine={0} lang="java" onLangChange={onLangChange} />,
    );

    fireEvent.click(screen.getByText('c'));

    expect(onLangChange).toHaveBeenCalledWith('c');
  });
});
