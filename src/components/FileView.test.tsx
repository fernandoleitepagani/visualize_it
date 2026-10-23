import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { FileView } from './FileView';
import type { Step } from '@/engine/types';

describe('FileView', () => {
  it('renders fallback notice when file state is missing', () => {
    renderWithProviders(<FileView state={undefined} />);
    expect(screen.getByTestId('file-view-empty')).toBeInTheDocument();
    expect(screen.getByText(/Nenhum estado de arquivo/)).toBeInTheDocument();
  });

  it('renders RAM section with handle and local variables', () => {
    const step: Step = {
      line: 0,
      desc: 'Teste RAM',
      file: {
        ram: {
          handle: {
            name: 'f',
            address: '0x7ffe',
            targetFileName: 'dados.txt',
            mode: 'w',
            status: 'open',
            state: 'write',
          },
          variables: [{ name: 'x', type: 'int', value: 42, state: 'write' }],
          buffer: '42\\n',
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [],
          cursorLine: 1,
          eofReached: false,
        },
        stdout: [],
      },
    };

    renderWithProviders(<FileView state={step} />);

    expect(screen.getByTestId('file-view')).toBeInTheDocument();
    expect(screen.getByTestId('file-view-ram')).toBeInTheDocument();
    expect(screen.getByText('FILE *f')).toBeInTheDocument();
    expect(screen.getByText('addr: 0x7ffe')).toBeInTheDocument();
    expect(screen.getByText('FLUXO ABERTO')).toBeInTheDocument();
    expect(screen.getByText('Modo "w" (Escrita/Criação)')).toBeInTheDocument();
    expect(screen.getByTestId('file-ram-var-x')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('"42\\\\n"')).toBeInTheDocument();
  });

  it('renders disk section with lines and seek head cursor', () => {
    const step: Step = {
      line: 3,
      desc: 'Linhas no disco',
      file: {
        ram: {
          handle: {
            name: 'f',
            status: 'open',
            mode: 'r',
          },
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10' },
            { number: 2, text: '20' },
          ],
          cursorLine: 2,
          eofReached: false,
        },
        stdout: ['10'],
      },
    };

    renderWithProviders(<FileView state={step} />);

    expect(screen.getByTestId('file-view-disk')).toBeInTheDocument();
    expect(screen.getByText('📄 dados.txt')).toBeInTheDocument();
    expect(screen.getByTestId('file-line-1')).toBeInTheDocument();
    expect(screen.getByTestId('file-line-2')).toBeInTheDocument();
    expect(screen.getByTestId('seek-head-indicator')).toHaveTextContent('SEEK HEAD: L2');
    expect(screen.getByTestId('seek-head-line-2')).toBeInTheDocument();
  });

  it('renders EOF marker and terminal stdout output', () => {
    const step: Step = {
      line: 10,
      desc: 'EOF atingido',
      file: {
        ram: {
          handle: {
            name: 'f',
            status: 'open',
            mode: 'r',
          },
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [
            { number: 1, text: '10' },
            { number: 2, text: '20' },
          ],
          cursorLine: 3,
          eofReached: true,
        },
        stdout: ['10', '20'],
      },
    };

    renderWithProviders(<FileView state={step} />);

    expect(screen.getByTestId('seek-head-eof')).toBeInTheDocument();
    const stdoutBox = screen.getByTestId('file-view-stdout');
    expect(within(stdoutBox).getByText('10')).toBeInTheDocument();
    expect(within(stdoutBox).getByText('20')).toBeInTheDocument();
  });

  it('indicates flush during file closing', () => {
    const step: Step = {
      line: 5,
      desc: 'Fechando arquivo',
      file: {
        ram: {
          handle: {
            name: 'f',
            status: 'closed',
          },
          buffer: null,
          flushing: true,
        },
        disk: {
          name: 'dados.txt',
          exists: true,
          lines: [{ number: 1, text: '10' }],
          cursorLine: null,
          eofReached: false,
        },
      },
    };

    renderWithProviders(<FileView state={step} />);

    expect(screen.getByText('FECHADO / LIBERADO')).toBeInTheDocument();
    expect(screen.getByText('FLUSH ⤓')).toBeInTheDocument();
  });

  it('renders stream connector with directional indicator for write and read', () => {
    const writeStep: Step = {
      line: 2,
      desc: 'Escrevendo',
      file: {
        ram: { handle: { name: 'f', status: 'open', mode: 'w' } },
        disk: { name: 'dados.txt', exists: true, lines: [] },
      },
    };

    const { unmount } = renderWithProviders(<FileView state={writeStep} />);
    expect(screen.getByText('fprintf ➔ GRAVAÇÃO')).toBeInTheDocument();
    unmount();

    const readStep: Step = {
      line: 7,
      desc: 'Lendo',
      file: {
        ram: { handle: { name: 'f', status: 'open', mode: 'r' } },
        disk: { name: 'dados.txt', exists: true, lines: [{ number: 1, text: '10' }] },
      },
    };

    renderWithProviders(<FileView state={readStep} />);
    expect(screen.getByText('◂ fscanf LEITURA')).toBeInTheDocument();
  });
});
