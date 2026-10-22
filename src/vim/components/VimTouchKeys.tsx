import { memo } from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { font, vizVar } from '@/theme';
import type { VimMode } from '../types';

interface Key {
  key: string;
  label: string;
  aria: string;
}

const GROUPS: Array<{ id: string; label: string; keys: Key[] }> = [
  {
    id: 'mover',
    label: 'mover',
    keys: [
      { key: 'h', label: 'h', aria: 'mover para a esquerda' },
      { key: 'j', label: 'j', aria: 'mover para baixo' },
      { key: 'k', label: 'k', aria: 'mover para cima' },
      { key: 'l', label: 'l', aria: 'mover para a direita' },
      { key: 'w', label: 'w', aria: 'próxima palavra' },
      { key: 'b', label: 'b', aria: 'palavra anterior' },
      { key: '0', label: '0', aria: 'início da linha' },
      { key: '$', label: '$', aria: 'fim da linha' },
    ],
  },
  {
    id: 'modos',
    label: 'modos',
    keys: [
      { key: 'Escape', label: 'Esc', aria: 'modo normal' },
      { key: 'i', label: 'i', aria: 'modo insert' },
      { key: ':', label: ':', aria: 'linha de comando' },
    ],
  },
  {
    id: 'editar',
    label: 'editar',
    keys: [
      { key: 'x', label: 'x', aria: 'apagar caractere' },
      { key: 'd', label: 'd', aria: 'operador apagar' },
      { key: 'u', label: 'u', aria: 'desfazer' },
      { key: '>', label: '>', aria: 'indentar' },
      { key: '<', label: '<', aria: 'dedententar' },
      { key: 'C-r', label: 'Ctrl-r', aria: 'refazer' },
      { key: 'Enter', label: 'Enter', aria: 'confirmar' },
      { key: 'Backspace', label: '⌫', aria: 'apagar anterior' },
    ],
  },
];

function isActive(key: string, mode: VimMode): boolean {
  if (key === 'Escape') return mode === 'normal';
  if (key === 'i') return mode === 'insert';
  if (key === ':') return mode === 'command';
  return false;
}

/** Touch fallback grouped by purpose. Hidden on fine pointers. */
export const VimTouchKeys = memo(function VimTouchKeys({
  mode,
  onKey,
}: {
  mode: VimMode;
  onKey: (key: string) => void;
}) {
  return (
    <Stack gap={6} p="sm" className="vim-touch" role="toolbar" aria-label="Teclas do editor">
      {GROUPS.map((group) => (
        <Group key={group.id} gap={5} wrap="wrap" align="center">
          <Text
            fz={font.micro}
            tt="uppercase"
            c="dimmed"
            w={46}
            style={{ letterSpacing: '0.1em', flexShrink: 0 }}
          >
            {group.label}
          </Text>
          {group.keys.map((item) => (
            <Button
              key={item.key}
              size="compact-xs"
              variant="default"
              radius="sm"
              fw={600}
              aria-label={`tecla ${item.aria}`}
              data-active={isActive(item.key, mode) ? 'true' : undefined}
              style={{
                borderColor: isActive(item.key, mode) ? vizVar.accentLine : undefined,
                background: isActive(item.key, mode) ? vizVar.accentSoft : undefined,
                color: isActive(item.key, mode) ? vizVar.accent : undefined,
              }}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onKey(item.key)}
              styles={{ label: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
            >
              {item.label}
            </Button>
          ))}
        </Group>
      ))}
    </Stack>
  );
});
