import type { ReactNode } from 'react';
import { vizVar } from '@/theme';

const KEYWORDS =
  'void|int|char|float|double|boolean|for|if|else|while|do|return|new|delete|length|break|continue|struct|typedef|malloc|free|class|public|private|protected|virtual|override|namespace|using|template|typename|try|catch|throw|throws|true|false|null|nullptr|String|System|Scanner|RuntimeException|const|let|function|std|cout|cin|vector|string';

const INLINE_TOKEN = new RegExp(
  `("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')|(/\\*[\\s\\S]*?\\*/)|(//.*$)|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b(?:${KEYWORDS})\\b)`,
  'g',
);

export interface HighlightState {
  inBlockComment: boolean;
}

const initialHighlightState: HighlightState = { inBlockComment: false };

function comment(text: string, key: number): ReactNode {
  return (
    <span key={key} style={{ color: vizVar.codeComment, fontStyle: 'italic' }}>
      {text}
    </span>
  );
}

function inlineTokens(text: string, startKey: number): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = startKey;
  let match: RegExpExecArray | null;

  INLINE_TOKEN.lastIndex = 0;
  while ((match = INLINE_TOKEN.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1]) {
      nodes.push(
        <span key={key++} style={{ color: vizVar.codeString }}>
          {match[1]}
        </span>,
      );
    } else if (match[2]) {
      nodes.push(comment(match[2], key++));
    } else if (match[3]) {
      nodes.push(comment(match[3], key++));
    } else if (match[4]) {
      nodes.push(
        <span key={key++} style={{ color: vizVar.codeNumber }}>
          {match[4]}
        </span>,
      );
    } else {
      nodes.push(
        <span key={key++} style={{ color: vizVar.codeKeyword }}>
          {match[5]}
        </span>,
      );
    }
    last = INLINE_TOKEN.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * Line-oriented highlighter for comments, strings, numbers and keywords.
 * Block comments carry state across lines, so callers must keep the returned
 * state between lines.
 */
export function highlightLine(
  line: string,
  state: HighlightState = initialHighlightState,
): { parts: ReactNode[]; state: HighlightState } {
  if (state.inBlockComment) {
    const end = line.indexOf('*/');
    if (end === -1) return { parts: [comment(line, 0)], state: { inBlockComment: true } };
    return {
      parts: [comment(line.slice(0, end + 2), 0), ...inlineTokens(line.slice(end + 2), 1)],
      state: { inBlockComment: false },
    };
  }

  const open = line.lastIndexOf('/*');
  const close = open >= 0 ? line.indexOf('*/', open + 2) : -1;
  if (open >= 0 && close === -1) {
    return {
      parts: [...inlineTokens(line.slice(0, open), 0), comment(line.slice(open), 100)],
      state: { inBlockComment: true },
    };
  }

  return { parts: inlineTokens(line, 0), state: { inBlockComment: false } };
}

/** Highlights a whole listing, carrying block-comment state across lines. */
export function highlightCode(code: string[]): ReactNode[][] {
  const parts: ReactNode[][] = [];
  let state: HighlightState = initialHighlightState;

  for (const line of code) {
    const result = highlightLine(line, state);
    parts.push(result.parts);
    state = result.state;
  }

  return parts;
}
