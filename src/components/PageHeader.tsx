import { Link } from 'react-router-dom';

/** Shared page header: back link, title and optional subtitle. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6 border-b border-line pb-5">
      <Link
        to="/"
        className="mb-1.5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-accent hover:no-underline"
      >
        ← todos os algoritmos
      </Link>
      <h1 className="text-[24px] font-semibold tracking-tight">{title}</h1>
      {subtitle ? <div className="mt-1 text-[13.5px] text-muted">{subtitle}</div> : null}
    </header>
  );
}
