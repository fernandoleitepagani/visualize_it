import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { ComparePage } from './ComparePage';

describe('ComparePage', () => {
  it('compares the integer sorting lessons on the same input', () => {
    renderWithProviders(<ComparePage />, '/comparar');

    expect(screen.getByRole('heading', { name: 'Comparar algoritmos' })).toBeInTheDocument();
    expect(screen.getAllByText('Selection Sort').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Radix Sort').length).toBeGreaterThan(0);
    expect(screen.getByText(/Bucket Sort fica de fora/)).toBeInTheDocument();
  });

  it('removes an algorithm from the table when its chip is toggled off', () => {
    renderWithProviders(<ComparePage />, '/comparar');
    expect(screen.getAllByText('Selection Sort')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Selection Sort' }));
    expect(screen.getAllByText('Selection Sort')).toHaveLength(1);
  });
});
