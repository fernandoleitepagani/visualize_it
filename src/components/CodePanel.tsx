import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

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
        <i key={key++} className="text-dim italic">
          {match[1]}
        </i>,
      );
    else if (match[2])
      nodes.push(
        <span key={key++} className="text-accent">
          {match[2]}
        </span>,
      );
    else
      nodes.push(
        <span key={key++} className="text-purple">
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
}

export function CodePanel({ code, activeLine, lang, onLangChange }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3 text-xs font-semibold tracking-wider text-dim uppercase">
        <span>código</span>
        <div className="flex gap-1 rounded-md bg-surface-2 p-1">
          {(['java', 'c'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onLangChange(option)}
              className={cx(
                'rounded-md px-2.5 py-1 font-mono text-xs uppercase transition-colors',
                lang === option
                  ? 'bg-accent font-semibold text-canvas'
                  : 'text-muted hover:text-ink',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[480px] overflow-auto bg-surface-2 py-3 font-mono text-[12.5px] leading-relaxed">
        {code.map((line, i) => (
          <div
            key={i}
            className={cx(
              'flex border-l-2 pr-4 whitespace-pre',
              i === activeLine ? 'border-accent bg-accent/10' : 'border-transparent',
            )}
          >
            <span
              className={cx(
                'flex-[0_0_34px] pr-3.5 text-right text-[11px] select-none',
                i === activeLine ? 'text-accent' : 'text-dim',
              )}
            >
              {i + 1}
            </span>
            <span>{highlight(line)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
