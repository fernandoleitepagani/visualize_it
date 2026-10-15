import { Link, useParams } from 'react-router-dom';
import { LessonView } from '@/components/LessonView';
import { getLesson } from '@/content/lessons';
import { NotFound } from './NotFound';

export function LessonPage() {
  const { slug } = useParams();
  const lesson = getLesson(slug);

  if (!lesson) return <NotFound />;

  return (
    <>
      <header className="mb-6 border-b border-line pb-5">
        <Link
          to="/"
          className="mb-1.5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-accent hover:no-underline"
        >
          ← todos os algoritmos
        </Link>
        <h1 className="text-[22px] font-semibold tracking-tight">{lesson.title}</h1>
        {lesson.subtitle ? (
          <div className="mt-1 text-[13.5px] text-muted">{lesson.subtitle}</div>
        ) : null}
      </header>
      <LessonView key={lesson.id} lesson={lesson} />
    </>
  );
}
