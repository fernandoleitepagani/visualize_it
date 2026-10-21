import { Box, Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { PlotState } from '@/engine/types';
import { font, radius, vizVar } from '@/theme';

const WIDTH = 420;
const HEIGHT = 230;
const BASELINE = 192;
const PLOT_TOP = 26;

/** Plot view — a term series with its accumulated total (summation). */
export function PlotView({ plot }: { plot: PlotState | undefined }) {
  const reducedMotion = useReducedMotion();
  const points = plot?.points ?? [];

  if (points.length === 0) {
    return (
      <Flex mih={250} align="center" justify="center">
        <Text fz="sm" c="dimmed">
          Gerando…
        </Text>
      </Flex>
    );
  }

  const current = plot?.current ?? -1;
  const total = plot?.total ?? 0;
  const max = Math.max(...points.map((point) => point.value), 1);
  const slot = WIDTH / points.length;
  const barWidth = Math.max(slot - 10, 8);
  const usable = BASELINE - PLOT_TOP;

  const geometry = points.map((point, i) => {
    const height = Math.max((point.value / max) * usable, point.value === 0 ? 2 : 5);
    return {
      x: i * slot,
      center: i * slot + slot / 2,
      y: BASELINE - height,
      height,
      width: barWidth,
    };
  });

  const line = geometry.map((bar, i) => `${i === 0 ? 'M' : 'L'} ${bar.center} ${bar.y}`).join(' ');
  const area = `${line} L ${geometry[geometry.length - 1].center} ${BASELINE} L ${geometry[0].center} ${BASELINE} Z`;

  return (
    <Box>
      <Flex justify="space-between" align="flex-end" gap={8} mb="xs">
        <Box>
          <Text
            fz={font.micro}
            fw={600}
            tt="uppercase"
            c="dimmed"
            ff="monospace"
            style={{ letterSpacing: '0.14em' }}
          >
            soma parcial
          </Text>
          <Text fz={font.tiny} c="dimmed">
            área acumulada dos termos
          </Text>
        </Box>
        <Flex align="baseline" gap={6}>
          <Text fz={font.h3} ff="monospace" fw={600} style={{ color: vizVar.accent }}>
            Σ
          </Text>
          <Text fz={font.h2} ff="monospace" fw={600} style={{ color: vizVar.ink, lineHeight: 1 }}>
            {total}
          </Text>
        </Flex>
      </Flex>

      <Box
        role="img"
        aria-label={`Somatório com ${points.length} termos; total atual ${total}`}
        style={{ position: 'relative' }}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          style={{ display: 'block', overflow: 'visible' }}
          aria-hidden
        >
          <defs>
            <linearGradient id="plot-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--viz-accent)" stopOpacity="0.24" />
              <stop offset="100%" stopColor="var(--viz-accent)" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="plot-bar-current" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--viz-accent)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--viz-accent)" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="plot-bar-past" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--viz-accent-dim)" stopOpacity="0.34" />
              <stop offset="100%" stopColor="var(--viz-accent-dim)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((lineIndex) => {
            const y = PLOT_TOP + (usable / 3) * lineIndex;
            return (
              <line
                key={lineIndex}
                x1="0"
                x2={WIDTH}
                y1={y}
                y2={y}
                stroke="var(--viz-line)"
                strokeWidth="1"
                opacity="0.7"
              />
            );
          })}

          <line
            x1="0"
            x2={WIDTH}
            y1={BASELINE}
            y2={BASELINE}
            stroke="var(--viz-line-2)"
            strokeWidth="1"
          />

          {geometry.map((bar, i) => {
            const isCurrent = i === current;
            const isPast = i < current;
            return (
              <g key={i}>
                <rect
                  x={bar.x + (slot - bar.width) / 2}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  rx="5"
                  fill={
                    isCurrent
                      ? 'url(#plot-bar-current)'
                      : isPast
                        ? 'url(#plot-bar-past)'
                        : 'color-mix(in srgb, var(--viz-surface-3) 70%, transparent)'
                  }
                  stroke={isCurrent ? 'var(--viz-accent)' : isPast ? 'var(--viz-accent-dim)' : 'var(--viz-line-2)'}
                  strokeWidth={isCurrent ? '1.6' : '1'}
                  style={{
                    transition: reducedMotion ? 'none' : 'all 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
                <text
                  x={bar.center}
                  y={Math.max(bar.y - 7, 12)}
                  textAnchor="middle"
                  fill={isCurrent ? 'var(--viz-accent)' : isPast ? 'var(--viz-ink-2)' : 'var(--viz-dim)'}
                  fontSize="10.5"
                  fontWeight="600"
                  fontFamily="var(--mantine-font-family-monospace)"
                >
                  {points[i].value}
                </text>
                <text
                  x={bar.center}
                  y={BASELINE + 16}
                  textAnchor="middle"
                  fill="var(--viz-dim)"
                  fontSize="9.5"
                  fontFamily="var(--mantine-font-family-monospace)"
                >
                  {points[i].label}
                </text>
              </g>
            );
          })}

          <path d={area} fill="url(#plot-area)" />
          <path
            d={line}
            fill="none"
            stroke="var(--viz-accent)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          {geometry.map((bar, i) => (
            <circle
              key={`dot-${i}`}
              cx={bar.center}
              cy={bar.y}
              r={i === current ? 4.2 : 2.4}
              fill={i === current ? 'var(--viz-accent)' : 'var(--viz-surface)'}
              stroke={i <= current ? 'var(--viz-accent)' : 'var(--viz-line-2)'}
              strokeWidth="1.4"
              style={{
                transition: reducedMotion ? 'none' : 'all 220ms ease',
                filter: i === current ? 'drop-shadow(0 0 6px var(--viz-accent))' : undefined,
              }}
            />
          ))}
        </svg>
      </Box>

      <Text
        fz={font.micro}
        c="dimmed"
        ff="monospace"
        mt={radius.xs}
        style={{ textAlign: 'right' }}
      >
        termo {current >= 0 ? current + 1 : 0} / {points.length}
      </Text>
    </Box>
  );
}
