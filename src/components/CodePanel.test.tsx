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
      <CodePanel
        {...baseProps}
        approach="iterativo"
        onApproachChange={onApproachChange}
      />,
    );

    expect(screen.getByLabelText('implementação')).toBeInTheDocument();
    fireEvent.click(screen.getByText('recursivo'));
    expect(onApproachChange).toHaveBeenCalledWith('recursivo');
  });

  it('hides the approach picker when the lesson has a single implementation', () => {
    renderWithProviders(<CodePanel {...baseProps} />);

    expect(screen.queryByLabelText('implementação')).not.toBeInTheDocument();
  });
});
