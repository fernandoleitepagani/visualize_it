import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import type { PointerState } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { PointersView } from './PointersView';

const state: PointerState = {
  boxes: [
    { id: 'x', name: 'x', type: 'int', address: '0x1000', value: 42, state: 'compare' },
    {
      id: 'p',
      name: 'p',
      type: 'int *',
      address: '0x1008',
      value: '0x1000',
      targetId: 'x',
      labels: ['*p'],
      state: 'active',
    },
    {
      id: 'pp',
      name: 'pp',
      type: 'int **',
      address: '0x100c',
      value: '0x1008',
      targetId: 'p',
      state: 'write',
    },
  ],
  result: { label: 'saída', value: '*p = 42' },
};

describe('PointersView', () => {
  it('renders each memory box with type, name, address and value', () => {
    renderWithProviders(<PointersView state={state} />);

    const x = screen.getByTestId('pointer-box-x');
    expect(x).toHaveTextContent('int x');
    expect(x).toHaveTextContent('0x1000');
    expect(within(x).getByText('42')).toBeInTheDocument();

    const p = screen.getByTestId('pointer-box-p');
    expect(p).toHaveTextContent('int *p');
    expect(p).toHaveTextContent('0x1008');
    expect(p).toHaveTextContent('aponta para x');
    expect(within(p).getByText('*p')).toBeInTheDocument();

    const pp = screen.getByTestId('pointer-box-pp');
    expect(pp).toHaveTextContent('int **pp');
    expect(pp).toHaveTextContent('0x100c');
    expect(pp).toHaveTextContent('aponta para p');
  });

  it('draws one arrow per valid target and gives each link its own lane', () => {
    renderWithProviders(<PointersView state={state} />);

    const links = screen.getByTestId('pointer-links').querySelectorAll('path[data-lane]');
    expect(links).toHaveLength(2);
    expect(new Set([...links].map((link) => link.getAttribute('data-lane'))).size).toBe(2);
    expect([...links].map((link) => link.getAttribute('data-from'))).toEqual(['p', 'pp']);
    expect([...links].map((link) => link.getAttribute('data-to'))).toEqual(['x', 'p']);
  });

  it('anchors every arrow on the bottom edge of fixed-height boxes', () => {
    renderWithProviders(<PointersView state={state} />);

    const links = screen.getByTestId('pointer-links').querySelectorAll('path[data-lane]');
    for (const link of links) {
      const from = screen.getByTestId(`pointer-box-${link.getAttribute('data-from')}`);
      const to = screen.getByTestId(`pointer-box-${link.getAttribute('data-to')}`);
      const height = parseFloat(from.style.height);

      expect(height).toBeGreaterThan(0);
      expect(parseFloat(to.style.height)).toBe(height);

      const numbers = link.getAttribute('d')!.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
      expect(numbers[1]).toBe(height);
      expect(numbers[numbers.length - 1]).toBe(height);
    }
  });

  it('keeps four memory boxes inside a compact canvas', () => {
    const fourBoxes: PointerState = {
      boxes: [
        { id: 'x', name: 'x', type: 'int', address: '0x1000', value: 42 },
        { id: 'y', name: 'y', type: 'int', address: '0x1004', value: 7 },
        { id: 'p', name: 'p', type: 'int *', address: '0x1008', value: '0x1000', targetId: 'x' },
        { id: 'pp', name: 'pp', type: 'int **', address: '0x100c', value: '0x1008', targetId: 'p' },
      ],
    };

    const { container } = renderWithProviders(<PointersView state={fourBoxes} />);
    const boxes = container.querySelectorAll<HTMLElement>('[data-testid^="pointer-box-"]');

    expect(boxes).toHaveLength(4);
    for (const box of boxes) {
      expect(box.style.width).toBe('120px');
      expect(box.style.height).toBe('116px');
    }
    expect(screen.getByTestId('pointer-links').getAttribute('width')).toBe('510');
  });

  it('shows the printf result and only the active legend states', () => {
    renderWithProviders(<PointersView state={state} />);

    expect(screen.getByText('saída')).toBeInTheDocument();
    expect(screen.getByText('*p = 42')).toBeInTheDocument();
    expect(screen.getByText('ativo')).toBeInTheDocument();
    expect(screen.getByText('leitura')).toBeInTheDocument();
    expect(screen.getByText('escrita')).toBeInTheDocument();
    expect(screen.queryByText('vazio')).not.toBeInTheDocument();
  });

  it('uses distinct styles for read and write states', () => {
    renderWithProviders(<PointersView state={state} />);

    const read = screen.getByTestId('pointer-box-x');
    const write = screen.getByTestId('pointer-box-pp');

    expect(read.style.borderColor).toContain('purple');
    expect(write.style.borderColor).toContain('accent');
    expect(read.style.borderColor).not.toBe(write.style.borderColor);
  });

  it('ignores a missing target instead of drawing a broken arrow', () => {
    renderWithProviders(
      <PointersView
        state={{
          boxes: [
            {
              id: 'p',
              name: 'p',
              type: 'int *',
              address: '0x1008',
              value: '0x1000',
              targetId: 'nao-existe',
            },
          ],
        }}
      />,
    );

    expect(screen.queryByTestId('pointer-links')).not.toBeInTheDocument();
    expect(screen.getByTestId('pointer-box-p')).toHaveTextContent('0x1000');
  });

  it('renders an empty state when there is no memory yet', () => {
    renderWithProviders(<PointersView state={undefined} />);

    expect(screen.getByText('Memória vazia')).toBeInTheDocument();
  });

  it('gives the whole scene an accessible description', () => {
    renderWithProviders(<PointersView state={state} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAccessibleName(
      /x.*0x1000.*42.*p.*0x1008.*aponta para x.*pp.*0x100c.*aponta para p/i,
    );
    expect(image).toHaveAccessibleName(/marcada como \*p/i);
    expect(image).toHaveAttribute('tabindex', '0');

    const marker = screen.getByTestId('pointer-links').querySelector('marker');
    const firstLink = screen.getByTestId('pointer-links').querySelector('path[data-lane]');
    expect(marker?.id).not.toBe('pointer-arrowhead');
    expect(firstLink?.getAttribute('marker-end')).toBe(`url(#${marker?.id})`);
  });
});
