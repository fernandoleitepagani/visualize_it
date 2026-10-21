import type { ReactNode } from 'react';
import {
  Blockquote,
  Box,
  Code as MantineCode,
  List,
  Table as MantineTable,
  Text,
  Title,
} from '@mantine/core';
import type { HighlightState } from '@/lib/highlight';
import { highlightLine } from '@/lib/highlight';
import { font, radius, vizVar } from '@/theme';

/** Mantine-backed building blocks shared by the theory/prose articles. */
interface Props {
  children?: ReactNode;
}

export function H2({ children }: Props) {
  return (
    <Title order={2} fz={font.h2} fw={500} mt={44} mb="md" style={{ letterSpacing: '-0.025em' }}>
      {children}
    </Title>
  );
}

export function H3({ children }: Props) {
  return (
    <Title order={3} fz={font.lead} fw={600} mt="xl" mb="xs">
      {children}
    </Title>
  );
}

export function P({ children }: Props) {
  return (
    <Text component="p" mb="md" maw="72ch" fz={font.body} lh={1.78}>
      {children}
    </Text>
  );
}

export function Pre({ children }: Props) {
  const source = typeof children === 'string' ? children.trim() : null;
  let state: HighlightState = { inBlockComment: false };
  const lines = source?.split('\n').map((line) => {
    const result = highlightLine(line, state);
    state = result.state;
    return result.parts;
  });

  return (
    <Box
      component="pre"
      mb="lg"
      maw="72ch"
      fz={font.small}
      px="md"
      py="md"
      style={{
        overflowX: 'auto',
        whiteSpace: 'pre',
        lineHeight: 1.7,
        color: vizVar.codeInk,
        background: vizVar.codeBg,
        border: `1px solid ${vizVar.line}`,
        borderRadius: radius.md,
        boxShadow: '0 18px 36px -32px rgba(0,0,0,0.55)',
      }}
    >
      {lines
        ? lines.map((line, index) => (
            <div key={index} style={{ minHeight: '1.7em' }}>
              {line}
            </div>
          ))
        : children}
    </Box>
  );
}

export function Quote({ children }: Props) {
  return (
    <Blockquote
      mb="lg"
      maw="72ch"
      p="md"
      style={{
        borderLeft: `2px solid ${vizVar.accent}`,
        background: `linear-gradient(90deg, ${vizVar.accentSoft}, transparent 78%)`,
        borderRadius: `0 ${radius.sm}px ${radius.sm}px 0`,
      }}
    >
      <Text component="span" c="dimmed" fs="italic" lh={1.7}>
        {children}
      </Text>
    </Blockquote>
  );
}

export function Code({ children }: Props) {
  return (
    <MantineCode
      style={{
        color: vizVar.accent,
        background: vizVar.surface2,
        border: `1px solid ${vizVar.line}`,
        borderRadius: 5,
        padding: '1px 5px',
      }}
    >
      {children}
    </MantineCode>
  );
}

export function Ul({ children }: Props) {
  return (
    <List mb="md" maw="72ch" spacing="xs" fz={font.body}>
      {children}
    </List>
  );
}

export function Ol({ children }: Props) {
  return (
    <List type="ordered" mb="md" maw="72ch" spacing="xs" fz={font.body}>
      {children}
    </List>
  );
}

export function Li({ children }: Props) {
  return <List.Item>{children}</List.Item>;
}

export function Table({ children }: Props) {
  return (
    <MantineTable maw="72ch" fz={font.small} verticalSpacing="xs">
      {children}
    </MantineTable>
  );
}

export function Thead({ children }: Props) {
  return <MantineTable.Thead>{children}</MantineTable.Thead>;
}

export function Tbody({ children }: Props) {
  return <MantineTable.Tbody>{children}</MantineTable.Tbody>;
}

export function Tr({ children }: Props) {
  return <MantineTable.Tr>{children}</MantineTable.Tr>;
}

export function Th({ children }: Props) {
  return (
    <MantineTable.Th
      fz={font.micro}
      tt="uppercase"
      c="dimmed"
      style={{ letterSpacing: '0.08em', borderColor: vizVar.line }}
    >
      {children}
    </MantineTable.Th>
  );
}

export function Td({ children }: Props) {
  return <MantineTable.Td style={{ borderColor: vizVar.line }}>{children}</MantineTable.Td>;
}
