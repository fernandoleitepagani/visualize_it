import type { Preview } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { theme } from '../src/theme';
import '@mantine/core/styles.css';
import '../src/styles/index.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Story />
      </MantineProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default preview;
