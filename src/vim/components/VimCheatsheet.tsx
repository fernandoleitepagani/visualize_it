import { memo, useState } from 'react';
import {
  Box,
  Button,
  CloseButton,
  Group,
  Kbd,
  SegmentedControl,
  SimpleGrid,
  Text,
  TextInput,
} from '@mantine/core';
import { KeyboardIcon, SearchIcon } from '@/components/icons';
import { font, vizVar } from '@/theme';
import { cheatTotals, filterCheatsheet, type CheatGroup } from '../cheatsheet';

interface Props {
  onPractice: (group: CheatGroup) => void;
}

/**
 * Readable reference: two columns, one command per row, keycaps on the left and
 * a single practice action per group. Memoized because it is static while the
 * user types in the editor.
 */
export const VimCheatsheet = memo(function VimCheatsheet({ onPractice }: Props) {
  const [query, setQuery] = useState('');
  const [essentialsOnly, setEssentialsOnly] = useState(false);
  const groups = filterCheatsheet(query, essentialsOnly);
  const visible = groups.reduce((total, group) => total + group.items.length, 0);

  return (
    <Box p="md">
      <Group justify="space-between" align="flex-end" gap="md" mb="lg" wrap="wrap">
        <Box>
          <Text fz={font.small} c="dimmed" maw="56ch" lh={1.5}>
            O suficiente para editar de verdade. Itens com marcador são o núcleo; o restante aparece
            na ordem em que você vai precisar.
          </Text>
          <Text fz={font.micro} c="dimmed" mt={4} aria-live="polite">
            {visible} comandos · {cheatTotals.essentials} essenciais de {cheatTotals.commands}
          </Text>
        </Box>

        <Group gap="sm" wrap="wrap" align="center" className="vim-cheat-controls">
          <SegmentedControl
            size="xs"
            radius="md"
            value={essentialsOnly ? 'essential' : 'all'}
            onChange={(value) => setEssentialsOnly(value === 'essential')}
            data={[
              { label: 'essenciais', value: 'essential' },
              { label: 'todos', value: 'all' },
            ]}
            aria-label="Filtrar por comandos essenciais"
            styles={{ label: { fontSize: font.micro } }}
          />
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="filtrar comando ou descrição"
            size="xs"
            radius="md"
            leftSection={<SearchIcon size={13} />}
            rightSection={
              query ? (
                <CloseButton size="xs" aria-label="Limpar filtro" onClick={() => setQuery('')} />
              ) : null
            }
            aria-label="Filtrar cheatsheet"
            styles={{ input: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
            w={{ base: '100%', sm: 260 }}
          />
        </Group>
      </Group>

      {groups.length === 0 ? (
        <Text fz={font.small} c="dimmed">
          Nenhum comando encontrado.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {groups.map((group) => {
            const items = [...group.items].sort(
              (a, b) => Number(Boolean(b.essential)) - Number(Boolean(a.essential)),
            );

            return (
              <Box
                key={group.id}
                component="section"
                aria-label={group.title}
                className="vim-cheat-group"
              >
                <Group justify="space-between" align="center" gap="sm" mb={8} wrap="nowrap">
                  <Group gap={8} align="baseline" wrap="nowrap">
                    <Text
                      fz={font.micro}
                      tt="uppercase"
                      style={{ color: vizVar.muted, letterSpacing: '0.14em' }}
                    >
                      {group.title}
                    </Text>
                    <Text fz={font.micro} c="dimmed">
                      {items.length}
                    </Text>
                  </Group>
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    radius="pill"
                    aria-label={`praticar ${group.title}`}
                    leftSection={<KeyboardIcon size={12} />}
                    onClick={() => onPractice(group)}
                    styles={{ label: { fontSize: font.micro } }}
                    style={{ color: vizVar.accent }}
                  >
                    praticar
                  </Button>
                </Group>

                <dl className="vim-cheat-list">
                  {items.map((item) => (
                    <div className="vim-cheat-row" key={item.id}>
                      <dt>
                        <Group gap={3} wrap="nowrap">
                          {item.keys.map((key, keyIndex) => (
                            <Kbd
                              key={`${item.id}-${key}-${keyIndex}`}
                              fz={11.5}
                              style={{
                                background: 'var(--viz-surface-2)',
                                borderColor: vizVar.line2,
                                boxShadow: 'none',
                                padding: '2px 6px',
                              }}
                            >
                              {key}
                            </Kbd>
                          ))}
                        </Group>
                      </dt>
                      <dd>
                        {item.essential ? (
                          <span className="vim-cheat-dot" aria-hidden="true" />
                        ) : null}
                        <span>{item.label}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
});
