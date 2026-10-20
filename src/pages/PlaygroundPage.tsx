import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Flex,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { BarsView } from '@/components/BarsView';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { PlayerControls } from '@/components/PlayerControls';
import type { Step } from '@/engine/types';
import { usePlayback } from '@/engine/usePlayback';
import { runSandbox } from '@/lib/sandbox';

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
        title="Playground"
        subtitle="Escreva generateSteps(arr) e veja os passos animados"
      />

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Panel label="seu código">
          <Box p="md">
            <Textarea
              value={code}
              onChange={(event) => setCode(event.currentTarget.value)}
              minRows={16}
              ff="monospace"
              fz={12.5}
              aria-label="código do playground"
            />
            <Flex gap="sm" mt="sm" wrap="wrap" align="flex-end">
              <TextInput
                label="vetor"
                value={inputValue}
                onChange={(event) => setInputValue(event.currentTarget.value)}
                w={200}
                size="sm"
              />
              <Button onClick={run} loading={running}>
                Executar
              </Button>
              <Button variant="default" onClick={share}>
                {copied ? 'Link copiado!' : 'Compartilhar'}
              </Button>
            </Flex>
            {error ? (
              <Alert color="red" title="Erro" mt="sm">
                {error}
              </Alert>
            ) : null}
          </Box>
        </Panel>

        <Panel label="prévia">
          <Box px="md" pt="lg" pb="md">
            <BarsView state={playback.step} />
            <Text fz="sm" c="dimmed" mt="sm">
              {playback.step?.desc ?? 'Execute o código para ver os passos.'}
            </Text>
          </Box>
        </Panel>
      </SimpleGrid>

      <PlayerControls playback={playback} />

      <Text fz="xs" c="dimmed" mt="sm">
        O código roda em um Web Worker isolado, sem acesso ao DOM. Cada passo pode trazer
        <code> arr</code>, <code>cmp</code>, <code>swap</code>, <code>pivot</code>,{' '}
        <code>sorted</code> e <code>dim</code>.
      </Text>
    </Box>
  );
}
