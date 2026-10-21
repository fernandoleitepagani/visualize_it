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

describe('LessonView code languages', () => {
  it('shows only C for AEDS I lessons and ignores lang=java', () => {
    const forLesson = getLesson('for');
    if (!forLesson) throw new Error('A lição for precisa existir.');

    renderWithProviders(<LessonView lesson={forLesson} />, '/algoritmos/for?lang=java');
    fireEvent.click(screen.getByRole('tab', { name: 'Código' }));
    expect(screen.getByRole('region', { name: 'Código C' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Código Java' })).not.toBeInTheDocument();
  });

  it('restores the C listing from the query string', () => {
    renderWithProviders(<LessonView lesson={lesson} />, '/algoritmos/selecao?lang=c');
    fireEvent.click(screen.getByRole('tab', { name: 'Código' }));
    expect(screen.getByRole('region', { name: 'Código C' })).toBeInTheDocument();
  });
});

describe('LessonView insights', () => {
  it('renders the tip and curiosity in the about panel', () => {
    renderWithProviders(<LessonView lesson={lesson} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Sobre' }));
    expect(screen.getByText(/Depois de i rodadas/)).toBeInTheDocument();
    expect(screen.getByText(/Θ\(n²\) comparações/)).toBeInTheDocument();
  });
});

describe('LessonView shortcuts', () => {
  it('opens the keyboard help with ?', async () => {
    renderWithProviders(<LessonView lesson={lesson} />);
    fireEvent.keyDown(document.body, { key: '?' });
    expect(await screen.findByText('Atalhos de teclado')).toBeInTheDocument();
  });
});

describe('LessonView unit-interval input', () => {
  const bucketLesson = getLesson('bucket');

  if (!bucketLesson) throw new Error('A lição de bucket precisa existir para estes testes.');

  it('accepts decimals in [0, 1)', () => {
    renderWithProviders(<LessonView lesson={bucketLesson} />);
    const input = screen.getByLabelText('valores');

    fireEvent.change(input, { target: { value: '0.9, 0.1, 0.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(input).toHaveValue('0.9, 0.1, 0.5');
    expect(screen.queryByText(/Use valores entre 0/)).not.toBeInTheDocument();
  });

  it('rejects values outside [0, 1)', () => {
    renderWithProviders(<LessonView lesson={bucketLesson} />);

    fireEvent.change(screen.getByLabelText('valores'), { target: { value: '1.5, 0.2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(
      screen.getByText('Use valores entre 0 (inclusive) e 1 (exclusive), como 0.25 ou 0.70.'),
    ).toBeInTheDocument();
  });
});
