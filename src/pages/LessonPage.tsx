import { useParams } from 'react-router-dom';
import { LessonPager, LessonRelated } from '@/components/LessonNav';
import { LessonView } from '@/components/LessonView';
import { MetaPill } from '@/components/MetaPill';
import { PageHeader } from '@/components/PageHeader';
import { getLesson } from '@/content/lessons';
import { getEntryLocation } from '@/content/subjects';
import { vizVar } from '@/theme';
import { NotFound } from './NotFound';

const accents = {
  accent: vizVar.accent,
  success: vizVar.green,
  info: vizVar.purple,
} as const;

export function LessonPage() {
  const { slug } = useParams();
  const lesson = getLesson(slug);
  const location = getEntryLocation(slug);

  if (!lesson) return <NotFound />;

  const accent = location ? accents[location.subject.accent] : vizVar.accent;
  const time = lesson.complexity.time ?? {};
  const worst = time.worst ?? time.avg ?? time.best;

  return (
    <>
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
            {worst ? <MetaPill tone="accent">{worst}</MetaPill> : null}
            {lesson.complexity.space ? <MetaPill>{lesson.complexity.space}</MetaPill> : null}
            <MetaPill>{lesson.view ?? 'bars'}</MetaPill>
          </>
        }
        actions={location ? <LessonPager location={location} /> : undefined}
      />
      <LessonView key={lesson.id} lesson={lesson} />
      {location ? <LessonRelated location={location} /> : null}
    </>
  );
}
