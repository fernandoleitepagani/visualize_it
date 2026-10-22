import type { Meta, StoryObj } from '@storybook/react';
import { applyKeys, createState } from '../keymap';
import { VimEditor } from './VimEditor';

const meta = {
  title: 'Vim/VimEditor',
  component: VimEditor,
  args: {
    state: createState(['const total = 0;', 'return total;']),
    onKey: () => {},
    onText: () => {},
  },
} satisfies Meta<typeof VimEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const Insert: Story = {
  args: { state: applyKeys(createState(['const total = 0;']), ['A']) },
};

export const Visual: Story = {
  args: {
    state: applyKeys(createState(['const total = 0;', 'return total;']), ['v', 'l', 'l', 'l']),
  },
};

export const Search: Story = {
  args: {
    state: applyKeys(createState(['const total = 0;', 'return total;']), ['/', 't', 'o']),
  },
};

export const EmptyBuffer: Story = {
  args: { state: createState(['']) },
};
