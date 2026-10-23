import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import type { CallStackState } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { CallStackView } from './CallStackView';

const state: CallStackState = {
  frames: [
    {
      id: 'main',
      fn: 'main',
      vars: [
        { name: 'x', value: 3, kind: 'local' },
        { name: 'y', value: 4, kind: 'local' },
      ],
      state: 'waiting',
    },
    {
      id: 'soma',
      fn: 'soma',
      call: 'soma(x, y)',
      vars: [
        { name: 'a', value: 3, kind: 'param' },
        { name: 'b', value: 4, kind: 'param' },
        { name: 'total', value: 7, kind: 'local' },
      ],
      state: 'active',
    },
  ],
  result: { label: 'saída', value: '13' },
};

describe('CallStackView', () => {
  it('renders the most recent frame first and marks the active one', () => {
    renderWithProviders(<CallStackView state={state} />);

    const frames = screen.getAllByTestId(/^call-frame-/);
    expect(frames.map((frame) => frame.getAttribute('data-testid'))).toEqual([
      'call-frame-soma',
      'call-frame-main',
    ]);
    expect(screen.getByTestId('call-frame-soma')).toHaveAttribute('data-state', 'active');
    expect(screen.getByTestId('call-frame-main')).toHaveAttribute('data-state', 'waiting');
  });

  it('separates parameters from local variables in each frame', () => {
    renderWithProviders(<CallStackView state={state} />);

    const soma = screen.getByTestId('call-frame-soma');
    expect(within(soma).getByText('parâmetros')).toBeInTheDocument();
    expect(within(soma).getByText('locais')).toBeInTheDocument();
    expect(within(soma).getByText('a = 3')).toBeInTheDocument();
    expect(within(soma).getByText('b = 4')).toBeInTheDocument();
    expect(within(soma).getByText('total = 7')).toBeInTheDocument();
    expect(soma).toHaveTextContent('soma(x, y)');

    const main = screen.getByTestId('call-frame-main');
    expect(within(main).queryByText('parâmetros')).not.toBeInTheDocument();
    expect(within(main).getByText('x = 3')).toBeInTheDocument();
  });

  it('shows the return value while a frame is returning', () => {
    renderWithProviders(
      <CallStackView
        state={{
          frames: [
            { id: 'main', fn: 'main', vars: [], state: 'waiting' },
            {
              id: 'dobro',
              fn: 'dobro',
              vars: [{ name: 'n', value: 6, kind: 'param' }],
              state: 'returning',
              returns: '6',
            },
          ],
        }}
      />,
    );

    const dobro = screen.getByTestId('call-frame-dobro');
    expect(dobro).toHaveAttribute('data-state', 'returning');
    expect(dobro).toHaveTextContent('retorno 6');
  });

  it('labels a changed variable in text, not only in color', () => {
    renderWithProviders(
      <CallStackView
        state={{
          frames: [
            {
              id: 'soma',
              fn: 'soma',
              vars: [{ name: 'n', value: 6, kind: 'param', state: 'changed' }],
              state: 'active',
            },
          ],
        }}
      />,
    );

    const chip = screen.getByTestId('frame-var-soma-n');
    expect(chip).toHaveTextContent('n = 6');
    expect(chip).toHaveTextContent('alterado');
  });

  it('shows in the caller frame the value received from a completed call', () => {
    renderWithProviders(
      <CallStackView
        state={{
          frames: [
            {
              id: 'fatorial-2',
              fn: 'fatorial',
              call: 'fatorial(2)',
              vars: [{ name: 'n', value: 2, kind: 'param' }],
              state: 'active',
              received: '1',
            },
          ],
        }}
      />,
    );

    const frame = screen.getByTestId('call-frame-fatorial-2');
    expect(frame).toHaveTextContent('recebeu 1');
  });

  it('shows the result chip and only the legend states present', () => {
    renderWithProviders(<CallStackView state={state} />);

    expect(screen.getByText('saída')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getAllByText('ativo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('aguardando').length).toBeGreaterThan(0);
    expect(screen.queryByText('retornando')).not.toBeInTheDocument();
  });

  it('describes the whole stack from the base to the top', () => {
    renderWithProviders(<CallStackView state={state} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAccessibleName(/main aguardando.*x = 3.*y = 4.*soma ativo.*a = 3/i);
  });

  it('renders an empty state when there is no call stack yet', () => {
    renderWithProviders(<CallStackView state={undefined} />);

    expect(screen.getByText('Pilha vazia')).toBeInTheDocument();
    expect(screen.queryAllByTestId(/^call-frame-/)).toHaveLength(0);
  });
});
