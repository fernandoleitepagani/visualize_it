import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mantine/core';
import { lineLength } from '../buffer';
import { isPrintable, normalizeKey } from '../keymap';
import type { VimState } from '../types';

interface Span {
  start: number;
  end: number;
}

interface Props {
  state: VimState;
  onKey: (key: string) => void;
  onText: (text: string) => void;
}

function selectionFor(state: VimState, lineIndex: number, line: string): Span | 'line' | null {
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

/**
 * A small, dependency-free Vim surface. All editing lives in `keymap.ts`; this
 * component only renders state and forwards keys.
 */
export function VimEditor({ state, onKey, onText }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const composing = useRef(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const area = inputRef.current;
    if (!area) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = normalizeKey(event);
      if (!key) return;

      // Printable insert characters flow through the textarea (IME/mobile safe).
      if (state.mode === 'insert' && isPrintable(key) && !event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onKey(key);
    };

    area.addEventListener('keydown', onKeyDown);
    return () => area.removeEventListener('keydown', onKeyDown);
  }, [state.mode, onKey]);

  // Switching to insert through a touch key should open the soft keyboard.
  useEffect(() => {
    if (state.mode === 'insert') inputRef.current?.focus();
  }, [state.mode]);

  const commit = useCallback(
    (value: string) => {
      if (value && state.mode === 'insert') onText(value);
    },
    [state.mode, onText],
  );

  const needle = state.mode === 'search' ? state.search : state.lastSearch;

  return (
    <Box
      role="application"
      aria-label="Editor Vim"
      data-mode={state.mode}
      data-cursor={`${state.cursor.line}:${state.cursor.col}`}
      className="vim-editor"
    >
      <div className="vim-surface" aria-hidden="true">
        {state.lines.map((line, lineIndex) => {
          const cells = Array.from(line);
          const selection = selectionFor(state, lineIndex, line);
          const matches = searchSpans(line, needle ?? '');
          const selectedLine = selection === 'line';

          return (
            <div
              key={lineIndex}
              className={`vim-line${selectedLine ? ' vim-line-selected' : ''}`}
            >
              {state.showNumbers ? (
                <span className="vim-gutter">{String(lineIndex + 1).padStart(3, ' ')}</span>
              ) : null}
              <span className="vim-text">
                {cells.length === 0 && lineIndex === state.cursor.line && state.mode !== 'insert' ? (
                  <span className="vim-cursor">&nbsp;</span>
                ) : null}
                {cells.map((char, col) => {
                  const isCursor = lineIndex === state.cursor.line && col === state.cursor.col;
                  const inSelection =
                    selection !== null &&
                    selection !== 'line' &&
                    col >= selection.start &&
                    col <= selection.end;
                  const inMatch = matches.some((span) => col >= span.start && col <= span.end);
                  const classes = ['vim-char'];
                  if (inSelection) classes.push('vim-selection');
                  if (inMatch) classes.push('vim-match');

                  return (
                    <span key={col} className={classes.join(' ')}>
                      {state.mode === 'insert' && isCursor ? <span className="vim-caret" /> : null}
                      <span className={isCursor && state.mode !== 'insert' ? 'vim-cursor' : undefined}>
                        {char}
                      </span>
                    </span>
                  );
                })}
                {state.mode === 'insert' &&
                lineIndex === state.cursor.line &&
                state.cursor.col >= cells.length ? (
                  <span className="vim-caret" />
                ) : null}
              </span>
            </div>
          );
        })}

        {state.mode === 'command' ? (
          <div className="vim-commandline">
            :{state.command}
            <span className="vim-caret" />
          </div>
        ) : null}
        {state.mode === 'search' ? (
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
        Buffer: {state.lines.join(' ')}. Linha {state.cursor.line + 1}, coluna{' '}
        {state.cursor.col + 1}.
      </p>

      <textarea
        ref={inputRef}
        className="vim-input"
        aria-label="Editor Vim"
        aria-describedby="vim-editor-help"
        value=""
        inputMode={state.mode === 'insert' ? 'text' : 'none'}
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
        <div className="vim-focus-hint" aria-hidden="true">
          clique para focar
        </div>
      ) : null}
    </Box>
  );
}
