import type { Meta, StoryObj } from '@storybook/react';
import { applyKeys, createState } from '../keymap';
import { VimStatusline } from './VimStatusline';

const meta = {
  title: 'Vim/VimStatusline',
  component: VimStatusline,
  args: {
    state: createState(['const total = 0;']),
    fileName: 'pratica.txt',
    strokes: 14,
    best: 12,
  },
} satisfies Meta<typeof VimStatusline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const InsertWithMessage: Story = {
  args: {
    state: applyKeys(createState(['const total = 0;'], { line: 0, col: 4 }), ['i']),
    fileName: 'pratica.txt',
    strokes: 2,
  },
};
