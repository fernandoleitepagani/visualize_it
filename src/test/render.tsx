import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { cssVariablesResolver, theme } from '@/theme';

/** Renders a component inside the app's providers (Mantine theme + router). */
export function renderWithProviders(ui: ReactElement, route = '/') {
  return render(
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
      cssVariablesResolver={cssVariablesResolver}
    >
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </MantineProvider>,
  );
}
