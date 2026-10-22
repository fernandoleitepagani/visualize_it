import type { Meta, StoryObj } from '@storybook/react';
import { VimCheatsheet } from './VimCheatsheet';

const meta = {
  title: 'Vim/VimCheatsheet',
  component: VimCheatsheet,
  args: { onPractice: () => {} },
} satisfies Meta<typeof VimCheatsheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Essential: Story = {};
