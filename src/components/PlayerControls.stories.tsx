import type { Meta, StoryObj } from '@storybook/react';
import type { Playback } from '@/engine/usePlayback';
import { PlayerControls } from './PlayerControls';

const playback = (overrides: Partial<Playback> = {}): Playback => ({
  index: 0,
  total: 10,
  step: undefined,
  isPlaying: false,
  speedMs: 900,
  atStart: true,
  atEnd: false,
  play: () => {},
  pause: () => {},
  toggle: () => {},
  next: () => {},
  prev: () => {},
  goTo: () => {},
  reset: () => {},
  setSpeedMs: () => {},
  ...overrides,
});

const meta = {
  title: 'Controls/PlayerControls',
  component: PlayerControls,
  args: { playback: playback() },
} satisfies Meta<typeof PlayerControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stopped: Story = {};

export const Playing: Story = {
  args: { playback: playback({ isPlaying: true, atStart: false, index: 3 }) },
};

export const FirstStep: Story = {
  args: { playback: playback({ index: 0, total: 1, atEnd: true }) },
};

export const LastStep: Story = {
  args: { playback: playback({ index: 9, atStart: false, atEnd: true }) },
};
