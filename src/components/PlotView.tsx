import type { CSSProperties } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { PlotState } from '@/engine/types';

/*
 * The theme variables are provided by the theming work; the hex fallbacks keep
 * this view correct on branches/PRs that predate it.
 */
const accent = 'var(--viz-accent, #fbbf24)';
const accentDim = 'var(--viz-accent-dim, #b07d0a)';
const line2 = 'var(--viz-line-2, #333333)';
const surface2 = 'var(--viz-surface-2, #1f1f1f)';
const ink = 'var(--viz-ink, #e8e8e8)';
const muted = 'var(--viz-muted, #8a8a8a)';

const tint = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;

function rectStyle(index: number, current: number): CSSProperties {
  if (index === current) return { borderColor: accent, background: tint(accent, 30) };
  if (index < current) return { borderColor: accentDim, background: tint(accentDim, 22) };
  return { borderColor: line2, background: surface2 };
}

/** Plot view — a term series with its accumulated total (summation). */
export function PlotView({ plot }: { plot: PlotState | undefined }) {
  const reducedMotion = useReducedMotion();
  const points = plot?.points ?? [];

  if (points.length === 0) {
    return (
      <Flex mih={240} align="center" justify="center">
        <Text fz="sm" c="dimmed">
          Gerando…
        </Text>
      </Flex>
    );
  }

  const current = plot?.current ?? -1;
  const total = plot?.total ?? 0;
  const max = Math.max(...points.map((point) => point.value), 1);
  const slot = 100 / points.length;

  return (
    <Flex direction="column" h={240}>
      <Flex justify="flex-end" align="baseline" gap={6} h={24}>
        <Text fz={11} fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.1em' }}>
          soma
        </Text>
        <Text ff="monospace" fw={600} c="amber">
          {total}
        </Text>
      </Flex>

      <Box pos="relative" style={{ flex: 1 }}>
        {points.map((point, i) => {
          const height = Math.max(8, Math.round((point.value / max) * 100));
          return (
            <Box
              key={i}
              pos="absolute"
              bottom={0}
              style={{
                left: `${i * slot}%`,
                width: `calc(${slot}% - 6px)`,
                height: `${height}%`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 6,
                border: '1.5px solid',
                borderBottom: 'none',
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                transition: reducedMotion
                  ? 'none'
                  : 'height 250ms ease-out, background-color 200ms, border-color 200ms',
                ...rectStyle(i, current),
              }}
            >
              <Text fz="xs" ff="monospace" style={{ color: i <= current ? ink : muted }}>
                {point.value}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Flex>
  );
}
