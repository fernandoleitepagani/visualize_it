import { Badge, Box, Flex, SimpleGrid, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { FileDiskLine, FileHandleStatus, FileRamVariable, FileStreamHandle, Step } from '@/engine/types';
import { font, radius, space, transition, vizVar } from '@/theme';
import { ViewLegend } from './ViewLegend';

interface Props {
  state?: Step;
}

const LEGEND = [
  { key: 'ram', label: 'RAM / Volátil', color: vizVar.purple },
  { key: 'disk', label: 'Disco / Persistente', color: vizVar.accent },
  { key: 'cursor', label: 'Seek Head (Cursor)', color: vizVar.accent },
  { key: 'read', label: 'Leitura (fscanf)', color: vizVar.purple },
  { key: 'write', label: 'Escrita (fprintf)', color: vizVar.accent },
  { key: 'flush', label: 'Flush (fclose)', color: vizVar.dim },
];

function getHandleStatusBadge(status: FileHandleStatus) {
  switch (status) {
    case 'open':
      return {
        label: 'FLUXO ABERTO',
        color: vizVar.accent,
        bg: vizVar.accentSoft,
        border: vizVar.accentLine,
      };
    case 'closed':
      return {
        label: 'FECHADO / LIBERADO',
        color: vizVar.muted,
        bg: vizVar.surface3,
        border: vizVar.line2,
      };
    case 'error_null':
      return {
        label: 'NULL / ERRO',
        color: vizVar.danger,
        bg: 'color-mix(in srgb, var(--viz-danger) 15%, transparent)',
        border: 'color-mix(in srgb, var(--viz-danger) 40%, transparent)',
      };
    default:
      return {
        label: 'NÃO INICIALIZADO',
        color: vizVar.dim,
        bg: vizVar.surface3,
        border: vizVar.line2,
      };
  }
}

function getModeBadge(mode?: string) {
  if (mode === 'w') {
    return { label: 'Modo "w" (Escrita/Criação)', color: vizVar.accent };
  }
  if (mode === 'r') {
    return { label: 'Modo "r" (Leitura sequencial)', color: vizVar.purple };
  }
  if (mode === 'a') {
    return { label: 'Modo "a" (Anexação)', color: vizVar.purple };
  }
  return null;
}

export function FileView({ state }: Props) {
  const reducedMotion = useReducedMotion();
  const file = state?.file;

  const motionTransition = reducedMotion
    ? undefined
    : `all ${transition.base} cubic-bezier(0.16, 1, 0.3, 1)`;

  if (!file) {
    return (
      <Box
        data-testid="file-view-empty"
        p={space.lg}
        style={{
          border: `1px dashed ${vizVar.line2}`,
          borderRadius: radius.md,
          background: vizVar.surface2,
          textAlign: 'center',
          color: vizVar.muted,
          fontFamily: 'monospace',
          fontSize: font.small,
        }}
      >
        Nenhum estado de arquivo disponível neste passo.
      </Box>
    );
  }

  const { ram, disk, stdout = [] } = file;
  const handle: FileStreamHandle = ram.handle ?? { name: 'f', status: 'unopened' };
  const variables: FileRamVariable[] = ram.variables ?? [];
  const statusBadge = getHandleStatusBadge(handle.status);
  const modeBadge = getModeBadge(handle.mode);

  return (
    <Box data-testid="file-view" style={{ display: 'flex', flexDirection: 'column', gap: space.md, width: '100%' }}>
      {/* Grid Principal: Memória RAM vs Armazenamento em Disco */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={space.md}>
        {/* ================= SEÇÃO RAM ================= */}
        <Box
          data-testid="file-view-ram"
          p={space.md}
          style={{
            background: vizVar.surface2,
            border: `1px solid ${handle.state === 'active' || handle.state === 'write' ? vizVar.purple : vizVar.line2}`,
            borderRadius: radius.md,
            display: 'flex',
            flexDirection: 'column',
            gap: space.sm,
            transition: motionTransition,
          }}
        >
          {/* Cabeçalho da Seção RAM */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={space.xs}>
            <Flex align="center" gap={space.xs}>
              <Text
                ff="monospace"
                fz={font.micro}
                fw={700}
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: vizVar.purple,
                }}
              >
                Memória RAM
              </Text>
              <Badge size="xs" variant="outline" color="gray" radius="sm">
                Volátil
              </Badge>
            </Flex>
            <Badge
              size="sm"
              radius="sm"
              style={{
                backgroundColor: statusBadge.bg,
                color: statusBadge.color,
                border: `1px solid ${statusBadge.border}`,
                fontFamily: 'monospace',
              }}
            >
              {statusBadge.label}
            </Badge>
          </Flex>

          {/* Bloco do Manipulador FILE *f */}
          <Box
            p={space.sm}
            style={{
              background: vizVar.surface3,
              border: `1px solid ${handle.state === 'write' || handle.state === 'active' ? vizVar.purple : vizVar.line}`,
              borderRadius: radius.sm,
              transition: motionTransition,
            }}
          >
            <Flex justify="space-between" align="flex-start" mb={space.xxs}>
              <Box>
                <Text ff="monospace" fz={font.tiny} c="dimmed">
                  Estrutura de Fluxo em RAM:
                </Text>
                <Text ff="monospace" fz={font.body} fw={700} c={vizVar.ink}>
                  FILE *{handle.name}
                </Text>
              </Box>
              {handle.address && (
                <Text ff="monospace" fz={font.tiny} c="dimmed" title="Endereço da estrutura na RAM">
                  addr: {handle.address}
                </Text>
              )}
            </Flex>

            {/* Metadados do Handle */}
            <Flex gap={space.xs} wrap="wrap" mt={space.xs} align="center">
              {modeBadge && (
                <Badge size="xs" variant="light" color="indigo" radius="sm">
                  {modeBadge.label}
                </Badge>
              )}
              {handle.targetFileName && handle.status === 'open' && (
                <Text ff="monospace" fz={font.tiny} c="dimmed">
                  ➔ Aponta para: <span style={{ color: vizVar.accent, fontWeight: 600 }}>{handle.targetFileName}</span>
                </Text>
              )}
            </Flex>
          </Box>

          {/* Buffer de I/O em RAM */}
          <Box
            p={space.sm}
            style={{
              background: ram.flushing ? vizVar.accentSoft : vizVar.surface3,
              border: `1px ${ram.flushing ? 'solid' : 'dashed'} ${ram.flushing ? vizVar.accent : vizVar.line2}`,
              borderRadius: radius.sm,
              transition: motionTransition,
            }}
          >
            <Flex justify="space-between" align="center">
              <Text ff="monospace" fz={font.tiny} c={ram.flushing ? vizVar.accent : 'dimmed'}>
                Buffer de E/S em RAM:
              </Text>
              {ram.flushing && (
                <Badge size="xs" variant="filled" color="orange" radius="sm">
                  FLUSH ⤓
                </Badge>
              )}
            </Flex>
            <Box mt={space.xxs}>
              {ram.buffer ? (
                <Text ff="monospace" fz={font.small} fw={600} c={vizVar.ink}>
                  {JSON.stringify(ram.buffer)}
                </Text>
              ) : (
                <Text ff="monospace" fz={font.tiny} c="dimmed" fs="italic">
                  [Buffer vazio / descarregado]
                </Text>
              )}
            </Box>
          </Box>

          {/* Variáveis Locais em RAM (ex: int x) */}
          <Box>
            <Text ff="monospace" fz={font.tiny} c="dimmed" mb={space.xxs}>
              Variáveis Locais:
            </Text>
            {variables.length > 0 ? (
              <Flex gap={space.xs} wrap="wrap">
                {variables.map((v) => {
                  const isRead = v.state === 'read';
                  const isWrite = v.state === 'write' || v.state === 'active';
                  const varBorder = isWrite ? vizVar.accent : isRead ? vizVar.purple : vizVar.line2;
                  const varBg = isWrite ? vizVar.accentSoft : isRead ? vizVar.purpleSoft : vizVar.surface3;

                  return (
                    <Box
                      key={v.name}
                      data-testid={`file-ram-var-${v.name}`}
                      px={space.sm}
                      py={space.xxs}
                      style={{
                        background: varBg,
                        border: `1px solid ${varBorder}`,
                        borderRadius: radius.sm,
                        minWidth: 90,
                        transition: motionTransition,
                      }}
                    >
                      <Text ff="monospace" fz={font.micro} c="dimmed">
                        {v.type} {v.name}
                      </Text>
                      <Text ff="monospace" fz={font.body} fw={700} c={isWrite ? vizVar.accent : isRead ? vizVar.purple : vizVar.ink}>
                        {String(v.value)}
                      </Text>
                    </Box>
                  );
                })}
              </Flex>
            ) : (
              <Text ff="monospace" fz={font.tiny} c="dimmed" fs="italic">
                Nenhuma variável adicional.
              </Text>
            )}
          </Box>
        </Box>

        {/* ================= SEÇÃO DISCO ================= */}
        <Box
          data-testid="file-view-disk"
          p={space.md}
          style={{
            background: vizVar.surface2,
            border: `1px solid ${disk.exists ? vizVar.accentLine : vizVar.line2}`,
            borderRadius: radius.md,
            display: 'flex',
            flexDirection: 'column',
            gap: space.sm,
            transition: motionTransition,
          }}
        >
          {/* Cabeçalho da Seção Disco */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={space.xs}>
            <Flex align="center" gap={space.xs}>
              <Text
                ff="monospace"
                fz={font.micro}
                fw={700}
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: vizVar.accent,
                }}
              >
                Armazenamento
              </Text>
              <Badge size="xs" variant="outline" color="orange" radius="sm">
                Disco / Persistente
              </Badge>
            </Flex>
            <Badge
              size="sm"
              radius="sm"
              style={{
                backgroundColor: disk.exists ? vizVar.accentSoft : vizVar.surface3,
                color: disk.exists ? vizVar.accent : vizVar.dim,
                border: `1px solid ${disk.exists ? vizVar.accentLine : vizVar.line2}`,
                fontFamily: 'monospace',
              }}
            >
              {disk.exists ? disk.name : 'Nenhum Arquivo'}
            </Badge>
          </Flex>

          {/* Bloco do Arquivo no Disco */}
          <Box
            p={space.sm}
            style={{
              background: vizVar.surface,
              border: `1px solid ${vizVar.line}`,
              borderRadius: radius.sm,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 180,
            }}
          >
            {/* Barra de título do arquivo */}
            <Flex justify="space-between" align="center" pb={space.xs} mb={space.xs} style={{ borderBottom: `1px solid ${vizVar.line2}` }}>
              <Flex align="center" gap={space.xs}>
                <Text ff="monospace" fz={font.tiny} fw={600} c={vizVar.accent}>
                  📄 {disk.name}
                </Text>
                <Text ff="monospace" fz={font.micro} c="dimmed">
                  ({disk.lines.length} {disk.lines.length === 1 ? 'linha' : 'linhas'})
                </Text>
              </Flex>
              {disk.cursorLine !== undefined && disk.cursorLine !== null && (
                <Badge size="xs" variant="filled" color="orange" radius="sm" data-testid="seek-head-indicator">
                  SEEK HEAD: {disk.eofReached ? 'EOF' : `L${disk.cursorLine}`}
                </Badge>
              )}
            </Flex>

            {/* Linhas do Arquivo com Indicador de Seek Head (Cursor) */}
            <Box style={{ display: 'flex', flexDirection: 'column', gap: space.xs, flex: 1 }}>
              {disk.lines.length === 0 ? (
                <Box
                  p={space.md}
                  style={{
                    textAlign: 'center',
                    border: `1px dashed ${vizVar.line}`,
                    borderRadius: radius.xs,
                    color: vizVar.dim,
                    fontFamily: 'monospace',
                    fontSize: font.tiny,
                    margin: 'auto 0',
                  }}
                >
                  {disk.exists ? '[Arquivo criado, 0 bytes gravados]' : '[Arquivo não existe no disco]'}
                </Box>
              ) : (
                disk.lines.map((line: FileDiskLine) => {
                  const isCursorHere = disk.cursorLine === line.number;
                  const isRead = line.state === 'read';
                  const isWrite = line.state === 'write';

                  const rowBorder = isCursorHere
                    ? vizVar.accent
                    : isWrite
                      ? vizVar.accentLine
                      : isRead
                        ? vizVar.purple
                        : vizVar.line2;

                  const rowBg = isCursorHere
                    ? vizVar.accentSoft
                    : isWrite
                      ? 'color-mix(in srgb, var(--viz-accent) 8%, var(--viz-surface-2))'
                      : isRead
                        ? vizVar.purpleSoft
                        : vizVar.surface2;

                  return (
                    <Flex
                      key={line.number}
                      data-testid={`file-line-${line.number}`}
                      align="center"
                      justify="space-between"
                      px={space.sm}
                      py={space.xs}
                      style={{
                        background: rowBg,
                        border: `1px solid ${rowBorder}`,
                        borderRadius: radius.xs,
                        transition: motionTransition,
                      }}
                    >
                      <Flex align="center" gap={space.sm}>
                        <Text ff="monospace" fz={font.tiny} c="dimmed" w={28}>
                          {line.number}.
                        </Text>
                        <Text ff="monospace" fz={font.small} fw={600} c={vizVar.ink}>
                          {line.text}
                        </Text>
                      </Flex>

                      {isCursorHere && (
                        <Flex align="center" gap={space.xxs} data-testid={`seek-head-line-${line.number}`}>
                          <Text ff="monospace" fz={font.micro} fw={700} c={vizVar.accent}>
                            ► CURSOR
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                  );
                })
              )}

              {/* Indicador de EOF (Fim de Arquivo) */}
              {disk.exists && (
                <Flex
                  data-testid="file-line-eof"
                  align="center"
                  justify="space-between"
                  px={space.sm}
                  py={space.xxs}
                  style={{
                    background: disk.eofReached ? vizVar.purpleSoft : vizVar.surface3,
                    border: `1px dashed ${disk.eofReached ? vizVar.purple : vizVar.line}`,
                    borderRadius: radius.xs,
                    opacity: disk.eofReached ? 1 : 0.6,
                    transition: motionTransition,
                  }}
                >
                  <Text ff="monospace" fz={font.micro} c={disk.eofReached ? vizVar.purple : 'dimmed'}>
                    [EOF - End Of File]
                  </Text>
                  {disk.eofReached && (
                    <Text ff="monospace" fz={font.micro} fw={700} c={vizVar.purple} data-testid="seek-head-eof">
                      ► CURSOR (EOF)
                    </Text>
                  )}
                </Flex>
              )}
            </Box>
          </Box>
        </Box>
      </SimpleGrid>

      {/* ================= SAÍDA PADRÃO (CONSOLE / STDOUT) ================= */}
      <Box
        data-testid="file-view-stdout"
        p={space.sm}
        style={{
          background: vizVar.surface4,
          border: `1px solid ${vizVar.line}`,
          borderRadius: radius.md,
        }}
      >
        <Flex justify="space-between" align="center" mb={space.xxs}>
          <Text ff="monospace" fz={font.micro} fw={700} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Terminal / Saída Padrão (stdout)
          </Text>
          <Text ff="monospace" fz={font.tiny} c="dimmed">
            printf(...)
          </Text>
        </Flex>

        <Box
          p={space.sm}
          style={{
            background: '#040404',
            border: `1px solid ${vizVar.line2}`,
            borderRadius: radius.sm,
            minHeight: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: stdout.length === 0 ? 'center' : 'flex-start',
            gap: space.xxs,
          }}
        >
          {stdout.length === 0 ? (
            <Text ff="monospace" fz={font.tiny} c="dimmed" fs="italic">
              (nenhuma saída gerada no console ainda)
            </Text>
          ) : (
            stdout.map((outLine: string, idx: number) => (
              <Flex key={idx} align="center" gap={space.xs}>
                <Text ff="monospace" fz={font.tiny} c={vizVar.accent} style={{ userSelect: 'none' }}>
                  &gt;
                </Text>
                <Text ff="monospace" fz={font.small} c={vizVar.ink} fw={500}>
                  {outLine}
                </Text>
              </Flex>
            ))
          )}
        </Box>
      </Box>

      {/* Legenda Compartilhada */}
      <ViewLegend items={[...LEGEND]} />
    </Box>
  );
}
