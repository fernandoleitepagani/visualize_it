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

  it('handles an empty step list without showing 1 / 0', () => {
    renderWithProviders(
      <PlayerControls playback={makePlayback({ index: 0, total: 0, atStart: true, atEnd: true })} />,
    );

    expect(screen.getByText('0 / 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Executar' })).toBeDisabled();
  });

  it('renders the step timeline and seeks through it', () => {
    const playback = makePlayback({ total: 3, index: 0 });
    renderWithProviders(
      <PlayerControls
        playback={playback}
        steps={[
          { line: 0, desc: 'início' },
          { line: 1, desc: 'compara', cmp: [0, 1] },
          { line: 2, desc: 'fim', sorted: [0, 1] },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ir para o passo 3' }));
    expect(playback.goTo).toHaveBeenCalledWith(2);
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

  it('displays active execution status and completed state', () => {
    renderWithProviders(
      <PlayerControls playback={makePlayback({ isPlaying: true, index: 1, total: 5 })} />,
    );

    expect(screen.getByText('Executando')).toBeInTheDocument();
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('displays completed state at the end of playback', () => {
    renderWithProviders(
      <PlayerControls playback={makePlayback({ isPlaying: false, index: 4, total: 5, atEnd: true })} />,
    );

    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
  });
});
