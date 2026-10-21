import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Divider,
  Group,
  Kbd,
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
  getEntryView,
  searchEntries,
  subjects,
} from '@/content/subjects';
import { font, radius, vizVar } from '@/theme';
import { SearchIcon } from './icons';
import { ViewPreview } from './ViewPreview';

interface Props {
  trigger?: 'input' | 'icon';
  fullWidth?: boolean;
  shortcut?: boolean;
  placeholder?: string;
}

const accentBySubject = {
  accent: vizVar.accent,
  success: vizVar.green,
  info: vizVar.purple,
} as const;

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
      overlayProps={{ backgroundOpacity: 0.58, blur: 6 }}
      transitionProps={{ transition: 'pop', duration: 200 }}
      closeButtonProps={{ 'aria-label': 'Fechar busca' }}
      styles={{
        content: { background: 'var(--viz-panel)', border: '1px solid var(--viz-line)' },
        header: { background: 'transparent' },
      }}
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
        leftSection={<SearchIcon size={16} />}
        rightSection={
          query ? (
            <Text fz={font.micro} c="dimmed" ff="monospace">
              {flat.length}
            </Text>
          ) : undefined
        }
        size="md"
      />

      <ScrollArea.Autosize mah={430} mt="md" type="auto" role="listbox" aria-label="Resultados">
        {flat.length === 0 ? (
          <Box py="xl" px="sm">
            <Text fz={font.body} c="dimmed">
              Nenhum resultado para “{query}”.
            </Text>
            <Text fz={font.small} c="dimmed" mt={4}>
              Tente outro nome ou navegue pelas matérias.
            </Text>
          </Box>
        ) : (
          grouped.map((group, groupIndex) => {
            const accent = accentBySubject[group.subject.accent];
            return (
              <Box key={group.subject.id} mb="sm">
                {groupIndex > 0 ? <Divider mb="sm" color="var(--viz-line)" /> : null}
                <Group gap={8} mb={6} px={4}>
                  <Box w={5} h={5} style={{ borderRadius: 999, background: accent }} />
                  <Text
                    fz={font.micro}
                    tt="uppercase"
                    c="dimmed"
                    fw={600}
                    ff="monospace"
                    style={{ letterSpacing: '0.12em' }}
                  >
                    {group.subject.title}
                  </Text>
                </Group>
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
                        borderRadius: radius.md,
                        background: selected
                          ? 'color-mix(in srgb, var(--viz-surface-2) 80%, transparent)'
                          : undefined,
                        boxShadow: selected ? `inset 2px 0 0 ${accent}` : undefined,
                      }}
                    >
                      <Group wrap="nowrap" gap="sm">
                        <Box style={{ transform: 'scale(0.9)', transformOrigin: 'left center' }}>
                          <ViewPreview view={getEntryView(location.entry)} kind={location.entry.kind} />
                        </Box>
                        <Box style={{ minWidth: 0, flex: 1 }}>
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
                          fz={font.micro}
                          style={{ whiteSpace: 'nowrap', color: accent }}
                        >
                          {location.entry.tag}
                        </Text>
                      </Group>
                    </UnstyledButton>
                  );
                })}
              </Box>
            );
          })
        )}
      </ScrollArea.Autosize>

      <Group gap="md" mt="sm" wrap="wrap">
        <Text fz={font.micro} c="dimmed" ff="monospace">
          <Kbd size="xs">↑</Kbd> <Kbd size="xs">↓</Kbd> navegar
        </Text>
        <Text fz={font.micro} c="dimmed" ff="monospace">
          <Kbd size="xs">Enter</Kbd> abrir
        </Text>
        <Text fz={font.micro} c="dimmed" ff="monospace">
          <Kbd size="xs">Esc</Kbd> fechar
        </Text>
      </Group>
    </Modal>
  );

  if (trigger === 'icon') {
    return (
      <>
        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          onClick={openSearch}
          aria-label="Buscar algoritmo"
        >
          <SearchIcon size={16} />
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
        w={fullWidth ? '100%' : 260}
        leftSection={<SearchIcon size={16} />}
        rightSectionWidth={shortcut ? 62 : undefined}
        rightSection={
          shortcut ? (
            <Text
              fz={font.micro}
              c="dimmed"
              ff="monospace"
              style={{
                whiteSpace: 'nowrap',
                border: `1px solid ${vizVar.line}`,
                borderRadius: 5,
                padding: '1px 5px',
                background: 'color-mix(in srgb, var(--viz-surface-2) 60%, transparent)',
              }}
            >
              Ctrl K
            </Text>
          ) : undefined
        }
      />
      {modal}
    </>
  );
}
