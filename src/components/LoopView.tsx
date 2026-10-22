import { Box, Flex, Group, Stack, Text } from '@mantine/core';
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

export function LoopView({ state }: { state?: LoopState }) {
  const reducedMotion = useReducedMotion();

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

  return (
    <Box
      role="region"
      aria-label="Visualizador do laço de repetição"
      py="md"
      px="xs"
      style={{ display: 'flex', flexDirection: 'column', gap: space.md }}
    >
      {/* 1. Barra de Fases do Ciclo de Vida do Laço */}
      <Box
        p="xs"
        style={{
          background: 'color-mix(in srgb, var(--viz-surface-2) 65%, transparent)',
          border: `1px solid ${vizVar.line}`,
          borderRadius: radius.md,
        }}
      >
        <Flex
          gap={6}
          align="center"
          justify="space-between"
          wrap="wrap"
          role="group"
          aria-label="Fase atual do laço"
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
      </Box>

      {/* 2. Palco Principal: Cards de Estado */}
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
              <Box
                mt="xs"
                pt="xs"
                style={{ borderTop: `1px dashed ${vizVar.line2}` }}
              >
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

          <Text fz={font.micro} c={condition?.satisfied === false ? 'dimmed' : 'dimmed'}>
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
    </Box>
  );
}
