import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { LoopState } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { LoopView } from './LoopView';

describe('LoopView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders waiting state when state is undefined', () => {
    renderWithProviders(<LoopView />);
    expect(screen.getByText('Aguardando execução do laço')).toBeInTheDocument();
  });

  it('renders squares mode by default for single loops', () => {
    const state: LoopState = {
      phase: 'body',
      iteration: { current: 2, total: 4, label: 'Iteração 2 de 4' },
      condition: {
        expression: 'i <= n',
        evaluation: '2 <= 4',
        satisfied: true,
      },
      accumulator: {
        label: 'S',
        value: 3,
        delta: '+ 2',
      },
    };

    renderWithProviders(<LoopView state={state} />);

    // Deve exibir a fila de iterações
    expect(screen.getByText('Fila de Iterações do Laço')).toBeInTheDocument();
    expect(screen.getByText('ATIVO')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByText('Verdadeiro ✅')).toBeInTheDocument();
  });

  it('renders triangular 2D grid for nested loops in squares mode', () => {
    const state: LoopState = {
      phase: 'body',
      iteration: { current: 2, total: 3, label: 'i = 2 de 3' },
      innerIteration: { current: 1, total: 2, label: 'j = 1 de 2' },
      condition: {
        expression: 'j <= i',
        evaluation: '1 <= 2',
        satisfied: true,
      },
      accumulator: {
        label: 'S',
        value: 4,
        delta: '+ 1',
      },
    };

    renderWithProviders(<LoopView state={state} />);

    expect(screen.getByText(/Grade de Iterações Aninhadas/)).toBeInTheDocument();
    expect(screen.getByText('i = 1')).toBeInTheDocument();
    expect(screen.getByText('i = 2')).toBeInTheDocument();
    expect(screen.getByText('i = 3')).toBeInTheDocument();
    expect(screen.getByText('executando')).toBeInTheDocument();
  });

  it('allows toggling between Quadrados and Dashboard mode', () => {
    const state: LoopState = {
      phase: 'check',
      iteration: { current: 2, total: 5, label: 'Iteração 2 de 5' },
      condition: {
        expression: 'i <= n',
        evaluation: '2 <= 5',
        satisfied: true,
        explanation: 'Continua no laço',
      },
      accumulator: {
        label: 'S',
        value: 3,
        delta: '+ 2',
      },
    };

    renderWithProviders(<LoopView state={state} />);

    // Por padrão no modo Quadrados
    expect(screen.getByText('Fila de Iterações do Laço')).toBeInTheDocument();

    // Alternar para Dashboard
    const dashboardRadio = screen.getByRole('radio', { name: 'Dashboard' });
    fireEvent.click(dashboardRadio);

    // Agora deve exibir os cartões detalhados do Dashboard
    expect(screen.getByText('Continua no laço')).toBeInTheDocument();
    expect(screen.getByText('Iteração 2 de 5')).toBeInTheDocument();

    // Alternar de volta para Quadrados
    const squaresRadio = screen.getByRole('radio', { name: 'Quadrados' });
    fireEvent.click(squaresRadio);
    expect(screen.getByText('Fila de Iterações do Laço')).toBeInTheDocument();
  });

  it('renders false condition correctly in dashboard mode when loop ends', () => {
    localStorage.setItem('visualize-it:loop-view-mode', 'dashboard');

    const state: LoopState = {
      phase: 'end',
      iteration: { current: 6, total: 5 },
      condition: {
        expression: 'i <= n',
        evaluation: '6 <= 5',
        satisfied: false,
        explanation: 'Condição falsa → sai do laço',
      },
      accumulator: {
        label: 'S',
        value: 15,
      },
    };

    renderWithProviders(<LoopView state={state} />);

    expect(screen.getByText('Falso ❌')).toBeInTheDocument();
    expect(screen.getByText('6 <= 5')).toBeInTheDocument();
    expect(screen.getByText('Condição falsa → sai do laço')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });
});
