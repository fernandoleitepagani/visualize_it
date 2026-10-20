import type { ReactNode } from 'react';
import { Box, Group, Paper, Text } from '@mantine/core';
import { palette, font, radius, shadow, tint, vizVar } from '@/theme';

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
      radius="md"
      style={{
        overflow: 'hidden',
        background: 'var(--mantine-color-body)',
        boxShadow: shadow.panel,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Group
        justify="space-between"
        gap="sm"
        px="md"
        py={8}
        wrap="nowrap"
        style={{
          borderBottom: `1px solid ${vizVar.line}`,
          background: tint(vizVar.surface, 55),
          flexShrink: 0,
          minHeight: 40,
        }}
      >
        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
          {icon ? (
            <Box
              aria-hidden
              style={{
                color: palette.accent,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          ) : (
            <Box
              w={3}
              h={12}
              aria-hidden
              style={{ background: palette.accent, borderRadius: radius.pill, flexShrink: 0 }}
            />
          )}
          <Text
            fz={font.tiny}
            fw={700}
            tt="uppercase"
            style={{
              color: vizVar.ink,
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {label}
          </Text>
        </Group>
        {aside}
      </Group>
      <Box style={{ flex: 1, minHeight: 0 }}>{children}</Box>
      {footer ? (
        <Box
          px="md"
          py="sm"
          style={{
            borderTop: `1px solid ${vizVar.line}`,
            background: tint(vizVar.surface, 55),
            flexShrink: 0,
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Paper>
  );
}
