import type { Preview } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { cssVariablesResolver, theme } from '../src/theme';
import '@fontsource-variable/space-grotesk';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-600.css';
import '@mantine/core/styles.css';
import '../src/styles/index.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MantineProvider
        theme={theme}
        defaultColorScheme="dark"
        cssVariablesResolver={cssVariablesResolver}
      >
        <Story />
      </MantineProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default preview;
