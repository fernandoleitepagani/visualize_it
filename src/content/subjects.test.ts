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

  it('places the pointers lessons in order inside the pointers group', () => {
    const basic = getEntryLocation('ponteiros-basico');
    const double = getEntryLocation('ponteiros-duplos');
    expect(basic?.subject.id).toBe('aeds-i');
    expect(basic?.group.id).toBe('ponteiros');
    expect(double?.subject.id).toBe('aeds-i');
    expect(double?.group.id).toBe('ponteiros');

    const slugs = basic!.group.entries.map((entry) => entry.slug);
    expect(slugs).toEqual(['ponteiros-basico', 'aritmetica', 'ponteiros-duplos']);
  });

  it('places functions and recursion in order inside their own group', () => {
    const functions = getEntryLocation('funcoes');
    const recursion = getEntryLocation('recursao');

    expect(functions?.subject.id).toBe('aeds-i');
    expect(functions?.group.id).toBe('funcoes-recursao');
    expect(recursion?.subject.id).toBe('aeds-i');
    expect(recursion?.group.id).toBe('funcoes-recursao');

    const slugs = functions!.group.entries.map((entry) => entry.slug);
    expect(slugs).toEqual(['funcoes', 'recursao']);
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
