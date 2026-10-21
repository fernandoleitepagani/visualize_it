import { Box, SimpleGrid, Text } from '@mantine/core';
import type { ComplexityAnalysis } from '@/engine/types';
import { font, vizVar } from '@/theme';
import { Panel } from './Panel';
import { GaugeIcon } from './icons';

/**
 * Card for the comparison/movement cost analysis. Lessons without copy keep
 * the reserved space with a placeholder.
 */
export function ComplexityAnalysisCard({ analysis }: { analysis: ComplexityAnalysis }) {
  const columns = [
    { label: 'comparações', content: analysis.comparisons },
    { label: 'movimentações', content: analysis.movements },
  ];

  return (
    <Panel label="análise de complexidade" icon={<GaugeIcon size={13} />}>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" p="md">
        {columns.map(({ label, content }) => (
          <Box key={label}>
            <Text
              fz={font.micro}
              fw={600}
              tt="uppercase"
              c="dimmed"
              ff="monospace"
              mb={8}
              style={{ letterSpacing: '0.12em' }}
            >
              {label}
            </Text>
            <Text
              fz={font.small}
              c={content ? undefined : 'dimmed'}
              style={{
                minHeight: 48,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
                color: content ? vizVar.ink2 : undefined,
              }}
            >
              {content || '—'}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Panel>
  );
}
