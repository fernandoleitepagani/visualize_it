import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { theory } from '@/content/theory';
import { NotFound } from './NotFound';

export function TheoryPage() {
  const { slug } = useParams();
  const page = slug ? theory[slug] : undefined;

  if (!page) return <NotFound />;

  const Article = page.Component;

  return (
    <article className="pb-10">
      <PageHeader title={page.title} subtitle={page.subtitle} />
      <Article />
    </article>
  );
}
