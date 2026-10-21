import { describe, expect, it } from 'vitest';
import { lessons } from '@/content/lessons';
import { buildReportIssueUrl } from './reportIssue';

describe('buildReportIssueUrl', () => {
  it('pre-fills the bug template with the lesson and URL', () => {
    const url = buildReportIssueUrl(lessons.selecao, 'https://example.com/algoritmos/selecao?step=3');
    expect(url).toContain('issues/new');
    expect(url).toContain('template=bug_report.md');
    expect(decodeURIComponent(url.replace(/\+/g, ' '))).toContain('Selection Sort');
    expect(decodeURIComponent(url.replace(/\+/g, ' '))).toContain('algoritmos/selecao?step=3');
  });
});
