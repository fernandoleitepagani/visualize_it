import type { CodeApproach, CodeLang, CodeListing, Lesson } from './types';

const DEFAULT_LANGUAGES: CodeLang[] = ['java', 'c'];

/** Languages a lesson exposes, falling back to the historical Java/C pair. */
export function getLessonLanguages(lesson: Lesson): CodeLang[] {
  return lesson.languages?.length ? lesson.languages : DEFAULT_LANGUAGES;
}

/** Listing for the selected implementation, with a safe fallback. */
export function getLessonListing(lesson: Lesson, approach?: CodeApproach): CodeListing {
  return lesson.codeVariants?.[approach ?? 'iterativo'] ?? lesson.code;
}

/** Source lines for a language, or an empty list when the lesson omits it. */
export function getLessonCode(
  lesson: Lesson,
  lang: CodeLang,
  approach?: CodeApproach,
): string[] {
  return getLessonListing(lesson, approach)[lang] ?? [];
}

/** Stable file name for copy/download actions. */
export function getCodeFileBaseName(lesson: Lesson, approach?: CodeApproach): string {
  return approach ? `${lesson.id}-${approach}` : lesson.id;
}
