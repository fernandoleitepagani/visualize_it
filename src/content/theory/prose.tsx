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

/** Mantine-backed building blocks shared by the theory/prose articles. */
interface Props {
  children?: ReactNode;
}

export function H2({ children }: Props) {
  return (
    <Title order={2} fz="lg" fw={600} mt="xl" mb="sm">
      {children}
    </Title>
  );
}

export function H3({ children }: Props) {
  return (
    <Title order={3} fz={15} fw={600} mt="lg" mb="xs">
      {children}
    </Title>
  );
}

export function P({ children }: Props) {
  return (
    <Text component="p" mb="sm" maw="76ch">
      {children}
    </Text>
  );
}

export function Pre({ children }: Props) {
  return (
    <Box
      component="pre"
      mb="md"
      maw="76ch"
      ff="monospace"
      fz={12.5}
      bg="dark.5"
      px="md"
      py="sm"
      style={{
        overflowX: 'auto',
        whiteSpace: 'pre',
        lineHeight: 1.6,
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 6,
      }}
    >
      {children}
    </Box>
  );
}

export function Quote({ children }: Props) {
  return (
    <Blockquote color="amber" mb="md" maw="76ch">
      <Text component="span" c="dimmed" fs="italic">
        {children}
      </Text>
    </Blockquote>
  );
}

export function Code({ children }: Props) {
  return <MantineCode c="amber">{children}</MantineCode>;
}

export function Ul({ children }: Props) {
  return (
    <List mb="sm" maw="76ch" spacing="xs">
      {children}
    </List>
  );
}

export function Ol({ children }: Props) {
  return (
    <List type="ordered" mb="sm" maw="76ch" spacing="xs">
      {children}
    </List>
  );
}

export function Li({ children }: Props) {
  return <List.Item>{children}</List.Item>;
}

export function Table({ children }: Props) {
  return <MantineTable maw="76ch">{children}</MantineTable>;
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
  return <MantineTable.Th>{children}</MantineTable.Th>;
}

export function Td({ children }: Props) {
  return <MantineTable.Td>{children}</MantineTable.Td>;
}
