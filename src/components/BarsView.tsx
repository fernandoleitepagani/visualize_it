import type { CSSProperties } from 'react';
import { Box, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { Step } from '@/engine/types';
import { radius, transition, font, space, tint, vizVar } from '@/theme';
import { getBarScale } from './barScale';
import { ViewLegend } from './ViewLegend';

interface Props {
  state: Step | undefined;
  /** Stable element ids (see assignElementIds) so swaps can glide. */
  ids?: string[];
}

interface Flags {
  cmp: boolean;
  swap: boolean;
  pivot: boolean;
  sorted: boolean;
  dim: boolean;
}

const BAR_GAP = 6;
const PLOT_HEIGHT = 260;
const GRID_LINES = [25, 50, 75, 100];

const LEGEND = [
  { key: 'cmp', label: 'comparação', color: vizVar.accent },
  { key: 'swap', label: 'troca', color: vizVar.green },
  { key: 'pivot', label: 'pivô', color: vizVar.purple },
  { key: 'sorted', label: 'ordenado', color: vizVar.accentDim },
  { key: 'dim', label: 'fora de foco', color: vizVar.dim },
] as const;

function barColor(flags: Flags): string {
  if (flags.swap) return vizVar.green;
  if (flags.pivot) return vizVar.purple;
  if (flags.cmp) return vizVar.accent;
  if (flags.sorted) return vizVar.accentDim;
  return vizVar.line2;
}

function barStyle(flags: Flags): CSSProperties {
  if (flags.swap) return { borderColor: vizVar.green, background: tint(vizVar.green, 20) };
  if (flags.pivot) return { borderColor: vizVar.purple, background: tint(vizVar.purple, 20) };
  if (flags.cmp) return { borderColor: vizVar.accent, background: tint(vizVar.accent, 15) };
  if (flags.sorted) return { borderColor: vizVar.accentDim, background: tint(vizVar.accent, 8) };
  return { borderColor: vizVar.line2, background: vizVar.surface3 };
}

function labelColor(flags: Flags): string {
  if (flags.swap) return vizVar.green;
  if (flags.pivot) return vizVar.purple;
  if (flags.cmp) return vizVar.accent;
  if (flags.dim) return vizVar.muted;
  return vizVar.ink;
}

/** Bars view — sorting and search over a numeric vector. */
export function BarsView({ state, ids = [] }: Props) {
  const reducedMotion = useReducedMotion();
  const arr = state?.arr ?? [];

  if (arr.length === 0) {
    return (
      <Box mih={240} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text fz="sm" c="dimmed">
          Gerando…
        </Text>
      </Box>
    );
  }

  const cmp = new Set(state?.cmp ?? []);
  const swap = new Set(state?.swap ?? []);
  const pivot = new Set(state?.pivot ?? []);
  const sorted = new Set(state?.sorted ?? []);
  const dim = new Set(state?.dim ?? []);
  const scale = getBarScale(arr);
  const slot = 100 / arr.length;
  const activeLegend = LEGEND.filter((item) => {
    if (item.key === 'cmp') return cmp.size > 0;
    if (item.key === 'swap') return swap.size > 0;
    if (item.key === 'pivot') return pivot.size > 0;
    if (item.key === 'sorted') return sorted.size > 0;
    return dim.size > 0;
  });

  return (
    <Box
      role="img"
      aria-label={`Vetor com ${arr.length} elementos: ${arr.join(', ')}`}
      pt={space.lg}
    >
      <Box pos="relative" h={PLOT_HEIGHT} mx={space.xs} mb={space.lg}>
        {GRID_LINES.map((line) => (
          <Box
            key={line}
            pos="absolute"
            left={0}
            right={0}
            bottom={`${line}%`}
            h={1}
            bg={vizVar.line}
            style={{ opacity: line === 100 ? 0.6 : 0.45, pointerEvents: 'none' }}
          />
        ))}

        <Box
          pos="absolute"
          left={0}
          right={0}
          bottom={`${scale.zeroPercent}%`}
          h={1}
          bg={vizVar.line2}
          style={{ pointerEvents: 'none' }}
        />

        {arr.map((_, i) => {
          const flags: Flags = {
            cmp: cmp.has(i),
            swap: swap.has(i),
            pivot: pivot.has(i),
            sorted: sorted.has(i),
            dim: dim.has(i),
          };
          const metrics = scale.bars[i];

          const isActive = flags.swap || flags.cmp || flags.pivot;

          return (
            <Box
              key={ids[i] ?? i}
              className="viz-bar"
              pos="absolute"
              aria-hidden
              style={{
                left: `${(i + 0.5) * slot}%`,
                width: `calc(${slot}% - ${BAR_GAP}px)`,
                maxWidth: 88,
                bottom: `${metrics.bottomPercent}%`,
                height: metrics.zero ? 2 : `${Math.max(metrics.heightPercent, 1.5)}%`,
                minHeight: 3,
                transform: isActive ? 'translateX(-50%) translateY(-3px)' : 'translateX(-50%)',
                border: '1.5px solid',
                borderRadius: radius.sm,
                opacity: flags.dim ? 0.28 : 1,
                transition: reducedMotion
                  ? 'none'
                  : `left ${transition.spring}, bottom ${transition.spring}, height ${transition.spring}, transform ${transition.base}, background-color ${transition.base}, border-color ${transition.base}, opacity ${transition.base}, box-shadow ${transition.base}`,
                boxShadow: isActive
                  ? `0 4px 14px ${
                      flags.swap
                        ? tint(vizVar.green, 22)
                        : flags.pivot
                          ? tint(vizVar.purple, 22)
                          : tint(vizVar.accent, 22)
                    }, 0 0 0 1px ${barColor(flags)}`
                  : undefined,
                ...barStyle(flags),
              }}
            />
          );
        })}

        {arr.map((value, i) => {
          const flags: Flags = {
            cmp: cmp.has(i),
            swap: swap.has(i),
            pivot: pivot.has(i),
            sorted: sorted.has(i),
            dim: dim.has(i),
          };
          const metrics = scale.bars[i];
          const topPercent = metrics.bottomPercent + metrics.heightPercent;
          const isActive = flags.swap || flags.cmp || flags.pivot;

          return (
            <Text
              key={`value-${ids[i] ?? i}`}
              className="viz-value"
              aria-hidden
              pos="absolute"
              fz={font.tiny}
              lh={1}
              fw={700}
              ff="monospace"
              style={{
                left: `${(i + 0.5) * slot}%`,
                width: `calc(${slot}% - 2px)`,
                bottom: `calc(${Math.min(topPercent, 100)}% + ${isActive ? 9 : 6}px)`,
                transform: 'translateX(-50%)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                color: labelColor(flags),
                opacity: flags.dim ? 0.55 : 1,
                transition: reducedMotion
                  ? 'none'
                  : `left ${transition.spring}, bottom ${transition.spring}, color ${transition.base}`,
              }}
            >
              {value}
            </Text>
          );
        })}

        {arr.map((_, i) => (
          <Text
            key={`index-${i}`}
            aria-hidden
            pos="absolute"
            top="calc(100% + 6px)"
            fz={font.micro}
            lh={1}
            ff="monospace"
            style={{
              left: `${(i + 0.5) * slot}%`,
              width: `calc(${slot}% - 2px)`,
              transform: 'translateX(-50%)',
              textAlign: 'center',
              color: vizVar.dim,
            }}
          >
            {i}
          </Text>
        ))}
      </Box>

      <ViewLegend items={activeLegend} />
    </Box>
  );
}
