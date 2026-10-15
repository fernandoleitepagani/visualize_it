import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BarsView } from '@/components/BarsView';

describe('BarsView', () => {
  it('renders one label per array value', () => {
    render(<BarsView state={{ line: 0, desc: 'passo', arr: [3, 1, 2] }} />);
    for (const value of ['3', '1', '2']) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
  });

  it('shows a placeholder when there is no data', () => {
    render(<BarsView state={undefined} />);
    expect(screen.getByText('Gerando…')).toBeInTheDocument();
  });
});
