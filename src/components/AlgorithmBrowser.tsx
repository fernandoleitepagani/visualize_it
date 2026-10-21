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
} from '@mantine/core';
import type { CatalogGroup, EntryLocation } from '@/content/subjects';
import { getEntryView, matchesEntry } from '@/content/subjects';
import type { ViewKind } from '@/engine/types';
import { font, radius, vizVar } from '@/theme';
import { AlgorithmCard } from './AlgorithmCard';
import { SectionHeading } from './SectionHeading';
import { SearchIcon } from './icons';

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
            onChange={(event) => setParam('q', event.currentTarget.value)}
            placeholder="Buscar nesta matéria..."
            aria-label="Buscar nesta matéria"
            leftSection={<SearchIcon size={15} />}
            rightSection={
              query ? (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  aria-label="Limpar busca"
                  onClick={() => setParam('q', '')}
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
            variant={groupId === 'todos' ? 'light' : 'default'}
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
              variant={groupId === group.id ? 'light' : 'default'}
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
              variant={viewFilter === 'todas' ? 'light' : 'default'}
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
                variant={viewFilter === view ? 'light' : 'default'}
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
