import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getSubject, getSubjectEntries } from '@/content/subjects';
import { renderWithProviders } from '@/test/render';
import { AlgorithmBrowser } from './AlgorithmBrowser';

function renderBrowser() {
  const subject = getSubject('aeds-ii')!;
  return renderWithProviders(
    <AlgorithmBrowser entries={getSubjectEntries(subject)} groups={subject.groups} />,
    '/materias/aeds-ii',
  );
}

describe('AlgorithmBrowser', () => {
  it('filters entries by query', () => {
    renderBrowser();
    fireEvent.change(screen.getByPlaceholderText('Buscar nesta matéria...'), {
      target: { value: 'quicksort' },
    });

    expect(screen.getByText('Quicksort')).toBeInTheDocument();
    expect(screen.queryByText('Selection Sort')).not.toBeInTheDocument();
  });

  it('filters entries by group', () => {
    renderBrowser();
    fireEvent.click(screen.getByRole('button', { name: 'Busca' }));

    expect(screen.getByText('Busca Binária')).toBeInTheDocument();
    expect(screen.queryByText('Quicksort')).not.toBeInTheDocument();
  });

  it('shows an empty state and clears the filters', () => {
    renderBrowser();
    fireEvent.change(screen.getByPlaceholderText('Buscar nesta matéria...'), {
      target: { value: 'xyz-inexistente' },
    });

    expect(screen.getByText('Nenhum resultado com esses filtros.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Limpar filtros' })[0]);

    expect(screen.getByText('Quicksort')).toBeInTheDocument();
  });
});
