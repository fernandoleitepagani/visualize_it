import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LessonView } from '@/components/LessonView';
import { getLesson } from '@/content/lessons';
import { renderWithProviders } from '@/test/render';

const lesson = getLesson('selecao');

if (!lesson) throw new Error('A lição de seleção precisa existir para estes testes.');

describe('LessonView input toolbar', () => {
  it('reports invalid input next to the field', () => {
    renderWithProviders(<LessonView lesson={lesson} />);

    fireEvent.change(screen.getByLabelText('valores'), { target: { value: '1, 2.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(
      screen.getByText('Use entre 1 e 12 números inteiros separados por vírgula.'),
    ).toBeInTheDocument();
  });

  it('applies a valid list and the ordering preset', () => {
    renderWithProviders(<LessonView lesson={lesson} />);
    const input = screen.getByLabelText('valores');

    fireEvent.change(input, { target: { value: '5, 2, 9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(input).toHaveValue('5, 2, 9');

    fireEvent.click(screen.getByRole('button', { name: 'Ordenado' }));
    expect(input).toHaveValue('2, 5, 9');
  });
});
