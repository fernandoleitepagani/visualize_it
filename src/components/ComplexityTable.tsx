import { Box, Table, Text } from '@mantine/core';
import type { Complexity } from '@/engine/types';
import { font, vizVar } from '@/theme';

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
      <Table
        horizontalSpacing="md"
        verticalSpacing="xs"
        fz={font.small}
        style={{ borderCollapse: 'separate', borderSpacing: 0 }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ borderBottom: `1px solid ${vizVar.line}` }} />
            {['melhor', 'médio', 'pior'].map((heading) => (
              <Table.Th
                key={heading}
                fz={font.micro}
                fw={600}
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: '0.1em', borderBottom: `1px solid ${vizVar.line}` }}
              >
                {heading}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.label}>
              <Table.Td
                fw={500}
                c="dimmed"
                style={{ borderBottom: `1px solid ${vizVar.line}`, whiteSpace: 'nowrap' }}
              >
                {row.label}
              </Table.Td>
              {row.cells.map((cell, i) => (
                <Table.Td
                  key={i}
                  colSpan={row.cells.length === 1 ? 3 : 1}
                  fw={row.mono ? 600 : 500}
                  style={{
                    borderBottom: `1px solid ${vizVar.line}`,
                    color: row.mono ? vizVar.accent : vizVar.ink2,
                  }}
                >
                  {cell}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {complexity.note ? (
        <Text fz={font.tiny} c="dimmed" mt="sm" lh={1.6}>
          {complexity.note}
        </Text>
      ) : null}
    </Box>
  );
}
