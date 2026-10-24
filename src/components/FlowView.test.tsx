import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import type { FlowState } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { FlowView } from './FlowView';

const ifState: FlowState = {
  kind: 'if',
  selector: 'nota >= 6',
  branches: [
    {
      id: 'if',
      label: 'if',
      condition: 'nota >= 9',
      evaluation: '7 >= 9',
      result: false,
      statements: ['printf("Excelente")'],
      state: 'skipped',
    },
    {
      id: 'else-if',
      label: 'else if',
      condition: 'nota >= 6',
      evaluation: '7 >= 6',
      result: true,
      statements: ['printf("Aprovado")'],
      state: 'done',
    },
    {
      id: 'else',
      label: 'else',
      statements: ['printf("Reprovado")'],
      state: 'skipped',
    },
  ],
  result: { label: 'saída', value: 'Aprovado' },
  next: 'return 0;',
};

const switchState: FlowState = {
  kind: 'switch',
  selector: 'opcao = 2',
  branches: [
    {
      id: 'case-1',
      label: 'case 1',
      condition: 'opcao == 1',
      evaluation: '2 == 1',
      result: false,
      statements: ['printf("Um")'],
      exit: 'break',
      state: 'skipped',
    },
    {
      id: 'case-2',
      label: 'case 2',
      condition: 'opcao == 2',
      evaluation: '2 == 2',
      result: true,
      statements: ['printf("Dois")'],
      exit: 'break',
      state: 'done',
    },
    {
      id: 'case-3',
      label: 'case 3',
      condition: 'opcao == 3',
      evaluation: '2 == 3',
      result: false,
      statements: ['printf("Três")'],
      exit: 'fall-through',
      state: 'skipped',
    },
    {
      id: 'default',
      label: 'default',
      statements: ['printf("Outro")'],
      state: 'skipped',
    },
  ],
  result: { label: 'saída', value: 'Dois' },
  note: 'Sem break, a execução continuaria no próximo case (fall-through).',
};

const ternaryState: FlowState = {
  kind: 'ternary',
  selector: 'a > b',
  branches: [
    { id: 'true', label: 'verdadeiro', evaluation: '8 > 5', result: true, value: 'a = 8', state: 'done' },
    { id: 'false', label: 'falso', evaluation: '8 > 5', result: false, value: 'b = 5', state: 'skipped' },
  ],
  result: { label: 'maior', value: 8 },
};

describe('FlowView', () => {
  it('renders the empty state when there is no flow', () => {
    renderWithProviders(<FlowView state={undefined} />);

    expect(screen.getByTestId('flow-view-empty')).toBeInTheDocument();
    expect(screen.getByText(/Aguardando execução do fluxo/)).toBeInTheDocument();
  });

  it('renders an if/else chain with condition, branches and result', () => {
    renderWithProviders(<FlowView state={ifState} />);

    expect(
      screen.getByRole('region', { name: 'Visualizador de fluxo condicional' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('flow-condition')).toHaveTextContent('nota >= 6');

    const first = screen.getByTestId('flow-branch-if');
    const second = screen.getByTestId('flow-branch-else-if');
    const fallback = screen.getByTestId('flow-branch-else');

    expect(within(first).getByText('ignorado')).toBeInTheDocument();
    expect(within(first).getByText(/falso/)).toBeInTheDocument();
    expect(within(second).getByText('executado')).toBeInTheDocument();
    expect(within(second).getByText(/verdadeiro/)).toBeInTheDocument();
    expect(within(fallback).getByText('ignorado')).toBeInTheDocument();
    expect(screen.getByTestId('flow-result')).toHaveTextContent('Aprovado');
  });

  it('renders every switch case, break and the fall-through note', () => {
    renderWithProviders(<FlowView state={switchState} />);

    expect(screen.getByTestId('flow-branch-case-1')).toBeInTheDocument();
    expect(screen.getByTestId('flow-branch-case-2')).toBeInTheDocument();
    expect(screen.getByTestId('flow-branch-case-3')).toBeInTheDocument();
    expect(screen.getByTestId('flow-branch-default')).toBeInTheDocument();
    expect(within(screen.getByTestId('flow-branch-case-2')).getByText('break')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('flow-branch-case-3')).getByText('fall-through'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('flow-note')).toHaveTextContent(/fall-through/);
    expect(screen.getByTestId('flow-result')).toHaveTextContent('Dois');
  });

  it('renders the selected ternary value and the assigned result', () => {
    renderWithProviders(<FlowView state={ternaryState} />);

    const selected = screen.getByTestId('flow-branch-true');
    const fallback = screen.getByTestId('flow-branch-false');

    expect(within(selected).getByText(/a = 8/)).toBeInTheDocument();
    expect(within(selected).getByText('executado')).toBeInTheDocument();
    expect(within(fallback).getByText('ignorado')).toBeInTheDocument();
    expect(screen.getByTestId('flow-result')).toHaveTextContent('maior');
    expect(screen.getByTestId('flow-result')).toHaveTextContent('8');
  });

  it('toggles between the branch list and the flowchart', () => {
    renderWithProviders(<FlowView state={ifState} />);

    expect(screen.getByTestId('flow-list')).toBeInTheDocument();
    expect(screen.queryByTestId('flow-chart')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Diagrama' }));

    expect(screen.getByTestId('flow-chart')).toBeInTheDocument();
    expect(screen.getByTestId('flow-chart-condition')).toHaveTextContent('nota >= 6');
    expect(screen.getByTestId('flow-chart-next')).toHaveTextContent('return 0;');
    expect(screen.getByTestId('flow-chart-branch-else-if')).toHaveAttribute(
      'data-highlighted',
      'true',
    );
    expect(screen.getByTestId('flow-chart-branch-if')).toHaveAttribute(
      'data-highlighted',
      'false',
    );
    expect(screen.queryByTestId('flow-list')).not.toBeInTheDocument();
    expect(screen.getByTestId('flow-branch-else-if')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Ramos' }));

    expect(screen.getByTestId('flow-list')).toBeInTheDocument();
    expect(screen.queryByTestId('flow-chart')).not.toBeInTheDocument();
  });

  it('hides evaluations and values for idle branches', () => {
    const idleState: FlowState = {
      kind: 'ternary',
      selector: 'a > b',
      branches: [
        {
          id: 'true',
          label: 'verdadeiro',
          condition: 'a > b',
          evaluation: '8 > 5',
          result: true,
          value: 'a = 8',
          state: 'idle',
        },
        {
          id: 'false',
          label: 'falso',
          condition: 'a > b',
          evaluation: '8 > 5',
          result: false,
          value: 'b = 5',
          state: 'idle',
        },
      ],
    };

    renderWithProviders(<FlowView state={idleState} />);

    expect(screen.getAllByText('não avaliado').length).toBe(2);
    expect(screen.queryByText(/8 > 5/)).not.toBeInTheDocument();
    expect(screen.queryByText(/a = 8/)).not.toBeInTheDocument();
  });

  it('uses text, not only color, for branch state', () => {
    renderWithProviders(<FlowView state={ifState} />);

    expect(screen.getAllByText('ignorado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('executado').length).toBeGreaterThan(0);
    expect(screen.getByText('caminho ativo')).toBeInTheDocument();
  });
});
