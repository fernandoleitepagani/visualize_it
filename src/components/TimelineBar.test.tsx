import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Step } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { TimelineBar } from './TimelineBar';

const sampleSteps: Step[] = [
  { line: 0, desc: 'Início da execução', arr: [4, 2, 1] },
  { line: 2, desc: 'Comparando elementos 0 e 1', arr: [4, 2, 1], cmp: [0, 1] },
  { line: 3, desc: 'Trocando elementos 0 e 1', arr: [2, 4, 1], swap: [0, 1] },
];

describe('TimelineBar', () => {
  it('renders one button per step and shows current step metadata', () => {
    renderWithProviders(
      <TimelineBar steps={sampleSteps} currentIndex={1} onSeek={vi.fn()} />,
    );
    expect(screen.getByText(/Comparando elementos 0 e 1/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir para o passo 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir para o passo 2' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('button', { name: 'Ir para o passo 3' })).toBeInTheDocument();
  });

  it('calls onSeek with target step index when clicked', () => {
    const onSeek = vi.fn();
    renderWithProviders(
      <TimelineBar steps={sampleSteps} currentIndex={0} onSeek={onSeek} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ir para o passo 3' }));
    expect(onSeek).toHaveBeenCalledWith(2);
  });
});
