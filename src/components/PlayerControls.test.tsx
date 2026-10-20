import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlayerControls } from '@/components/PlayerControls';
import type { Playback } from '@/engine/usePlayback';
import { renderWithProviders } from '@/test/render';

function makePlayback(overrides: Partial<Playback> = {}): Playback {
  return {
    index: 0,
    total: 3,
    step: undefined,
    isPlaying: false,
    speedMs: 900,
    atStart: true,
    atEnd: false,
    play: vi.fn(),
    pause: vi.fn(),
    toggle: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
    goTo: vi.fn(),
    reset: vi.fn(),
    setSpeedMs: vi.fn(),
    ...overrides,
  };
}

describe('PlayerControls', () => {
  it('renders the primary action as executar and toggles playback', () => {
    const playback = makePlayback();
    renderWithProviders(<PlayerControls playback={playback} />);

    const play = screen.getByRole('button', { name: 'Executar' });
    expect(play).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(play);
    expect(playback.toggle).toHaveBeenCalledOnce();
  });

  it('shows pausar while playing', () => {
    renderWithProviders(
      <PlayerControls playback={makePlayback({ isPlaying: true, index: 1 })} />,
    );
    expect(screen.getByRole('button', { name: 'Pausar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('shows recomeçar at the end', () => {
    renderWithProviders(<PlayerControls playback={makePlayback({ index: 2, atEnd: true })} />);
    expect(screen.getByRole('button', { name: 'Recomeçar' })).toBeInTheDocument();
  });

  it('disables the edge transport actions', () => {
    renderWithProviders(
      <PlayerControls playback={makePlayback({ atStart: false, atEnd: true })} />,
    );

    expect(screen.getByRole('button', { name: 'Passo anterior' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Próximo passo' })).toBeDisabled();
  });

  it('resets, advances and changes speed', () => {
    const playback = makePlayback();
    renderWithProviders(<PlayerControls playback={playback} />);

    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao início' }));
    fireEvent.click(screen.getByRole('button', { name: 'Próximo passo' }));
    fireEvent.click(screen.getByText('2×'));

    expect(playback.reset).toHaveBeenCalledOnce();
    expect(playback.next).toHaveBeenCalledOnce();
    expect(playback.setSpeedMs).toHaveBeenCalledWith(450);
  });
});
