import { Link } from 'react-router-dom';
import { catalog } from '@/content/catalog';
import { getLesson } from '@/content/lessons';

export function HomePage() {
  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-3 border-b border-line pb-5">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Visualize It<span className="text-accent">.</span>
        </h1>
      </header>

      <section className="pt-3 pb-7">
        <h1 className="mb-2 text-[34px] font-semibold tracking-tight">
          Veja os algoritmos <span className="text-accent">funcionando</span>.
        </h1>
        <p className="max-w-[640px] text-[15.5px] text-muted">
          Percorra cada algoritmo linha por linha, com a estrutura animada, código em Java ou C e a
          análise assintótica lado a lado.
        </p>
      </section>

      {catalog.map((section) => (
        <section key={section.title} className="mt-2">
          <h1 className="mb-4 text-[19px] font-semibold tracking-tight">{section.title}</h1>
          {section.groups.map((group) => (
            <div key={group.title}>
              <h2 className="mt-8 mb-3.5 text-xs font-semibold tracking-[0.12em] text-dim uppercase">
                {group.title}
              </h2>
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
                {group.entries.map((entry) => {
                  const to =
                    entry.kind === 'lesson' ? `/algoritmos/${entry.slug}` : `/teoria/${entry.slug}`;
                  const title =
                    entry.kind === 'lesson'
                      ? (getLesson(entry.slug)?.title ?? entry.slug)
                      : entry.title;

                  return (
                    <Link
                      key={entry.slug}
                      to={to}
                      className="block rounded-xl border border-line bg-surface px-4 py-4 transition hover:-translate-y-px hover:border-accent-dim hover:no-underline"
                    >
                      <h3 className="mb-1.5 text-[15px] font-semibold text-ink">{title}</h3>
                      <p className="text-[13px] leading-snug text-muted">{entry.blurb}</p>
                      <span className="mt-2.5 inline-block font-mono text-[11px] text-accent opacity-85">
                        {entry.tag}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}

      <footer className="mt-14 border-t border-line pt-5 text-[12.5px] text-dim">
        Última fase — busca, complexidade e provas por indução.
      </footer>
    </>
  );
}
