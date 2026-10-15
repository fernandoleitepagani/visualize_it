import { useParams } from 'react-router-dom';
import { LessonView } from '@/components/LessonView';
import { PageHeader } from '@/components/PageHeader';
import { getLesson } from '@/content/lessons';
import { NotFound } from './NotFound';

export function LessonPage() {
  const { slug } = useParams();
  const lesson = getLesson(slug);

  if (!lesson) return <NotFound />;

  return (
    <>
      <PageHeader title={lesson.title} subtitle={lesson.subtitle} />
      <LessonView key={lesson.id} lesson={lesson} />
    </>
  );
}
