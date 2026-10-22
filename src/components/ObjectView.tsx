import type { CSSProperties } from 'react';
import {
  Badge,
  Box,
  Flex,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type {
  ObjectAttribute,
  ObjectClassBlueprint,
  ObjectExceptionState,
  ObjectInstance,
  ObjectItemState,
  ObjectMethod,
  ObjectPointer,
  ObjectState,
  ObjectVisibility,
} from '@/engine/types';
import { font, radius, space, transition, vizVar } from '@/theme';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BoxIcon,
  LockIcon,
  UnlockIcon,
} from './icons';
import { ViewLegend } from './ViewLegend';

export interface ObjectViewProps {
  state?: ObjectState;
}

function visibilityIcon(visibility?: ObjectVisibility) {
  if (visibility === 'private') {
    return <LockIcon size={12} style={{ color: vizVar.dim }} />;
  }
  if (visibility === 'protected') {
    return <LockIcon size={12} style={{ color: vizVar.purple }} />;
  }
  return <UnlockIcon size={12} style={{ color: vizVar.accent }} />;
}

function attributeItemStyle(state?: ObjectItemState): CSSProperties {
  switch (state) {
    case 'write':
      return {
        borderColor: vizVar.accent,
        background: `linear-gradient(90deg, ${vizVar.accentSoft}, transparent)`,
        boxShadow: `0 0 0 1px ${vizVar.accentSoft}`,
      };
    case 'read':
    case 'active':
      return {
        borderColor: vizVar.accentLine,
        background: `linear-gradient(90deg, color-mix(in srgb, ${vizVar.accentSoft} 40%, transparent), transparent)`,
      };
    default:
      return {
        borderColor: vizVar.line,
        background: 'transparent',
      };
  }
}

function BlueprintCard({ blueprint, activeMethod }: { blueprint: ObjectClassBlueprint; activeMethod?: string }) {
  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      style={{
        background: vizVar.surface2,
        borderColor: blueprint.state === 'active' ? vizVar.accentLine : vizVar.line2,
        display: 'flex',
        flexDirection: 'column',
        gap: space.xs,
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap" pb={4} style={{ borderBottom: `1px solid ${vizVar.line}` }}>
        <Group gap={6} align="center">
          <BoxIcon size={14} style={{ color: 'var(--subject-accent, var(--viz-accent))' }} />
          <Text fz={font.small} fw={700} ff="monospace" style={{ color: vizVar.ink }}>
            class {blueprint.name}
          </Text>
        </Group>
        {blueprint.baseClass && (
          <Badge size="xs" variant="outline" color="gray" radius="sm">
            : public {blueprint.baseClass}
          </Badge>
        )}
      </Group>

      {/* Atributos do molde */}
      {blueprint.attributes && blueprint.attributes.length > 0 && (
        <Stack gap={2} pt={2}>
          <Text fz={font.micro} fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.08em' }}>
            Atributos
          </Text>
          {blueprint.attributes.map((attr, idx) => (
            <Group
              key={idx}
              justify="space-between"
              align="center"
              px={6}
              py={3}
              style={{
                borderRadius: radius.xs,
                background: vizVar.surface3,
                border: `1px solid ${vizVar.line}`,
              }}
            >
              <Group gap={6} align="center">
                {visibilityIcon(attr.visibility)}
                <Text fz={font.micro} ff="monospace" style={{ color: vizVar.ink2 }}>
                  {attr.name}
                </Text>
              </Group>
              {attr.type && (
                <Text fz={font.micro} ff="monospace" c="dimmed">
                  {attr.type}
                </Text>
              )}
            </Group>
          ))}
        </Stack>
      )}

      {/* Métodos do molde */}
      {blueprint.methods && blueprint.methods.length > 0 && (
        <Stack gap={2} pt={2}>
          <Text fz={font.micro} fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.08em' }}>
            Métodos
          </Text>
          {blueprint.methods.map((method: ObjectMethod, idx: number) => {
            const isActive = activeMethod === method.name || method.state === 'active';
            return (
              <Group
                key={idx}
                justify="space-between"
                align="center"
                px={6}
                py={3}
                style={{
                  borderRadius: radius.xs,
                  background: isActive ? vizVar.accentSoft : vizVar.surface3,
                  border: `1px solid ${isActive ? vizVar.accentLine : vizVar.line}`,
                  transition: `all ${transition.fast} ease`,
                }}
              >
                <Group gap={6} align="center">
                  {visibilityIcon(method.visibility)}
                  <Text
                    fz={font.micro}
                    ff="monospace"
                    fw={isActive ? 600 : 400}
                    style={{ color: isActive ? vizVar.ink : vizVar.ink2 }}
                  >
                    {method.name}({method.params ?? ''})
                  </Text>
                </Group>
                <Group gap={4} align="center">
                  {method.isVirtual && (
                    <Badge size="xs" variant="light" color="yellow" radius="xs" fz={9}>
                      virtual
                    </Badge>
                  )}
                  {method.isOverride && (
                    <Badge size="xs" variant="light" color="blue" radius="xs" fz={9}>
                      override
                    </Badge>
                  )}
                  {method.returnType && (
                    <Text fz={font.micro} ff="monospace" c="dimmed">
                      : {method.returnType}
                    </Text>
                  )}
                </Group>
              </Group>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

function InstanceCard({ instance }: { instance: ObjectInstance }) {
  const reducedMotion = useReducedMotion();

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      style={{
        background: vizVar.surface2,
        borderColor: instance.state === 'write' ? vizVar.accent : vizVar.line2,
        boxShadow: instance.state === 'write' ? `0 0 16px -4px ${vizVar.accent}` : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: space.xs,
        transition: reducedMotion ? 'none' : `all ${transition.fast} ease`,
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap" pb={4} style={{ borderBottom: `1px solid ${vizVar.line}` }}>
        <Group gap={6} align="center">
          <Box
            w={8}
            h={8}
            style={{
              borderRadius: radius.pill,
              background: instance.state === 'write' ? vizVar.accent : vizVar.line3,
            }}
          />
          <Text fz={font.small} fw={700} ff="monospace" style={{ color: vizVar.ink }}>
            {instance.label || instance.id}
          </Text>
        </Group>
        <Badge size="xs" variant="filled" color="dark" radius="sm" style={{ border: `1px solid ${vizVar.line2}` }}>
          instância : {instance.className}
        </Badge>
      </Group>

      <Stack gap={3}>
        <Text fz={font.micro} fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.08em' }}>
          Estado Interno (Atributos)
        </Text>
        {instance.attributes.map((attr: ObjectAttribute, idx: number) => {
          const itemStyle = attributeItemStyle(attr.state);
          const hasValue = attr.value !== undefined && attr.value !== null && attr.value !== '';
          const displayValue = hasValue ? (typeof attr.value === 'string' ? `"${attr.value}"` : String(attr.value)) : '—';

          return (
            <Group
              key={idx}
              justify="space-between"
              align="center"
              px={8}
              py={4}
              style={{
                borderRadius: radius.xs,
                border: '1px solid',
                ...itemStyle,
                transition: reducedMotion ? 'none' : `all ${transition.fast} ease`,
              }}
            >
              <Group gap={6} align="center">
                {visibilityIcon(attr.visibility)}
                <Text fz={font.micro} ff="monospace" style={{ color: vizVar.ink2 }}>
                  {attr.name}
                </Text>
              </Group>

              <Group gap={6} align="center">
                <Text
                  fz={font.micro}
                  ff="monospace"
                  fw={attr.state === 'write' ? 700 : 500}
                  style={{
                    color: attr.state === 'write' ? vizVar.accent : hasValue ? vizVar.ink : vizVar.dim,
                  }}
                >
                  {displayValue}
                </Text>
                {attr.state === 'write' && (
                  <Badge size="xs" variant="filled" color="yellow" radius="xs" fz={9}>
                    gravado
                  </Badge>
                )}
                {attr.state === 'read' && (
                  <Badge size="xs" variant="outline" color="yellow" radius="xs" fz={9}>
                    lido
                  </Badge>
                )}
              </Group>
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
}

function PointerCard({ pointer }: { pointer: ObjectPointer }) {
  return (
    <Paper
      withBorder
      radius="md"
      px="md"
      py="xs"
      style={{
        background: `linear-gradient(90deg, color-mix(in srgb, ${vizVar.surface3} 90%, ${vizVar.accentSoft}), ${vizVar.surface2})`,
        borderColor: vizVar.accentLine,
      }}
    >
      <Flex align="center" justify="space-between" wrap="wrap" gap="sm">
        <Group gap="xs" align="center">
          <Badge size="sm" variant="outline" color="yellow" radius="sm">
            ponteiro base
          </Badge>
          <Text fz={font.small} ff="monospace" fw={700} style={{ color: vizVar.ink }}>
            {pointer.name}
          </Text>
        </Group>

        <Group gap="xs" align="center">
          <Text fz={font.tiny} c="dimmed">
            aponta para
          </Text>
          <ArrowRightIcon size={14} style={{ color: vizVar.accent }} />
          <Badge size="sm" variant="filled" color="yellow" radius="sm">
            {pointer.targetLabel || (pointer.targetId ? `&${pointer.targetId}` : 'nullptr')}
          </Badge>
        </Group>
      </Flex>
    </Paper>
  );
}

function ExceptionBlock({ exception }: { exception: ObjectExceptionState }) {
  const stages: Array<{ key: ObjectExceptionState['stage']; label: string }> = [
    { key: 'try', label: 'try { ... }' },
    { key: 'throw', label: 'throw' },
    { key: 'catch', label: 'catch (e) { ... }' },
  ];

  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      style={{
        background: vizVar.surface2,
        borderColor: exception.stage === 'throw' ? vizVar.danger : vizVar.line2,
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Group gap={6} align="center">
            <AlertTriangleIcon
              size={15}
              style={{
                color: exception.stage === 'throw' ? vizVar.danger : vizVar.accent,
              }}
            />
            <Text fz={font.small} fw={700} style={{ color: vizVar.ink }}>
              Fluxo de Tratamento de Exceções
            </Text>
          </Group>
          {exception.errorType && (
            <Badge size="xs" color="red" variant="filled" radius="sm">
              {exception.errorType}
            </Badge>
          )}
        </Group>

        <Flex gap="xs" align="center" wrap="wrap">
          {stages.map((stg, idx) => {
            const isCurrent = exception.stage === stg.key || (stg.key === 'catch' && exception.stage === 'handled');
            const isThrow = stg.key === 'throw';

            return (
              <Flex key={stg.key} align="center" gap="xs">
                {idx > 0 && <ArrowRightIcon size={12} style={{ color: vizVar.line3 }} />}
                <Paper
                  withBorder
                  px="sm"
                  py={4}
                  radius="sm"
                  style={{
                    background: isCurrent
                      ? isThrow
                        ? 'color-mix(in srgb, var(--viz-danger) 18%, transparent)'
                        : vizVar.accentSoft
                      : vizVar.surface3,
                    borderColor: isCurrent
                      ? isThrow
                        ? vizVar.danger
                        : vizVar.accent
                      : vizVar.line,
                  }}
                >
                  <Text
                    fz={font.micro}
                    ff="monospace"
                    fw={isCurrent ? 700 : 500}
                    style={{
                      color: isCurrent
                        ? isThrow
                          ? vizVar.danger
                          : vizVar.accent
                        : vizVar.muted,
                    }}
                  >
                    {stg.label}
                  </Text>
                </Paper>
              </Flex>
            );
          })}
        </Flex>

        {exception.message && (
          <Group gap="xs" pt={2} px={4}>
            <Text fz={font.micro} c="dimmed">
              Mensagem de erro:
            </Text>
            <Text fz={font.micro} ff="monospace" fw={600} style={{ color: vizVar.danger }}>
              &quot;{exception.message}&quot;
            </Text>
            {exception.bypassed && (
              <Badge size="xs" variant="outline" color="red" radius="xs">
                fluxo normal do try cancelado
              </Badge>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}

const LEGEND = [
  { key: 'private', label: 'privado (🔒)', color: vizVar.dim },
  { key: 'public', label: 'público (🌐)', color: vizVar.ink2 },
  { key: 'write', label: 'escrita / alterado', color: vizVar.accent },
  { key: 'virtual', label: 'virtual / override', color: vizVar.purple },
] as const;

export function ObjectView({ state }: ObjectViewProps) {
  if (
    !state ||
    (!state.blueprints?.length &&
      !state.instances?.length &&
      !state.exception &&
      !state.call &&
      !state.pointer)
  ) {
    return (
      <Box mih={250} display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text fz="sm" c="dimmed">
          Nenhum objeto em memória
        </Text>
      </Box>
    );
  }

  const { blueprints, instances, pointer, call, exception } = state;
  const activeMethodName = call?.target?.split('(')[0]?.split('.')?.pop()?.split('->')?.pop();

  return (
    <Box>
      <Stack gap="md" pt="xs" pb="sm">
        {/* Banner de Chamada / Despacho Ativo */}
        {call && (
          <Paper
            withBorder
            radius="md"
            px="md"
            py="xs"
            style={{
              background: `linear-gradient(90deg, ${vizVar.accentSoft}, ${vizVar.surface2})`,
              borderColor: vizVar.accentLine,
            }}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap="xs">
              <Group gap="xs" align="center">
                <Badge size="xs" variant="filled" color="yellow" radius="sm">
                  executando método
                </Badge>
                <Text fz={font.small} ff="monospace" fw={700} style={{ color: vizVar.ink }}>
                  {call.target}
                </Text>
              </Group>

              {call.dispatchedTo && (
                <Group gap="xs" align="center">
                  <Text fz={font.micro} c="dimmed">
                    despacho dinâmico:
                  </Text>
                  <Badge size="xs" variant="light" color="blue" radius="sm" ff="monospace">
                    ➔ {call.dispatchedTo}
                  </Badge>
                </Group>
              )}

              {call.params && Object.keys(call.params).length > 0 && (
                <Group gap={6} align="center">
                  <Text fz={font.micro} c="dimmed">
                    parâmetros:
                  </Text>
                  {Object.entries(call.params).map(([k, val]) => (
                    <Badge key={k} size="xs" variant="outline" color="gray" radius="xs" ff="monospace">
                      {k} = {typeof val === 'string' ? `"${val}"` : val}
                    </Badge>
                  ))}
                </Group>
              )}
            </Flex>
          </Paper>
        )}

        {/* Rastreador de Exceção */}
        {exception && <ExceptionBlock exception={exception} />}

        {/* Ponteiro Polimórfico */}
        {pointer && <PointerCard pointer={pointer} />}

        {/* Grade com Moldes (Classes) e Instâncias (Objetos) */}
        <SimpleGrid cols={{ base: 1, sm: blueprints?.length && instances?.length ? 2 : 1 }} spacing="md">
          {blueprints && blueprints.length > 0 && (
            <Stack gap="xs">
              <Text fz={font.micro} fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.1em' }}>
                Molde / Definição da Classe
              </Text>
              {blueprints.map((bp: ObjectClassBlueprint) => (
                <BlueprintCard key={bp.name} blueprint={bp} activeMethod={activeMethodName} />
              ))}
            </Stack>
          )}

          {instances && instances.length > 0 && (
            <Stack gap="xs">
              <Text fz={font.micro} fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.1em' }}>
                Instâncias em Memória (Objetos)
              </Text>
              {instances.map((inst: ObjectInstance) => (
                <InstanceCard key={inst.id} instance={inst} />
              ))}
            </Stack>
          )}
        </SimpleGrid>

        <ViewLegend items={[...LEGEND]} />
      </Stack>
    </Box>
  );
}
