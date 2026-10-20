import { useState } from 'react';
import { Box, Flex, Group, Text } from '@mantine/core';
import type { Step } from '@/engine/types';
import { vizVar } from '@/theme';

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
      return vizVar.line2;
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
    <Box mb="sm">
      {/* Header row: Timeline label + hovered/active step preview + legend */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="xs" mb={6}>
        <Group gap={8} align="center" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <Text
            fz={10.5}
            fw={600}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: '0.08em', flexShrink: 0 }}
          >
            Timeline
          </Text>
          <Text
            ff="monospace"
            fz={11}
            fw={600}
            px={6}
            py={1}
            style={{
              borderRadius: 4,
              background: vizVar.surface3,
              color: getKindColor(inspectedKind),
              border: `1px solid ${vizVar.line2}`,
              flexShrink: 0,
            }}
          >
            #{inspectIndex + 1}/{total} • L{(inspectedStep?.line ?? 0) + 1} ({getKindLabel(inspectedKind)})
          </Text>
          <Text
            fz="xs"
            c={hoveredIndex !== null ? 'amber' : 'dimmed'}
            truncate="end"
            style={{ minWidth: 0 }}
          >
            {inspectedStep?.desc}
          </Text>
        </Group>

        <Group gap={10} wrap="nowrap" visibleFrom="sm">
          {[
            { label: 'Comp/Ação', color: vizVar.accent },
            { label: 'Troca', color: vizVar.green },
            { label: 'Pivô', color: vizVar.purple },
          ].map((item) => (
            <Group key={item.label} gap={4} wrap="nowrap">
              <Box
                w={7}
                h={7}
                style={{ borderRadius: '50%', background: item.color, flexShrink: 0 }}
              />
              <Text fz={10.5} c="dimmed">
                {item.label}
              </Text>
            </Group>
          ))}
        </Group>
      </Flex>

      {/* Interactive segmented scrubber track */}
      <Box
        role="group"
        aria-label="Linha do tempo de passos"
        onMouseLeave={() => setHoveredIndex(null)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: total > 60 ? 1 : 2,
          height: 22,
          padding: '3px 4px',
          borderRadius: 6,
          background: vizVar.surface,
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
                opacity: isCurrent ? 1 : isHovered ? 0.95 : isPast ? 0.85 : 0.38,
                boxShadow: isCurrent ? `0 0 8px ${vizVar.accent}` : undefined,
                transition: 'height 120ms ease, opacity 120ms ease, background-color 120ms ease',
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
