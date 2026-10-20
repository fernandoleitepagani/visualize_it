import { useParams } from 'react-router-dom';
import { LessonPager, LessonRelated } from '@/components/LessonNav';
import { LessonView } from '@/components/LessonView';
import { PageHeader } from '@/components/PageHeader';
import { getLesson } from '@/content/lessons';
import { getEntryLocation } from '@/content/subjects';
import { NotFound } from './NotFound';

export function LessonPage() {
  const { slug } = useParams();
  const lesson = getLesson(slug);
  const location = getEntryLocation(slug);

  if (!lesson) return <NotFound />;

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
        title={lesson.title}
        subtitle={lesson.subtitle}
        actions={location ? <LessonPager location={location} /> : undefined}
      />
      <LessonView key={lesson.id} lesson={lesson} />
      {location ? <LessonRelated location={location} /> : null}
    </>
  );
}
