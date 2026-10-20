import type { Meta, StoryObj } from '@storybook/react';
import { BarsView } from './BarsView';

const meta = {
  title: 'Views/BarsView',
  component: BarsView,
  args: {
    state: { line: 0, desc: 'passo', arr: [5, 2, 9, 1, 7] },
  },
} satisfies Meta<typeof BarsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Comparing: Story = {
  args: { state: { line: 0, desc: 'comparando', arr: [5, 2, 9, 1, 7], cmp: [1, 2] } },
};

export const Swapping: Story = {
  args: { state: { line: 0, desc: 'trocando', arr: [2, 5, 9, 1, 7], swap: [0, 1] } },
};

export const Sorted: Story = {
  args: { state: { line: 0, desc: 'ordenado', arr: [1, 2, 5, 7, 9], sorted: [0, 1, 2, 3, 4] } },
};

export const Empty: Story = {
  args: { state: undefined },
};
