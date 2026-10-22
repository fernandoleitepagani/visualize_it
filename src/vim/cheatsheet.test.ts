import { describe, expect, it } from 'vitest';
import { filterCheatsheet } from './cheatsheet';
import { loadProgress, recordSolved, saveProgress } from './progress';

describe('cheatsheet', () => {
  it('lists the essential groups', () => {
    const groups = filterCheatsheet('');
    expect(groups.length).toBeGreaterThanOrEqual(8);
    expect(groups.flatMap((group) => group.items).length).toBeGreaterThanOrEqual(45);
  });

  it('filters by command and label, ignoring accents and case', () => {
    const byKey = filterCheatsheet('gg').flatMap((group) => group.items.map((item) => item.id));
    expect(byKey).toContain('gg');

    const byLabel = filterCheatsheet('desfazer').flatMap((group) =>
      group.items.map((item) => item.id),
    );
    expect(byLabel).toContain('u');

    expect(filterCheatsheet('existente-em-nenhum-lugar')).toEqual([]);
  });
});

describe('progress', () => {
  it('starts empty and records the best result', () => {
    window.localStorage.clear();
    const empty = loadProgress();
    expect(empty).toEqual({ solved: [], best: {} });

    const once = recordSolved(empty, 'hjkl', 6);
    expect(once.solved).toEqual(['hjkl']);
    expect(once.best.hjkl).toBe(6);

    const better = recordSolved(once, 'hjkl', 4);
    expect(better.best.hjkl).toBe(4);

    saveProgress(better);
    expect(loadProgress()).toEqual(better);
  });

  it('survives corrupt storage', () => {
    window.localStorage.setItem('visualize-it:vim-progress', '{oops');
    expect(loadProgress()).toEqual({ solved: [], best: {} });
  });
});
