import { Profiler, useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { VimCheatsheet } from './VimCheatsheet';

const noop = () => {};

describe('VimCheatsheet', () => {
  it('renders two-column groups with a live count', () => {
    renderWithProviders(<VimCheatsheet onPractice={noop} />);

    expect(screen.getByText(/comandos · .* essenciais de/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'praticar Movimento' })).toBeInTheDocument();
    expect(screen.getByText('desfazer')).toBeInTheDocument();
  });

  it('filters commands and keeps the essential groups', () => {
    renderWithProviders(<VimCheatsheet onPractice={noop} />);

    expect(screen.getByText('desfazer')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filtrar cheatsheet'), {
      target: { value: 'diw' },
    });

    expect(screen.queryByText('desfazer')).not.toBeInTheDocument();
    expect(screen.getByText('apagar a palavra sob o cursor')).toBeInTheDocument();
  });

  it('toggles the essentials-only view', () => {
    renderWithProviders(<VimCheatsheet onPractice={noop} />);

    expect(screen.getByText('aspas simples incluídas')).toBeInTheDocument();
    fireEvent.click(screen.getByText('essenciais'));

    expect(screen.queryByText('aspas simples incluídas')).not.toBeInTheDocument();
    expect(screen.getByText('desfazer')).toBeInTheDocument();
  });

  it('clears the filter', () => {
    renderWithProviders(<VimCheatsheet onPractice={noop} />);
    const field = screen.getByLabelText('Filtrar cheatsheet');

    fireEvent.change(field, { target: { value: 'zzz' } });
    expect(screen.getByText('Nenhum comando encontrado.')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Limpar filtro'));
    expect(screen.getByText('desfazer')).toBeInTheDocument();
  });

  it('triggers practice for a whole group', () => {
    const onPractice = vi.fn();
    renderWithProviders(<VimCheatsheet onPractice={onPractice} />);

    fireEvent.click(screen.getByRole('button', { name: 'praticar Movimento' }));
    expect(onPractice).toHaveBeenCalledTimes(1);
    expect(onPractice.mock.calls[0][0].id).toBe('movimento');
  });

  it('is memoized so parent renders cannot redo its work', () => {
    const type = (VimCheatsheet as unknown as { $$typeof: symbol }).$$typeof;
    expect(type).toBe(Symbol.for('react.memo'));
  });

  it('keeps zero render work when the parent re-renders', () => {
    const onRender = vi.fn();

    function Harness() {
      const [tick, setTick] = useState(0);
      return (
        <>
          <button type="button" onClick={() => setTick((value) => value + 1)}>
            tick
          </button>
          <Profiler id="cheatsheet" onRender={onRender}>
            <VimCheatsheet onPractice={noop} />
          </Profiler>
          <span>{tick}</span>
        </>
      );
    }

    renderWithProviders(<Harness />);
    expect(onRender).toHaveBeenCalled();
    onRender.mockClear();

    fireEvent.click(screen.getByText('tick'));
    const update = onRender.mock.calls.find((call) => call[1] === 'update');
    // React still reports a commit for the Profiler wrapper, but the memoized
    // subtree bails out, so no actual render work happens.
    expect(update?.[2] ?? 0).toBeLessThan(1);
  });
});
