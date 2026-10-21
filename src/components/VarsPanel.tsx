import { Box, Group, Text } from '@mantine/core';
import type { VarValue } from '@/engine/types';
import { font, radius, space, vizVar } from '@/theme';

interface Props {
  vars?: Record<string, VarValue>;
  prevVars?: Record<string, VarValue>;
}

/** Chips showing the named variables captured by the current step. */
export function VarsPanel({ vars, prevVars }: Props) {
  const entries = Object.entries(vars ?? {});
  if (entries.length === 0) return null;

  return (
    <Box mt="md" pt="sm" style={{ borderTop: `1px solid ${vizVar.line}` }}>
      <Text
        fz={font.micro}
        fw={600}
        tt="uppercase"
        c="dimmed"
        mb={space.xs}
        style={{ letterSpacing: '0.14em' }}
      >
        variáveis
      </Text>
      <Group role="group" aria-label="Variáveis do passo" gap={6} wrap="wrap">
        {entries.map(([name, value]) => {
          const isChanged = prevVars !== undefined && prevVars[name] !== value;
          return (
            <Group
              key={`${name}-${String(value)}`}
              className={isChanged ? 'viz-var-changed' : undefined}
              gap={5}
              px="sm"
              py={3}
              style={{
                background: isChanged
                  ? 'color-mix(in srgb, var(--viz-accent-soft) 80%, var(--viz-surface-2))'
                  : 'color-mix(in srgb, var(--viz-surface-2) 66%, transparent)',
                border: `1px solid ${isChanged ? vizVar.accentLine : vizVar.line}`,
                borderRadius: radius.sm,
                boxShadow: isChanged ? `0 0 0 1px ${vizVar.accentSoft}` : undefined,
              }}
            >
              <Text span fz={font.small} style={{ color: vizVar.muted }}>
                {name}
              </Text>
              <Text span fz={font.tiny} style={{ color: vizVar.dim }}>
                =
              </Text>
              {value === null || value === undefined ? (
                <Text span fz={font.small} style={{ color: vizVar.dim }}>
                  —
                </Text>
              ) : (
                <Text span fz={font.small} fw={700} style={{ color: vizVar.ink }}>
                  {String(value)}
                </Text>
              )}
              {isChanged ? (
                <Box
                  w={4}
                  h={4}
                  aria-hidden
                  style={{
                    background: vizVar.accent,
                    borderRadius: radius.pill,
                    boxShadow: `0 0 6px ${vizVar.accent}`,
                  }}
                />
              ) : null}
            </Group>
          );
        })}
      </Group>
    </Box>
  );
}
