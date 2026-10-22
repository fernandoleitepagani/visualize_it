import { describe, expect, it } from 'vitest';
import { executeCommand } from './commands';
import { createState } from './keymap';
import { pushUndo, redo, undo } from './history';

describe('history', () => {
  it('undoes and redoes snapshots', () => {
    let state = createState(['a']);
    state = pushUndo(state);
    state = { ...state, lines: ['b'] };
    state = undo(state);
    expect(state.lines).toEqual(['a']);
    state = redo(state);
    expect(state.lines).toEqual(['b']);
  });

  it('reports empty history', () => {
    expect(undo(createState(['a'])).message).toContain('início');
    expect(redo(createState(['a'])).message).toContain('nada');
  });

  it('clears redo when a new change is pushed', () => {
    let state = { ...createState(['a']), undo: [['x']], redo: [['y']] };
    state = pushUndo(state);
    expect(state.redo).toEqual([]);
  });

  it('caps the undo stack at 100 snapshots', () => {
    let state = createState(['a']);
    for (let index = 0; index < 120; index += 1) state = pushUndo(state);
    expect(state.undo).toHaveLength(100);
  });
});

describe('commands', () => {
  const command = (value: string, state = createState(['a'])) =>
    executeCommand({ ...state, command: value, mode: 'command' });

  it('writes and clears the dirty flag', () => {
    const state = executeCommand({ ...createState(['a']), command: 'w', mode: 'command' });
    expect(state.dirty).toBe(false);
    expect(state.message).toContain('escrito');
  });

  it('blocks quit when the buffer is dirty', () => {
    const state = executeCommand({
      ...createState(['a']),
      dirty: true,
      command: 'q',
      mode: 'command',
    });
    expect(state.message).toContain('E37');
    expect(state.mode).toBe('normal');
  });

  it('quits without saving', () => {
    expect(command('q!').message).toContain('fechado');
  });

  it('writes and quits with :wq and :x', () => {
    expect(command('wq').message).toContain('escrito');
    expect(command('x').dirty).toBe(false);
  });

  it('jumps to a line', () => {
    const state = executeCommand({
      ...createState(['a', '  b', 'c']),
      command: '2',
      mode: 'command',
    });
    expect(state.cursor).toEqual({ line: 1, col: 2 });
  });

  it('toggles line numbers', () => {
    expect(command('set number').showNumbers).toBe(true);
    expect(command('set nonumber').showNumbers).toBe(false);
  });

  it('reports unknown commands', () => {
    expect(command('xyz').message).toContain('E492');
  });

  it('accepts an empty command', () => {
    expect(command('').message).toBe('');
  });
});
