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

  it('prioritizes hovered step metadata and styling over currentIndex', () => {
    renderWithProviders(
      <TimelineBar steps={sampleSteps} currentIndex={0} onSeek={vi.fn()} />,
    );

    // Initial state: currentIndex = 0
    expect(screen.getByText(/Início da execução/)).toBeInTheDocument();

    // Hover over step 3 (index 2)
    const step3Btn = screen.getByRole('button', { name: 'Ir para o passo 3' });
    fireEvent.mouseEnter(step3Btn);

    // Should display description and details of step 3
    expect(screen.getByText(/Trocando elementos 0 e 1/)).toBeInTheDocument();

    // Mouse leaves the timeline container
    const timelineGroup = screen.getByRole('group', { name: 'Linha do tempo de passos' });
    fireEvent.mouseLeave(timelineGroup);

    // Restores display for step 1 (index 0)
    expect(screen.getByText(/Início da execução/)).toBeInTheDocument();
  });

  it('renders nothing when steps list is empty', () => {
    renderWithProviders(
      <TimelineBar steps={[]} currentIndex={0} onSeek={vi.fn()} />,
    );
    expect(screen.queryByRole('group', { name: 'Linha do tempo de passos' })).not.toBeInTheDocument();
  });

  it('supports drag scrubbing across the timeline', () => {
    const onSeek = vi.fn();
    renderWithProviders(
      <TimelineBar steps={sampleSteps} currentIndex={0} onSeek={onSeek} />,
    );

    const timelineGroup = screen.getByRole('group', { name: 'Linha do tempo de passos' });

    // Mock getBoundingClientRect
    vi.spyOn(timelineGroup, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 300,
      height: 44,
      right: 300,
      bottom: 44,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // MouseDown at 50% width -> step index 1
    fireEvent.mouseDown(timelineGroup, { button: 0, clientX: 150 });
    expect(onSeek).toHaveBeenCalledWith(1);

    // MouseMove at 85% width -> step index 2
    fireEvent.mouseMove(window, { clientX: 260 });
    expect(onSeek).toHaveBeenCalledWith(2);

    // MouseUp ends dragging
    fireEvent.mouseUp(window);
  });
});
