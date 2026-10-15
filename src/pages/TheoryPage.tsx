import { Link, useParams } from 'react-router-dom';
import { theory } from '@/content/theory';
import { NotFound } from './NotFound';

export function TheoryPage() {
  const { slug } = useParams();
  const page = slug ? theory[slug] : undefined;

  if (!page) return <NotFound />;

  const Article = page.Component;

  return (
    <article className="pb-10">
      <header className="mb-6 border-b border-line pb-5">
        <Link
          to="/"
          className="mb-1.5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-accent hover:no-underline"
        >
          ← todos os algoritmos
        </Link>
        <h1 className="text-[28px] font-semibold tracking-tight">{page.title}</h1>
        <div className="mt-1 text-[13.5px] text-muted">{page.subtitle}</div>
      </header>
      <Article />
    </article>
  );
}
