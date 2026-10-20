import type { Meta, StoryObj } from '@storybook/react';
import { CellsView } from './CellsView';

const meta = {
  title: 'Views/CellsView',
  component: CellsView,
  args: {
    cells: [{ val: 10 }, { val: 20 }, { val: 30 }],
  },
} satisfies Meta<typeof CellsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Highlighted: Story = {
  args: {
    cells: [
      { val: 10, state: 'active' },
      { val: 20, state: 'compare' },
      { val: 30 },
    ],
  },
};

export const EmptyCell: Story = {
  args: {
    cells: [{ val: 10 }, { val: null, labels: ['topo'] }, { val: null }],
  },
};
