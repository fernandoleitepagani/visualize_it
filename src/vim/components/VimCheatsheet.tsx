import { useState } from 'react';
import { Box, Button, Group, Kbd, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { SearchIcon } from '@/components/icons';
import { font, radius, vizVar } from '@/theme';
import { filterCheatsheet, type CheatItem } from '../cheatsheet';

interface Props {
  onPractice: (item: CheatItem) => void;
}

/** Essential commands, filterable and linked to the practice buffer. */
export function VimCheatsheet({ onPractice }: Props) {
  const [query, setQuery] = useState('');
  const groups = filterCheatsheet(query);

  return (
    <Box p="md">
      <Group justify="space-between" align="flex-end" gap="sm" mb="md" wrap="wrap">
        <Text fz={font.small} c="dimmed" maw="56ch" lh={1.5}>
          O suficiente para editar de verdade. Itens marcados são o núcleo; os demais aparecem na
          sequência em que você vai precisar deles.
        </Text>
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="filtrar comando ou descrição"
          size="xs"
          radius="md"
          leftSection={<SearchIcon size={13} />}
          aria-label="Filtrar cheatsheet"
          styles={{ input: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
          w={{ base: '100%', sm: 280 }}
        />
      </Group>

      {groups.length === 0 ? (
        <Text fz={font.small} c="dimmed">
          Nenhum comando encontrado.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {groups.map((group) => {
            const items = [...group.items].sort(
              (a, b) => Number(Boolean(b.essential)) - Number(Boolean(a.essential)),
            );
            return (
              <Box key={group.id}>
                <Text
                  fz={font.micro}
                  tt="uppercase"
                  c="dimmed"
                  mb={8}
                  style={{ letterSpacing: '0.14em' }}
                >
                  {group.title}
                </Text>
                <Stack gap={5}>
                  {items.map((item) => (
                    <Group
                      key={item.id}
                      justify="space-between"
                      align="center"
                      gap={8}
                      wrap="nowrap"
                      style={{
                        padding: '3px 0',
                        borderBottom: `1px solid ${vizVar.line}`,
                      }}
                    >
                      <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                        <Group gap={3} wrap="nowrap" style={{ flexShrink: 0 }}>
                          {item.keys.map((key) => (
                            <Kbd key={key} fz={font.micro}>
                              {key}
                            </Kbd>
                          ))}
                        </Group>
                        <Text fz={font.tiny} c="dimmed" style={{ lineHeight: 1.35 }}>
                          {item.label}
                        </Text>
                      </Group>
                      {item.practice ? (
                        <Button
                          size="compact-xs"
                          variant="subtle"
                          radius="sm"
                          aria-label={`praticar ${item.label}`}
                          onClick={() => onPractice(item)}
                          style={{
                            color: vizVar.accent,
                            flexShrink: 0,
                            borderRadius: radius.pill,
                          }}
                        >
                          praticar
                        </Button>
                      ) : null}
                    </Group>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
