import { useEffect, useRef, useState } from 'react';
import { ActionIcon, Box, Group, SegmentedControl, Text, Tooltip } from '@mantine/core';
import type { CodeApproach, CodeLang } from '@/engine/types';
import { highlightCode } from '@/lib/highlight';
import { font, space, vizVar } from '@/theme';
import { Panel } from './Panel';
import { CheckIcon, CodeIcon, CopyIcon, DownloadIcon } from './icons';

interface Props {
  code: string[];
  activeLine: number;
  lang: CodeLang;
  onLangChange: (lang: CodeLang) => void;
  /** Languages available for this lesson. Defaults to Java and C. */
  languages?: CodeLang[];
  /** Base name for copy/download, e.g. `selecao-iterativo`. */
  fileBaseName?: string;
  /** Optional implementation picker (iterative / recursive). */
  approach?: CodeApproach;
  onApproachChange?: (approach: CodeApproach) => void;
}

const LABELS: Record<CodeLang, string> = { java: 'java', c: 'c', cpp: 'c++' };
const ARIA: Record<CodeLang, string> = { java: 'Java', c: 'C', cpp: 'C++' };
const EXTENSIONS: Record<CodeLang, string> = { java: 'java', c: 'c', cpp: 'cpp' };

export function CodePanel({
  code,
  activeLine,
  lang,
  onLangChange,
  languages = ['java', 'c'],
  fileBaseName = 'codigo',
  approach,
  onApproachChange,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const showApproach = approach !== undefined && onApproachChange !== undefined;
  const showLanguage = languages.length > 1;
  const extension = EXTENSIONS[lang];

  // Keep the highlighted line visible inside the code box without scrolling the page.
  useEffect(() => {
    const container = scrollRef.current;
    const line = activeRef.current;
    if (!container || !line || typeof container.scrollTo !== 'function') return;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = reduced ? 'auto' : 'smooth';
    const lineTop = line.offsetTop;
    const lineBottom = lineTop + line.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    if (lineTop < viewTop) {
      container.scrollTo({ top: Math.max(lineTop - 8, 0), behavior });
    } else if (lineBottom > viewBottom) {
      container.scrollTo({ top: lineBottom - container.clientHeight + 8, behavior });
    }
  }, [activeLine, lang]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; the code remains selectable.
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileBaseName}.${extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const highlighted = highlightCode(code);

  return (
    <Panel
      label="código"
      icon={<CodeIcon size={13} />}
      aside={
        <Group gap="xs" wrap="nowrap">
          {showApproach ? (
            <SegmentedControl
              size="xs"
              value={approach}
              onChange={(value) => onApproachChange(value as CodeApproach)}
              aria-label="implementação"
              data={[
                { label: 'iterativo', value: 'iterativo' },
                { label: 'recursivo', value: 'recursivo' },
              ]}
            />
          ) : null}
          {showLanguage ? (
            <SegmentedControl
              size="xs"
              value={lang}
              onChange={(value) => onLangChange(value as CodeLang)}
              aria-label="linguagem"
              data={languages.map((language) => ({
                label: LABELS[language],
                value: language,
              }))}
            />
          ) : (
            <Text ff="monospace" fz={font.micro} c="dimmed" lh={1} aria-label="linguagem">
              {ARIA[lang]}
            </Text>
          )}
        </Group>
      }
      footer={
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Group gap={4} wrap="nowrap">
            <Tooltip label={copied ? 'Código copiado' : 'Copiar código'} withArrow>
              <ActionIcon
                variant="subtle"
                size="sm"
                aria-label={copied ? 'Código copiado' : 'Copiar código'}
                onClick={copyCode}
              >
                {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Baixar código" withArrow>
              <ActionIcon
                variant="subtle"
                size="sm"
                aria-label="Baixar código"
                onClick={downloadCode}
              >
                <DownloadIcon size={13} />
              </ActionIcon>
            </Tooltip>
            <Text fz={font.micro} c="dimmed" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {LABELS[lang]} · {showApproach ? approach : 'implementação única'}
            </Text>
          </Group>
          <Text fz={font.micro} c="dimmed" ff="monospace">
            linha {Math.min(activeLine + 1, code.length)} de {code.length}
          </Text>
        </Group>
      }
    >
      <Box
        ref={scrollRef}
        role="region"
        aria-label={`Código ${ARIA[lang]}`}
        className="code-scroll"
        py="sm"
        fz={12.5}
        style={{
          overflow: 'auto',
          position: 'relative',
          lineHeight: 1.72,
          background: vizVar.codeBg,
          color: vizVar.codeInk,
        }}
      >
        {code.map((_, i) => {
          const active = i === activeLine;
          return (
            <div
              key={i}
              ref={active ? activeRef : undefined}
              aria-current={active ? 'step' : undefined}
              style={{
                display: 'flex',
                whiteSpace: 'pre',
                minHeight: 25,
                paddingRight: space.lg,
                borderLeft: `3px solid ${active ? 'var(--subject-accent, var(--viz-accent))' : 'transparent'}`,
                background: active
                  ? `linear-gradient(90deg, color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 11%, transparent) 0%, color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 3%, transparent) 88%, transparent 100%)`
                  : undefined,
                transition:
                  'background 200ms cubic-bezier(0.22, 1, 0.36, 1), border-color 200ms ease',
              }}
            >
              <span
                aria-hidden
                style={{
                  flex: '0 0 42px',
                  textAlign: 'right',
                  paddingRight: 14,
                  fontSize: font.micro,
                  lineHeight: '25px',
                  userSelect: 'none',
                  color: active ? 'var(--subject-accent, var(--viz-accent))' : vizVar.dim,
                  fontWeight: active ? 700 : 400,
                }}
              >
                {i + 1}
              </span>
              <span style={{ lineHeight: '25px', color: vizVar.codeInk }}>{highlighted[i]}</span>
            </div>
          );
        })}
      </Box>
    </Panel>
  );
}
