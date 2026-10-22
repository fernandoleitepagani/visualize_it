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

    fireEvent.click(screen.getByRole('button', { name: 'Próximo desafio' }));
    expect(screen.getByText('Contagem antes do movimento')).toBeInTheDocument();
  });

  it('types through the stable handlers', () => {
    const { container } = renderWithProviders(<VimPage />, '/vim');
    const area = input();

    fireEvent.focus(area);
    fireEvent.keyDown(area, { key: 'i' });
    fireEvent.change(area, { target: { value: 'x' } });
    fireEvent.change(area, { target: { value: 'y' } });

    expect(container.textContent).toContain('xyprimeira linha');
    expect(container.textContent).toContain('3 teclas');
  });

  it('restarts all challenges and erases the history', () => {
    renderWithProviders(<VimPage />, '/vim');
    const area = input();
    fireEvent.focus(area);
    for (const key of ['j', 'j', 'j', 'l', 'l', 'l']) {
      fireEvent.keyDown(area, { key });
    }
    expect(window.localStorage.getItem('visualize-it:vim-progress')).toContain('hjkl');

    fireEvent.click(
      screen.getByRole('button', { name: 'Reiniciar desafios e apagar histórico' }),
    );
    expect(screen.getByText('Reiniciar desafios?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar tudo' }));

    expect(window.localStorage.getItem('visualize-it:vim-progress')).toBeNull();
    expect(screen.getAllByText('0 concluídos').length).toBeGreaterThan(0);
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

  it('stages a practice buffer from a cheatsheet group', () => {
    renderWithProviders(<VimPage />, '/vim');

    fireEvent.click(screen.getByRole('button', { name: 'praticar Modos' }));

    expect(screen.getByText('modo prática')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao desafio' }));
    expect(screen.queryByText('modo prática')).not.toBeInTheDocument();
  });
});
