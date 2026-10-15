import type { Complexity } from '@/engine/types';

const dash = (value: string | undefined) => (value && value.length > 0 ? value : '—');

export function ComplexityTable({ complexity }: { complexity: Complexity }) {
  const time = complexity.time ?? {};
  const rows: Array<{ label: string; cells: string[]; mono?: boolean }> = [
    { label: 'Tempo', cells: [dash(time.best), dash(time.avg), dash(time.worst)], mono: true },
    { label: 'Espaço', cells: [dash(complexity.space)], mono: true },
    { label: 'Estável', cells: [complexity.stable ? 'Sim' : 'Não'] },
  ];

  return (
    <div>
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr>
            <th className="border-b border-line px-3.5 py-2.5 text-left text-[11.5px] font-medium tracking-wider text-dim uppercase" />
            {['melhor', 'médio', 'pior'].map((heading) => (
              <th
                key={heading}
                className="border-b border-line px-3.5 py-2.5 text-left text-[11.5px] font-medium tracking-wider text-dim uppercase"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="border-b border-line px-3.5 py-2.5 text-muted">{row.label}</td>
              {row.cells.map((cell, i) => (
                <td
                  key={i}
                  colSpan={row.cells.length === 1 ? 3 : 1}
                  className={`border-b border-line px-3.5 py-2.5 ${row.mono ? 'font-mono text-[13px] text-accent' : ''}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {complexity.note ? <p className="mt-3 text-[13px] text-muted">{complexity.note}</p> : null}
    </div>
  );
}
