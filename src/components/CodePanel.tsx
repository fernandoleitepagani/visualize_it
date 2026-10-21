import { useEffect, useRef } from 'react';
import { Box, Group, SegmentedControl } from '@mantine/core';
import type { CodeApproach } from '@/engine/types';
import { highlightCode } from '@/lib/highlight';
import { font, space, vizVar } from '@/theme';
import { Panel } from './Panel';
import { CodeIcon } from './icons';

export type CodeLang = 'java' | 'c';

interface Props {
  code: string[];
  activeLine: number;
  lang: CodeLang;
  onLangChange: (lang: CodeLang) => void;
  /** Optional implementation picker (iterative / recursive). */
  approach?: CodeApproach;
  onApproachChange?: (approach: CodeApproach) => void;
}

export function CodePanel({
  code,
  activeLine,
  lang,
  onLangChange,
  approach,
  onApproachChange,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);
  const showApproach = approach !== undefined && onApproachChange !== undefined;

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
          <SegmentedControl
            size="xs"
            value={lang}
            onChange={(value) => onLangChange(value as CodeLang)}
            aria-label="linguagem"
            data={[
              { label: 'java', value: 'java' },
              { label: 'c', value: 'c' },
            ]}
          />
        </Group>
      }
      footer={
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Box
            fz={font.micro}
            c="dimmed"
            style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {lang} · {showApproach ? approach : 'implementação única'}
          </Box>
          <Box fz={font.micro} c="dimmed">
            linha {Math.min(activeLine + 1, code.length)} de {code.length}
          </Box>
        </Group>
      }
    >
      <Box
        ref={scrollRef}
        role="region"
        aria-label={`Código ${lang === 'java' ? 'Java' : 'C'}`}
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
