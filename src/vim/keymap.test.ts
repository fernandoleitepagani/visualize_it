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
