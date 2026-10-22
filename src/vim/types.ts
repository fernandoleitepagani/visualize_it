/** Core data model for the Vim trainer. Everything here is plain data. */

export type VimMode = 'normal' | 'insert' | 'visual' | 'visual-line' | 'command' | 'search';

export interface VimCursor {
  /** 0-based line index. */
  line: number;
  /** 0-based character index (code points, not UTF-16 units). */
  col: number;
}

export interface VimFind {
  command: 'f' | 'F' | 't' | 'T';
  char: string;
}

export interface VimState {
  lines: string[];
  cursor: VimCursor;
  mode: VimMode;
  /** Pending keys: counts, operators, `g`, `f`, `r`, `i`/`a` after an operator. */
  pending: string;
  /** Start of the visual selection. */
  anchor: VimCursor | null;
  /** Unnamed register (yank/delete). */
  register: string;
  registerLinewise: boolean;
  undo: string[][];
  redo: string[][];
  /** Command-line buffer without the leading `:`. */
  command: string;
  /** Search buffer without the leading `/` or `?`. */
  search: string;
  lastSearch: string | null;
  /** `1` forward, `-1` backward. */
  searchDirection: 1 | -1;
  message: string;
  dirty: boolean;
  /** Column remembered across `j`/`k`. */
  desiredCol: number;
  scrollTop: number;
  /** Last completed change, replayed by `.`. */
  lastChange: string[] | null;
  lastFind: VimFind | null;
  showNumbers: boolean;
  relativeNumbers: boolean;
  ignoreCase: boolean;
  marks: Record<string, VimCursor>;
  macros: Record<string, string[]>;
  recording: string | null;
  macroDepth: number;
  lastMacro: string | null;
  lastPosition: VimCursor | null;
  jumpBack: VimCursor[];
  jumpForward: VimCursor[];
  overwrite: boolean;
  lastVisual: { anchor: VimCursor; cursor: VimCursor } | null;
  /** Keys typed during the current insert session (for `.`). */
  insertKeys: string[];
  /** Operator keys that opened the current insert session (`ciw`, `S`, …). */
  changeKeys: string[] | null;
}

export type VimGoal =
  | { kind: 'cursor'; at: VimCursor }
  | { kind: 'text'; lines: string[]; requireDirty?: boolean }
  | { kind: 'mode'; mode: VimMode }
  | { kind: 'register'; value: string }
  | { kind: 'message'; includes: string }
  | { kind: 'clean' };

export interface VimChallenge {
  slug: string;
  title: string;
  brief: string;
  initialLines: string[];
  start?: VimCursor;
  goal: VimGoal;
  hint: string;
  /** Reference keystrokes; always covered by a test. */
  solution: string[];
  /** Keystroke budget shown in the UI. */
  par: number;
}

export interface VimProgress {
  solved: string[];
  best: Record<string, number>;
}
