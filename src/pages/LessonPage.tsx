import type { CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mantine/core';
import { LessonPager, LessonRelated } from '@/components/LessonNav';
import { LessonView } from '@/components/LessonView';
import { MetaPill } from '@/components/MetaPill';
import { PageHeader } from '@/components/PageHeader';
import { ReportIssueLink } from '@/components/ReportIssueLink';
import { getLesson } from '@/content/lessons';
import { getLessonLanguages } from '@/engine/code';
import { getEntryLocation } from '@/content/subjects';
import type { ViewKind } from '@/engine/types';
import { subjectAccent, vizVar } from '@/theme';
import { NotFound } from './NotFound';

const viewLabels: Record<ViewKind, string> = {
  bars: 'barras',
  cells: 'células',
  nodes: 'nós',
  plot: 'gráfico',
  strings: 'strings',
  matrix: 'matriz',
  pointers: 'ponteiros',
};

export function LessonPage() {
  const { slug } = useParams();
  const lesson = getLesson(slug);
  const location = getEntryLocation(slug);

  if (!lesson) return <NotFound />;

  const accent = location ? subjectAccent[location.subject.accent] : vizVar.accent;
  const time = lesson.complexity.time ?? {};
  const worst = time.worst ?? time.avg ?? time.best;
  const languages = getLessonLanguages(lesson);

  return (
    <Box
      style={
        {
          '--subject-accent': accent,
          '--subject-accent-ink': 'var(--viz-subject-ink)',
        } as CSSProperties
      }
    >
      <PageHeader
        breadcrumb={
          location
            ? [
                { label: 'Início', to: '/' },
                { label: location.subject.title, to: `/materias/${location.subject.id}` },
                { label: location.group.title },
                { label: lesson.title },
              ]
            : undefined
        }
        kicker={location ? `${location.subject.title} · ${location.group.title}` : 'lição'}
        title={lesson.title}
        subtitle={lesson.subtitle}
        accent={accent}
        meta={
          <>
            {lesson.panelLabel ? <MetaPill>{lesson.panelLabel}</MetaPill> : null}
            {worst ? <MetaPill tone="subject">{worst}</MetaPill> : null}
            {lesson.complexity.space ? <MetaPill>{lesson.complexity.space}</MetaPill> : null}
            <MetaPill>{viewLabels[lesson.view ?? 'bars']}</MetaPill>
            <MetaPill>{languages.map((lang) => (lang === 'java' ? 'Java' : lang === 'cpp' ? 'C++' : 'C')).join(' · ')}</MetaPill>
          </>
        }
        actions={location ? <LessonPager location={location} /> : undefined}
      />
      <LessonView key={lesson.id} lesson={lesson} />
      {location ? <LessonRelated location={location} /> : null}
      <ReportIssueLink lesson={lesson} />
    </Box>
  );
}
