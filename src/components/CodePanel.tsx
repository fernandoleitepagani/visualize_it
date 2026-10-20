import type { ReactNode } from 'react';
import { Box, Group, SegmentedControl } from '@mantine/core';
import type { CodeApproach } from '@/engine/types';
import { viz } from '@/theme';
import { Panel } from './Panel';

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
        <span key={key++} style={{ color: viz.dim, fontStyle: 'italic' }}>
          {match[1]}
        </span>,
      );
    else if (match[2])
      nodes.push(
        <span key={key++} style={{ color: viz.accent }}>
          {match[2]}
        </span>,
      );
    else
      nodes.push(
        <span key={key++} style={{ color: viz.purple }}>
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

export function CodePanel({ code, activeLine, lang, onLangChange, approach, onApproachChange }: Props) {
  const showApproach = approach !== undefined && onApproachChange !== undefined;

  return (
    <Panel
      label="código"
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
        mah={480}
        py="sm"
        ff="monospace"
        fz={12.5}
        bg="dark.5"
        style={{ overflow: 'auto', lineHeight: 1.6 }}
      >
        {code.map((line, i) => {
          const active = i === activeLine;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                whiteSpace: 'pre',
                paddingRight: 16,
                borderLeft: `2px solid ${active ? viz.accent : 'transparent'}`,
                background: active ? 'rgba(251, 191, 36, 0.1)' : undefined,
              }}
            >
              <span
                style={{
                  flex: '0 0 34px',
                  textAlign: 'right',
                  paddingRight: 14,
                  fontSize: 11,
                  userSelect: 'none',
                  color: active ? viz.accent : viz.dim,
                }}
              >
                {i + 1}
              </span>
              <span>{highlight(line)}</span>
            </div>
          );
        })}
      </Box>
    </Panel>
  );
}
