import { describe, expect, it } from 'vitest';
import { applyKeys, applyText, createState, normalizeKey, reduce } from './keymap';

function run(lines: string[], keys: string[], start = { line: 0, col: 0 }) {
  return applyKeys(createState(lines, start), keys);
}

describe('keymap: movement', () => {
  it('moves with hjkl and arrows', () => {
    expect(run(['abc', 'def'], ['l', 'l', 'j']).cursor).toEqual({ line: 1, col: 2 });
    expect(run(['abc', 'def'], ['ArrowRight', 'ArrowDown']).cursor).toEqual({ line: 1, col: 1 });
  });

  it('applies counts to motions', () => {
    expect(run(['a', 'b', 'c', 'd'], ['3', 'j']).cursor.line).toBe(3);
    expect(run(['abcdef'], ['3', 'l']).cursor.col).toBe(3);
    expect(run(['a', 'b', 'c', 'd', 'e'], ['2', 'G']).mode).toBe('normal');
    expect(run(['a', 'b', 'c', 'd', 'e'], ['2', 'G']).cursor.line).toBe(1);
  });

  it('jumps with gg and G', () => {
    expect(run(['a', 'b', 'c'], ['G']).cursor.line).toBe(2);
    expect(run(['a', 'b', 'c'], ['G', 'g', 'g']).cursor.line).toBe(0);
  });

  it('matches brackets and moves by paragraph', () => {
    expect(run(['(a)'], ['%']).cursor).toEqual({ line: 0, col: 2 });
    expect(run(['if (a) {', '  b();', '}'], ['%']).cursor).toEqual({ line: 0, col: 5 });
    expect(run(['a', 'b', '', 'c'], ['}']).cursor.line).toBe(2);
    expect(run(['a', 'b', '', 'c'], ['G', '{']).cursor.line).toBe(2);
  });

  it('finds a character and repeats it with ; and ,', () => {
    const state = run(['a-b-c-d'], ['f', '-', ';']);
    expect(state.cursor.col).toBe(3);
    expect(run(['a-b-c-d'], ['f', '-', ';', ',']).cursor.col).toBe(1);
  });
});

describe('keymap: editing', () => {
  it('deletes characters with x and X', () => {
    expect(run(['abcd'], ['x']).lines).toEqual(['bcd']);
    expect(run(['abcd'], ['3', 'x']).lines).toEqual(['d']);
    expect(run(['abcd'], ['l', 'l', 'X']).lines).toEqual(['acd']);
  });

  it('deletes words and lines with operators', () => {
    expect(run(['foo bar baz'], ['d', 'w']).lines).toEqual(['bar baz']);
    expect(run(['foo bar baz'], ['d', 'd']).lines).toEqual(['']);
    expect(run(['a', 'b', 'c', 'd'], ['2', 'd', 'd']).lines).toEqual(['c', 'd']);
    expect(run(['foo', 'bar'], ['d', 'G']).lines).toEqual(['']);
  });

  it('deletes to the end of the line', () => {
    expect(run(['abcdef'], ['l', 'l', 'd', '$']).lines).toEqual(['ab']);
  });

  it('deletes the last word without leaving a fragment', () => {
    expect(run(['foo bar'], ['w', 'd', 'w']).lines).toEqual(['foo ']);
    expect(run(['foo bar'], ['d', 'e']).lines).toEqual([' bar']);
  });

  it('opens a line and undoes it as one change', () => {
    const opened = run(['a'], ['o', 'b', 'Escape']);
    expect(opened.lines).toEqual(['a', 'b']);
    expect(applyKeys(opened, ['u']).lines).toEqual(['a']);
  });

  it('changes a word like ce, keeping the trailing space', () => {
    const state = run(['foo bar'], ['c', 'w']);
    expect(state.mode).toBe('insert');
    expect(state.lines).toEqual([' bar']);
  });

  it('changes a word and enters insert', () => {
    const state = run(['foo bar'], ['c', 'i', 'w']);
    expect(state.mode).toBe('insert');
    expect(state.lines).toEqual([' bar']);
  });

  it('changes inside quotes from insert and finishes with Escape', () => {
    const state = run(['say "antigo" now'], ['f', '"', 'l', 'c', 'i', '"', 'n', 'o', 'v', 'o', 'Escape']);
    expect(state.lines).toEqual(['say "novo" now']);
    expect(state.mode).toBe('normal');
  });

  it('inserts with i, a, A, o and O', () => {
    expect(run(['ac'], ['l', 'i', 'b', 'Escape']).lines).toEqual(['abc']);
    expect(run(['ac'], ['a', 'b', 'Escape']).lines).toEqual(['abc']);
    expect(run(['ac'], ['A', '!', 'Escape']).lines).toEqual(['ac!']);
    expect(run(['ac'], ['o', 'x', 'Escape']).lines).toEqual(['ac', 'x']);
    expect(run(['ac'], ['O', 'x', 'Escape']).lines).toEqual(['x', 'ac']);
  });

  it('splits and joins lines from insert mode', () => {
    expect(run(['ab'], ['A', 'Enter', 'c', 'Escape']).lines).toEqual(['ab', 'c']);
    expect(run(['ab', 'cd'], ['j', 'i', 'Backspace', 'Escape']).lines).toEqual(['abcd']);
  });

  it('replaces and toggles case', () => {
    expect(run(['let x = 1;'], ['l', 'l', 'l', 'l', 'r', 'y']).lines).toEqual(['let y = 1;']);
    expect(run(['abc'], ['~']).lines).toEqual(['Abc']);
  });

  it('records and replays macros', () => {
    const recorded = run(['abcd'], ['q', 'a', 'x', 'q']);
    expect(recorded.macros.a).toEqual(['x']);
    expect(recorded.recording).toBeNull();

    const replayed = applyKeys(recorded, ['@', 'a']);
    expect(replayed.lines).toEqual(['cd']);
    expect(applyKeys(replayed, ['@', '@']).lines).toEqual(['d']);
  });

  it('sets marks and jumps back to them', () => {
    const marked = run(['a', 'b', 'c'], ['G', 'm', 'a']);
    expect(marked.marks.a).toEqual({ line: 2, col: 0 });

    const lineJump = applyKeys(marked, ['g', 'g', "'", 'a']);
    expect(lineJump.cursor.line).toBe(2);

    const exactJump = applyKeys(marked, ['g', 'g', '`', 'a']);
    expect(exactJump.cursor.line).toBe(2);
    expect(applyKeys(exactJump, ["'", "'"]).cursor.line).toBe(0);
  });

  it('deletes words and lines from insert mode', () => {
    expect(run(['foo bar'], ['A', 'C-w', 'Escape']).lines).toEqual(['foo ']);
    expect(run(['foo bar'], ['A', 'C-u', 'Escape']).lines).toEqual(['']);
    expect(run(['foo'], ['A', 'C-t', 'Escape']).lines).toEqual(['  foo']);
  });

  it('overwrites in replace mode', () => {
    expect(run(['abc'], ['R', 'X', 'Y', 'Escape']).lines).toEqual(['XYc']);
  });

  it('joins without spaces with gJ', () => {
    expect(run(['a', 'b'], ['g', 'J']).lines).toEqual(['ab']);
  });

  it('indents and dedents lines', () => {
    expect(run(['a', 'b'], ['>', '>']).lines).toEqual(['  a', 'b']);
    expect(run(['a', 'b'], ['2', '>', '>']).lines).toEqual(['  a', '  b']);
    expect(run(['a', 'b'], ['>', 'j']).lines).toEqual(['  a', '  b']);
    expect(run(['  a'], ['<', '<']).lines).toEqual(['a']);
    expect(run(['\ta'], ['<', '<']).lines).toEqual(['a']);
  });

  it('deletes, changes and yanks to the end of the line', () => {
    expect(run(['abcdef'], ['l', 'l', 'D']).lines).toEqual(['ab']);
    expect(run(['abcdef'], ['l', 'l', 'C', 'x', 'Escape']).lines).toEqual(['abx']);
    expect(run(['abcdef'], ['l', 'l', 'Y']).register).toBe('cdef');
    expect(run(['abcdef'], ['l', 'l', 'Y']).lines).toEqual(['abcdef']);
  });

  it('increments and decrements numbers', () => {
    expect(run(['x = 41'], ['C-a']).lines).toEqual(['x = 42']);
    expect(run(['x = 41'], ['C-x']).lines).toEqual(['x = 40']);
    expect(run(['sem numero'], ['C-a']).message).toContain('nenhum número');
  });

  it('joins lines with J', () => {
    expect(run(['a', 'b'], ['J']).lines).toEqual(['a b']);
    expect(run(['a', '', 'b'], ['2', 'J']).lines).toEqual(['a b']);
  });

  it('yanks and pastes charwise and linewise', () => {
    const yanked = run(['abc'], ['y', 'y', 'p']);
    expect(yanked.lines).toEqual(['abc', 'abc']);
    expect(yanked.register).toBe('abc');

    const word = run(['foo bar'], ['y', 'w', 'l', 'l', 'l', 'l', 'p']);
    expect(word.lines).toEqual(['foo bfoo ar']);
  });
});

describe('keymap: history and repeat', () => {
  it('undoes and redoes a change', () => {
    const undone = run(['abc'], ['x', 'u']);
    expect(undone.lines).toEqual(['abc']);
    expect(applyKeys(undone, ['C-r']).lines).toEqual(['bc']);
  });

  it('groups an insert session into one undo step', () => {
    const state = run([''], ['i', 'a', 'b', 'c', 'Escape', 'u']);
    expect(state.lines).toEqual(['']);
  });

  it('repeats the last change with .', () => {
    expect(run(['abcdef'], ['x', '.']).lines).toEqual(['cdef']);
    expect(run(['a', 'b', 'c'], ['d', 'd', '.']).lines).toEqual(['c']);
  });
});

describe('keymap: search', () => {
  const lines = ['total = 1', 'subtotal = 2', 'total = 3'];

  it('searches forward and repeats with n/N', () => {
    const first = run(lines, ['/', 't', 'o', 't', 'a', 'l', 'Enter']);
    expect(first.cursor).toEqual({ line: 0, col: 0 });
    expect(applyKeys(first, ['n']).cursor).toEqual({ line: 1, col: 3 });
    expect(applyKeys(first, ['n', 'n']).cursor.line).toBe(2);
    expect(applyKeys(first, ['n', 'n', 'N']).cursor).toEqual({ line: 1, col: 3 });
  });

  it('wraps when nothing matches after the cursor', () => {
    const state = run(lines, ['G', '$', '/', 't', 'o', 't', 'a', 'l', 'Enter']);
    expect(state.cursor.line).toBe(0);
  });

  it('searches the word under the cursor with *', () => {
    const state = run(['foo bar foo'], ['*']);
    expect(state.cursor.col).toBe(8);
    expect(state.lastSearch).toBe('foo');
  });

  it('reports a missing pattern', () => {
    expect(run(['abc'], ['/', 'z', 'z', 'Enter']).message).toContain('E486');
  });
});

describe('keymap: commands', () => {
  it('substitutes text on a line and in the buffer', () => {
    expect(run(['a a'], [':', 's', '/', 'a', '/', 'b', '/', 'g', 'Enter']).lines).toEqual([
      'b b',
    ]);
    expect(
      run(['a', 'a'], [':', '%', 's', '/', 'a', '/', 'b', '/', 'g', 'Enter']).lines,
    ).toEqual(['b', 'b']);
  });

  it('sorts lines and toggles options', () => {
    expect(run(['b', 'a'], [':', 's', 'o', 'r', 't', 'Enter']).lines).toEqual(['a', 'b']);

    const relative = run(['a'], [':', 's', 'e', 't', ' ', 'r', 'n', 'u', 'Enter']);
    expect(relative.showNumbers).toBe(true);
    expect(relative.relativeNumbers).toBe(true);

    const ignore = run(['a'], [':', 's', 'e', 't', ' ', 'i', 'c', 'Enter']);
    expect(ignore.ignoreCase).toBe(true);
  });

  it('lists registers and marks', () => {
    const state = run(['a'], ['m', 'a', 'q', 'b', 'x', 'q', ':', 'r', 'e', 'g', 'Enter']);
    expect(state.message).toContain('@b');

    const marks = applyKeys(state, [':', 'm', 'a', 'r', 'k', 's', 'Enter']);
    expect(marks.message).toContain('a');
  });

  it('searches case-insensitively after set ignorecase', () => {
    expect(run(['Foo'], [':', 's', 'e', 't', ' ', 'i', 'c', 'Enter', '/', 'f', 'o', 'o', 'Enter']).cursor.col).toBe(0);
    expect(run(['Foo'], ['/', 'f', 'o', 'o', 'Enter']).message).toContain('E486');
  });


  it('clears dirty after :w and blocks :q', () => {
    const dirty = run(['abc'], ['x', ':', 'w', 'Enter']);
    expect(dirty.dirty).toBe(false);
    expect(dirty.message).toContain('escrito');

    const blocked = run(['abc'], ['x', ':', 'q', 'Enter']);
    expect(blocked.message).toContain('E37');
  });

  it('quits with :q! and :wq', () => {
    expect(run(['abc'], [':', 'q', '!', 'Enter']).message).toContain('fechado');
    const saved = run(['abc'], [':', 'w', 'q', 'Enter']);
    expect(saved.message).toContain('escrito');
    expect(saved.dirty).toBe(false);
  });

  it('jumps to a line and toggles numbers', () => {
    expect(run(['a', 'b', 'c'], [':', '3', 'Enter']).cursor.line).toBe(2);
    expect(run(['a'], [':', 's', 'e', 't', ' ', 'n', 'u', 'm', 'b', 'e', 'r', 'Enter']).showNumbers).toBe(true);
  });

  it('reports unknown commands', () => {
    expect(run(['a'], [':', 'z', 'z', 'Enter']).message).toContain('E492');
  });
});

describe('keymap: visual mode', () => {
  it('deletes a character selection', () => {
    expect(run(['abcdef'], ['v', 'l', 'l', 'd']).lines).toEqual(['def']);
  });

  it('deletes whole lines with V', () => {
    expect(run(['a', 'b', 'c'], ['V', 'j', 'd']).lines).toEqual(['c']);
  });

  it('changes case and pastes over a visual selection', () => {
    expect(run(['abcd'], ['v', 'l', 'U']).lines).toEqual(['ABcd']);
    expect(run(['ABCD'], ['v', 'l', 'u']).lines).toEqual(['abCD']);

    const pasted = run(['a', 'b'], ['y', 'y', 'j', 'V', 'p']);
    expect(pasted.lines).toEqual(['a', 'a']);
  });

  it('restores the last visual selection with gv', () => {
    const state = run(['abcd'], ['v', 'l', 'Escape', 'g', 'v']);
    expect(state.mode).toBe('visual');
    expect(state.anchor).toEqual({ line: 0, col: 0 });
    expect(state.cursor).toEqual({ line: 0, col: 1 });
  });

  it('indents a visual line selection', () => {
    expect(run(['a', 'b'], ['V', 'j', '>']).lines).toEqual(['  a', '  b']);
  });

  it('deletes inside backticks and paragraphs', () => {
    expect(run(['x `abc` y'], ['f', '`', 'l', 'd', 'i', '`']).lines).toEqual(['x `` y']);
    expect(run(['a', 'b', '', 'c'], ['d', 'i', 'p']).lines).toEqual(['', 'c']);
  });

  it('swaps the anchor with o', () => {
    const state = run(['abcd'], ['v', 'l', 'l', 'o', 'd']);
    expect(state.lines).toEqual(['d']);
  });
});

describe('keymap: misc', () => {
  it('feeds composed text in insert mode', () => {
    const state = applyText(run([''], ['i']), 'ação');
    expect(state.lines).toEqual(['ação']);
  });

  it('normalizes keyboard events', () => {
    expect(normalizeKey({ key: 'ArrowLeft' })).toBe('ArrowLeft');
    expect(normalizeKey({ key: 'r', ctrlKey: true })).toBe('C-r');
    expect(normalizeKey({ key: '[', ctrlKey: true })).toBe('Escape');
    expect(normalizeKey({ key: '_' })).toBe('_');
    expect(normalizeKey({ key: 'a', ctrlKey: true })).toBe('C-a');
    expect(normalizeKey({ key: 'x', ctrlKey: true })).toBe('C-x');
    expect(normalizeKey({ key: 'k', metaKey: true })).toBeNull();
    expect(normalizeKey({ key: 'Tab' })).toBeNull();
    expect(normalizeKey({ key: 'a' })).toBe('a');
    expect(normalizeKey({ key: 'Shift' })).toBeNull();
  });

  it('cancels a pending operator with Escape', () => {
    const state = run(['abc'], ['d', 'Escape']);
    expect(state.pending).toBe('');
    expect(state.lines).toEqual(['abc']);
    expect(state.message).toBe('');
  });

  it('keeps unknown keys from breaking the state', () => {
    const state = reduce(createState(['abc']), 'F1');
    expect(state.lines).toEqual(['abc']);
  });
});
