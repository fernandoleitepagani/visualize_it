import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Box, Group, SegmentedControl } from '@mantine/core';
import type { CodeApproach } from '@/engine/types';
import { font, space, tint, vizVar } from '@/theme';
import { Panel } from './Panel';
import { CodeIcon } from './icons';

export type CodeLang = 'java' | 'c';

const KEYWORDS =
  'void|int|char|float|double|boolean|for|if|else|while|return|new|length|break|continue|struct|typedef|malloc|free|class|public|static|throws|throw|true|false|null|String|System|Scanner|RuntimeException';
const TOKEN = new RegExp(`(//.*$)|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b(?:${KEYWORDS})\\b)`, 'g');

/** Very small syntax highlighter: comments, numbers, keywords. */
function highlight(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(line)) !== null) {
    if (match.index > last) nodes.push(line.slice(last, match.index));
    if (match[1])
      nodes.push(
        <span key={key++} style={{ color: vizVar.dim, fontStyle: 'italic' }}>
          {match[1]}
        </span>,
      );
    else if (match[2])
      nodes.push(
        <span key={key++} style={{ color: vizVar.accent }}>
          {match[2]}
        </span>,
      );
    else
      nodes.push(
        <span key={key++} style={{ color: vizVar.purple }}>
          {match[3]}
        </span>,
      );
    last = TOKEN.lastIndex;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return nodes;
}

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

  return (
    <Panel
      label="código"
      icon={<CodeIcon size={14} />}
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
    >
      <Box
        ref={scrollRef}
        role="region"
        aria-label={`Código ${lang === 'java' ? 'Java' : 'C'}`}
        mah={520}
        py="sm"
        ff="monospace"
        fz={font.small}
        style={{
          overflow: 'auto',
          position: 'relative',
          lineHeight: 1.65,
          background: vizVar.surface,
        }}
      >
        {code.map((line, i) => {
          const active = i === activeLine;
          return (
            <div
              key={i}
              ref={active ? activeRef : undefined}
              aria-current={active ? 'step' : undefined}
              style={{
                display: 'flex',
                whiteSpace: 'pre',
                minHeight: 24,
                paddingRight: space.lg,
                borderLeft: `3px solid ${active ? vizVar.accent : 'transparent'}`,
                background: active
                  ? `linear-gradient(90deg, ${tint(vizVar.accent, 14)} 0%, ${tint(
                      vizVar.accent,
                      4,
                    )} 90%, transparent 100%)`
                  : undefined,
                transition: `background 160ms ease-out, border-color 160ms ease-out`,
              }}
            >
              <span
                style={{
                  flex: '0 0 38px',
                  textAlign: 'right',
                  paddingRight: 14,
                  fontSize: font.tiny,
                  lineHeight: '24px',
                  userSelect: 'none',
                  color: active ? vizVar.accent : vizVar.dim,
                  fontWeight: active ? 700 : 400,
                }}
              >
                {i + 1}
              </span>
              <span style={{ lineHeight: '24px', color: vizVar.ink }}>{highlight(line)}</span>
            </div>
          );
        })}
      </Box>
    </Panel>
  );
}
