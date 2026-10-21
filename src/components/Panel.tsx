import type { ReactNode } from 'react';
import { Box, Group, Paper, Text } from '@mantine/core';
import { font, radius, vizVar } from '@/theme';

interface Props {
  /** Left-aligned header text. */
  label: ReactNode;
  /** Optional right-aligned header content (counter, tabs, …). */
  aside?: ReactNode;
  /** Optional leading icon; replaces the default accent bar. */
  icon?: ReactNode;
  /** Optional footer that shares the card chrome with the header. */
  footer?: ReactNode;
  children: ReactNode;
}

/** Shared card chrome: an accented header strip, a body and an optional footer. */
export function Panel({ label, aside, icon, footer, children }: Props) {
  return (
    <Paper
      withBorder
      radius="xl"
      style={{
        overflow: 'hidden',
        background: vizVar.panel,
        borderColor: vizVar.line,
        boxShadow: 'var(--viz-shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Group
        justify="space-between"
        gap="sm"
        px="md"
        py={9}
        wrap="nowrap"
        style={{
          borderBottom: `1px solid ${vizVar.line}`,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--viz-surface-2) 42%, transparent), transparent)',
          flexShrink: 0,
          minHeight: 42,
        }}
      >
        <Group gap={9} wrap="nowrap" style={{ minWidth: 0 }}>
          <Box
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: 7,
              color: icon ? vizVar.accent : vizVar.muted,
              background: icon ? vizVar.accentSoft : 'transparent',
              border: icon ? `1px solid ${vizVar.accentLine}` : 'none',
              flexShrink: 0,
            }}
          >
            {icon ?? (
              <Box
                w={3}
                h={10}
                style={{ background: vizVar.accent, borderRadius: radius.pill }}
              />
            )}
          </Box>
          <Text
            fz={font.micro}
            fw={600}
            tt="uppercase"
            style={{
              color: vizVar.ink2,
              letterSpacing: '0.14em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'var(--mantine-font-family-monospace)',
            }}
          >
            {label}
          </Text>
        </Group>
        {aside}
      </Group>
      <Box style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
      {footer ? (
        <Box
          px="md"
          py="sm"
          style={{
            borderTop: `1px solid ${vizVar.line}`,
            background: 'color-mix(in srgb, var(--viz-surface-2) 32%, transparent)',
            flexShrink: 0,
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Paper>
  );
}
