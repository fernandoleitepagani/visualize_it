import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';

/** Switches between the light and dark color schemes. */
export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });
  const next = scheme === 'dark' ? 'light' : 'dark';
  const label = next === 'dark' ? 'tema escuro' : 'tema claro';

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        variant="default"
        size="lg"
        aria-label={`Mudar para ${label}`}
        onClick={() => setColorScheme(next)}
      >
        {scheme === 'dark' ? '☀' : '☾'}
      </ActionIcon>
    </Tooltip>
  );
}
