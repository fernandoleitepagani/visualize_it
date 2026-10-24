import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Box, Flex, SegmentedControl, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { FlowBranch, FlowBranchState, FlowKind, FlowState } from '@/engine/types';
import { font, radius, space, transition, vizVar } from '@/theme';
import { ViewLegend } from './ViewLegend';

const KIND_LABELS: Record<FlowKind, string> = {
  if: 'if / else',
  switch: 'switch / case',
  ternary: 'ternário',
};

type FlowMode = 'list' | 'chart';

const SELECTOR_LABELS: Record<FlowKind, string> = {
  if: 'condição',
  switch: 'seletor',
  ternary: 'expressão',
};

const STATE_LABELS: Record<FlowBranchState, string> = {
  active: 'em avaliação',
  done: 'executado',
  skipped: 'ignorado',
  idle: 'não avaliado',
};

const LEGEND = [
  { key: 'active', label: 'caminho ativo', color: vizVar.accent },
  { key: 'skipped', label: 'ignorado', color: vizVar.dim },
  { key: 'result', label: 'resultado', color: vizVar.purple },
] as const;

function branchStyle(state: FlowBranchState, reducedMotion: boolean): CSSProperties {
  const motion = reducedMotion
    ? undefined
    : `border-color ${transition.base}, background ${transition.base}, box-shadow ${transition.base}, opacity ${transition.base}`;

  switch (state) {
    case 'active':
      return {
        borderColor: vizVar.accent,
        background: `linear-gradient(180deg, ${vizVar.accentSoft}, color-mix(in srgb, var(--viz-surface-2) 70%, transparent))`,
        boxShadow: `0 0 0 3px ${vizVar.accentSoft}`,
        transition: motion,
      };
    case 'done':
      return {
        borderColor: vizVar.accentLine,
        background: vizVar.accentSoft,
        transition: motion,
      };
    case 'skipped':
      return {
        borderColor: vizVar.line2,
        background: 'transparent',
        opacity: 0.7,
        transition: motion,
      };
    default:
      return {
        borderColor: vizVar.line2,
        background: `linear-gradient(180deg, ${vizVar.surface3}, ${vizVar.surface2})`,
        transition: motion,
      };
  }
}

function Branch({ branch, reducedMotion }: { branch: FlowBranch; reducedMotion: boolean }) {
  const state = branch.state ?? 'idle';

  return (
    <Box
      data-testid={`flow-branch-${branch.id}`}
      data-state={state}
      p={space.sm}
      style={{
        border: '1px solid',
        borderRadius: radius.md,
        ...branchStyle(state, reducedMotion),
      }}
    >
      <Flex justify="space-between" align="baseline" gap={space.sm} wrap="wrap">
        <Text ff="monospace" fz={font.tiny} fw={700} style={{ color: vizVar.ink }}>
          {branch.label}
        </Text>
        <Text
          fz={font.micro}
          tt="uppercase"
          style={{
            color: state === 'active' || state === 'done' ? vizVar.accent : vizVar.dim,
            letterSpacing: '0.08em',
          }}
        >
          {STATE_LABELS[state]}
        </Text>
      </Flex>

      {branch.condition ? (
        <Text
          ff="monospace"
          fz={font.tiny}
          mt={space.xxs}
          style={{ color: vizVar.ink2, overflowWrap: 'anywhere' }}
        >
          {branch.condition}
          {state !== 'idle' && branch.evaluation ? ` · ${branch.evaluation}` : ''}
        </Text>
      ) : null}

      {state !== 'idle' && branch.result !== undefined ? (
        <Text
          ff="monospace"
          fz={font.tiny}
          mt={space.xxs}
          style={{ color: branch.result ? vizVar.accent : vizVar.dim }}
        >
          {branch.result ? 'verdadeiro' : 'falso'}
        </Text>
      ) : null}

      {branch.statements?.map((statement) => (
        <Text
          key={statement}
          ff="monospace"
          fz={font.tiny}
          mt={space.xxs}
          style={{ color: vizVar.ink2, overflowWrap: 'anywhere' }}
        >
          → {statement}
        </Text>
      ))}

      {state !== 'idle' && branch.value !== undefined ? (
        <Text
          ff="monospace"
          fz={font.tiny}
          mt={space.xxs}
          style={{ color: vizVar.ink, overflowWrap: 'anywhere' }}
        >
          → {branch.value}
        </Text>
      ) : null}

      {branch.exit ? (
        <Text
          span
          mt={space.xxs}
          px={6}
          style={{
            display: 'inline-flex',
            border: `1px solid ${branch.exit === 'fall-through' ? vizVar.danger : vizVar.purple}`,
            borderRadius: radius.pill,
            color: branch.exit === 'fall-through' ? vizVar.danger : vizVar.purple,
            fontFamily: 'monospace',
            fontSize: font.micro,
          }}
        >
          {branch.exit}
        </Text>
      ) : null}
    </Box>
  );
}

function FlowChart({ state, reducedMotion }: { state: FlowState; reducedMotion: boolean }) {
  return (
    <Box
      data-testid="flow-chart"
      role="group"
      aria-label="Fluxograma do fluxo condicional"
      mt={space.sm}
    >
      <Flex justify="center">
        <Box
          data-testid="flow-chart-condition"
          p={space.sm}
          style={{
            minWidth: 190,
            maxWidth: 320,
            textAlign: 'center',
            border: `1px solid ${vizVar.accentLine}`,
            borderRadius: radius.md,
            background: vizVar.surface2,
          }}
        >
          <Text
            fz={font.micro}
            tt="uppercase"
            style={{ color: vizVar.muted, letterSpacing: '0.08em' }}
          >
            {SELECTOR_LABELS[state.kind]}
          </Text>
          <Text
            ff="monospace"
            fz={font.body}
            fw={700}
            mt={space.xxs}
            style={{ color: vizVar.ink, overflowWrap: 'anywhere' }}
          >
            {state.selector ?? '—'}
          </Text>
        </Box>
      </Flex>

      <Box
        ml={28}
        pl={20}
        mt={space.xs}
        style={{ borderLeft: `2px solid ${vizVar.line2}` }}
      >
        {state.branches.map((branch) => {
          const branchState = branch.state ?? 'idle';
          const edgeColor =
            branchState === 'active' || branchState === 'done' ? vizVar.accent : vizVar.line3;

          return (
            <Box key={branch.id} pos="relative" mb={space.xs}>
              <Box
                aria-hidden
                pos="absolute"
                left={-20}
                top={16}
                w={20}
                style={{ borderTop: `2px solid ${edgeColor}` }}
              />
              <Text
                fz={font.micro}
                tt="uppercase"
                mb={4}
                style={{ color: edgeColor, letterSpacing: '0.08em' }}
              >
                {branch.label}
              </Text>
              <Branch branch={branch} reducedMotion={reducedMotion} />
            </Box>
          );
        })}
      </Box>

      <Flex justify="center" mt={space.xs} aria-hidden>
        <Text fz={font.tiny} style={{ color: vizVar.dim }}>
          ↓
        </Text>
      </Flex>
    </Box>
  );
}

/** Flow view — conditions, skipped branches, switch cases and ternary selection. */
export function FlowView({ state }: { state?: FlowState }) {
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<FlowMode>('list');

  if (!state) {
    return (
      <Flex
        data-testid="flow-view-empty"
        align="center"
        justify="center"
        mih={250}
        p="md"
      >
        <Text fz="sm" c="dimmed">
          Aguardando execução do fluxo
        </Text>
      </Flex>
    );
  }

  const hasActive = state.branches.some(
    (branch) => branch.state === 'active' || branch.state === 'done',
  );
  const hasSkipped = state.branches.some((branch) => branch.state === 'skipped');
  const legend = [
    ...(hasActive ? [LEGEND[0]] : []),
    ...(hasSkipped ? [LEGEND[1]] : []),
    ...(state.result ? [LEGEND[2]] : []),
  ];

  return (
    <Box
      data-testid="flow-view"
      role="region"
      aria-label="Visualizador de fluxo condicional"
      py="md"
      px="xs"
    >
      <Flex justify="space-between" align="center" gap={space.sm} wrap="wrap">
        <Flex gap={space.sm} align="baseline" wrap="wrap">
          <Text
            fz={font.micro}
            tt="uppercase"
            style={{ color: vizVar.muted, letterSpacing: '0.14em' }}
          >
            {KIND_LABELS[state.kind]}
          </Text>
          <Text fz={font.micro} style={{ color: vizVar.dim }}>
            {state.branches.length} ramos
          </Text>
        </Flex>
        <SegmentedControl
          value={mode}
          onChange={(value) => setMode(value as FlowMode)}
          data={[
            { label: 'Ramos', value: 'list' },
            { label: 'Fluxograma', value: 'chart' },
          ]}
          size="xs"
          radius="md"
          aria-label="Tipo de visualização do fluxo"
        />
      </Flex>

      {mode === 'list' ? (
        <Box
          data-testid="flow-condition"
          mt={space.xs}
          p={space.sm}
          style={{
            border: `1px solid ${vizVar.line}`,
            borderRadius: radius.md,
            background: vizVar.surface2,
          }}
        >
          <Text
            fz={font.micro}
            tt="uppercase"
            style={{ color: vizVar.muted, letterSpacing: '0.08em' }}
          >
            {SELECTOR_LABELS[state.kind]}
          </Text>
          <Text
            ff="monospace"
            fz={font.body}
            fw={700}
            mt={space.xxs}
            style={{ color: vizVar.ink, overflowWrap: 'anywhere' }}
          >
            {state.selector ?? '—'}
          </Text>
        </Box>
      ) : (
        <FlowChart state={state} reducedMotion={reducedMotion} />
      )}

      {mode === 'list' ? (
        <Flex data-testid="flow-list" direction="column" gap={space.xs} mt={space.sm}>
          {state.branches.map((branch) => (
            <Branch key={branch.id} branch={branch} reducedMotion={reducedMotion} />
          ))}
        </Flex>
      ) : null}

      {state.note ? (
        <Text
          data-testid="flow-note"
          fz={font.tiny}
          mt={space.sm}
          p={space.sm}
          style={{
            borderLeft: `2px solid ${vizVar.purple}`,
            color: vizVar.ink2,
            background: vizVar.purpleSoft,
            borderRadius: radius.sm,
          }}
        >
          {state.note}
        </Text>
      ) : null}

      {state.result ? (
        <Flex
          data-testid="flow-result"
          mt={space.sm}
          p={space.sm}
          justify="space-between"
          align="baseline"
          gap={space.sm}
          style={{
            border: `1px solid ${vizVar.purple}`,
            borderRadius: radius.md,
            background: vizVar.purpleSoft,
          }}
        >
          <Text fz={font.micro} tt="uppercase" style={{ color: vizVar.purple }}>
            {state.result.label}
          </Text>
          <Text ff="monospace" fz={font.lead} fw={700} style={{ color: vizVar.purple }}>
            {state.result.value}
          </Text>
        </Flex>
      ) : null}

      <ViewLegend items={legend} />
    </Box>
  );
}
