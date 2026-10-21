import type { ReactNode } from 'react';
import { Box, Group, Text, Title } from '@mantine/core';
import { font } from '@/theme';

interface Props {
  id?: string;
  /** Small mono marker, e.g. `01`. */
  index?: string;
  /** Optional label displayed before the rule. */
  kicker?: string;
  /** Optional right-aligned count. */
  count?: ReactNode;
  children: ReactNode;
}

/**
 * Section heading with a mono index, a title and a fading rule. The index is
 * decorative so the accessible heading stays exactly the visible title.
 */
export function SectionHeading({ id, index, kicker, count, children }: Props) {
  return (
    <Box className="section-heading">
      {index ? (
        <Text className="section-index" aria-hidden>
          {index}
        </Text>
      ) : null}
      <Title order={2} id={id} fz={font.h3} fw={600} style={{ letterSpacing: '-0.02em' }}>
        {children}
      </Title>
      {kicker ? (
        <Text fz={font.micro} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.1em' }}>
          {kicker}
        </Text>
      ) : null}
      <Box className="section-rule" aria-hidden />
      {count !== undefined ? (
        <Group gap={0} wrap="nowrap" aria-hidden>
          <Text fz={font.tiny} c="dimmed">
            {count}
          </Text>
        </Group>
      ) : null}
    </Box>
  );
}
