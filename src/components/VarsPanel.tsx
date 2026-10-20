import { Box, Group, Text } from '@mantine/core';
import type { VarValue } from '@/engine/types';
import { palette, radius, space, font, transition, vizVar } from '@/theme';

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
        fw={700}
        tt="uppercase"
        c="dimmed"
        mb={space.xs}
        style={{ letterSpacing: '0.1em' }}
      >
        variáveis
      </Text>
      <Group role="group" aria-label="Variáveis do passo" gap="xs" ff="monospace">
        {entries.map(([name, value]) => {
          const isChanged = prevVars !== undefined && prevVars[name] !== value;
          return (
            <Group
              key={`${name}-${String(value)}`}
              className={isChanged ? 'viz-var-changed' : undefined}
              gap={6}
              px="sm"
              py={space.xxs}
              style={{
                background: isChanged ? palette.accentSoft : vizVar.surface2,
                border: `1px solid ${isChanged ? palette.accentLine : vizVar.line2}`,
                borderRadius: radius.sm,
                transition: `background-color ${transition.base}, border-color ${transition.base}`,
              }}
            >
              <Text span fz={font.small} fw={500} style={{ color: vizVar.muted }}>
                {name}
              </Text>
              {value === null || value === undefined ? (
                <Text span fz={font.small} style={{ color: vizVar.dim }}>
                  —
                </Text>
              ) : (
                <Text span fz={font.small} fw={700} c="amber">
                  {String(value)}
                </Text>
              )}
              {isChanged ? (
                <Box
                  w={5}
                  h={5}
                  aria-hidden
                  style={{
                    background: palette.accent,
                    borderRadius: radius.pill,
                    boxShadow: `0 0 6px ${palette.accent}`,
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
