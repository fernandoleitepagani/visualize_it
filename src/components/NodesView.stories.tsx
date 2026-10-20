import type { Meta, StoryObj } from '@storybook/react';
import { NodesView } from './NodesView';

const nodes = [
  { id: 'a', val: 1, next: 'b' },
  { id: 'b', val: 2, next: 'c' },
  { id: 'c', val: 3, next: null },
];

const meta = {
  title: 'Views/NodesView',
  component: NodesView,
  args: { nodes },
} satisfies Meta<typeof NodesView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Singly: Story = {};

export const Doubly: Story = {
  args: {
    linked: 'doubly',
    nodes: [
      { id: 'a', val: 1, prev: null, next: 'b' },
      { id: 'b', val: 2, prev: 'a', next: 'c' },
      { id: 'c', val: 3, prev: 'b', next: null },
    ],
  },
};

export const ActiveNode: Story = {
  args: {
    nodes: [
      { id: 'a', val: 1, next: 'b' },
      { id: 'b', val: 2, next: 'c', state: 'active' },
      { id: 'c', val: 3, next: null },
    ],
  },
};
