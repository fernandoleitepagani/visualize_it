import { useMemo, useState } from 'react';
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
  Title,
} from '@mantine/core';
import type { CatalogGroup, EntryLocation } from '@/content/subjects';
import { getEntryView, matchesEntry } from '@/content/subjects';
import type { ViewKind } from '@/engine/types';
import { font, palette, radius } from '@/theme';
import { AlgorithmCard } from './AlgorithmCard';

const viewLabels: Record<ViewKind, string> = {
  bars: 'Barras',
  cells: 'Células',
  nodes: 'Nós',
  plot: 'Gráfico',
};

interface Props {
  entries: EntryLocation[];
  groups: CatalogGroup[];
}

/** Search, filters and card grid used on each subject page. */
export function AlgorithmBrowser({ entries, groups }: Props) {
  const [params, setParams] = useSearchParams();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const query = params.get('q') ?? '';
  const groupId = params.get('grupo') ?? 'todos';
  const viewFilter = params.get('view') ?? 'todas';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'todos' || value === 'todas') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setParams(next, { replace: true });
  };

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

  const clearFilters = () => setParams({}, { replace: true });

  return (
    <Box>
      <Group align="flex-end" gap="sm" mb="md" wrap="wrap">
        <TextInput
          value={query}
          onChange={(event) => setParam('q', event.currentTarget.value)}
          placeholder="Buscar nesta matéria..."
          aria-label="Buscar nesta matéria"
          leftSection={
            <Text fz="sm" c="dimmed">
              ⌕
            </Text>
          }
          maw={360}
          style={{ flex: '1 1 240px' }}
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
      </Group>

      <Group gap="xs" mb="xs" wrap="wrap">
        <Button
          size="xs"
          variant={groupId === 'todos' ? 'light' : 'default'}
          aria-pressed={groupId === 'todos'}
          onClick={() => setParam('grupo', 'todos')}
        >
          Todos
        </Button>
        {groups.map((group) => (
          <Button
            key={group.id}
            size="xs"
            variant={groupId === group.id ? 'light' : 'default'}
            aria-pressed={groupId === group.id}
            onClick={() => setParam('grupo', group.id)}
          >
            {group.title}
          </Button>
        ))}
      </Group>

      {availableViews.length > 0 ? (
        <Group gap="xs" mb="md" wrap="wrap">
          <Button
            size="xs"
            variant={viewFilter === 'todas' ? 'light' : 'default'}
            aria-pressed={viewFilter === 'todas'}
            onClick={() => setParam('view', 'todas')}
          >
            Todas as views
          </Button>
          {availableViews.map((view) => (
            <Button
              key={view}
              size="xs"
              variant={viewFilter === view ? 'light' : 'default'}
              aria-pressed={viewFilter === view}
              onClick={() => setParam('view', view)}
            >
              {viewLabels[view]}
            </Button>
          ))}
        </Group>
      ) : null}

      <Group justify="space-between" mb="lg" wrap="wrap">
        <Text fz={font.small} c="dimmed" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </Text>
        {hasFilters ? (
          <Button size="xs" variant="subtle" onClick={clearFilters}>
            Limpar filtros
          </Button>
        ) : null}
      </Group>

      {filtered.length === 0 ? (
        <Paper
          withBorder
          radius="md"
          p="lg"
          style={{ borderColor: palette.line, background: palette.surface }}
        >
          <Text fz="sm" c="dimmed" mb="sm">
            Nenhum resultado com esses filtros.
          </Text>
          <Button size="xs" variant="default" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </Paper>
      ) : (
        grouped.map(({ group, items }) => (
          <Box
            key={group.id}
            component="section"
            aria-labelledby={`grupo-${group.id}`}
            mb="xl"
          >
            <Group justify="space-between" mb="sm" align="baseline">
              <Title order={2} id={`grupo-${group.id}`} fz={font.h3} fw={600}>
                {group.title}
              </Title>
              <Text fz={font.tiny} c="dimmed" ff="monospace">
                {items.length}
              </Text>
            </Group>
            <SimpleGrid
              cols={layout === 'grid' ? { base: 1, sm: 2, lg: 3 } : 1}
              spacing="md"
              style={{ borderRadius: radius.md }}
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
