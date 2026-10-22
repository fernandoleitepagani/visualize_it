import { useLocation } from 'react-router-dom';
import { Anchor } from '@mantine/core';
import type { Lesson } from '@/engine/types';
import { buildReportIssueUrl } from '@/lib/reportIssue';
import { font, vizVar } from '@/theme';
import { BugIcon } from './icons';

/** Low-friction bug report link that pre-fills the GitHub issue template. */
export function ReportIssueLink({ lesson }: { lesson: Lesson }) {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}${location.search}`;

  return (
    <Anchor
      href={buildReportIssueUrl(lesson, currentUrl)}
      target="_blank"
      rel="noreferrer"
      underline="never"
      fz={font.tiny}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: vizVar.dim,
        marginTop: 24,
      }}
    >
      <BugIcon size={13} />
      Encontrou um problema nesta lição? Reportar
    </Anchor>
  );
}
