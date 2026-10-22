import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Box } from '@mantine/core';
import { KeyboardIcon } from '@/components/icons';
import { lineLength } from '../buffer';
import { isPrintable, normalizeKey } from '../keymap';
import type { VimMode, VimState } from '../types';

interface Span {
  start: number;
  end: number;
}

interface Props {
  state: VimState;
  onKey: (key: string) => void;
  onText: (text: string) => void;
}

function selectionFor(
  state: Pick<VimState, 'anchor' | 'cursor' | 'mode'>,
  lineIndex: number,
  line: string,
): Span | 'line' | null {
  const { anchor, cursor, mode } = state;
  if (!anchor || (mode !== 'visual' && mode !== 'visual-line')) return null;

  const forward =
    anchor.line < cursor.line || (anchor.line === cursor.line && anchor.col <= cursor.col);
  const from = forward ? anchor : cursor;
  const to = forward ? cursor : anchor;

  if (mode === 'visual-line') {
    return lineIndex >= from.line && lineIndex <= to.line ? 'line' : null;
  }

  if (lineIndex < from.line || lineIndex > to.line) return null;
  const last = Math.max(0, lineLength(line) - 1);
  return {
    start: lineIndex === from.line ? from.col : 0,
    end: lineIndex === to.line ? Math.min(to.col, last) : last,
  };
}

function searchSpans(line: string, needle: string): Span[] {
  if (!needle) return [];
  const lower = line.toLowerCase();
  const target = needle.toLowerCase();
  const spans: Span[] = [];
  let offset = 0;

  for (;;) {
    const index = lower.indexOf(target, offset);
    if (index < 0) break;
    const start = Array.from(line.slice(0, index)).length;
    spans.push({ start, end: start + Array.from(target).length - 1 });
    offset = index + Math.max(1, target.length);
  }

  return spans;
}

function renderLine(
  line: string,
  lineIndex: number,
  selection: Span | 'line' | null,
  matches: Span[],
  cursor: VimState['cursor'],
  mode: VimMode,
): ReactNode {
  const cells = Array.from(line);
  const nodes: ReactNode[] = [];
  const cursorHere = lineIndex === cursor.line;
  let plain = '';

  const flush = () => {
    if (plain) {
      nodes.push(plain);
      plain = '';
    }
  };

  if (cells.length === 0 && cursorHere && mode !== 'insert') {
    nodes.push(
      <span key="empty-cursor" className="vim-cursor">
        &nbsp;
      </span>,
    );
  }

  cells.forEach((char, col) => {
    const isCursor = cursorHere && col === cursor.col;

    if (mode === 'insert' && isCursor) {
      flush();
      nodes.push(<span key={`caret-${col}`} className="vim-caret" />);
    }

    const selected =
      selection !== null &&
      selection !== 'line' &&
      col >= selection.start &&
      col <= selection.end;
    const matched = matches.some((span) => col >= span.start && col <= span.end);

    if (!selected && !matched && !(isCursor && mode !== 'insert')) {
      plain += char;
      return;
    }

    flush();
    const classes = ['vim-char'];
    if (selected) classes.push('vim-selection');
    if (matched) classes.push('vim-match');
    if (isCursor && mode !== 'insert') classes.push('vim-cursor');
    nodes.push(
      <span key={col} className={classes.join(' ')}>
        {char}
      </span>,
    );
  });

  flush();

  if (mode === 'insert' && cursorHere && cursor.col >= cells.length) {
    nodes.push(<span key="caret-end" className="vim-caret" />);
  }

  return nodes;
}

/**
 * A small, dependency-free Vim surface. All editing lives in `keymap.ts`; this
 * component only renders state and forwards keys.
 *
 * Performance notes: the keydown listener is bound once, handlers are read from
 * refs, and plain text runs are grouped into single text nodes. Only cursor,
 * selection and search hits become elements.
 */
export function VimEditor({ state, onKey, onText }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const onKeyRef = useRef(onKey);
  const onTextRef = useRef(onText);
  const modeRef = useRef(state.mode);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    onKeyRef.current = onKey;
    onTextRef.current = onText;
    modeRef.current = state.mode;
  }, [onKey, onText, state.mode]);

  useEffect(() => {
    const area = inputRef.current;
    if (!area) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = normalizeKey(event);
      if (!key) return;

      // Printable insert characters flow through the textarea (IME/mobile safe).
      if (modeRef.current === 'insert' && isPrintable(key) && !event.ctrlKey && !event.metaKey) {
        return;
      }

      // Keep the browser paste shortcut working inside insert mode.
      if (modeRef.current === 'insert' && key === 'C-v') return;

      event.preventDefault();
      event.stopPropagation();
      onKeyRef.current(key);
    };

    area.addEventListener('keydown', onKeyDown);
    return () => area.removeEventListener('keydown', onKeyDown);
  }, []);

  // Switching to insert through a touch key should open the soft keyboard.
  useEffect(() => {
    if (state.mode === 'insert') inputRef.current?.focus();
  }, [state.mode]);

  // zz/zt/zb and Ctrl-e/y update the logical scroll position.
  useEffect(() => {
    if (surfaceRef.current) surfaceRef.current.scrollTop = state.scrollTop;
  }, [state.scrollTop]);

  const commit = useCallback((value: string) => {
    if (value && modeRef.current === 'insert') onTextRef.current(value);
  }, []);

  const needle = state.mode === 'search' ? state.search : state.lastSearch;
  const { lines, cursor, mode, showNumbers, relativeNumbers } = state;

  const matchesByLine = useMemo(
    () => lines.map((line) => searchSpans(line, needle ?? '')),
    [lines, needle],
  );
  const selectionByLine = useMemo(
    () =>
      lines.map((line, lineIndex) =>
        selectionFor({ anchor: state.anchor, cursor, mode }, lineIndex, line),
      ),
    [lines, state.anchor, cursor, mode],
  );

  return (
    <Box
      role="application"
      aria-label="Editor Vim"
      data-mode={state.mode}
      data-cursor={`${state.cursor.line}:${state.cursor.col}`}
      className="vim-editor"
    >
      <div ref={surfaceRef} className="vim-surface" aria-hidden="true">
        {lines.map((line, lineIndex) => {
          const selection = selectionByLine[lineIndex];
          const selectedLine = selection === 'line';

          return (
            <div
              key={lineIndex}
              className={`vim-line${selectedLine ? ' vim-line-selected' : ''}`}
            >
              {showNumbers ? (
                <span className="vim-gutter">
                  {relativeNumbers
                    ? lineIndex === cursor.line
                      ? String(lineIndex + 1).padStart(3, ' ')
                      : String(Math.abs(lineIndex - cursor.line)).padStart(3, ' ')
                    : String(lineIndex + 1).padStart(3, ' ')}
                </span>
              ) : null}
              <span className="vim-text">
                {renderLine(line, lineIndex, selection, matchesByLine[lineIndex] ?? [], cursor, mode)}
              </span>
            </div>
          );
        })}

        {mode === 'command' ? (
          <div className="vim-commandline">
            :{state.command}
            <span className="vim-caret" />
          </div>
        ) : null}
        {mode === 'search' ? (
          <div className="vim-commandline">
            {state.searchDirection === 1 ? '/' : '?'}
            {state.search}
            <span className="vim-caret" />
          </div>
        ) : null}
      </div>

      <p id="vim-editor-help" className="vim-sr-only">
        Editor Vim. Clique para focar. Use Escape para voltar ao modo normal. Tab sai do editor.
      </p>
      <p className="vim-sr-only">
        Buffer: {lines.join(' ')}. Linha {cursor.line + 1}, coluna {cursor.col + 1}.
      </p>

      <textarea
        ref={inputRef}
        className="vim-input"
        aria-label="Editor Vim"
        aria-describedby="vim-editor-help"
        value=""
        inputMode={mode === 'insert' ? 'text' : 'none'}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(event) => {
          if (composing.current) return;
          commit(event.currentTarget.value);
          event.currentTarget.value = '';
        }}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          commit(event.currentTarget.value);
          event.currentTarget.value = '';
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {!focused ? (
        <button
          type="button"
          tabIndex={-1}
          className="vim-focus-overlay"
          aria-label="Focar no editor Vim"
          onClick={() => inputRef.current?.focus()}
        >
          <span className="vim-focus-card">
            <KeyboardIcon size={22} />
            <span className="vim-focus-title">Clique para focar</span>
            <span className="vim-focus-sub">Esc volta ao normal · Tab sai do editor</span>
          </span>
        </button>
      ) : null}
    </Box>
  );
}
