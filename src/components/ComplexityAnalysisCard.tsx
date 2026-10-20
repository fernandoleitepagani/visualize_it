import { Box, SimpleGrid, Text } from '@mantine/core';
import type { ComplexityAnalysis } from '@/engine/types';
import { Panel } from './Panel';

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
    <Panel label="análise de complexidade">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" p="md">
        {columns.map(({ label, content }) => (
          <Box key={label}>
            <Text
              fz={11}
              fw={600}
              tt="uppercase"
              c="dimmed"
              mb={6}
              style={{ letterSpacing: '0.1em' }}
            >
              {label}
            </Text>
            <Text
              fz="sm"
              c={content ? undefined : 'dimmed'}
              style={{ minHeight: 48, whiteSpace: 'pre-wrap' }}
            >
              {content || '—'}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Panel>
  );
}
