import { Button, Group } from '@mantine/core';

const KEYS: Array<{ key: string; label: string }> = [
  { key: 'Escape', label: 'Esc' },
  { key: ':', label: ':' },
  { key: 'i', label: 'i' },
  { key: 'h', label: 'h' },
  { key: 'j', label: 'j' },
  { key: 'k', label: 'k' },
  { key: 'l', label: 'l' },
  { key: 'w', label: 'w' },
  { key: 'b', label: 'b' },
  { key: '0', label: '0' },
  { key: '$', label: '$' },
  { key: 'x', label: 'x' },
  { key: 'd', label: 'd' },
  { key: 'u', label: 'u' },
  { key: 'C-r', label: 'Ctrl-r' },
  { key: 'Enter', label: 'Enter' },
  { key: 'Backspace', label: '⌫' },
];

/** Touch fallback for keyboards without Esc/Ctrl. Hidden on fine pointers. */
export function VimTouchKeys({ onKey }: { onKey: (key: string) => void }) {
  return (
    <Group gap={5} p="sm" wrap="wrap" className="vim-touch" role="toolbar" aria-label="Teclas do editor">
      {KEYS.map(({ key, label }) => (
        <Button
          key={key}
          size="compact-xs"
          variant="default"
          radius="sm"
          fw={600}
          aria-label={`tecla ${label}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onKey(key)}
          styles={{ label: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
        >
          {label}
        </Button>
      ))}
    </Group>
  );
}
