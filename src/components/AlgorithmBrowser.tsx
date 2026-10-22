import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Text,
  TextInput,
} from '@mantine/core';
import type { CatalogGroup, EntryLocation } from '@/content/subjects';
import { getEntryView, matchesEntry } from '@/content/subjects';
import type { ViewKind } from '@/engine/types';
import { font, radius, subjectAccent, vizVar } from '@/theme';
import { AlgorithmCard } from './AlgorithmCard';
import { SectionHeading } from './SectionHeading';
import { SearchIcon } from './icons';

const viewLabels: Record<ViewKind, string> = {
  bars: 'Barras',
  cells: 'Células',
  nodes: 'Nós',
  plot: 'Gráfico',
  strings: 'Strings',
};

interface Props {
  entries: EntryLocation[];
  groups: CatalogGroup[];
}

/** Search, filters and card grid used on each subject page. */
export function AlgorithmBrowser({ entries, groups }: Props) {
  const [params, setParams] = useSearchParams();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const accent = entries[0] ? subjectAccent[entries[0].subject.accent] : vizVar.accent;
  const chipStyle = (active: boolean): CSSProperties | undefined =>
    active
      ? {
          borderColor: accent,
          background: `color-mix(in srgb, ${accent} 12%, transparent)`,
          color: accent,
          fontWeight: 600,
        }
      : undefined;

  const urlQuery = params.get('q') ?? '';
  const groupId = params.get('grupo') ?? 'todos';
  const viewFilter = params.get('view') ?? 'todas';

  /*
   * The search field is intentionally local. Routing on every keystroke used
   * to re-render the whole catalog (and rewrite the URL) while the user typed,
   * which made fast typing lose characters on slower machines. The URL now
   * catches up after a short pause, while filtering stays immediate.
   */
  const [query, setQuery] = useState(urlQuery);
  const queryRef = useRef(query);

  useEffect(() => {
    if (urlQuery !== queryRef.current) {
      queryRef.current = urlQuery;
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query === urlQuery) return;
      setParams(
        (previous) => {
          const current = previous.get('q') ?? '';
          if (current === query) return previous;
          const next = new URLSearchParams(previous);
          if (query) next.set('q', query);
          else next.delete('q');
          return next;
        },
        { replace: true },
      );
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, urlQuery, setParams]);

  const updateQuery = useCallback((value: string) => {
    queryRef.current = value;
    setQuery(value);
  }, []);

  const setParam = useCallback(
    (key: string, value: string) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (!value || value === 'todos' || value === 'todas') {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const availableViews = useMemo(
    () =>
      [...new Set(entries.map((location) => getEntryView(location.entry)).filter(Boolean))] as ViewKind[],
    [entries],
  );

  const filtered = useMemo(
    () =>
      entries.filter((location) => {
        if (groupId !== 'todos' && location.group.id !== groupId) return false;
        if (viewFilter !== 'todas' && getEntryView(location.entry) !== viewFilter) return false;
        return matchesEntry(location, query);
      }),
    [entries, groupId, query, viewFilter],
  );

  const grouped = useMemo(
    () =>
      groups
        .map((group) => ({
          group,
          items: filtered.filter((location) => location.group.id === group.id),
        }))
        .filter((group) => group.items.length > 0),
    [filtered, groups],
  );

  const hasFilters = Boolean(query || groupId !== 'todos' || viewFilter !== 'todas');

  const clearFilters = useCallback(() => {
    queryRef.current = '';
    setQuery('');
    setParams({}, { replace: true });
  }, [setParams]);

  return (
    <Box>
      <Paper
        withBorder
        radius="xl"
        p="sm"
        mb="md"
        className="filter-bar"
        style={{
          borderColor: vizVar.line,
          background: 'color-mix(in srgb, var(--viz-panel) 82%, transparent)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        <Group align="center" gap="sm" wrap="wrap">
          <TextInput
            value={query}
            onChange={(event) => updateQuery(event.currentTarget.value)}
            placeholder="Buscar nesta matéria..."
            aria-label="Buscar nesta matéria"
            autoComplete="off"
            spellCheck={false}
            leftSection={<SearchIcon size={15} />}
            rightSection={
              query ? (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  aria-label="Limpar busca"
                  onClick={() => updateQuery('')}
                  px={6}
                >
                  ×
                </Button>
              ) : undefined
            }
            style={{ flex: '1 1 260px' }}
            size="sm"
          />
          <SegmentedControl
            size="xs"
            value={layout}
            onChange={(value) => setLayout(value as 'grid' | 'list')}
            data={[
              { label: 'Grade', value: 'grid' },
              { label: 'Lista', value: 'list' },
            ]}
            aria-label="Modo de exibição"
          />
          {hasFilters ? (
            <Button size="xs" variant="subtle" onClick={clearFilters}>
              Limpar filtros
            </Button>
          ) : null}
        </Group>

        <Group gap={6} mt="sm" wrap="wrap">
          <Text fz={font.micro} c="dimmed" mr={4} tt="uppercase" style={{ letterSpacing: '0.1em' }}>
            grupo
          </Text>
          <Button
            size="compact-sm"
            radius="pill"
            variant="default"
            style={chipStyle(groupId === 'todos')}
            aria-pressed={groupId === 'todos'}
            onClick={() => setParam('grupo', 'todos')}
          >
            Todos
          </Button>
          {groups.map((group) => (
            <Button
              key={group.id}
              size="compact-sm"
              radius="pill"
              variant="default"
              style={chipStyle(groupId === group.id)}
              aria-pressed={groupId === group.id}
              onClick={() => setParam('grupo', group.id)}
            >
              {group.title}
            </Button>
          ))}
        </Group>

        {availableViews.length > 0 ? (
          <Group gap={6} mt={8} wrap="wrap">
            <Text
              fz={font.micro}
              c="dimmed"
              mr={4}
              tt="uppercase"
              style={{ letterSpacing: '0.1em' }}
            >
              view
            </Text>
            <Button
              size="compact-sm"
              radius="pill"
              variant="default"
              style={chipStyle(viewFilter === 'todas')}
              aria-pressed={viewFilter === 'todas'}
              onClick={() => setParam('view', 'todas')}
            >
              Todas
            </Button>
            {availableViews.map((view) => (
              <Button
                key={view}
                size="compact-sm"
                radius="pill"
                variant="default"
                style={chipStyle(viewFilter === view)}
                aria-pressed={viewFilter === view}
                onClick={() => setParam('view', view)}
              >
                {viewLabels[view]}
              </Button>
            ))}
          </Group>
        ) : null}
      </Paper>

      <Group justify="space-between" mb="lg" wrap="wrap">
        <Text fz={font.tiny} c="dimmed" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </Text>
        {query ? (
          <Text fz={font.tiny} c="dimmed">
            filtro: “{query}”
          </Text>
        ) : null}
      </Group>

      {filtered.length === 0 ? (
        <Paper
          withBorder
          radius="xl"
          p="xl"
          style={{ borderColor: vizVar.line, background: vizVar.panel }}
        >
          <Text fz={font.body} c="dimmed" mb="sm">
            Nenhum resultado com esses filtros.
          </Text>
          <Button size="xs" variant="default" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </Paper>
      ) : (
        grouped.map(({ group, items }, groupIndex) => (
          <Box key={group.id} component="section" aria-labelledby={`grupo-${group.id}`} mb="xl">
            <SectionHeading
              id={`grupo-${group.id}`}
              index={String(groupIndex + 1).padStart(2, '0')}
              count={items.length}
            >
              {group.title}
            </SectionHeading>
            <SimpleGrid
              cols={layout === 'grid' ? { base: 1, sm: 2, lg: 3 } : 1}
              spacing="md"
              style={{ borderRadius: radius.lg }}
            >
              {items.map((location) => (
                <AlgorithmCard
                  key={`${location.subject.id}-${location.entry.slug}`}
                  location={location}
                  compact={layout === 'list'}
                />
              ))}
            </SimpleGrid>
          </Box>
        ))
      )}
    </Box>
  );
}
