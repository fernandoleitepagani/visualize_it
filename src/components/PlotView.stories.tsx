import type { Meta, StoryObj } from '@storybook/react';
import { PlotView } from './PlotView';

const points = [
  { label: 'f(1)', value: 3 },
  { label: 'f(2)', value: 5 },
  { label: 'f(3)', value: 2 },
  { label: 'f(4)', value: 6 },
  { label: 'f(5)', value: 4 },
];

const meta = {
  title: 'Views/PlotView',
  component: PlotView,
  args: { plot: { points, current: 0, total: 3 } },
} satisfies Meta<typeof PlotView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstTerm: Story = {};

export const PartialSum: Story = {
  args: { plot: { points, current: 2, total: 10 } },
};

export const Complete: Story = {
  args: { plot: { points, current: 4, total: 20 } },
};

export const Empty: Story = {
  args: { plot: { points: [], current: -1, total: 0 } },
};
