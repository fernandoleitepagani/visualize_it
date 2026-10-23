import type { CSSProperties } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { CallFrame, CallStackState, FrameStateName, FrameVar } from '@/engine/types';
import { font, radius, space, transition, vizVar } from '@/theme';
import { ViewLegend } from './ViewLegend';

const STATE_LABELS: Record<FrameStateName, string> = {
  active: 'ativo',
  waiting: 'aguardando',
  returning: 'retornando',
  done: 'encerrado',
};

const LEGEND = [
  { key: 'active', label: 'ativo', color: vizVar.accent },
  { key: 'waiting', label: 'aguardando', color: vizVar.dim },
  { key: 'returning', label: 'retornando', color: vizVar.purple },
] as const;

function frameStyle(state: FrameStateName, reducedMotion: boolean): CSSProperties {
  const motion = reducedMotion
    ? undefined
    : `border-color ${transition.base}, background ${transition.base}, box-shadow ${transition.base}`;

  switch (state) {
    case 'active':
      return {
        borderColor: vizVar.accent,
        background: `linear-gradient(180deg, ${vizVar.accentSoft}, color-mix(in srgb, var(--viz-surface-2) 70%, transparent))`,
        boxShadow: `0 0 0 3px ${vizVar.accentSoft}`,
        transition: motion,
      };
    case 'returning':
      return {
        borderColor: vizVar.purple,
        background: `linear-gradient(180deg, ${vizVar.purpleSoft}, color-mix(in srgb, var(--viz-surface-2) 70%, transparent))`,
        boxShadow: `0 0 0 3px ${vizVar.purpleSoft}`,
        transition: motion,
      };
    case 'done':
      return {
        borderColor: vizVar.line,
        background: 'transparent',
        opacity: 0.72,
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

const VAR_STATE_LABELS: Record<NonNullable<FrameVar['state']>, string> = {
  changed: 'alterado',
  read: 'lido',
};

function varStyle(kind: FrameVar['kind'], value: FrameVar['state']): CSSProperties {
  if (value === 'changed') {
    return {
      borderColor: vizVar.accentLine,
      background: vizVar.accentSoft,
      color: vizVar.accent,
    };
  }

  if (value === 'read') {
    return {
      borderColor: 'color-mix(in srgb, var(--viz-purple) 38%, transparent)',
      background: vizVar.purpleSoft,
      color: vizVar.purple,
    };
  }

  return {
    borderColor: kind === 'param' ? vizVar.line3 : vizVar.line2,
    background: 'color-mix(in srgb, var(--viz-surface) 62%, transparent)',
    color: vizVar.ink2,
  };
}

function VarGroup({
  title,
  vars,
  frameId,
}: {
  title: string;
  vars: FrameVar[];
  frameId: string;
}) {
  if (vars.length === 0) return null;

  return (
    <Box mt={space.xs}>
      <Text
        fz={font.micro}
        tt="uppercase"
        style={{ color: vizVar.muted, letterSpacing: '0.14em' }}
      >
        {title}
      </Text>
      <Flex gap={space.xs} wrap="wrap" mt={space.xxs}>
        {vars.map((variable) => (
          <Text
            key={variable.name}
            span
            px={6}
            data-testid={`frame-var-${frameId}-${variable.name}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              border: '1px solid',
              borderRadius: radius.pill,
              fontFamily: 'monospace',
              fontSize: font.tiny,
              lineHeight: 1.5,
              whiteSpace: 'nowrap',
              ...varStyle(variable.kind, variable.state),
            }}
          >
            {variable.name} = {variable.value}
            {variable.state ? (
              <Text
                span
                style={{
                  fontSize: font.micro,
                  fontStyle: 'italic',
                  letterSpacing: '0.02em',
                }}
              >
                {VAR_STATE_LABELS[variable.state]}
              </Text>
            ) : null}
          </Text>
        ))}
      </Flex>
    </Box>
  );
}

function Frame({ frame, reducedMotion }: { frame: CallFrame; reducedMotion: boolean }) {
  const state = frame.state ?? 'waiting';
  const params = frame.vars.filter((variable) => variable.kind === 'param');
  const locals = frame.vars.filter((variable) => variable.kind !== 'param');

  return (
    <Box
      data-testid={`call-frame-${frame.id}`}
      data-state={state}
      style={{
        padding: space.sm,
        border: '1px solid',
        borderRadius: radius.md,
        ...frameStyle(state, reducedMotion),
      }}
    >
      <Flex justify="space-between" align="baseline" gap={space.xs}>
        <Flex align="baseline" gap={space.xs} style={{ minWidth: 0 }}>
          <Text fz={font.small} fw={700} ff="monospace" style={{ color: vizVar.ink }}>
            {frame.fn}
          </Text>
          {frame.call ? (
            <Text fz={font.micro} ff="monospace" style={{ color: vizVar.muted }} truncate>
              {frame.call}
            </Text>
          ) : null}
        </Flex>
        <Text
          fz={font.micro}
          tt="uppercase"
          style={{
            flexShrink: 0,
            color:
              state === 'active'
                ? vizVar.accent
                : state === 'returning'
                  ? vizVar.purple
                  : vizVar.muted,
            letterSpacing: '0.1em',
          }}
        >
          {STATE_LABELS[state]}
        </Text>
      </Flex>

      <VarGroup title="parâmetros" vars={params} frameId={frame.id} />
      <VarGroup title="locais" vars={locals} frameId={frame.id} />

      {frame.returns ? (
        <Text fz={font.tiny} ff="monospace" mt={space.xs} style={{ color: vizVar.purple }}>
          ↩ retorno {frame.returns}
        </Text>
      ) : null}

      {frame.received ? (
        <Text
          fz={font.tiny}
          ff="monospace"
          mt={space.xs}
          data-testid={`call-frame-received-${frame.id}`}
          style={{ color: vizVar.purple }}
        >
          ↳ recebeu {frame.received}
        </Text>
      ) : null}
    </Box>
  );
}

/** Call frames for the function/recursion lessons. */
export function CallStackView({ state }: { state: CallStackState | undefined }) {
  const reducedMotion = useReducedMotion();
  const frames = state?.frames ?? [];
  const ordered = [...frames].reverse();
  const states = new Set(frames.map((frame) => frame.state ?? 'waiting'));
  const legend = LEGEND.filter((item) => states.has(item.key));

  const description =
    frames.length === 0
      ? 'Pilha vazia'
      : `Pilha de chamadas com ${frames.length} ${
          frames.length === 1 ? 'quadro' : 'quadros'
        }, da base ao topo: ${frames
          .map((frame) => {
            const vars = frame.vars.map((variable) => `${variable.name} = ${variable.value}`).join(', ');
            const returns = frame.returns ? `, retornando ${frame.returns}` : '';
            return `${frame.fn} ${STATE_LABELS[frame.state ?? 'waiting']}${vars ? ` (${vars})` : ''}${returns}`;
          })
          .join('; ')}`;

  return (
    <Box>
      <Box role="img" aria-label={description} data-testid="call-stack">
        {frames.length === 0 ? (
          <Flex align="center" justify="center" mih={250}>
            <Text fz="sm" c="dimmed">
              Pilha vazia
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" gap={space.sm} style={{ maxWidth: 520, margin: '0 auto' }}>
            {ordered.length > 1 ? (
              <Text
                fz={font.micro}
                tt="uppercase"
                ta="right"
                style={{ color: vizVar.dim, letterSpacing: '0.14em' }}
              >
                topo da pilha
              </Text>
            ) : null}
            {ordered.map((frame) => (
              <Frame key={frame.id} frame={frame} reducedMotion={reducedMotion} />
            ))}
          </Flex>
        )}
      </Box>

      {state?.result ? (
        <Flex justify="center" mt={space.sm}>
          <Flex
            gap={space.sm}
            align="baseline"
            px={space.md}
            py={space.xs}
            style={{
              border: `1px solid ${vizVar.accentLine}`,
              borderRadius: radius.pill,
              background: vizVar.accentSoft,
            }}
          >
            <Text fz={font.micro} tt="uppercase" style={{ color: vizVar.muted }}>
              {state.result.label}
            </Text>
            <Text fz={font.small} ff="monospace" style={{ color: vizVar.ink }}>
              {state.result.value}
            </Text>
          </Flex>
        </Flex>
      ) : null}

      <ViewLegend items={legend} />
    </Box>
  );
}
