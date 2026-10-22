import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { LoopState } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { LoopView } from './LoopView';

describe('LoopView', () => {
  it('renders waiting state when state is undefined', () => {
    renderWithProviders(<LoopView />);
    expect(screen.getByText('Aguardando execução do laço')).toBeInTheDocument();
  });

  it('renders iteration counter and phases', () => {
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

    expect(screen.getByText('Iteração 2 de 5')).toBeInTheDocument();
    expect(screen.getByText('i <= n')).toBeInTheDocument();
    expect(screen.getByText('2 <= 5')).toBeInTheDocument();
    expect(screen.getByText('Verdadeiro ✅')).toBeInTheDocument();
    expect(screen.getByText('Continua no laço')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('+ 2')).toBeInTheDocument();
  });

  it('renders false condition correctly when loop ends', () => {
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

  it('renders inner loop tracking for nested loops', () => {
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

    expect(screen.getByText('i = 2 de 3')).toBeInTheDocument();
    expect(screen.getByText('Laço Interno')).toBeInTheDocument();
    expect(screen.getByText('j = 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('j <= i')).toBeInTheDocument();
    expect(screen.getByText('1 <= 2')).toBeInTheDocument();
  });
});
