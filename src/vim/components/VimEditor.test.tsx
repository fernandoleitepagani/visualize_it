import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { applyKeys, applyText, createState } from '../keymap';
import type { VimState } from '../types';
import { VimCheatsheet } from './VimCheatsheet';
import { VimEditor } from './VimEditor';
import { VimStatusline } from './VimStatusline';

function EditorHarness({ lines = ['abc', 'def'] }: { lines?: string[] }) {
  const [state, setState] = useState<VimState>(() => createState(lines));
  return (
    <>
      <VimEditor
        state={state}
        onKey={(key) => setState((current) => applyKeys(current, [key]))}
        onText={(text) => setState((current) => applyText(current, text))}
      />
      <VimStatusline state={state} fileName="teste.txt" strokes={0} />
    </>
  );
}

describe('VimEditor', () => {
  it('renders the buffer and exposes the cursor state', () => {
    const { container } = renderWithProviders(<EditorHarness />);

    expect(container.textContent).toContain('abc');
    expect(container.textContent).toContain('def');
    expect(screen.getByRole('application')).toHaveAttribute('data-cursor', '0:0');
    expect(screen.getByRole('application')).toHaveAttribute('data-mode', 'normal');
  });

  it('moves with the keyboard after focusing', () => {
    renderWithProviders(<EditorHarness />);
    const input = screen.getByRole('textbox', { name: 'Editor Vim' });

    fireEvent.focus(input);
    expect(screen.queryByText('clique para focar')).not.toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'j' });
    expect(screen.getByRole('application')).toHaveAttribute('data-cursor', '1:0');
  });

  it('enters insert mode and accepts typed text', () => {
    const { container } = renderWithProviders(<EditorHarness />);
    const input = screen.getByRole('textbox', { name: 'Editor Vim' });

    fireEvent.keyDown(input, { key: 'i' });
    expect(screen.getByRole('application')).toHaveAttribute('data-mode', 'insert');

    fireEvent.change(input, { target: { value: 'X' } });
    expect(screen.getByRole('application')).toHaveAttribute('data-cursor', '0:1');
    expect(container.textContent).toContain('Xabc');

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.getByRole('application')).toHaveAttribute('data-mode', 'normal');
  });

  it('announces mode and message in the statusline', () => {
    renderWithProviders(<EditorHarness />);
    const input = screen.getByRole('textbox', { name: 'Editor Vim' });

    fireEvent.keyDown(input, { key: ':' });
    expect(screen.getByRole('application')).toHaveAttribute('data-mode', 'command');
    expect(screen.getAllByText('COMANDO').length).toBeGreaterThan(0);
    expect(screen.getByText('teste.txt')).toBeInTheDocument();
  });
});

describe('VimCheatsheet', () => {
  it('filters commands and keeps the essential groups', () => {
    renderWithProviders(<VimCheatsheet onPractice={vi.fn()} />);

    expect(screen.getByText('desfazer')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filtrar cheatsheet'), {
      target: { value: 'diw' },
    });

    expect(screen.queryByText('desfazer')).not.toBeInTheDocument();
    expect(screen.getByText('apagar a palavra sob o cursor')).toBeInTheDocument();
  });

  it('shows a practice action only for staged items', () => {
    const onPractice = vi.fn();
    renderWithProviders(<VimCheatsheet onPractice={onPractice} />);

    fireEvent.click(screen.getByLabelText('praticar inserir antes do cursor'));
    expect(onPractice).toHaveBeenCalledTimes(1);
    expect(onPractice.mock.calls[0][0].id).toBe('i');
  });
});
