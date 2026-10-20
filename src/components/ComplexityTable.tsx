import { Box, Table, Text } from '@mantine/core';
import type { Complexity } from '@/engine/types';
import { font } from '@/theme';

const dash = (value: string | undefined) => (value && value.length > 0 ? value : '—');

export function ComplexityTable({ complexity }: { complexity: Complexity }) {
  const time = complexity.time ?? {};
  const stable =
    complexity.stable === undefined ? '—' : complexity.stable ? 'Sim' : 'Não';
  const rows: Array<{ label: string; cells: string[]; mono?: boolean }> = [
    { label: 'Tempo', cells: [dash(time.best), dash(time.avg), dash(time.worst)], mono: true },
    { label: 'Espaço', cells: [dash(complexity.space)], mono: true },
    { label: 'Estável', cells: [stable] },
  ];

  return (
    <Box>
      <Table horizontalSpacing="md" verticalSpacing="xs" fz={font.small}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            {['melhor', 'médio', 'pior'].map((heading) => (
              <Table.Th
                key={heading}
                fz={font.micro}
                fw={600}
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: '0.08em' }}
              >
                {heading}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.label}>
              <Table.Td fw={500} c="dimmed">
                {row.label}
              </Table.Td>
              {row.cells.map((cell, i) => (
                <Table.Td
                  key={i}
                  colSpan={row.cells.length === 1 ? 3 : 1}
                  ff={row.mono ? 'monospace' : undefined}
                  fw={row.mono ? 600 : 500}
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
