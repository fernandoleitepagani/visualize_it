import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Box, Group, SegmentedControl, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { Step } from '@/engine/types';
import { font, radius, space, tint, transition, vizVar } from '@/theme';
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

type HeapDisplayMode = 'dual' | 'tree' | 'bars';

const BAR_GAP = 7;
const PLOT_HEIGHT = 160;
const GRID_LINES = [25, 50, 75, 100];
const NODE_SIZE = 40;

const LEGEND = [
  { key: 'cmp', label: 'comparação', color: vizVar.accent },
  { key: 'swap', label: 'troca / subida / descida', color: vizVar.green },
  { key: 'pivot', label: 'raiz / foco do heapify', color: vizVar.purple },
  { key: 'sorted', label: 'ordenado / extraído', color: vizVar.accentDim },
] as const;

function itemColor(flags: Flags): string {
  if (flags.swap) return vizVar.green;
  if (flags.pivot) return vizVar.purple;
  if (flags.cmp) return vizVar.accent;
  if (flags.sorted) return vizVar.accentDim;
  return vizVar.line2;
}

function itemBg(flags: Flags): string {
  if (flags.swap) return `linear-gradient(180deg, ${tint(vizVar.green, 46)}, ${tint(vizVar.green, 14)})`;
  if (flags.pivot) return `linear-gradient(180deg, ${tint(vizVar.purple, 44)}, ${tint(vizVar.purple, 13)})`;
  if (flags.cmp) return `linear-gradient(180deg, ${tint(vizVar.accent, 42)}, ${tint(vizVar.accent, 12)})`;
  if (flags.sorted) return `linear-gradient(180deg, ${tint(vizVar.accent, 20)}, ${tint(vizVar.accent, 5)})`;
  return `linear-gradient(180deg, ${vizVar.surface4}, ${vizVar.surface3})`;
}

interface TreeNodeCoords {
  index: number;
  val: number;
  xPct: number;
  yPx: number;
  level: number;
  flags: Flags;
  active: boolean;
  glow: string;
}

export function HeapView({ state, ids = [] }: Props) {
  const reducedMotion = useReducedMotion();
  const [displayMode, setDisplayMode] = useState<HeapDisplayMode>('dual');

  const rawArr = state?.arr;
  const arr = useMemo(() => rawArr ?? [], [rawArr]);
  const n = arr.length;

  const cmp = useMemo(() => new Set(state?.cmp ?? []), [state?.cmp]);
  const swap = useMemo(() => new Set(state?.swap ?? []), [state?.swap]);
  const pivot = useMemo(() => new Set(state?.pivot ?? []), [state?.pivot]);
  const sorted = useMemo(() => new Set(state?.sorted ?? []), [state?.sorted]);
  const dim = useMemo(() => new Set(state?.dim ?? []), [state?.dim]);

  const heapSize = state?.heapSize ?? (n - sorted.size);

  const scale = useMemo(() => getBarScale(arr), [arr]);
  const slot = n > 0 ? 100 / n : 0;

  // Tree coordinates calculation
  const { nodes, edges, treeHeight } = useMemo(() => {
    if (n === 0) return { nodes: [], edges: [], treeHeight: 180 };

    const maxLevel = Math.floor(Math.log2(n));
    const levelHeight = 58;
    const topMargin = 28;
    const computedHeight = topMargin + (maxLevel + 1) * levelHeight + 10;

    const computedNodes: TreeNodeCoords[] = [];
    const computedEdges: Array<{
      from: number;
      to: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      active: boolean;
      sorted: boolean;
    }> = [];

    for (let i = 0; i < n; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const slotsInLevel = Math.pow(2, level);
      const positionInLevel = i - (slotsInLevel - 1);
      const xPct = ((positionInLevel + 0.5) / slotsInLevel) * 100;
      const yPx = topMargin + level * levelHeight;

      const flags: Flags = {
        cmp: cmp.has(i),
        swap: swap.has(i),
        pivot: pivot.has(i),
        sorted: sorted.has(i) || i >= heapSize,
        dim: dim.has(i),
      };

      const isActive = flags.swap || flags.cmp || flags.pivot;
      const glow = flags.swap
        ? tint(vizVar.green, 24)
        : flags.pivot
          ? tint(vizVar.purple, 24)
          : tint(vizVar.accent, 24);

      computedNodes.push({
        index: i,
        val: arr[i],
        xPct,
        yPx,
        level,
        flags,
        active: isActive,
        glow,
      });

      // Left and right edges from parent
      if (i > 0) {
        const parentIdx = Math.floor((i - 1) / 2);
        const parent = computedNodes[parentIdx];
        if (parent) {
          const isEdgeActive =
            (flags.swap && parent.flags.swap) ||
            (flags.cmp && (parent.flags.cmp || parent.flags.pivot)) ||
            (parent.flags.swap && flags.cmp);

          computedEdges.push({
            from: parentIdx,
            to: i,
            x1: parent.xPct,
            y1: parent.yPx,
            x2: xPct,
            y2: yPx,
            active: isEdgeActive,
            sorted: flags.sorted && parent.flags.sorted,
          });
        }
      }
    }

    return { nodes: computedNodes, edges: computedEdges, treeHeight: Math.max(computedHeight, 200) };
  }, [arr, cmp, dim, heapSize, n, pivot, sorted, swap]);

  if (arr.length === 0) {
    return (
      <Box mih={240} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text fz="sm" c="dimmed">
          Gerando…
        </Text>
      </Box>
    );
  }

  const activeLegend = LEGEND.filter((item) => {
    if (item.key === 'cmp') return cmp.size > 0;
    if (item.key === 'swap') return swap.size > 0;
    if (item.key === 'pivot') return pivot.size > 0;
    if (item.key === 'sorted') return sorted.size > 0;
    return false;
  });

  return (
    <Box
      role="img"
      aria-label={`Heap binário com ${n} elementos: ${arr.join(', ')}`}
      pt={space.xs}
    >
      {/* Mode Switcher toolbar */}
      <Group justify="space-between" align="center" mb="sm" px={space.xs}>
        <Group gap={8} align="center">
          <Text fz={font.tiny} fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.08em' }}>
            Visualização:
          </Text>
          <SegmentedControl
            size="xs"
            value={displayMode}
            onChange={(val) => setDisplayMode(val as HeapDisplayMode)}
            data={[
              { label: 'Árvore + Vetor', value: 'dual' },
              { label: 'Apenas Árvore', value: 'tree' },
              { label: 'Apenas Vetor', value: 'bars' },
            ]}
          />
        </Group>

        <Group gap={6} align="center">
          <Text fz={font.micro} c="dimmed">
            Elementos no Heap:{' '}
            <Text span fw={700} c={heapSize > 0 ? vizVar.accent : vizVar.muted}>
              {Math.max(0, heapSize)} / {n}
            </Text>
          </Text>
        </Group>
      </Group>

      {/* Binary Tree Representation */}
      {(displayMode === 'dual' || displayMode === 'tree') && (
        <Box
          data-testid="heap-tree"
          pos="relative"
          h={treeHeight}
          mx={space.xs}
          mb={displayMode === 'dual' ? space.md : space.xs}
          style={{
            borderRadius: radius.md,
            background: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, ${vizVar.surface3} 60%, transparent), transparent 75%)`,
            border: `1px solid ${vizVar.line}`,
            overflow: 'hidden',
          }}
        >
          {/* Header indicator inside tree */}
          <Box
            pos="absolute"
            top={8}
            left={12}
            fz={font.micro}
            fw={700}
            c="dimmed"
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em', pointerEvents: 'none' }}
          >
            Árvore Binária Completa
          </Box>

          {/* SVG Connector lines */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
            aria-hidden
          >
            {edges.map((edge) => {
              const edgeColor = edge.active
                ? vizVar.accent
                : edge.sorted
                  ? vizVar.line2
                  : vizVar.line3;
              const strokeWidth = edge.active ? 2.4 : 1.5;

              return (
                <line
                  key={`edge-${edge.from}-${edge.to}`}
                  x1={`${edge.x1}%`}
                  y1={edge.y1}
                  x2={`${edge.x2}%`}
                  y2={edge.y2}
                  stroke={edgeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={edge.sorted ? '3 3' : undefined}
                  opacity={edge.sorted ? 0.45 : 0.85}
                  style={{
                    transition: reducedMotion
                      ? 'none'
                      : `stroke ${transition.base}, stroke-width ${transition.base}`,
                  }}
                />
              );
            })}
          </svg>

          {/* Tree Nodes */}
          {nodes.map((node) => {
            const isRoot = node.index === 0;
            const borderColor = itemColor(node.flags);
            const bg = itemBg(node.flags);

            return (
              <Box
                key={`node-${ids[node.index] ?? node.index}`}
                data-testid={`heap-node-${node.index}`}
                pos="absolute"
                aria-hidden
                style={{
                  left: `${node.xPct}%`,
                  top: node.yPx,
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  transform: node.active ? 'translate(-50%, -50%) scale(1.14)' : 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${borderColor}`,
                  background: bg,
                  boxShadow: node.active
                    ? `0 0 16px ${node.glow}, 0 0 0 2px ${borderColor}`
                    : isRoot && !node.flags.sorted
                      ? `0 0 8px color-mix(in srgb, ${vizVar.accent} 25%, transparent)`
                      : undefined,
                  opacity: node.flags.dim ? 0.3 : node.flags.sorted ? 0.48 : 1,
                  zIndex: node.active ? 5 : 2,
                  transition: reducedMotion
                    ? 'none'
                    : `transform ${transition.spring}, background ${transition.base}, border-color ${transition.base}, box-shadow ${transition.base}, opacity ${transition.base}`,
                }}
              >
                {/* Index mini-badge above or top-right */}
                <Box
                  pos="absolute"
                  top={-10}
                  right={-6}
                  px={4}
                  h={14}
                  style={{
                    borderRadius: radius.pill,
                    background: vizVar.surface,
                    border: `1px solid ${node.flags.sorted ? vizVar.line : borderColor}`,
                    fontSize: 9,
                    fontWeight: 700,
                    lineHeight: '12px',
                    color: node.flags.sorted ? vizVar.dim : vizVar.ink2,
                  }}
                >
                  {node.index}
                </Box>

                {/* Node Value */}
                <Text
                  fz={font.small}
                  fw={700}
                  lh={1}
                  style={{
                    color: node.active
                      ? vizVar.ink
                      : node.flags.sorted
                        ? vizVar.muted
                        : vizVar.ink,
                  }}
                >
                  {node.val}
                </Text>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Vector / Bars Representation */}
      {(displayMode === 'dual' || displayMode === 'bars') && (
        <Box
          data-testid="heap-bars"
          pos="relative"
          h={PLOT_HEIGHT}
          mx={space.xs}
          mb={space.md}
          mt={displayMode === 'dual' ? space.sm : space.xs}
        >
          {/* Header indicator inside bars */}
          <Box
            pos="absolute"
            top={-18}
            left={4}
            fz={font.micro}
            fw={700}
            c="dimmed"
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em', pointerEvents: 'none' }}
          >
            Vetor Implícito (Índices e Posições)
          </Box>

          {/* Grid lines */}
          {GRID_LINES.map((line) => (
            <Box
              key={line}
              pos="absolute"
              left={0}
              right={0}
              bottom={`${line}%`}
              h={1}
              style={{
                background: line === 100 ? vizVar.line2 : vizVar.line,
                opacity: line === 100 ? 0.5 : 0.65,
                pointerEvents: 'none',
              }}
            />
          ))}

          <Box
            pos="absolute"
            left={0}
            right={0}
            bottom={`${scale.zeroPercent}%`}
            h={1}
            style={{ background: vizVar.line3, pointerEvents: 'none' }}
          />

          {/* Heap active boundary line */}
          {heapSize > 0 && heapSize < n && (
            <Box
              data-testid="heap-boundary"
              pos="absolute"
              top={-4}
              bottom={-22}
              left={`${heapSize * slot}%`}
              w={2}
              style={{
                borderLeft: `2px dashed ${vizVar.accentDim}`,
                pointerEvents: 'none',
                zIndex: 6,
                opacity: 0.8,
              }}
            >
              <Text
                fz={9}
                fw={700}
                pos="absolute"
                top={0}
                left={4}
                style={{
                  color: vizVar.accentDim,
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Fim do Heap
              </Text>
            </Box>
          )}

          {/* Bars */}
          {arr.map((_, i) => {
            const isSortedItem = sorted.has(i) || i >= heapSize;
            const flags: Flags = {
              cmp: cmp.has(i),
              swap: swap.has(i),
              pivot: pivot.has(i),
              sorted: isSortedItem,
              dim: dim.has(i),
            };
            const metrics = scale.bars[i];
            const isActive = flags.swap || flags.cmp || flags.pivot;
            const glow = flags.swap
              ? tint(vizVar.green, 20)
              : flags.pivot
                ? tint(vizVar.purple, 20)
                : tint(vizVar.accent, 20);

            const barStyle: CSSProperties = {
              borderColor: itemColor(flags),
              background: itemBg(flags),
            };

            return (
              <Box
                key={ids[i] ?? i}
                data-testid={`heap-bar-${i}`}
                className="viz-bar"
                pos="absolute"
                aria-hidden
                style={{
                  left: `${(i + 0.5) * slot}%`,
                  width: `calc(${slot}% - ${BAR_GAP}px)`,
                  maxWidth: 88,
                  bottom: `${metrics?.bottomPercent ?? 0}%`,
                  height: metrics?.zero ? 2 : `${Math.max(metrics?.heightPercent ?? 0, 2)}%`,
                  minHeight: 4,
                  transform: isActive ? 'translateX(-50%) translateY(-4px)' : 'translateX(-50%)',
                  border: '1.5px solid',
                  borderRadius: '9px 9px 3px 3px',
                  opacity: flags.dim ? 0.26 : flags.sorted ? 0.52 : 1,
                  transition: reducedMotion
                    ? 'none'
                    : `left ${transition.spring}, bottom ${transition.spring}, height ${transition.spring}, transform ${transition.base}, background ${transition.base}, border-color ${transition.base}, opacity ${transition.base}, box-shadow ${transition.base}`,
                  boxShadow: isActive ? `0 10px 22px -12px ${glow}, 0 0 0 1px ${itemColor(flags)}` : undefined,
                  ...barStyle,
                }}
              />
            );
          })}

          {/* Values */}
          {arr.map((value, i) => {
            const isSortedItem = sorted.has(i) || i >= heapSize;
            const flags: Flags = {
              cmp: cmp.has(i),
              swap: swap.has(i),
              pivot: pivot.has(i),
              sorted: isSortedItem,
              dim: dim.has(i),
            };
            const metrics = scale.bars[i];
            const topPercent = (metrics?.bottomPercent ?? 0) + (metrics?.heightPercent ?? 0);
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
                style={{
                  left: `${(i + 0.5) * slot}%`,
                  width: `calc(${slot}% - 2px)`,
                  bottom: `calc(${Math.min(topPercent, 100)}% + ${isActive ? 10 : 7}px)`,
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  color: flags.swap
                    ? vizVar.green
                    : flags.pivot
                      ? vizVar.purple
                      : flags.cmp
                        ? vizVar.accent
                        : flags.sorted
                          ? vizVar.muted
                          : vizVar.ink,
                  opacity: flags.dim ? 0.5 : 1,
                  transition: reducedMotion
                    ? 'none'
                    : `left ${transition.spring}, bottom ${transition.spring}, color ${transition.base}`,
                }}
              >
                {value}
              </Text>
            );
          })}

          {/* Indices */}
          {arr.map((_, i) => (
            <Text
              key={`index-${i}`}
              aria-hidden
              pos="absolute"
              top="calc(100% + 7px)"
              fz={font.micro}
              lh={1}
              style={{
                left: `${(i + 0.5) * slot}%`,
                width: `calc(${slot}% - 2px)`,
                transform: 'translateX(-50%)',
                textAlign: 'center',
                color: i >= heapSize ? vizVar.accentDim : vizVar.dim,
                fontWeight: i >= heapSize ? 600 : 400,
              }}
            >
              {i}
            </Text>
          ))}
        </Box>
      )}

      {/* Shared Legend */}
      <ViewLegend items={activeLegend} />
    </Box>
  );
}
