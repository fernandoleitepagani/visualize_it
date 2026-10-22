import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '@/app/App';
import { renderWithProviders } from '@/test/render';
import { VimPage } from './VimPage';

function input() {
  return screen.getByRole('textbox', { name: 'Editor Vim' });
}

describe('VimPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the trainer, mission and cheatsheet', () => {
    renderWithProviders(<VimPage />, '/vim');

    expect(screen.getByRole('heading', { name: 'Vim' })).toBeInTheDocument();
    expect(screen.getAllByText('Mover sem as setas').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cheatsheet essencial/i).length).toBeGreaterThan(0);
  });

  it('solves the first challenge and stores progress', () => {
    renderWithProviders(<VimPage />, '/vim');
    const area = input();
    fireEvent.focus(area);

    for (const key of ['j', 'j', 'j', 'l', 'l', 'l']) {
      fireEvent.keyDown(area, { key });
    }

    expect(screen.getByText('Desafio concluído')).toBeInTheDocument();
    expect(window.localStorage.getItem('visualize-it:vim-progress')).toContain('hjkl');
  });

  it('switches challenges and resets the buffer', () => {
    const { container } = renderWithProviders(<VimPage />, '/vim');

    fireEvent.click(screen.getByRole('button', { name: /Duplicar uma linha/ }));
    expect(container.textContent).toContain('const a = 1;');
    expect(screen.getAllByText('Duplicar uma linha').length).toBeGreaterThan(0);
  });

  it('opens a challenge directly from the route', () => {
    const { container } = renderWithProviders(<App />, '/vim/desafios/palavras');

    expect(screen.getByRole('heading', { name: 'Salto entre palavras' })).toBeInTheDocument();
    expect(container.textContent).toContain('mova o cursor buffer até a palavra alvo');
  });

  it('stages a practice buffer from the cheatsheet', () => {
    renderWithProviders(<VimPage />, '/vim');

    fireEvent.click(screen.getByLabelText('praticar inserir antes do cursor'));

    expect(screen.getByText('modo prática')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao desafio' }));
    expect(screen.queryByText('modo prática')).not.toBeInTheDocument();
  });
});
