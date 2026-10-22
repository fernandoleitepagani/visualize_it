import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { applyKeys, applyText, createState } from '../keymap';
import type { VimState } from '../types';
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
    expect(screen.queryByRole('button', { name: 'Focar no editor Vim' })).not.toBeInTheDocument();

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

  it('shows the centered focus overlay and focuses on click', () => {
    renderWithProviders(<EditorHarness />);

    const overlay = screen.getByRole('button', { name: 'Focar no editor Vim' });
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('vim-focus-overlay');
    expect(screen.getByText('Clique para focar')).toBeInTheDocument();

    fireEvent.click(overlay);
    expect(screen.queryByRole('button', { name: 'Focar no editor Vim' })).not.toBeInTheDocument();
  });

  it('brings the overlay back when the editor loses focus', () => {
    renderWithProviders(<EditorHarness />);
    const input = screen.getByRole('textbox', { name: 'Editor Vim' });

    fireEvent.focus(input);
    expect(screen.queryByRole('button', { name: 'Focar no editor Vim' })).not.toBeInTheDocument();

    fireEvent.blur(input);
    expect(screen.getByRole('button', { name: 'Focar no editor Vim' })).toBeInTheDocument();
  });

  it('announces mode and message in the statusline', () => {
    renderWithProviders(<EditorHarness />);
    const input = screen.getByRole('textbox', { name: 'Editor Vim' });

    fireEvent.keyDown(input, { key: ':' });
    expect(screen.getByRole('application')).toHaveAttribute('data-mode', 'command');
    expect(screen.getByText('COMANDO')).toBeInTheDocument();
    expect(screen.getByText('teste.txt')).toBeInTheDocument();
  });

  it('keeps the DOM small on long buffers', () => {
    const lines = Array.from({ length: 120 }, (_, index) => `const value${index} = ${index};`);
    const { container } = renderWithProviders(<EditorHarness lines={lines} />);

    expect(container.querySelectorAll('.vim-editor *').length).toBeLessThan(800);
  });
});
