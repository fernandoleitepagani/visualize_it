import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Divider,
  Group,
  Modal,
  ScrollArea,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { EntryLocation } from '@/content/subjects';
import {
  allEntryLocations,
  getEntryPath,
  getEntrySubtitle,
  getEntryTitle,
  searchEntries,
  subjects,
} from '@/content/subjects';
import { font, palette, radius } from '@/theme';

interface Props {
  trigger?: 'input' | 'icon';
  fullWidth?: boolean;
  shortcut?: boolean;
  placeholder?: string;
}

/** Search field + modal that finds lessons and theory pages across subjects. */
export function GlobalSearch({
  trigger = 'input',
  fullWidth = false,
  shortcut = false,
  placeholder = 'Buscar algoritmo...',
}: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const openSearch = useCallback(() => {
    setQuery('');
    setActive(0);
    open();
  }, [open]);

  useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcut, openSearch]);

  const results = useMemo(
    () => (query.trim() ? searchEntries(query) : allEntryLocations().slice(0, 8)),
    [query],
  );

  const grouped = useMemo(
    () =>
      subjects
        .map((subject) => ({
          subject,
          items: results.filter((location) => location.subject.id === subject.id),
        }))
        .filter((group) => group.items.length > 0),
    [results],
  );

  const flat = useMemo(() => grouped.flatMap((group) => group.items), [grouped]);

  const go = (location: EntryLocation) => {
    navigate(getEntryPath(location.entry));
    close();
  };

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, Math.max(flat.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      const location = flat[active];
      if (location) {
        event.preventDefault();
        go(location);
      }
    }
  };

  const modal = (
    <Modal
      opened={opened}
      onClose={close}
      title="Buscar"
      size="lg"
      centered
      closeButtonProps={{ 'aria-label': 'Fechar busca' }}
    >
      <TextInput
        autoFocus
        data-autofocus
        value={query}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          setActive(0);
        }}
        onKeyDown={onSearchKeyDown}
        placeholder="Nome, tema ou complexidade..."
        aria-label="Buscar algoritmo"
        leftSection={
          <Text fz="sm" c="dimmed">
            ⌕
          </Text>
        }
      />

      <ScrollArea.Autosize mah={420} mt="md" type="auto" role="listbox" aria-label="Resultados">
        {flat.length === 0 ? (
          <Text fz="sm" c="dimmed" py="md">
            Nenhum resultado para “{query}”. Tente outro nome ou navegue pelas matérias.
          </Text>
        ) : (
          grouped.map((group, groupIndex) => (
            <Box key={group.subject.id} mb="sm">
              {groupIndex > 0 ? <Divider mb="sm" /> : null}
              <Text
                fz={font.tiny}
                tt="uppercase"
                c="dimmed"
                fw={600}
                mb={4}
                style={{ letterSpacing: '0.08em' }}
              >
                {group.subject.title}
              </Text>
              {group.items.map((location) => {
                const index = flat.indexOf(location);
                const selected = index === active;
                return (
                  <UnstyledButton
                    key={`${location.subject.id}-${location.entry.slug}`}
                    role="option"
                    aria-selected={selected}
                    onClick={() => go(location)}
                    onMouseEnter={() => setActive(index)}
                    className="search-result"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: radius.sm,
                      background: selected ? palette.surface3 : undefined,
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap" gap="sm">
                      <Box style={{ minWidth: 0 }}>
                        <Text fz={font.small} fw={600} lineClamp={1}>
                          {getEntryTitle(location.entry)}
                        </Text>
                        <Text fz={font.tiny} c="dimmed" lineClamp={1}>
                          {location.group.title}
                          {getEntrySubtitle(location.entry)
                            ? ` · ${getEntrySubtitle(location.entry)}`
                            : ''}
                        </Text>
                      </Box>
                      <Text
                        ff="monospace"
                        fz={font.tiny}
                        c="amber"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {location.entry.tag}
                      </Text>
                    </Group>
                  </UnstyledButton>
                );
              })}
            </Box>
          ))
        )}
      </ScrollArea.Autosize>

      <Text fz={font.tiny} c="dimmed" mt="sm">
        ↑ ↓ para navegar · Enter para abrir · Esc para fechar
      </Text>
    </Modal>
  );

  if (trigger === 'icon') {
    return (
      <>
        <ActionIcon variant="default" size="lg" onClick={openSearch} aria-label="Buscar algoritmo">
          <Text fz="sm">⌕</Text>
        </ActionIcon>
        {modal}
      </>
    );
  }

  return (
    <>
      <TextInput
        readOnly
        value=""
        onClick={openSearch}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openSearch();
          }
        }}
        placeholder={placeholder}
        aria-label="Buscar algoritmo"
        w={fullWidth ? '100%' : 250}
        leftSection={
          <Text fz="sm" c="dimmed">
            ⌕
          </Text>
        }
        rightSectionWidth={shortcut ? 52 : undefined}
        rightSection={
          shortcut ? (
            <Text fz={font.micro} c="dimmed" ff="monospace" style={{ whiteSpace: 'nowrap' }}>
              Ctrl K
            </Text>
          ) : undefined
        }
      />
      {modal}
    </>
  );
}
