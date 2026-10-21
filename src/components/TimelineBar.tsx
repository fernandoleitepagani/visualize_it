import { useState } from 'react';
import { Box, Flex, Group, Text } from '@mantine/core';
import type { Step } from '@/engine/types';
import { font, vizVar } from '@/theme';

interface Props {
  steps: Step[];
  currentIndex: number;
  onSeek: (index: number) => void;
}

type StepKind = 'swap' | 'pivot' | 'cmp' | 'normal';

function classifyStep(step: Step): StepKind {
  if (step.swap && step.swap.length > 0) return 'swap';
  if (step.pivot && step.pivot.length > 0) return 'pivot';
  if (step.cmp && step.cmp.length > 0) return 'cmp';
  if (step.cells?.some((c) => c.state === 'write' || c.state === 'active' || c.state === 'compare'))
    return 'cmp';
  if (step.nodes?.some((n) => n.state === 'write' || n.state === 'active' || n.state === 'compare'))
    return 'cmp';
  return 'normal';
}

function getKindColor(kind: StepKind): string {
  switch (kind) {
    case 'swap':
      return vizVar.green;
    case 'pivot':
      return vizVar.purple;
    case 'cmp':
      return vizVar.accent;
    default:
      return vizVar.line3;
  }
}

function getKindLabel(kind: StepKind): string {
  switch (kind) {
    case 'swap':
      return 'Troca';
    case 'pivot':
      return 'Pivô';
    case 'cmp':
      return 'Comparação / Ação';
    default:
      return 'Fluxo';
  }
}

/**
 * Interactive step-by-step execution timeline with semantic operation markers
 * and hover inspection.
 */
export function TimelineBar({ steps, currentIndex, onSeek }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = steps.length;

  if (total === 0) return null;

  const inspectIndex = hoveredIndex ?? currentIndex;
  const inspectedStep = steps[inspectIndex] ?? steps[0];
  const inspectedKind = inspectedStep ? classifyStep(inspectedStep) : 'normal';

  return (
    <Box>
      <Flex justify="space-between" align="center" wrap="wrap" gap="xs" mb={6}>
        <Group gap={8} align="center" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <Text
            fz={font.micro}
            fw={600}
            tt="uppercase"
            c="dimmed"
            ff="monospace"
            style={{ letterSpacing: '0.12em', flexShrink: 0 }}
          >
            timeline
          </Text>
          <Text
            ff="monospace"
            fz={font.micro}
            fw={600}
            px={7}
            py={1}
            style={{
              borderRadius: 5,
              background: 'color-mix(in srgb, var(--viz-surface-3) 74%, transparent)',
              color: getKindColor(inspectedKind),
              border: `1px solid ${vizVar.line2}`,
              flexShrink: 0,
            }}
          >
            #{inspectIndex + 1}/{total} · L{(inspectedStep?.line ?? 0) + 1} ({getKindLabel(inspectedKind)})
          </Text>
          <Text
            fz={font.tiny}
            c={hoveredIndex !== null ? undefined : 'dimmed'}
            truncate="end"
            style={{ minWidth: 0, color: hoveredIndex !== null ? vizVar.accent : undefined }}
          >
            {inspectedStep?.desc}
          </Text>
        </Group>

        <Group gap={10} wrap="nowrap" visibleFrom="md">
          {[
            { label: 'comp/ação', color: vizVar.accent },
            { label: 'troca', color: vizVar.green },
            { label: 'pivô', color: vizVar.purple },
          ].map((item) => (
            <Group key={item.label} gap={4} wrap="nowrap">
              <Box
                w={6}
                h={6}
                style={{ borderRadius: '50%', background: item.color, flexShrink: 0 }}
              />
              <Text fz={font.micro} c="dimmed" ff="monospace">
                {item.label}
              </Text>
            </Group>
          ))}
        </Group>
      </Flex>

      <Box
        role="group"
        aria-label="Linha do tempo de passos"
        onMouseLeave={() => setHoveredIndex(null)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: total > 60 ? 1 : 2,
          height: 24,
          padding: '4px 5px',
          borderRadius: 7,
          background: 'color-mix(in srgb, var(--viz-surface-2) 64%, transparent)',
          border: `1px solid ${vizVar.line}`,
          userSelect: 'none',
        }}
      >
        {steps.map((step, i) => {
          const kind = classifyStep(step);
          const color = getKindColor(kind);
          const isCurrent = i === currentIndex;
          const isPast = i < currentIndex;
          const isHovered = i === hoveredIndex;

          return (
            <Box
              key={i}
              component="button"
              type="button"
              tabIndex={isCurrent ? 0 : -1}
              aria-label={`Ir para o passo ${i + 1}`}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onSeek(i)}
              onMouseEnter={() => setHoveredIndex(i)}
              onFocus={() => setHoveredIndex(i)}
              onBlur={() => setHoveredIndex(null)}
              style={{
                flex: 1,
                minWidth: 2,
                height: isCurrent ? 14 : isHovered ? 12 : kind !== 'normal' ? 10 : 6,
                border: 'none',
                padding: 0,
                borderRadius: 2,
                cursor: 'pointer',
                background: isCurrent ? vizVar.ink : color,
                opacity: isCurrent ? 1 : isHovered ? 0.95 : isPast ? 0.82 : 0.34,
                boxShadow: isCurrent ? `0 0 10px ${vizVar.accent}` : undefined,
                transition:
                  'height 140ms ease, opacity 140ms ease, background-color 140ms ease, box-shadow 140ms ease',
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
