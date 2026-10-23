import { useCallback, useRef, useState } from 'react';
import { Box, Flex, Group, Text } from '@mantine/core';
import type { Step } from '@/engine/types';
import { resolveStepLine } from '@/engine/types';
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
 * Interactive step-by-step execution timeline with magnification dock effect,
 * semantic operation markers, and drag/hover inspection.
 */
export function TimelineBar({ steps, currentIndex, onSeek }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = steps.length;

  // Determine index from pointer coordinates within the container
  const handlePointerSeek = useCallback(
    (clientX: number) => {
      if (!containerRef.current || total === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const progress = Math.max(0, Math.min(1, relativeX / rect.width));
      const targetIndex = Math.min(total - 1, Math.floor(progress * total));
      setHoveredIndex(targetIndex);
      onSeek(targetIndex);
    },
    [total, onSeek],
  );

  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDraggingRef.current || !containerRef.current || total === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, relativeX / rect.width));
      const targetIndex = Math.min(total - 1, Math.floor(progress * total));
      setHoveredIndex(targetIndex);
    },
    [total],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only primary mouse button
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      handlePointerSeek(e.clientX);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;
        handlePointerSeek(moveEvent.clientX);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [handlePointerSeek],
  );

  if (total === 0) return null;

  // Priority: hover/scrubbing focus strictly takes precedence over running currentIndex
  const focalIndex = hoveredIndex ?? currentIndex;
  const isHoverActive = hoveredIndex !== null;

  const inspectedStep = steps[focalIndex] ?? steps[0];
  const inspectedKind = inspectedStep ? classifyStep(inspectedStep) : 'normal';

  return (
    <Box>
      <Flex justify="space-between" align="center" wrap="wrap" gap="xs" mb={10}>
        <Group gap={8} align="center" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <Text
            fz={font.micro}
            fw={700}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: '0.12em', flexShrink: 0 }}
          >
            timeline
          </Text>
          <Text
            fz={font.micro}
            fw={700}
            px={8}
            py={2}
            style={{
              borderRadius: 6,
              background: isHoverActive
                ? 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 16%, var(--viz-surface-3))'
                : 'var(--viz-surface-3)',
              color: isHoverActive
                ? 'var(--subject-accent, var(--viz-accent))'
                : inspectedKind === 'normal'
                ? vizVar.muted
                : vizVar.ink,
              border: `1px solid ${isHoverActive ? 'var(--subject-accent, var(--viz-accent))' : vizVar.line2}`,
              flexShrink: 0,
              transition: 'all 120ms ease',
            }}
          >
            #{focalIndex + 1}/{total} · L{
              (typeof inspectedStep?.line === 'number'
                ? inspectedStep.line
                : resolveStepLine(inspectedStep?.line, 'c') ??
                  resolveStepLine(inspectedStep?.line, 'java') ??
                  0) + 1
            } ({getKindLabel(inspectedKind)})
          </Text>
          <Text
            fz={font.tiny}
            truncate="end"
            style={{
              minWidth: 0,
              fontWeight: isHoverActive ? 600 : 500,
              color: isHoverActive
                ? 'var(--subject-accent, var(--viz-accent))'
                : vizVar.ink2,
            }}
          >
            {inspectedStep?.desc}
          </Text>
        </Group>

        <Text fz={font.micro} fw={600} c="dimmed" visibleFrom="md">
          {total} passos
        </Text>
      </Flex>

      <Box
        ref={containerRef}
        role="group"
        aria-label="Linha do tempo de passos"
        onMouseDown={handleMouseDown}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: total > 80 ? 1.5 : total > 40 ? 2.5 : 4,
          height: 44,
          padding: '6px 8px',
          borderRadius: 10,
          background: 'color-mix(in srgb, var(--viz-surface-2) 75%, transparent)',
          border: `1px solid ${vizVar.line2}`,
          userSelect: 'none',
          cursor: 'pointer',
        }}
      >
        {steps.map((step, i) => {
          const kind = classifyStep(step);
          const isCurrent = i === currentIndex;
          const isFocal = i === focalIndex;
          const isPast = i < currentIndex;

          // Distance from focal index for dock/magnification effect
          const dist = Math.abs(i - focalIndex);

          // Calculate magnified height and border radius based on distance
          let height = 11;
          let opacity = isPast ? 0.72 : 0.45;
          let borderRadius = 3;

          if (dist === 0) {
            height = 30;
            opacity = 1;
            borderRadius = 4;
          } else if (dist === 1) {
            height = 23;
            opacity = 0.9;
            borderRadius = 3.5;
          } else if (dist === 2) {
            height = 17;
            opacity = 0.75;
            borderRadius = 3;
          } else if (dist === 3) {
            height = 13;
            opacity = 0.6;
          } else if (kind !== 'normal') {
            height = 13;
          }

          // Coloring: current execution gets accent; focal hover gets accent or elevated tint; semantic operations keep distinction
          let backgroundColor: string = vizVar.line3;
          if (isCurrent) {
            backgroundColor = 'var(--subject-accent, var(--viz-accent))';
          } else if (isFocal) {
            backgroundColor = 'var(--subject-accent, var(--viz-accent))';
          } else if (dist <= 1 && isHoverActive) {
            backgroundColor = 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 65%, var(--viz-surface-3))';
          } else if (dist <= 1 && !isHoverActive) {
            backgroundColor = 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 50%, var(--viz-line-3))';
          } else if (kind === 'swap') {
            backgroundColor = 'color-mix(in srgb, var(--viz-accent-swap, #ef4444) 75%, var(--viz-line-3))';
          } else if (kind === 'pivot') {
            backgroundColor = 'color-mix(in srgb, var(--viz-purple, #8b5cf6) 75%, var(--viz-line-3))';
          } else if (kind === 'cmp') {
            backgroundColor = 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 60%, var(--viz-line-3))';
          }

          return (
            <Box
              key={i}
              component="button"
              type="button"
              tabIndex={isCurrent ? 0 : -1}
              aria-label={`Ir para o passo ${i + 1}`}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(i);
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onFocus={() => setHoveredIndex(i)}
              onBlur={() => setHoveredIndex(null)}
              style={{
                flex: 1,
                minWidth: total > 80 ? 3 : total > 40 ? 5 : 8,
                height,
                border: 'none',
                padding: 0,
                borderRadius,
                cursor: 'pointer',
                background: backgroundColor,
                opacity,
                boxShadow: isFocal
                  ? '0 0 12px 0 var(--subject-accent, var(--viz-accent))'
                  : dist === 1 && isHoverActive
                  ? '0 0 6px 0 color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 45%, transparent)'
                  : 'none',
                transition:
                  'height 140ms cubic-bezier(0.2, 0, 0, 1), opacity 140ms ease, background-color 140ms ease, box-shadow 140ms ease',
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
