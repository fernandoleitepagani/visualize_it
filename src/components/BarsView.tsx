import type { CSSProperties } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import type { Step } from '@/engine/types';
import { viz } from '@/theme';

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

function barStyle(flags: Flags): CSSProperties {
  if (flags.swap) return { borderColor: viz.green, background: 'rgba(74, 222, 128, 0.2)' };
  if (flags.pivot) return { borderColor: viz.purple, background: 'rgba(192, 132, 252, 0.2)' };
  if (flags.cmp) return { borderColor: viz.accent, background: 'rgba(251, 191, 36, 0.15)' };
  if (flags.sorted) return { borderColor: viz.accentDim, background: 'rgba(251, 191, 36, 0.05)' };
  return { borderColor: viz.line2, background: viz.surface3 };
}

function labelColor(flags: Flags): string {
  if (flags.swap) return viz.green;
  if (flags.pivot) return viz.purple;
  if (flags.cmp) return viz.accent;
  return viz.muted;
}

/** Bars view — sorting and search over a numeric vector. */
export function BarsView({ state, ids = [] }: Props) {
  const arr = state?.arr ?? [];

  if (arr.length === 0) {
    return (
      <Flex mih={240} align="center" justify="center">
        <Text fz="sm" c="dimmed">
          Gerando…
        </Text>
      </Flex>
    );
  }

  const cmp = new Set(state?.cmp ?? []);
  const swap = new Set(state?.swap ?? []);
  const pivot = new Set(state?.pivot ?? []);
  const sorted = new Set(state?.sorted ?? []);
  const dim = new Set(state?.dim ?? []);
  const max = Math.max(...arr, 1);
  const slot = 100 / arr.length;

  return (
    <Box pos="relative" h={240}>
      {arr.map((value, i) => {
        const flags: Flags = {
          cmp: cmp.has(i),
          swap: swap.has(i),
          pivot: pivot.has(i),
          sorted: sorted.has(i),
          dim: dim.has(i),
        };
        const height = Math.max(8, Math.round((value / max) * 100));

        return (
          <Box
            key={ids[i] ?? i}
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
              opacity: flags.dim ? 0.3 : 1,
              transition:
                'left 300ms ease-out, height 300ms ease-out, background-color 300ms, border-color 300ms',
              ...barStyle(flags),
            }}
          >
            <Text fz="xs" ff="monospace" style={{ color: labelColor(flags) }}>
              {value}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
