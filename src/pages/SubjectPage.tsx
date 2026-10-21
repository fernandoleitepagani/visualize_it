import type { CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mantine/core';
import { AlgorithmBrowser } from '@/components/AlgorithmBrowser';
import { MetaPill } from '@/components/MetaPill';
import { PageHeader } from '@/components/PageHeader';
import { getSubject, getSubjectEntries } from '@/content/subjects';
import { subjectAccent } from '@/theme';
import { NotFound } from './NotFound';

export function SubjectPage() {
  const { subjectId } = useParams();
  const subject = getSubject(subjectId);

  if (!subject) return <NotFound />;

  const entries = getSubjectEntries(subject);
  const lessons = entries.filter((location) => location.entry.kind === 'lesson').length;
  const theory = entries.length - lessons;
  const accent = subjectAccent[subject.accent];

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
        breadcrumb={[{ label: 'Início', to: '/' }, { label: subject.title }]}
        kicker={theory === entries.length ? 'análise' : 'matéria'}
        title={subject.title}
        subtitle={subject.description}
        accent={accent}
        meta={
          <>
            <MetaPill>{entries.length} entradas</MetaPill>
            {lessons > 0 ? <MetaPill>{lessons} lições</MetaPill> : null}
            {theory > 0 ? <MetaPill>{theory} artigos</MetaPill> : null}
            <MetaPill>{subject.groups.length} grupos</MetaPill>
          </>
        }
      />
      <AlgorithmBrowser entries={entries} groups={subject.groups} />
    </Box>
  );
}
