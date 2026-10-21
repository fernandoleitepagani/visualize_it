import { Fragment } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import type { CatalogEntry } from '@/content/subjects';
import type { ViewKind } from '@/engine/types';
import { font, radius, vizVar } from '@/theme';

const barHeights = [9, 16, 12, 22, 15, 25];

/** Tiny abstract preview of a lesson's view, used on catalog cards. */
export function ViewPreview({
  view,
  kind,
}: {
  view?: ViewKind;
  kind: CatalogEntry['kind'];
}) {
  if (kind === 'theory') {
    return (
      <Box
        w={44}
        h={30}
        aria-hidden
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${vizVar.line2}`,
          borderRadius: radius.sm,
          background: vizVar.surface2,
          color: vizVar.accent,
          fontFamily: 'var(--mantine-font-family-monospace)',
          fontSize: font.tiny,
        }}
      >
        §
      </Box>
    );
  }

  if (view === 'cells') {
    return (
      <Flex gap={3} align="center" h={30} aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            className="viz-preview-cell"
            w={9}
            h={20}
            style={{
              border: `1px solid ${i === 2 ? vizVar.accentLine : vizVar.line2}`,
              borderRadius: 4,
              background: i === 2 ? vizVar.accentSoft : vizVar.surface2,
            }}
          />
        ))}
      </Flex>
    );
  }

  if (view === 'nodes') {
    return (
      <Flex gap={2} align="center" h={30} aria-hidden>
        {[0, 1, 2].map((i) => (
          <Fragment key={i}>
            {i > 0 ? (
              <Text fz={font.micro} c="dimmed">
                ›
              </Text>
            ) : null}
            <Box
              className="viz-preview-node"
              w={13}
              h={20}
              style={{
                border: `1px solid ${i === 1 ? vizVar.accentLine : vizVar.line2}`,
                borderRadius: 4,
                background: i === 1 ? vizVar.accentSoft : vizVar.surface2,
              }}
            />
          </Fragment>
        ))}
      </Flex>
    );
  }

  if (view === 'plot') {
    return (
      <Flex gap={3} align="flex-end" h={30} aria-hidden>
        {[8, 14, 20, 26].map((height, i) => (
          <Box
            key={i}
            className="viz-preview-bar"
            w={7}
            h={height}
            style={{
              borderRadius: '3px 3px 1px 1px',
              background: i === 3 ? vizVar.accent : vizVar.greenSoft,
              border: `1px solid ${i === 3 ? vizVar.accentLine : vizVar.line}`,
            }}
          />
        ))}
      </Flex>
    );
  }

  return (
    <Flex gap={3} align="flex-end" h={30} aria-hidden>
      {barHeights.map((height, i) => (
        <Box
          key={i}
          className="viz-preview-bar"
          w={5}
          h={height}
          style={{
            borderRadius: '3px 3px 1px 1px',
            background: i === 5 ? vizVar.accent : vizVar.line3,
          }}
        />
      ))}
    </Flex>
  );
}
