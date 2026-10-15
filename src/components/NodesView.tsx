import { Fragment } from 'react';
import type { LinkedKind, Node } from '@/engine/types';
import { cx } from '@/lib/cx';

/** Nodes view — linked structures (singly/doubly linked lists, queues, stacks). */
export function NodesView({
  nodes,
  linked = 'singly',
}: {
  nodes: Node[] | undefined;
  linked?: LinkedKind;
}) {
  const list = nodes ?? [];

  return (
    <div className="flex min-h-60 flex-wrap items-center justify-center gap-2.5 pt-8 pb-2.5">
      {list.map((node, i) => {
        const state = node.state || '';
        const prev = node.prev ?? null;
        const next = node.next ?? null;

        return (
          <Fragment key={node.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-3.5 gap-1 whitespace-nowrap font-mono text-[10px] text-accent">
                {(node.labels ?? []).map((label, j) => (
                  <i key={j} className="not-italic">
                    {label}
                  </i>
                ))}
              </div>
              <div
                className={cx(
                  'flex items-stretch overflow-hidden rounded-md border-[1.5px] bg-surface-2 transition',
                  state === 'active' && 'border-accent shadow-[0_0_0_3px_rgba(251,191,36,0.2)]',
                  state === 'compare' && 'border-green',
                  state === 'write' && 'border-accent',
                  state === '' && 'border-line-2',
                )}
              >
                {linked === 'doubly' && (
                  <span className="flex items-center border-r border-line-2 bg-surface-3 px-2.5 py-2 font-mono text-[11px] text-muted">
                    {prev ? `←${prev}` : '∅'}
                  </span>
                )}
                <span className="flex items-center px-3 py-2 font-mono text-sm font-semibold">
                  {node.val}
                </span>
                <span className="flex items-center border-l border-line-2 bg-surface-3 px-2.5 py-2 font-mono text-[11px] text-muted">
                  {next ? `→${next}` : '∅'}
                </span>
              </div>
            </div>
            {i < list.length - 1 && <span className="font-mono text-sm text-dim">→</span>}
          </Fragment>
        );
      })}
    </div>
  );
}
