import { useState } from 'react';
import { Box, Flex, Group, SegmentedControl, Stack, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { LoopPhase, LoopState } from '@/engine/types';
import { font, mono, radius, space, transition, vizVar } from '@/theme';

const PHASES: { id: LoopPhase; label: string }[] = [
  { id: 'init', label: 'Inicialização' },
  { id: 'check', label: 'Teste Condicional' },
  { id: 'body', label: 'Corpo do Laço' },
  { id: 'update', label: 'Atualização' },
  { id: 'end', label: 'Término' },
];

const STORAGE_KEY = 'visualize-it:loop-view-mode';
type LoopMode = 'squares' | 'dashboard';

export function LoopView({ state }: { state?: LoopState }) {
  const reducedMotion = useReducedMotion();

  const [mode, setMode] = useState<LoopMode>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'dashboard' || saved === 'squares') return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'squares';
  });

  const handleModeChange = (val: string) => {
    const next = val as LoopMode;
    setMode(next);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // Ignore
    }
  };

  if (!state) {
    return (
      <Flex align="center" justify="center" mih={220} p="md">
        <Text fz="sm" c="dimmed">
          Aguardando execução do laço
        </Text>
      </Flex>
    );
  }

  const { phase, iteration, innerIteration, condition, accumulator } = state;
  const currentPhase = phase ?? 'init';

  const isNested = Boolean(innerIteration);
  const currentI = iteration?.current ?? 1;
  const totalI = iteration?.total ?? 5;
  const currentJ = innerIteration?.current ?? 1;

  return (
    <Box
      role="region"
      aria-label="Visualizador do laço de repetição"
      py="md"
      px="xs"
      style={{ display: 'flex', flexDirection: 'column', gap: space.md }}
    >
      {/* 1. Barra Superior: Fases do Ciclo de Vida + Seletor de Modo */}
      <Flex
        p="xs"
        gap={10}
        align="center"
        justify="space-between"
        wrap="wrap"
        style={{
          background: 'color-mix(in srgb, var(--viz-surface-2) 65%, transparent)',
          border: `1px solid ${vizVar.line}`,
          borderRadius: radius.md,
        }}
      >
        <Flex
          gap={6}
          align="center"
          wrap="wrap"
          role="group"
          aria-label="Fase atual do laço"
          style={{ flex: 1 }}
        >
          {PHASES.map((p) => {
            const isActive = p.id === currentPhase;
            return (
              <Box
                key={p.id}
                px={10}
                py={4}
                style={{
                  borderRadius: radius.sm,
                  background: isActive
                    ? 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 16%, var(--viz-surface-3))'
                    : 'transparent',
                  border: `1px solid ${
                    isActive
                      ? 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 50%, transparent)'
                      : 'transparent'
                  }`,
                  color: isActive ? vizVar.ink : vizVar.dim,
                  fontWeight: isActive ? 600 : 400,
                  fontSize: font.micro,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  transition: reducedMotion ? 'none' : `all ${transition.base}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isActive ? (
                  <Box
                    w={6}
                    h={6}
                    style={{
                      borderRadius: radius.pill,
                      background: 'var(--subject-accent, var(--viz-accent))',
                      boxShadow: '0 0 6px var(--subject-accent, var(--viz-accent))',
                    }}
                  />
                ) : null}
                <span>{p.label}</span>
              </Box>
            );
          })}
        </Flex>

        {/* Seletor de Modo: Quadrados vs Dashboard */}
        <SegmentedControl
          value={mode}
          onChange={handleModeChange}
          size="xs"
          data={[
            { label: 'Quadrados', value: 'squares' },
            { label: 'Dashboard', value: 'dashboard' },
          ]}
          aria-label="Modo de visualização do laço"
        />
      </Flex>

      {/* 2. Visualização Selecionada */}
      {mode === 'squares' ? (
        <Stack gap={space.md}>
          {/* Faixa Compacta de Contexto da Condição e Acumulador */}
          <Flex
            px="md"
            py="xs"
            align="center"
            justify="space-between"
            wrap="wrap"
            gap={12}
            style={{
              background: vizVar.surface2,
              border: `1px solid ${
                condition?.satisfied === true
                  ? 'color-mix(in srgb, var(--viz-green, var(--viz-accent)) 40%, transparent)'
                  : condition?.satisfied === false
                    ? 'color-mix(in srgb, var(--viz-danger) 40%, transparent)'
                    : vizVar.line2
              }`,
              borderRadius: radius.md,
            }}
          >
            {/* Lado Esquerdo: Condição Ativa */}
            <Group gap={8} wrap="wrap">
              <Text fz={font.micro} fw={700} tt="uppercase" c="dimmed">
                Condição:
              </Text>
              <Text fz="sm" fw={600} style={{ color: vizVar.ink, fontFamily: mono }}>
                {condition?.expression ?? '—'}
              </Text>
              {condition?.evaluation ? (
                <Text fz="sm" c="dimmed" style={{ fontFamily: mono }}>
                  ({condition.evaluation})
                </Text>
              ) : null}
              {condition?.satisfied !== undefined && condition?.satisfied !== null ? (
                <Box
                  px={8}
                  py={2}
                  style={{
                    borderRadius: radius.pill,
                    background: condition.satisfied
                      ? 'color-mix(in srgb, var(--viz-green, var(--viz-accent)) 16%, transparent)'
                      : 'color-mix(in srgb, var(--viz-danger) 16%, transparent)',
                    border: `1px solid ${
                      condition.satisfied
                        ? 'color-mix(in srgb, var(--viz-green, var(--viz-accent)) 40%, transparent)'
                        : 'color-mix(in srgb, var(--viz-danger) 40%, transparent)'
                    }`,
                    color: condition.satisfied
                      ? 'var(--subject-accent, var(--viz-accent))'
                      : vizVar.danger,
                    fontSize: font.micro,
                    fontWeight: 700,
                  }}
                >
                  {condition.satisfied ? 'Verdadeiro ✅' : 'Falso ❌'}
                </Box>
              ) : null}
            </Group>

            {/* Lado Direito: Acumulador */}
            {accumulator ? (
              <Group gap={8}>
                <Text fz={font.micro} fw={700} tt="uppercase" c="dimmed">
                  {accumulator.label}:
                </Text>
                <Text fz={font.lead} fw={700} style={{ color: vizVar.ink, fontFamily: mono }}>
                  {accumulator.value}
                </Text>
                {accumulator.delta ? (
                  <Box
                    px={6}
                    py={2}
                    style={{
                      borderRadius: radius.sm,
                      background: 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 16%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 34%, transparent)',
                      color: 'var(--subject-accent, var(--viz-accent))',
                      fontSize: font.micro,
                      fontWeight: 700,
                      fontFamily: mono,
                    }}
                  >
                    {accumulator.delta}
                  </Box>
                ) : null}
              </Group>
            ) : null}
          </Flex>

          {/* Área Principal de Quadrados de Iteração */}
          {isNested ? (
            /* Grade Triangular 2D para Laço Aninhado (for.ts) */
            <Box
              p="md"
              style={{
                background: vizVar.surface2,
                border: `1px solid ${vizVar.line2}`,
                borderRadius: radius.md,
              }}
            >
              <Text fz={font.micro} fw={600} tt="uppercase" c="dimmed" mb="sm">
                Grade de Iterações Aninhadas (Linhas: i, Colunas: j)
              </Text>
              <Stack gap={8}>
                {Array.from({ length: totalI }).map((_, rIdx) => {
                  const r = rIdx + 1; // i atual desta linha
                  const isOuterActive = currentI === r && currentPhase !== 'end';
                  const isOuterCompleted = currentI > r || currentPhase === 'end';

                  return (
                    <Flex key={r} align="center" gap={10} wrap="nowrap">
                      {/* Rótulo da Linha (Laço Externo) */}
                      <Box
                        w={54}
                        style={{
                          flexShrink: 0,
                          textAlign: 'right',
                          fontFamily: mono,
                          fontSize: font.tiny,
                          fontWeight: isOuterActive ? 700 : 500,
                          color: isOuterActive
                            ? 'var(--subject-accent, var(--viz-accent))'
                            : isOuterCompleted
                              ? vizVar.muted
                              : vizVar.dim,
                        }}
                      >
                        i = {r}
                      </Box>

                      {/* Quadrados do Laço Interno (j = 1..i) */}
                      <Flex gap={8} wrap="wrap">
                        {Array.from({ length: r }).map((__, cIdx) => {
                          const c = cIdx + 1; // j atual
                          const isCellActive =
                            isOuterActive && currentJ === c && currentPhase === 'body';
                          const isCellCompleted =
                            currentI > r ||
                            currentPhase === 'end' ||
                            (isOuterActive && currentJ > c) ||
                            (isOuterActive && currentJ === c && currentPhase !== 'body');
                          const isCellPending = !isCellActive && !isCellCompleted;

                          return (
                            <Box
                              key={c}
                              w={62}
                              h={62}
                              p={4}
                              style={{
                                borderRadius: radius.sm,
                                border: `1.5px ${isCellPending ? 'dashed' : 'solid'}`,
                                borderColor: isCellActive
                                  ? 'var(--subject-accent, var(--viz-accent))'
                                  : isCellCompleted
                                    ? 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 45%, var(--viz-line2))'
                                    : vizVar.line2,
                                background: isCellActive
                                  ? 'linear-gradient(180deg, var(--viz-accent-soft), color-mix(in srgb, var(--viz-surface-2) 70%, transparent))'
                                  : isCellCompleted
                                    ? 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 10%, var(--viz-surface-3))'
                                    : 'transparent',
                                boxShadow: isCellActive
                                  ? '0 0 0 3px var(--viz-accent-soft), 0 8px 16px -8px var(--viz-accent)'
                                  : undefined,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: reducedMotion ? 'none' : `all ${transition.base}`,
                              }}
                            >
                              <Text
                                fz={font.micro}
                                fw={600}
                                style={{
                                  color: isCellActive
                                    ? 'var(--subject-accent, var(--viz-accent))'
                                    : isCellCompleted
                                      ? vizVar.muted
                                      : vizVar.dim,
                                  fontFamily: mono,
                                }}
                              >
                                j = {c}
                              </Text>

                              <Text
                                fz="xs"
                                fw={700}
                                style={{
                                  fontFamily: mono,
                                  color: isCellActive
                                    ? vizVar.ink
                                    : isCellCompleted
                                      ? vizVar.ink2
                                      : vizVar.dim,
                                }}
                              >
                                {isCellPending ? '—' : `+${c}`}
                              </Text>

                              <Text
                                fz={9}
                                style={{
                                  color: isCellActive
                                    ? 'var(--subject-accent, var(--viz-accent))'
                                    : isCellCompleted
                                      ? vizVar.dim
                                      : vizVar.faint,
                                }}
                              >
                                {isCellActive ? 'executando' : isCellCompleted ? '✓ feito' : 'espera'}
                              </Text>
                            </Box>
                          );
                        })}
                      </Flex>
                    </Flex>
                  );
                })}
              </Stack>
            </Box>
          ) : (
            /* Fila 1D para Laços Simples (while, do-while) */
            <Box
              p="md"
              style={{
                background: vizVar.surface2,
                border: `1px solid ${vizVar.line2}`,
                borderRadius: radius.md,
                overflowX: 'auto',
              }}
              className="scroll-fade-x"
            >
              <Text fz={font.micro} fw={600} tt="uppercase" c="dimmed" mb="sm">
                Fila de Iterações do Laço
              </Text>
              <Flex gap={10} align="center" wrap="nowrap" pb="xs">
                {Array.from({ length: totalI }).map((_, idx) => {
                  const stepNum = idx + 1;
                  const isActive = currentI === stepNum && currentPhase !== 'end';
                  const isCompleted = currentI > stepNum || currentPhase === 'end';
                  const isPending = !isActive && !isCompleted;

                  return (
                    <Box
                      key={stepNum}
                      w={76}
                      h={80}
                      p={6}
                      style={{
                        flexShrink: 0,
                        borderRadius: radius.md,
                        border: `1.5px ${isPending ? 'dashed' : 'solid'}`,
                        borderColor: isActive
                          ? 'var(--subject-accent, var(--viz-accent))'
                          : isCompleted
                            ? 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 45%, var(--viz-line2))'
                            : vizVar.line2,
                        background: isActive
                          ? 'linear-gradient(180deg, var(--viz-accent-soft), color-mix(in srgb, var(--viz-surface-2) 70%, transparent))'
                          : isCompleted
                            ? 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 10%, var(--viz-surface-3))'
                            : 'transparent',
                        boxShadow: isActive
                          ? '0 0 0 3px var(--viz-accent-soft), 0 8px 18px -10px var(--viz-accent)'
                          : undefined,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: reducedMotion ? 'none' : `all ${transition.base}`,
                      }}
                    >
                      <Text
                        fz={font.micro}
                        fw={700}
                        style={{
                          fontFamily: mono,
                          color: isActive
                            ? 'var(--subject-accent, var(--viz-accent))'
                            : isCompleted
                              ? vizVar.muted
                              : vizVar.dim,
                        }}
                      >
                        i = {stepNum}
                      </Text>

                      <Text
                        fz="sm"
                        fw={700}
                        style={{
                          fontFamily: mono,
                          color: isActive ? vizVar.ink : isCompleted ? vizVar.ink2 : vizVar.dim,
                        }}
                      >
                        {isPending ? '—' : `+${stepNum}`}
                      </Text>

                      <Box
                        px={4}
                        py={1}
                        style={{
                          borderRadius: radius.xs,
                          background: isActive
                            ? 'var(--subject-accent, var(--viz-accent))'
                            : isCompleted
                              ? 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 25%, transparent)'
                              : 'transparent',
                          color: isActive
                            ? 'var(--subject-accent-ink, var(--viz-accent-ink))'
                            : vizVar.dim,
                          fontSize: 9.5,
                          fontWeight: 700,
                          lineHeight: 1.1,
                        }}
                      >
                        {isActive ? 'ATIVO' : isCompleted ? '✓ OK' : 'espera'}
                      </Box>
                    </Box>
                  );
                })}

                {/* Caixa Terminal com o Teste de Saída Falso */}
                <Box
                  w={76}
                  h={80}
                  p={6}
                  style={{
                    flexShrink: 0,
                    borderRadius: radius.md,
                    border: '1.5px solid',
                    borderColor:
                      currentPhase === 'end'
                        ? 'color-mix(in srgb, var(--viz-danger) 50%, var(--viz-line2))'
                        : vizVar.line2,
                    background:
                      currentPhase === 'end'
                        ? 'color-mix(in srgb, var(--viz-danger) 12%, var(--viz-surface-3))'
                        : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text fz={font.micro} fw={700} c={currentPhase === 'end' ? 'danger' : 'dimmed'}>
                    Saída
                  </Text>
                  <Text
                    fz="xs"
                    fw={700}
                    style={{
                      fontFamily: mono,
                      color: currentPhase === 'end' ? vizVar.danger : vizVar.dim,
                    }}
                  >
                    i &gt; n
                  </Text>
                  <Box
                    px={4}
                    py={1}
                    style={{
                      borderRadius: radius.xs,
                      background:
                        currentPhase === 'end'
                          ? 'color-mix(in srgb, var(--viz-danger) 25%, transparent)'
                          : 'transparent',
                      color: currentPhase === 'end' ? vizVar.danger : vizVar.dim,
                      fontSize: 9.5,
                      fontWeight: 700,
                    }}
                  >
                    {currentPhase === 'end' ? '❌ FIM' : 'espera'}
                  </Box>
                </Box>
              </Flex>
            </Box>
          )}
        </Stack>
      ) : (
        /* Modo Dashboard: 3 Cards Analíticos */
        <Flex gap={space.md} wrap="wrap" align="stretch">
          {/* Card 1: Rastreio de Iteração */}
          <Box
            p="md"
            style={{
              flex: '1 1 200px',
              minWidth: 200,
              background: vizVar.surface2,
              border: `1px solid ${vizVar.line2}`,
              borderRadius: radius.md,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Text
              fz={font.micro}
              fw={600}
              tt="uppercase"
              c="dimmed"
              style={{ letterSpacing: '0.12em' }}
            >
              Iteração
            </Text>

            <Stack gap={6} my="sm">
              {iteration ? (
                <Box>
                  <Text fz={font.lead} fw={700} style={{ color: vizVar.ink, fontFamily: mono }}>
                    {iteration.label ??
                      (iteration.total !== undefined
                        ? `${iteration.current} de ${iteration.total}`
                        : `${iteration.current}`)}
                  </Text>
                  {iteration.total && iteration.total > 0 ? (
                    <Group gap={4} mt={6}>
                      {Array.from({ length: Math.min(iteration.total, 12) }).map((_, idx) => {
                        const stepNum = idx + 1;
                        const isPast = stepNum < iteration.current;
                        const isCurrent = stepNum === iteration.current;
                        return (
                          <Box
                            key={idx}
                            w={12}
                            h={6}
                            style={{
                              borderRadius: radius.xs,
                              background: isCurrent
                                ? 'var(--subject-accent, var(--viz-accent))'
                                : isPast
                                  ? 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 35%, transparent)'
                                  : vizVar.line2,
                              boxShadow: isCurrent
                                ? '0 0 4px var(--subject-accent, var(--viz-accent))'
                                : undefined,
                              transition: reducedMotion ? 'none' : `background ${transition.base}`,
                            }}
                          />
                        );
                      })}
                    </Group>
                  ) : null}
                </Box>
              ) : (
                <Text fz="sm" c="dimmed">
                  Não iniciada
                </Text>
              )}

              {/* Suporte a Laço Interno (ex: for aninhado) */}
              {innerIteration ? (
                <Box mt="xs" pt="xs" style={{ borderTop: `1px dashed ${vizVar.line2}` }}>
                  <Text fz={font.micro} fw={500} c="dimmed" tt="uppercase">
                    Laço Interno
                  </Text>
                  <Text fz="sm" fw={600} style={{ color: vizVar.ink, fontFamily: mono }}>
                    {innerIteration.label ??
                      (innerIteration.total !== undefined
                        ? `${innerIteration.current} de ${innerIteration.total}`
                        : `${innerIteration.current}`)}
                  </Text>
                </Box>
              ) : null}
            </Stack>

            <Text fz={font.micro} c="dimmed">
              {innerIteration ? 'Laços aninhados' : 'Ciclo de repetição ativo'}
            </Text>
          </Box>

          {/* Card 2: Teste Condicional */}
          <Box
            p="md"
            style={{
              flex: '1.4 1 260px',
              minWidth: 240,
              background: vizVar.surface2,
              border: `1px solid ${
                condition?.satisfied === true
                  ? 'color-mix(in srgb, var(--viz-green, var(--viz-accent)) 40%, transparent)'
                  : condition?.satisfied === false
                    ? 'color-mix(in srgb, var(--viz-danger) 40%, transparent)'
                    : vizVar.line2
              }`,
              borderRadius: radius.md,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: reducedMotion ? 'none' : `border-color ${transition.base}`,
            }}
          >
            <Flex justify="space-between" align="center" gap={8}>
              <Text
                fz={font.micro}
                fw={600}
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: '0.12em' }}
              >
                Teste Condicional
              </Text>
              {condition?.satisfied !== undefined && condition?.satisfied !== null ? (
                <Box
                  px={8}
                  py={2}
                  style={{
                    borderRadius: radius.pill,
                    background: condition.satisfied
                      ? 'color-mix(in srgb, var(--viz-green, var(--viz-accent)) 16%, transparent)'
                      : 'color-mix(in srgb, var(--viz-danger) 16%, transparent)',
                    border: `1px solid ${
                      condition.satisfied
                        ? 'color-mix(in srgb, var(--viz-green, var(--viz-accent)) 40%, transparent)'
                        : 'color-mix(in srgb, var(--viz-danger) 40%, transparent)'
                    }`,
                    color: condition.satisfied
                      ? 'var(--subject-accent, var(--viz-accent))'
                      : vizVar.danger,
                    fontSize: font.micro,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{condition.satisfied ? 'Verdadeiro ✅' : 'Falso ❌'}</span>
                </Box>
              ) : (
                <Box
                  px={8}
                  py={2}
                  style={{
                    borderRadius: radius.pill,
                    background: vizVar.surface3,
                    border: `1px solid ${vizVar.line}`,
                    color: vizVar.dim,
                    fontSize: font.micro,
                  }}
                >
                  <span>Aguardando</span>
                </Box>
              )}
            </Flex>

            <Stack gap={4} my="sm">
              {condition ? (
                <>
                  <Text fz={font.lead} fw={600} style={{ color: vizVar.ink, fontFamily: mono }}>
                    {condition.expression}
                  </Text>
                  {condition.evaluation ? (
                    <Text fz="sm" fw={500} style={{ color: vizVar.muted, fontFamily: mono }}>
                      Avaliação: <strong style={{ color: vizVar.ink }}>{condition.evaluation}</strong>
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text fz="sm" c="dimmed">
                  Nenhum teste ativo no momento.
                </Text>
              )}
            </Stack>

            <Text fz={font.micro} c="dimmed">
              {condition?.explanation ?? 'Avaliação booleana da guarda do laço.'}
            </Text>
          </Box>

          {/* Card 3: Acumulador Visual */}
          <Box
            p="md"
            style={{
              flex: '1 1 200px',
              minWidth: 190,
              background: vizVar.surface2,
              border: `1px solid ${vizVar.line2}`,
              borderRadius: radius.md,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Text
              fz={font.micro}
              fw={600}
              tt="uppercase"
              c="dimmed"
              style={{ letterSpacing: '0.12em' }}
            >
              {accumulator ? `Acumulador (${accumulator.label})` : 'Acumulador'}
            </Text>

            <Stack gap={4} my="sm">
              {accumulator ? (
                <Flex align="baseline" gap={8} wrap="wrap">
                  <Text fz={font.h2} fw={700} lh={1} style={{ color: vizVar.ink, fontFamily: mono }}>
                    {accumulator.value}
                  </Text>
                  {accumulator.delta ? (
                    <Box
                      px={6}
                      py={2}
                      style={{
                        borderRadius: radius.sm,
                        background: 'color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 16%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 34%, transparent)',
                        color: 'var(--subject-accent, var(--viz-accent))',
                        fontSize: font.micro,
                        fontWeight: 700,
                        fontFamily: mono,
                      }}
                    >
                      {accumulator.delta}
                    </Box>
                  ) : null}
                </Flex>
              ) : (
                <Text fz="sm" c="dimmed">
                  Sem acumulador
                </Text>
              )}

              {accumulator?.previousValue !== undefined ? (
                <Text fz={font.micro} c="dimmed" style={{ fontFamily: mono }}>
                  Anterior: {accumulator.previousValue}
                </Text>
              ) : null}
            </Stack>

            <Text fz={font.micro} c="dimmed">
              {accumulator?.delta ? 'Valor somado no passo atual' : 'Total acumulado'}
            </Text>
          </Box>
        </Flex>
      )}
    </Box>
  );
}
