import type { CSSProperties } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { Step } from '@/engine/types';
import { tint, vizVar } from '@/theme';

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
  if (flags.swap) return { borderColor: vizVar.green, background: tint(vizVar.green, 20) };
  if (flags.pivot) return { borderColor: vizVar.purple, background: tint(vizVar.purple, 20) };
  if (flags.cmp) return { borderColor: vizVar.accent, background: tint(vizVar.accent, 15) };
  if (flags.sorted) return { borderColor: vizVar.accentDim, background: tint(vizVar.accent, 6) };
  return { borderColor: vizVar.line2, background: vizVar.surface2 };
}

function labelColor(flags: Flags): string {
  if (flags.swap) return vizVar.green;
  if (flags.pivot) return vizVar.purple;
  if (flags.cmp) return vizVar.accent;
  return vizVar.muted;
}

/** Bars view — sorting and search over a numeric vector. */
export function BarsView({ state, ids = [] }: Props) {
  const reducedMotion = useReducedMotion();
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
              transition: reducedMotion
                ? 'none'
                : 'left 300ms ease-out, height 300ms ease-out, background-color 300ms, border-color 300ms',
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
