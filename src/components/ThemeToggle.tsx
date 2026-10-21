import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { MoonIcon, SunIcon } from './icons';

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
        radius="xl"
        aria-label={`Mudar para ${label}`}
        onClick={() => setColorScheme(next)}
      >
        {scheme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      </ActionIcon>
    </Tooltip>
  );
}
