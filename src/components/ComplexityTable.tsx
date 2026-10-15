import { Box, Table, Text } from '@mantine/core';
import type { Complexity } from '@/engine/types';

const dash = (value: string | undefined) => (value && value.length > 0 ? value : '—');

export function ComplexityTable({ complexity }: { complexity: Complexity }) {
  const time = complexity.time ?? {};
  const rows: Array<{ label: string; cells: string[]; mono?: boolean }> = [
    { label: 'Tempo', cells: [dash(time.best), dash(time.avg), dash(time.worst)], mono: true },
    { label: 'Espaço', cells: [dash(complexity.space)], mono: true },
    { label: 'Estável', cells: [complexity.stable ? 'Sim' : 'Não'] },
  ];

  return (
    <Box>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            {['melhor', 'médio', 'pior'].map((heading) => (
              <Table.Th key={heading}>{heading}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.label}>
              <Table.Td c="dimmed">{row.label}</Table.Td>
              {row.cells.map((cell, i) => (
                <Table.Td
                  key={i}
                  colSpan={row.cells.length === 1 ? 3 : 1}
                  ff={row.mono ? 'monospace' : undefined}
                  c={row.mono ? 'amber' : undefined}
                >
                  {cell}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {complexity.note ? (
        <Text fz="sm" c="dimmed" mt="sm">
          {complexity.note}
        </Text>
      ) : null}
    </Box>
  );
}
