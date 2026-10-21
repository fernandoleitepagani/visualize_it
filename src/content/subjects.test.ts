import { describe, expect, it } from 'vitest';
import { lessons } from '@/content/lessons';
import { theory } from '@/content/theory';
import {
  allEntryLocations,
  getEntryLocation,
  getEntryPath,
  getSubject,
  getSubjectEntries,
  searchEntries,
  subjects,
} from './subjects';

describe('subjects catalog', () => {
  it('has unique subject ids', () => {
    const ids = subjects.map((subject) => subject.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every subject a distinct accent', () => {
    const accents = subjects.map((subject) => subject.accent);
    expect(new Set(accents).size).toBe(subjects.length);
  });

  it('places every lesson in exactly one subject', () => {
    const slugs = allEntryLocations()
      .filter((location) => location.entry.kind === 'lesson')
      .map((location) => location.entry.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(slugs)).toEqual(new Set(Object.keys(lessons)));
  });

  it('places every theory page in the catalog', () => {
    const slugs = allEntryLocations()
      .filter((location) => location.entry.kind === 'theory')
      .map((location) => location.entry.slug);

    expect(new Set(slugs)).toEqual(new Set(Object.keys(theory)));
  });

  it('resolves entries to their subject and group', () => {
    expect(getEntryLocation('selecao')?.subject.id).toBe('aeds-ii');
    expect(getEntryLocation('selecao')?.group.id).toBe('ordenacao');
    expect(getEntryLocation('complexidade')?.subject.id).toBe('analise');
    expect(getEntryLocation('inexistente')).toBeUndefined();
  });

  it('builds the routes used by the lesson and theory pages', () => {
    expect(getEntryPath(getEntryLocation('selecao')!.entry)).toBe('/algoritmos/selecao');
    expect(getEntryPath(getEntryLocation('complexidade')!.entry)).toBe('/teoria/complexidade');
  });

  it('returns every entry of a subject', () => {
    const subject = getSubject('aeds-ii');
    expect(subject).toBeDefined();
    const entries = getSubjectEntries(subject!);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((location) => location.subject.id === 'aeds-ii')).toBe(true);
  });

  it('finds entries by title and accent-insensitive text', () => {
    expect(searchEntries('quicksort').map((location) => location.entry.slug)).toContain('quicksort');
    expect(searchEntries('ordenacao').length).toBeGreaterThan(0);
    expect(searchEntries('inducao').map((location) => location.entry.slug)).toContain('inducao');
  });
});
