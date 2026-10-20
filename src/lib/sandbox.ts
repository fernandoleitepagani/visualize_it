import type { Step } from '@/engine/types';

/**
 * Source of the sandbox worker. The user's code runs inside a Web Worker, so
 * it has no access to the DOM and cannot block the UI thread.
 */
const WORKER_SOURCE = `
self.onmessage = (event) => {
  const { code, input } = event.data;
  try {
    const factory = new Function(
      code + "\\n; return typeof generateSteps === 'function' ? generateSteps : undefined;"
    );
    const generateSteps = factory();
    if (typeof generateSteps !== 'function') {
      throw new Error('Defina uma função generateSteps(arr).');
    }

    const steps = generateSteps(input);
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('generateSteps deve retornar um array não vazio de passos.');
    }

    const clean = steps.map((step, i) => ({
      line: Number.isInteger(step && step.line) ? step.line : 0,
      desc:
        typeof (step && step.desc) === 'string' && step.desc
          ? step.desc
          : 'passo ' + (i + 1),
      arr: Array.isArray(step && step.arr)
        ? step.arr.filter((n) => typeof n === 'number' && Number.isFinite(n))
        : undefined,
      cells: Array.isArray(step && step.cells) ? step.cells : undefined,
      nodes: Array.isArray(step && step.nodes) ? step.nodes : undefined,
    }));

    self.postMessage({ ok: true, steps: clean });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
`;

/** Runs user code in a worker and resolves with the produced steps. */
export function runSandbox(code: string, input: number[], timeoutMs = 1500): Promise<Step[]> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([WORKER_SOURCE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    let settled = false;
    let timer = 0;

    const cleanup = () => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
    };

    timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Tempo esgotado ao executar o código.'));
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent) => {
      if (settled) return;
      settled = true;
      cleanup();

      const data = event.data as { ok: boolean; steps?: Step[]; error?: string };
      if (data.ok && data.steps) resolve(data.steps);
      else reject(new Error(data.error ?? 'Falha ao executar o código.'));
    };

    worker.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Falha ao executar o código.'));
    };

    worker.postMessage({ code, input });
  });
}
