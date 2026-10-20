import { Fragment } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import type { CatalogEntry } from '@/content/subjects';
import type { ViewKind } from '@/engine/types';
import { font, palette, radius } from '@/theme';

const barHeights = [10, 17, 8, 21, 13];

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
        w={38}
        h={26}
        aria-hidden
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${palette.line2}`,
          borderRadius: radius.sm,
          background: palette.surface2,
        }}
      >
        <Text fz={font.tiny} c="dimmed">
          §
        </Text>
      </Box>
    );
  }

  if (view === 'cells') {
    return (
      <Flex gap={3} align="center" h={26} aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            className="viz-preview-cell"
            w={8}
            h={18}
            style={{
              border: `1px solid ${palette.line2}`,
              borderRadius: 2,
              background: i === 2 ? palette.accentSoft : palette.surface2,
            }}
          />
        ))}
      </Flex>
    );
  }

  if (view === 'nodes') {
    return (
      <Flex gap={2} align="center" h={26} aria-hidden>
        {[0, 1, 2].map((i) => (
          <Fragment key={i}>
            {i > 0 ? (
              <Text fz={font.micro} c="dimmed">
                →
              </Text>
            ) : null}
            <Box
              key={`node-${i}`}
              className="viz-preview-node"
              w={12}
              h={18}
              style={{
                border: `1px solid ${palette.line2}`,
                borderRadius: 3,
                background: i === 1 ? palette.accentSoft : palette.surface2,
              }}
            />
          </Fragment>
        ))}
      </Flex>
    );
  }

  return (
    <Flex gap={3} align="flex-end" h={26} aria-hidden>
      {barHeights.map((height, i) => (
        <Box
          key={i}
          className="viz-preview-bar"
          w={5}
          h={height}
          style={{
            borderRadius: 1,
            background: i === 3 ? palette.accent : palette.line2,
          }}
        />
      ))}
    </Flex>
  );
}
