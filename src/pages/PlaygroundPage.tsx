import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Flex,
  Group,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { BarsView } from '@/components/BarsView';
import { MetaPill } from '@/components/MetaPill';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { PlayerControls } from '@/components/PlayerControls';
import type { Step } from '@/engine/types';
import { usePlayback } from '@/engine/usePlayback';
import { runSandbox } from '@/lib/sandbox';
import { font, radius, space, vizVar } from '@/theme';
import { CodeIcon, PlayIcon, SigmaIcon } from '@/components/icons';

const DEFAULT_CODE = `function generateSteps(arr) {
  const steps = [];
  const copy = [...arr];

  steps.push({ line: 0, desc: 'início', arr: [...copy] });

  for (let i = 0; i < copy.length; i++) {
    for (let j = 0; j < copy.length - i - 1; j++) {
      steps.push({ line: 1, desc: 'compara ' + copy[j] + ' e ' + copy[j + 1], arr: [...copy], cmp: [j, j + 1] });
      if (copy[j] > copy[j + 1]) {
        [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
        steps.push({ line: 2, desc: 'troca', arr: [...copy], swap: [j, j + 1] });
      }
    }
  }

  steps.push({ line: 3, desc: 'fim', arr: [...copy], sorted: copy.map((_, index) => index) });
  return steps;
}`;

const parseValues = (raw: string): number[] | null => {
  const parts = raw
    .trim()
    .split(/[,\s;]+/)
    .filter(Boolean)
    .map(Number);
  if (parts.length < 1 || parts.length > 12 || parts.some((n) => !Number.isFinite(n))) return null;
  return parts;
};

export function PlaygroundPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(() => searchParams.get('code') ?? DEFAULT_CODE);
  const [inputValue, setInputValue] = useState('5, 2, 9, 1, 7');
  const [steps, setSteps] = useState<Step[]>([]);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const autoRan = useRef(false);

  const playback = usePlayback(steps);

  const run = useCallback(async () => {
    const input = parseValues(inputValue);
    if (!input) {
      setError('Use entre 1 e 12 números separados por vírgula.');
      return;
    }

    setRunning(true);
    setError('');
    try {
      setSteps(await runSandbox(code, input));
    } catch (err) {
      setSteps([]);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }, [code, inputValue]);

  useEffect(() => {
    if (!autoRan.current && searchParams.has('code')) {
      autoRan.current = true;
      void run();
    }
  }, [run, searchParams]);

  const share = useCallback(async () => {
    setSearchParams({ code }, { replace: true });
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/playground?code=${encodeURIComponent(code)}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; the URL is still updated.
    }
  }, [code, setSearchParams]);

  return (
    <Box pb={40}>
      <PageHeader
        kicker="sandbox"
        title="Playground"
        subtitle="Escreva generateSteps(arr) e veja os passos animados"
        meta={
          <>
            <MetaPill>Web Worker isolado</MetaPill>
            <MetaPill>sem acesso ao DOM</MetaPill>
            <MetaPill tone="accent">compartilhável</MetaPill>
          </>
        }
      />

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Panel
          label="seu código"
          icon={<CodeIcon size={13} />}
          aside={
            <Group gap={6} wrap="nowrap">
              <Text fz={font.micro} c="dimmed">
                generateSteps.js
              </Text>
              <Button
                size="compact-xs"
                variant="subtle"
                radius="pill"
                onClick={() => setCode(DEFAULT_CODE)}
              >
                exemplo
              </Button>
            </Group>
          }
        >
          <Box p="md">
            <Textarea
              value={code}
              onChange={(event) => setCode(event.currentTarget.value)}
              autosize
              minRows={14}
              maxRows={26}
              wrap="off"
              fz={font.small}
              aria-label="código do playground"
              styles={{
                input: {
                  background: vizVar.codeBg,
                  color: vizVar.codeInk,
                  lineHeight: 1.7,
                  borderColor: vizVar.line,
                  whiteSpace: 'pre',
                  overflowX: 'auto',
                },
              }}
            />
            <Flex gap="sm" mt="sm" wrap="wrap" align="flex-end">
              <TextInput
                label="vetor"
                value={inputValue}
                onChange={(event) => setInputValue(event.currentTarget.value)}
                w={200}
                size="sm"
              />
              <Button onClick={run} loading={running} radius="md" leftSection={<PlayIcon size={13} />}>
                Executar
              </Button>
              <Button variant="default" onClick={share} radius="md">
                {copied ? 'Link copiado!' : 'Compartilhar'}
              </Button>
            </Flex>
            {error ? (
              <Alert color="red" title="Erro" mt="sm" radius="md">
                {error}
              </Alert>
            ) : null}
          </Box>
        </Panel>

        <Panel
          label="prévia"
          icon={<SigmaIcon size={13} />}
          aside={
            <Text fz={font.micro} c="dimmed">
              {steps.length} passos
            </Text>
          }
        >
          <Box px="md" pt="lg" pb="md" style={{ minHeight: 360 }}>
            {steps.length > 0 && playback.step ? (
              <>
                <BarsView state={playback.step} />
                <Text fz={font.small} c="dimmed" mt="sm" lh={1.6}>
                  {playback.step.desc}
                </Text>
              </>
            ) : (
              <Flex
                align="center"
                justify="center"
                direction="column"
                gap="sm"
                mih={320}
                style={{
                  border: `1px dashed ${vizVar.line2}`,
                  borderRadius: radius.lg,
                  background: 'color-mix(in srgb, var(--viz-surface-2) 28%, transparent)',
                }}
              >
                <Box style={{ color: vizVar.accent, opacity: 0.8 }}>
                  <SigmaIcon size={34} />
                </Box>
                <Text fz={font.body} c="dimmed">
                  Execute o código para ver os passos.
                </Text>
                <Text fz={font.tiny} c="dimmed">
                  cada passo precisa de line, desc e arr
                </Text>
              </Flex>
            )}
          </Box>
        </Panel>
      </SimpleGrid>

      <Box mt="lg">
        <PlayerControls playback={playback} steps={steps} />
      </Box>

      <Group gap={6} mt="md" wrap="wrap">
        <Text fz={font.tiny} c="dimmed" maw="72ch">
          O código roda em um Web Worker isolado, sem acesso ao DOM. Cada passo pode trazer
        </Text>
        {['arr', 'cmp', 'swap', 'pivot', 'sorted', 'dim'].map((field) => (
          <Text
            key={field}
            component="code"
            fz={font.micro}
            px={6}
            py={1}
            style={{
              color: vizVar.accent,
              border: `1px solid ${vizVar.line}`,
              borderRadius: 5,
              background: vizVar.surface2,
            }}
          >
            {field}
          </Text>
        ))}
      </Group>

      <Text fz={font.micro} c="dimmed" mt={space.sm}>
        dica: use os presets e o timeline para revisar cada operação
      </Text>
    </Box>
  );
}
