import type { Lesson } from '@/engine/types';

const ISSUE_URL = 'https://github.com/fernandoleitepagani/visualize_it/issues/new';

export function buildReportIssueUrl(lesson: Lesson, currentUrl: string): string {
  const params = new URLSearchParams({
    template: 'bug_report.md',
    title: `[BUG] ${lesson.title}`,
    labels: 'bug',
    body: [
      '## Descrição',
      '',
      'Descreva o problema encontrado nesta lição.',
      '',
      '## Passos para replicar',
      '',
      `1. Abrir ${currentUrl}`,
      '2. Avançar até o passo problemático',
      '3. Observar o comportamento',
      '',
      '## Comportamento esperado',
      '',
      '...',
      '',
      '## Comportamento atual',
      '',
      '...',
      '',
      '## Componente / Página Afetada',
      '',
      `Lição: ${lesson.title} (${lesson.id})`,
    ].join('\n'),
  });

  return `${ISSUE_URL}?${params.toString()}`;
}
